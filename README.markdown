# JS Console
参考移动端的web调试工具(https://github.com/remy/jsconsole)
针对机顶盒中间件的远程调试工具

# Features
- 使用`listen`指令进行远程调试
- 键入`javascript`语句进行调试时，基于WebKit的浏览器支持智能补全
- Shift + up/down 可以关闭/开启多行脚本调试
- 基于session的调试历史记录

# Hosting jsconsole yourself
使用`nodejs`部署调试服务前，需安装`nodejs`和`npm`
1. 在项目代码目录下，执行`npm install`
2. 启动服务器，执行`node server.js`，或者指定端口`PORT=8080 node server.js`
