# GoogleSearchFilter

通过 Surge ，对 Google 搜索结果进行过滤，隐藏那些不想看到的网站的结果（比如内容农场）。

安装地址：

[https://jason5ng32.github.io/GoogleSearchFilter.sgmodule](https://jason5ng32.github.io/GoogleSearchFilter/GoogleSearchFilter.sgmodule)

需确保 Surge 当前是最新版本，否则会运行不正常。

## 为什么做这个模块

前段时间看到字节的豆包通过大量生成的 AI 内容污染了 Google 搜索结果，于是就想，我能不能在搜索结果里过滤掉豆包？

而实际上，不仅仅是豆包，还有很多网站我不希望它们出现在搜索结果里，俗称「内容农场」。

通过搜索发现，Chrome 上一个名为 `uBlacklist` 的扩展，能实现这个需求，而且实现得非常好。

然而，手机上 Chrome 无法安装扩展，于是我想，或许我可以试试写一个 Surge 的模块，通过修改 Google 返回的数据，进行搜索结果过滤。

然后就做出来了。

实测基本上不影响搜索结果的返回速度，如果有的话，也是 ms 级别的。

## 如何启用

1. 首先，确保你的 Surge 是最新版本，Mac v5.5+, iOS v5.9+
2. 确保你的 Surge 已经启用了 MitM、HTTP 重写和脚本功能，并且系统已经信任了你的自定义证书
3. 通过上面的安装地址进行安装，安装后记得更新一下外部资源，确保脚本已经被加载进来
4. 修改模块里的参数，包括 Websites 和 Combine 两个参数
   1. Websites：网站列表，用逗号分开，可以包含路径，不支持正则。
   2. Combine：是否将结果合并，默认是 `true`，表示将自定义的名单和内置名单合并，`true` 为是，其它都为否。
5. 内置的名单我思考了许久，其实网上有公开的内容农场名单，但是我没有添加进去，只添加了某几个明确认为内容非常垃圾的网站。
6. Websites 的默认值我也写了几个，包括 CSDN 的博客、百度知道、百度经验。如果你不设置 Websites，这些默认值都会生效。设置一下就消失了。

## Mac 上能用吗

答案是，能。我确实在代码里兼容了 Mac。

但是，Mac 上我反而更建议使用 `uBlacklist`，因为它的原理更轻一些，功能也更强大。

要不是 Chrome for iOS 不能安装插件，谁没事写这种需要启用 MitM 的东西呢。
