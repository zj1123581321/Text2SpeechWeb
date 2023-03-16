const apiKeyInput = document.getElementById("api-key");
const saveApiKeyButton = document.getElementById("save-api-key");
const chineseInput = document.getElementById("chinese-input");
const englishInput = document.getElementById("english-input");
const translateToEnglishButton = document.getElementById(  "translate-to-english");
const transcribeAudioButton = document.getElementById("transcribe-audio");
const targetLanguageSelect = document.getElementById("target-language");

const languageConfig = {
    "阿拉伯语-WaveNet-女A": {"languageCode":"ar-XA","name":"ar-XA-Wavenet-A","ssmlGender":"FEMALE"},
    "阿拉伯语-WaveNet-男B": {"languageCode":"ar-XA","name":"ar-XA-Wavenet-B","ssmlGender":"MALE"},
    "阿拉伯语-WaveNet-男C": {"languageCode":"ar-XA","name":"ar-XA-Wavenet-C","ssmlGender":"MALE"},
    "阿拉伯语-WaveNet-女D": {"languageCode":"ar-XA","name":"ar-XA-Wavenet-D","ssmlGender":"FEMALE"},
    "美国英语-WaveNet-女K": {"languageCode":"en-US","name":"en-US-News-K","ssmlGender":"FEMALE"}
  };

	// 尝试从 local storage 中加载 API key
const apiKey = localStorage.getItem('apiKey');
if (apiKey) {
  apiKeyInput.value = apiKey;
}

// 如果 targetLanguageSelect 选中，自动保存到 local storage
targetLanguageSelect.addEventListener("change", () => {
  const targetLanguage = targetLanguageSelect.value;
  localStorage.setItem("targetLanguage", targetLanguage);
});

// 如果 local storage 中有 targetLanguage，自动选中
const targetLanguage = localStorage.getItem("targetLanguage");
if (targetLanguage) {
  targetLanguageSelect.value = targetLanguage;
}

saveApiKeyButton.addEventListener("click", saveApiKey);

translateToEnglishButton.addEventListener("click", translateToEnglish);

transcribeAudioButton.addEventListener("click", transcribeAudio);

function saveApiKey() {
  const apiKey = apiKeyInput.value;
  localStorage.setItem("apiKey", apiKey);
  alert("API key 保存成功");
}

async function translateToEnglish() {
  const chineseText = chineseInput.value;
  if (!chineseText) {
    alert("请输入中文内容");
    return;
  }
  const englishText = await GoogleTranslate(chineseText, "en");
  englishInput.value = englishText;
}

async function transcribeAudio() {
  const apiKey = localStorage.getItem("apiKey");
  if (!apiKey) {
    alert("请先输入 API key 并保存");
    return;
  }

  const englishText = englishInput.value;
  if (!englishText) {
    alert("请先翻译中文内容为英文,或者自行输入英文内容");
    return;
  }

  const targetLanguage = targetLanguageSelect.value;
  const audioBlob = await text2speech(englishText, targetLanguage, apiKey);
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.play();
	// 保存音频文件
	const chineseText = chineseInput.value;
  const fileName =  `${getNowTime()}-${chineseText}.mp3`;
	// const fileName = `${new Date().toISOString().slice(0, 19).replace(/[-:]/g, "")}-${chineseText}.mp3`;
	const downloadLink  = document.createElement("a");
  downloadLink.href = audioUrl;
  downloadLink.download = fileName;
  downloadLink.click();
}

//获取当前时间，返回 yymmdd-hhmmss 格式,格式对齐
function getNowTime() {
  const now = new Date();
  const year = now.getFullYear().toString().slice(2);
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hour = now.getHours().toString().padStart(2, "0");
  const minute = now.getMinutes().toString().padStart(2, "0");
  const second = now.getSeconds().toString().padStart(2, "0");
  const time = `${year}${month}${day}-${hour}${minute}${second}`;
  return time;
}

async function GoogleTranslate(chineseText, targetLanguageCode) {
  const encodedText = encodeURIComponent(chineseText);
	const url = `https://translate.googleapis.com/translate_a/single?dt=t&dt=bd&dt=qc&dt=rm&client=gtx&sl=auto&tl=${targetLanguageCode}&hl=en-US&dj=1&q=${encodedText}&tk=574558.574558`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const targetText = data.sentences.map(sentence => sentence.trans).join('');
    console.log("翻译结果: " + targetText);
    return targetText;
  } catch (error) {
    alert(`翻译失败: ${error}`);
  }
}

async function text2speech(englishText, targetLanguage, apiKey) {
  // 调用 Google translate 将 EnglishtText 翻译成目标语言
  const targetLanguageConfig = languageConfig[targetLanguage];
  console.log(targetLanguageConfig);
  const TargetLanguageCode = targetLanguageConfig.languageCode;
  console.log(TargetLanguageCode);
	const TargetLanguageText = await GoogleTranslate(englishText, TargetLanguageCode);
  console.log(TargetLanguageText);
  // 调用 text2speech API 将目标语言文本转换为音频
	const request = {
			"input": {"text": TargetLanguageText},
			"voice": targetLanguageConfig,
			"audioConfig": {"audioEncoding": "MP3"}
			};
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    // 根据 response 判断请求是否成功
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }
    const data = await response.json();
    const audioContent = data.audioContent;
    const audioBlob = base64toBlob(audioContent, "audio/mp3");
    return audioBlob;
  } catch (error) {
    alert(`转写失败: ${error}`);
  }
}

function base64toBlob(base64Data, contentType) {
    contentType = contentType || "";
    const sliceSize = 1024;
    const byteCharacters = atob(base64Data);
    const bytesLength = byteCharacters.length;
    const slicesCount = Math.ceil(bytesLength / sliceSize);
    const byteArrays = new Array(slicesCount);
  
    for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
      const begin = sliceIndex * sliceSize;
      const end = Math.min(begin + sliceSize, bytesLength);
  
      const bytes = new Array(end - begin);
      for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
        bytes[i] = byteCharacters[offset].charCodeAt(0);
      }
      byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
  
    return new Blob(byteArrays, { type: contentType });
  }