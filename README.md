# GoogleSearchFilter

通过 Surge ，对 Google 搜索结果进行过滤，隐藏那些不想看到的网站的结果（比如内容农场）。

安装地址：

[https://jason5ng32.github.io/GoogleSearchFilter.sgmodule](https://jason5ng32.github.io/GoogleSearchFilter/GoogleSearchFilter.sgmodule)

## 为什么做这个模块

前段时间看到字节的豆包通过大量生成的 AI 内容污染了 Google 搜索结果，于是就想，我能不能在搜索结果里过滤掉豆包？

而实际上，不仅仅是豆包，还有很多网站我不希望它们出现在搜索结果里，比如一些「内容农场」，比如那些要登录或者点击好几次才能查看内容的网站。

通过搜索发现，Chrome 桌面版上一个名为 `uBlacklist` 的扩展，能实现这个需求，而且实现得非常好。

而我能搜索到的，在手机上进行搜索结果过滤的，都是基于代理规则对链接进行屏蔽。可是，我要的不是屏蔽，而是隐藏。我他妈的就不想看见它们，而不是点击后打不开。

因为手机上 Chrome 无法安装扩展，于是我想，或许我可以试试写一个 Surge 的模块，通过修改 Google 返回的数据，进行搜索结果过滤。

然后就做出来了。

实测基本上不影响搜索结果的返回速度，如果有的话，也是 ms 级别的。

## 如何启用

1. 首先，确保你的 Surge 是最新版本，Mac v5.6+, iOS v5.10+
2. 确保你的 Surge 已经启用了 MitM、HTTP 重写和脚本功能，并且系统已经信任了你的自定义证书
3. 通过上面的安装地址进行安装，安装后记得更新一下外部资源，确保脚本已经被加载进来
4. 修改模块里的参数，包括 Websites 和 Combine 两个参数
   1. Websites：网站列表，用逗号分开，可以包含路径，不支持正则。
   2. Combine：是否将结果合并，默认是 `true`，表示将自定义的名单和内置名单合并，`true` 为是，其它都为否。
5. 内置的名单我思考了许久，其实网上有公开的内容农场名单，但是我没有添加进去，只添加了某几个经常污染我搜索结果的网站。
6. Websites 的默认值我也写了几个，包括 CSDN 的博客、百度知道、百度经验。如果你不设置 Websites，这些默认值都会生效。设置一下就消失了。（什么，你要留空？那你装这个模块干啥？）

## Mac 上能用吗

答案是，能。我确实在代码里兼容了 Mac。

但是，Mac 上我反而更建议使用 `uBlacklist`，因为它的原理更轻一些，功能也更强大。

要不是 Chrome for iOS 不能安装插件，谁没事写这种需要启用 MitM 的东西呢。

## 这和在搜索关键词里加减号有什么区别

加减号当然是很好的做法。但是，会有 2 个问题：

1. 搜索词就脏了，同时还有可能触发不了 suggestion 。
2. 如果你有 1000 个网站要过滤，你添加 1000 个减号试试看……

## 支持其它工具不

是否支持 Loon, Quantumult X, Stash 之类的？理论上是可以移植的，您有空可以搞搞。
