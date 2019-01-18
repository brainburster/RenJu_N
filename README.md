RenJuN-五?子棋
---
[查看项目](https://brainburster.github.io/RenJuN/ "五子棋项目")  
---
说明
---
运行项目
---
- 直接用游览器打开**public**文件夹下的**index.html**即可
<<<<<<< HEAD
- 如果安装了*nodejs*，可以在控制台输入`node index.js`运行服务器程序时，这个*index.js*只是我写的一个普通的静态文件服务器，然后在游览器地址栏输入`http://127.0.0.1:8080/`
=======
- 或者，如果你安装了*nodejs*，可以在控制台输入`node index.js`运行服务器程序时，*index.js*只是一个普通的静态文件服务器，然后在游览器地址栏输入`http://127.0.0.1:8080/`打开网页
>>>>>>> f5ae407c985526262c7e9260b7e8659444c49990
- 不支持*IE8*以下
- *src*目录下的*index.html*文件**并不能**运行

开发设置
---
- 使用*npm*安装开发时依赖
```
npm install
```
- webpack需要全局安装
```
npm install webpack webpack-cli -g
```
- 在控制台输入指令`webpack`, 使用*webpack*来打包、编译ES6的代码
``` 
  webpack
```
<<<<<<< HEAD
- 源代码在*src*文件夹下面,*public*文件夹下是编译好的静态网页文件
- 测试项目
```
npm test
```

=======
- 源代码在*src*文件夹下面,编译好的静态网页文件在*public*文件夹下
>>>>>>> f5ae407c985526262c7e9260b7e8659444c49990

 todolist
 ---
- [x] 可改变棋盘大小
- [x] 可设获胜所需的棋子数
- [x] 悔棋
- [x] 棋盘调试
- [x] 贪心算法（先验知识）
- [x] 博弈树（使用了负极大值算法，与极大极小值算法类似）
- [x] alpha-beta减枝
- [x] 启发式(先验)减枝
- [x] 迭代深化
- [ ] 置换表
- [ ] 开局库
- [ ] 禁手
- [ ] 网页多线程
- [ ] AI设置界面
- [x] 设置时限
- [ ] 其他功能
<<<<<<< HEAD
- [ ] 界面美化
=======

[详细信息](https://github.com/brainburster/RenJuN/blob/master/src/README.md)
---
>>>>>>> f5ae407c985526262c7e9260b7e8659444c49990
