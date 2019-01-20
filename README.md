# RenJuN-五?子棋

## [查看项目](https://brainburster.github.io/RenJuN/ "五子棋项目")  

## 说明

### 运行项目

- 直接用游览器打开*public*文件夹下的*index.html*即可
- 或者，如果你安装了**nodejs**，可以在控制台输入`node index.js`运行服务器程序时，这个*index.js*只是一个普通的静态文件服务器，然后在游览器地址栏输入`http://127.0.0.1:8080/`打开网页
- 由于使用了**inline worker**实现的多线程，因此多线程功能不支持**IE**
- *src*目录下是源码文件，无法再游览器上运行，通过**webpack**打包之后，在*public*文件夹下生成的文件才能够在游览器上运行

### todolist

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
- [X] 网页多线程
- [X] AI设置界面
- [x] 设置时限
- [ ] 其他功能
- [ ] ~~界面美化~~
- [ ] 兼容IE
