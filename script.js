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
	const fileName = `${new Date().toISOString().slice(0, 19).replace(/[-:]/g, "")}-${chineseText}.mp3`;
	const downloadLink  = document.createElement("a");
  downloadLink.href = audioUrl;
  downloadLink.download = fileName;
  downloadLink.click();
}

async function GoogleTranslate(chineseText, targetLanguageCode) {
  const encodedText = encodeURIComponent(chineseText);
	const url = `https://translate.googleapis.com/translate_a/single?dt=t&dt=bd&dt=qc&dt=rm&client=gtx&sl=auto&tl=${targetLanguageCode}zh-CN&hl=en-US&dj=1&q=${encodedText}&tk=574558.574558`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const englishText = data.sentences.map(sentence => sentence.trans).join('');
    return englishText;
  } catch (error) {
    alert(`翻译失败: ${error}`);
  }
}

async function text2speech(englishText, targetLanguage, apiKey) {
  const targetLanguageConfig = languageConfig[targetLanguage];
// 调用 Google translate 将 EnglishtText 翻译成目标语言
  const TargetLanguageCode = targetLanguageConfig.languageCode;
	const TargetLanguageText = await GoogleTranslate(englishText, TargetLanguageCode);
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