// ####
// 备忘：第一页的时候，Google 返回的是整个 DOM，第二页开始，返回的疑似是 JSONP 数据，所以要分别处理。
// 第一页可以简单处理，第二页开始，使用正则处理。
// 试过第二页在移除了一些前后缀后用 DOMParser 解析，但会因此引入一些转义字符，导致触发数据完整性问题。
// 在第一页处理的时候，将搜索结果条目的类名存起来，方便后续页的过滤。
// 在第一页的时候，塞入一个用来隐藏搜索结果的类名，方便后续页的过滤。
// 实测发现，如果塞入的类名不等于 6 个字符串长度，会触发数据完整性问题。挺好玩的。
// ####

let body = $response.body;
let header = $request.headers;
let url = $request.url;

// 判断 User-Agent 是否包含 iPhone
const userAgent = header['user-agent'];
let device = 'Mac';
if (userAgent.includes('iPhone')) {
    device = 'iPhone';
}

// 判断是否是第二页
const secondPageTag = 'vet=';
let secondTimeLoading = false;
if (url.includes(secondPageTag)) {
    secondTimeLoading = true;
}

// 要过滤的网站列表
let websites = [
    'kknews.cc',
    'douyin.com/shipin',
    'douyin.com/search',
    'developer.aliyun.com/article',
    'www.aliyun.com/ssw',
    'bbs.huaweicloud.com/blogs'
];

//获取上游传入的 argument
let arguments = $argument;
let userDefinedWebsites = [];
let combine = false;
if (arguments) {
    let params = arguments.split('&');
    params.forEach(param => {
        let [key, value] = param.split('=');
        value = value.trim().replace(/^"|"$/g, '');
        if (key === 'websites') {
            userDefinedWebsites = value.split(',')
                .map(site => site.trim())
                .filter(site => site !== '');
        } else if (key === 'combine') {
            combine = value.toLowerCase() === 'true';
        }
    });
}

let userDefined = !(userDefinedWebsites.length === 0 || userDefinedWebsites.every(site => site === ''));

// 进行网站列表合并
if (userDefinedWebsites.length > 0 && combine) {
    websites = websites.concat(userDefinedWebsites);
} else if (userDefinedWebsites.length > 0) {
    websites = userDefinedWebsites;
} else if (!userDefined && !combine) {
    $done({ body });
}

// Web 版的类名
let resultClass = $persistentStore.read('GoogleResultClass') || 'MjjYud'; // 'MjjYud' 是近期版本的类名
const searchContainerId_Web = 'search';
const searchContainerId_iPhone = 'topstuff';
const displayNoneClass = 'JasonN'; // 定义一个隐藏类名

// 通知的样式
const outputStyle_Web = 'font-size: 1rem; color: green;height: 18pt;';
const outputStyle_iPhone = 'color: green; display: flex;align-items: center;height: 30pt;flex-wrap: nowrap;padding-left: 10pt;';
const outputClass = resultClass;

// 第一页搜索结果过滤
function firstLoadFiter(rawData) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawData, 'text/html');

    // 获取搜索条目的类名
    const rso = doc.getElementById('rso');
    if (rso) {
        const firstDiv = rso.querySelector('div');
        if (firstDiv) {
            $persistentStore.write(firstDiv.className.split(' ')[0], 'GoogleResultClass');
        } else {
            $persistentStore.write(resultClass, 'GoogleResultClass');
        }
    }
    resultClass = $persistentStore.read('GoogleResultClass');

    // 塞入隐藏样式
    const styleElement = doc.querySelector('style');
    styleElement.innerHTML += `.${displayNoneClass} { display: none; }`;

    // 获取搜索结果
    const results = doc.querySelectorAll(`.${resultClass}`);
    let matchCount = 0;

    results.forEach(result => {
        // 对于iPhone，额外检查是否包含具有 lang 属性的 div
        if (device === 'iPhone') {
            const topDiv = result.querySelector('div[lang]');
            if (!topDiv) return;
        }

        // 在每个 result 中寻找 a 标签
        const aElements = result.querySelectorAll('a');
        aElements.forEach(aElement => {
            const href = aElement.getAttribute('href');
            // 如果 href 为空，跳过
            if (!href) return;
            // 检查 href 是否包含指定的网址
            if (websites.some(website => href.includes(website))) {
                // 如果包含，设置不可见
                result.style.display = 'none';
                matchCount++;
            }
        });
    });

    showToast(doc, matchCount);

    return '<!doctype html>' + doc.documentElement.outerHTML;
}

// 第二页搜索结果过滤
function secondLoadFiter(rawData) {

    let htmlContent = rawData

    // 替换所有 a 标签
    let aTags = [];
    let aTagIndex = 0;
    htmlContent = htmlContent.replace(/<a([\s\S]+?)<\/a>/g, function (match, p1) {
        aTags.push(p1);
        return `<a>jn_a_to_replace_${++aTagIndex}</a>`;
    });

    // 替换所有 class
    let items = [];
    const classRegex = new RegExp(`("${resultClass}")([\\s\\S]+?)<a>jn_a_to_replace_(\\d+)`, 'g');
    htmlContent = htmlContent.replace(classRegex, function (match, p1, p2, p3) {
        items[p3 - 1] = p2;
        return `"jn_class_to_replace_${p3}"${p2}<a>jn_a_to_replace_${p3}`;
    });

    // 进行匹配和隐藏
    let matchCount = 0;
    let i = 0;
    for (i = 0; i < aTags.length; i++) {
        if (websites.some(website => aTags[i].includes(website))) {
            htmlContent = htmlContent.replace(new RegExp(`"jn_class_to_replace_${i + 1}"([\\s\\S]+?)<a>jn_a_to_replace_${i + 1}`, 'g'), `"${displayNoneClass}"${items[i]}<a>jn_a_to_replace_${i + 1}`);
            matchCount++;
        }
    }

    // 不匹配的时候直接返回
    if (matchCount === 0) {
        return rawData;
    }

    // 恢复所有未匹配的类替换
    htmlContent = htmlContent.replace(/"jn_class_to_replace_(\d+)"([\s\S]+?)<a>jn_a_to_replace_(\d+)/g, function (match, p1, p2, p3) {
        return `"${resultClass}"${items[p1 - 1]}<a>jn_a_to_replace_${p1}`;
    });

    // 恢复链接
    htmlContent = htmlContent.replace(/<a>jn_a_to_replace_(\d+)<\/a>/g, function (match, p1, p2) {
        return `<a${aTags[p1 - 1]}</a>`;
    });

    return htmlContent;
}

// 添加 Toast
function showToast(doc, count) {
    if (count === 0) return;
    const searchContainer = device === 'Mac' ? doc.getElementById(searchContainerId_Web) : doc.getElementById(searchContainerId_iPhone);

    // 创建通知元素
    const notification = doc.createElement('div');
    notification.className = outputClass;
    notification.style.cssText = device === 'Mac' ? outputStyle_Web : outputStyle_iPhone;
    notification.innerHTML = `${count} 条你不喜欢的搜索结果已被隐藏`;

    // 将通知元素添加到容器的顶部
    if (searchContainer.firstChild) {
        searchContainer.insertBefore(notification, searchContainer.firstChild);
    } else {
        searchContainer.appendChild(notification);
    }
}


// 执行过滤
if (!secondTimeLoading) {
    body = firstLoadFiter(body);
} else {
    body = secondLoadFiter(body);
}

$done({ body });
