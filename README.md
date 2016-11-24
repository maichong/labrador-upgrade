# labrador-upgrade
Labrador代码升级与转换工具

目前可将Labrador 0.5.x版本的项目升级为0.6.x。

使用此工具升级前请务必备份你的代码。

此工具升级后的代码不保证完全可用，还请参考 [升级指南](https://github.com/maichong/labrador) 排查错误。

目前升级工具的功能包括：

* 将组件 `setData` 升级为 `setState`
* 将组件XML模板中的变量绑定到`state.*`域

安装

```
npm install -g labrador-upgrade
```

升级项目

```
cd path/to/project # 跳转到Labrador项目根目录

labrador-upgrade
```
