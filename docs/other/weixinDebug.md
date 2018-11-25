# 使用 Fiddler 调试微信 js sdk

## PC 端调试

1. 打开 fiddler hosts，`菜单 -> Tools -> hosts`，填入内容格式为：targethost hostname
   例如：192.168.1.19 xxx.xxx.com
2. 在浏览器直接访问 xxx.xxx.com 就可以了
3. 如果在微信调试工具中调试，需要另外将微信调试工具的代理设置为：本机 ip，端口号 8888

## 手机端调试

1. 在 pc 端的 fiddler 中，开启 Allow remote computers to connect `如何开启请自行百度`
2. 重启 fiddler
3. 手机连上 wifi，跟电脑处于通过局域网i
4. 修改 wifi 中的 HTTP 代理，设置为本机 ip，端口号 8888

> 注意，想要通过 js sdk 的验证，你的域名需在微信开放平台上设置为安全域名
