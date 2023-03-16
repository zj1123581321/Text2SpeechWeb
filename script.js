const apiKeyInput = document.getElementById("api-key");
const saveApiKeyButton = document.getElementById("save-api-key");
const chineseInput = document.getElementById("chinese-input");
const englishInput = document.getElementById("english-input");
const translateToEnglishButton = document.getElementById(
  "translate-to-english"
);
const transcribeAudioButton = document.getElementById("transcribe-audio");
const targetLanguageSelect = document.getElementById("target-language");

saveApiKeyButton.addEventListener("click", saveApiKey);

translateToEnglishButton.addEventListener("click", translateToEnglish);

transcribeAudioButton.addEventListener("click", transcribeAudio);

function saveApiKey() {
  const apiKey = apiKeyInput.value;
  localStorage.setItem("apiKey", apiKey);
  alert("API key 保存成功");
}

async function translateToEnglish() {
  const apiKey = localStorage.getItem("apiKey");
  if (!apiKey) {
    alert("请先输入 API key 并保存");
    return;
  }

  const chineseText = chineseInput.value;
  if (!chineseText) {
    alert("请输入中文内容");
    return;
  }

  const englishText = await GoogleTranslate(chineseText, apiKey);
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
    alert("请先翻译中文内容为英文");
    return;
  }

  const targetLanguage = targetLanguageSelect.value;
  const audioBlob = await text2speech(englishText, targetLanguage, apiKey);
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.play();
}

async function GoogleTranslate(chineseText, apiKey) {
  const encodedText = encodeURIComponent(chineseText);
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-CN&tl=en&dt=t&q=${encodedText}&ie=UTF-8&oe=UTF-8&tk=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const englishText = data[0][0][0];
    return englishText;
  } catch (error) {
    alert(`翻译失败: ${error}`);
  }
}

async function text2speech(englishText, targetLanguage, apiKey) {
  const voiceName = getVoiceName(targetLanguage);
  const voiceGender = getVoiceGender(targetLanguage);
  const audioConfig = getAudioConfig();
  const synthesisInput = getSynthesisInput(englishText);
  const request = {
    input: synthesisInput,
    voice: {
      languageCode: targetLanguage,
      name: voiceName,
      ssmlGender: voiceGender,
    },
    audioConfig: audioConfig,
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
    const audioBlob = base64toBlob(audioContent, "audio/mpeg");
    return audioBlob;
  } catch (error) {
    alert(`转写失败: ${error}`);
  }
}

function getVoiceName(targetLanguage) {
  return targetLanguage === "ar-XA" ? "ar-XA-Wavenet-A" : "en-US-Wavenet-C";
}

function getVoiceGender(targetLanguage) {
  return targetLanguage === "ar-XA" ? "FEMALE" : "MALE";
}

function getAudioConfig() {
  return {
    audioEncoding: "MP3",
    speakingRate: 1.0,
    pitch: 0.0,
    volumeGainDb: 0.0,
    effectsProfileId: [],
  };
}

function getSynthesisInput(englishText) {
  return {
    text: englishText,
  };
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