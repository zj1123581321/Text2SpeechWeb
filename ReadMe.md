## 使用说明

### 获取 Google Text 2 Speech Api Key

如果你是 Fd 的朋友，请点击[文章](https://wiki.duolainc.com/pages/viewpage.action?pageId=43462257)获取 API key。该 API key *仅在 Fd 内网条件**下可以使用，在家使用请挂 VPN。

如果你想自己申请 API key，请参考[文章](https://zhanglixing.feishu.cn/docs/doccnvP6BLCiBwjHZrtGEPI97cA#Ldp3p2)自行申请。

拿到 API key 后，点击『Save』，后续无需重新输入。

### 中翻英
在『中文内容』输入框输入要翻译的中文内容，点击『翻译成英文』，翻译后的英文文本会自动出现在『English Content』中。

如有错误，**你可以自行修改英文翻译内容**

### 英翻阿并生成 mp3
英文内容如果确认无误，可以选择声音风格，然后点击『转写音频』。网站自动会自动播放生成的 MP3 文件，然后下载到本地。

## 注意事项
1. 功能全部在前端网页实现，调用了 Google Translate 和 Google Text2Speech API，请确保自己的网络条件可以正常访问 Google。

## 参考文档
[Method: text.synthesize  |  Cloud Text-to-Speech Documentation  |  Google Cloud](https://cloud.google.com/text-to-speech/docs/reference/rest/v1/text/synthesize)

[Supported voices and languages  |  Cloud Text-to-Speech Documentation  |  Google Cloud](https://cloud.google.com/text-to-speech/docs/voices)