# Wechat-Official-Account-Web

微信公众号的关注界面

[预览效果](https://wechat.zhheo.com/)

## 入门

如果你准备使用这个项目，除了部署在自己的服务器或者网站空间之外，你需要

- 修改/img/文件夹中的图片（保证名称相同）
- 修改/variables.js文件中的配置变量

## 特性

- 响应式设计，适配各种设备
- 明亮/暗黑模式自动切换
- 主题手动切换开关
- 微信二维码展示
- 一键复制关注回复内容
- 直接跳转微信客户端功能
- 键盘导航支持
- 无障碍访问优化

## 参数

可以在url中携带参数。例如

```
https://blog.zhheo.com/wechatOA/?replyText=欢迎关注
```

### replyText

用于显示关注公众号时应该回复的内容参数

[预览效果](https://wechat.zhheo.com/?replyText=%E5%BE%AE%E4%BF%A1VI)

## 配置说明

所有配置变量都集中在 `variables.js` 文件中：

- `oaConfig`: 微信公众号信息
- `siteConfig`: 网站配置
- `copyConfig`: 复制功能文本
- `defaultReplyText`: 默认回复文本
- `imageAssets`: 图片资源配置
- `wechatConfig`: 微信跳转配置
- `themeConfig`: 主题配置
- `animationConfig`: 动画配置