---
title: WEB：Audio 音频基础
date: 2021-06-27 11:01:01
tags:
top: ture
---

Web Audio API (AduioContext) 实在太多了，当然玩起来也会很有趣。

<!-- more -->

![PCM](/images/web-audio/audio.jpeg)

## 基础概念

声音：根据初中物理知识，声音是由物体振动产生的__声波__，通过介质（空气或固体、液体）传播，被人或动物听觉器官所感知的波动现象。气压的变化会产生声音信号，声音是一种波。人的耳朵可以听到20~20000Hz的声音，最敏感是200~800Hz之间的声音，蚊子挥动翅膀的频率刚好就在 600Hz 左右（频率越高音调 pitch 或 key 越高）。

我们可以测量压力变化的强度，并绘制随时间变化的测量值。其中音频采样，是把声音从模拟信号转换为数字信号，所得的被称为 `PCM` 。

![PCM](/images/web-audio/audio-steps.png)

- 模拟信号：通常指连续的物理量，例如温度、湿度、速度、光照、声响等
- 数字信号：通常是模拟信号经过采样、量化和编码等几个步骤后得到的

## PCM

 `PCM` (脉冲编码调制）有[三要素](https://www.cnblogs.com/yongdaimi/p/10722355.html)：声道数（channel number）、采样率（sample rate）、采样位数或位深（bit depth）。

![PCM](/images/web-audio/pcm.png)

> PCM 是一种编码格式，WAV 是一种文件格式。

### 声道数

声道数，常见的声道（喇叭数量）类型：

- 单声道：Mono，单喇叭或者两个喇叭输出同一个声道的声音（**在线 ASR 录音用的是单声道**）
- 双声道：Stereo，分左声道和右声道，更加有空间效果

![双声道](/images/web-audio/channel.png)

### 采样率

采样率：每秒对声音进行采集的次数，同样也是所得的数字信号的每秒样本数，单位为 Hz。**采样率越高，声音的质量就越好，声音的还原就越真实越自然。**

当然人耳对频率识别范围有限，超过 48k 的采样率意义不大，一般 20k 可以满足， **22050 Hz** 为常用的采样频率。

- 采样率：数字音频系统记录声音信号时每秒采集的数据个数
- 声音频率：物体每秒的震动频率

> [声音频率和采样率的区别](https://www.zhihu.com/question/27644914)：其实它们之间没有直接关系，不是同一回事。

![采样率](/images/web-audio/sample-rate.png)

### 采样位数

采样位数：采样后，将采样的单个样本进行量化，用来衡量声音波动变化的一个参数，也可以说是声卡的分辨率。**它的数值越大，分辨率也就越高，所发出声音的能力就越强，声音越好。**

n-bit 指的是声音的强度（振幅）被均分为 2^n 级，常用的有 8bit（1字节）、`16bit（2字节）`、32bit（4字节）。振幅越大，音量越大。

在把量化所得的结果，即单个声道的样本，以`二进制`的码字进行存放。

> B for Byte (字节)， b for bit（位）。1 Byte = 8 bit

![采样位数](/images/web-audio/bit-depth.png)

### 比特率

比特率：每秒的传输速率，单位为 bps。

采样率为 16khz，位深为 16 bit，单声道的比特率为 `16000 * 16 * 1 = 256000 b/s（比特/秒）`，转化为字节 `256000 / 8 = 32000 B/s（字节/秒）`。

> 通常说的 10M 带宽为 10Mbps（这里是比特），下载速率为 10M / 8 = 1.25 MB/s（这里是字节）

## 音频采集

讲述完 PCM 的基础概念后，开始谈谈如何通过浏览器实现音频采集。

### getUserMedia

实现媒体音频采集的是 `WebRTC` 技术，使用的方法是 `navigator.mediaDevices.getUserMedia()`，需要做低版本兼容。麦克风或摄像头的启用涉及到安全隐私，通常网页中会有弹框提示，用户确认后才可启用相关功能，调用成功后，回调函数中就可以得到**多媒体流对象**，后续的工作就是围绕这个`媒体流(MediaStream)`展开的。

![wav-audio-api](/images/web-audio/web-audio-api.png)

```Javascript
navigator.mediaDevices.getUserMedia({audio:true})
  .then(mediaStream=> {
    // audioInput 表示音频源节点
    const audioInput = audioContext.createMediaStreamSource(stream);
    // scriptProcessorNode 为关键节点
    const recorder = audioContext.createScriptProcessor(4096, 1, 1)
    // 音频采集，每采集完样本帧预设数值（4096）后会触发 onaudioprocess 接口一次
    recorder.onaudioprocess = (e: {
      inputBuffer: AudioBuffer;
      outputBuffer: AudioBuffer;
    }) => {
      // 核心：处理 AudioBuffer 逻辑，假设是单声道
      encodePCM(compress(e.inputBuffer.getChannelData(0)))
    }
    audioInput.connect(recorder);
    recorder.connect(audioContext.destination);
  })
```

核心过程：

1. 通过 createMediaStreamSource 方法创建 MediaStreamAudioSourceNode 音频源节点

2. 通过 createScriptProcessor 方法创建 scriptProcessorNode 脚本处理节点

3. 通过 scriptProcessorNode 节点的 onaudioprocess 回调函数**处理音频逻辑**

#### [AudioBuffer](https://developer.mozilla.org/zh-CN/docs/Web/API/AudioBuffer)

AudioBuffer接口表示存在内存里的一段短小的音频资源。缓存区（buffer）包含以下数据：不间断的 IEEE754 32 位线性PCM，从-1到1的范围额定，就是说，32位的浮点缓存区的每个样本在-1.0到1.0之间。

#### 采样率的转写

音频是由浏览器采样率（一般为 48k）采集的，需要进行转写为我们真正需要的采样率（假设 16k），只支持由高转低，**具体为按照输入采样率和输出采样率的比例，每隔比例位数取1位**。

```Javascript
/**
 * 根据输入和输出的采样率压缩数据，
 * 比如输入的采样率是48k的，我们需要的是（输出）的是16k的，由于48k与16k是3倍关系，
 * 所以输入数据中每隔3取1位
 *
 * @param {float32array} data       [-1, 1]的pcm数据
 * @param {number} inputSampleRate  输入采样率
 * @param {number} outputSampleRate 输出采样率
 * @returns  {float32array}         压缩处理后的二进制数据
 */
  function interleave(data: Float32Array, inputSampleRate: number, outputSampleRate: number) {
    const t = data.length;
    let s = 0;
    const o = inputSampleRate / outputSampleRate;
    const u = Math.ceil((t * outputSampleRate) / inputSampleRate);
    const a = new Float32Array(u);
    for (let i = 0; i < u; i++) {
      a[i] = data[Math.floor(s)];
      s += o;
    }
    return a;
  }
```

#### 位深的转写

采样率的问题解决完，还需要将音频流转为对应位深，生成长度为（位深/8 * 音频原长度）的 Uint8Array。

```Javascript
// bit reduce and convert to integer
switch (this.bytesPerSample) {
  case 4: // 32 bits signed
    sample = sample * 2147483647.5 - 0.5;
    reducedData[outputIndex] = sample;
    // tslint:disable-next-line:no-bitwise
    reducedData[outputIndex + 1] = sample >> 8;
    // tslint:disable-next-line:no-bitwise
    reducedData[outputIndex + 2] = sample >> 16;
    // tslint:disable-next-line:no-bitwise
    reducedData[outputIndex + 3] = sample >> 24;
    break;

  case 3: // 24 bits signed
    sample = sample * 8388607.5 - 0.5;
    reducedData[outputIndex] = sample;
    // tslint:disable-next-line:no-bitwise
    reducedData[outputIndex + 1] = sample >> 8;
    // tslint:disable-next-line:no-bitwise
    reducedData[outputIndex + 2] = sample >> 16;
    break;

  case 2: // 16 bits signed
    sample = sample * 32767.5 - 0.5;
    reducedData[outputIndex] = sample;
    // tslint:disable-next-line:no-bitwise
    reducedData[outputIndex + 1] = sample >> 8;
    break;

  case 1: // 8 bits unsigned
    reducedData[outputIndex] = (sample + 1) * 127.5;
    break;
```

### HTTPS vs HTTP

获取麦克风权限时需要 https 协议下验证，如何能在 http 网站情况下也可以获取[权限](https://support.scandit.com/hc/en-us/articles/360002743551-Do-I-really-need-to-serve-my-site-with-https-)。

> chrome://flags/#unsafely-treat-insecure-origin-as-secure

本地服务 iOS wss 连接断开问题，[需要开启指定的新特性](https://stackoverflow.com/questions/37898048/websocket-network-error-osstatus-error-9807-invalid-certificate-chain/42148960)

> Settings（设置） > Safari > Advanced（高级） > Experimental Features > NSURLSession Websocket

### 设备兼容情况

Android WebView 和 Chrome 支持程度较好，Mac 和 iOS Safari 支持系统版本 11 及以上，**iOS WKWebView 支持系统版本 14.3 及以上（iOS 微信内置浏览器和小程序 web-view 使用的是 WKWebView）**。

![getUserMedia](/images/web-audio/getUserMedia.jpeg)

## 音频播放

下一步，需要了解采集后得到的 PCM 是如何播放：PCM 是无法直接播放的，需要给 PCM **添加 wav 头部**，才能通过 AudioContext 转换为 AudioBuffer 播放。

### 转换

wav 格式是一种无损格式，是依据规范在 pcm 数据前添加 **44** 个__字节__长度用来填充一些声明信息的。wav 头部有 44 个字节，具体对应如下：

![wav 头部](/images/web-audio/wav-header.png)

<details>
<summary>如何添加 wav 头部代码</summary>

```Javascript
  public generateWavHeader(options: IWavHeaderOptions): ArrayBuffer {
    const {
      numFrames = originArrayBuffer.byteLength, // originArrayBuffer 为源 PCM
      numChannels = 1,
      sampleRate = 16000,
      bytesPerSample = 2
    } = options;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const chunkSize = (numFrames as number) * blockAlign;

    const buffer = new ArrayBuffer(44);
    const dataview = new DataView(buffer);

    let position = 0;
    position = this.dataviewWriteString(dataview, 'RIFF', position); // ChunkID
    position = this.dataviewWriteUint32(dataview, chunkSize + 36, position); // ChunkSize
    position = this.dataviewWriteString(dataview, 'WAVE', position); // Format
    position = this.dataviewWriteString(dataview, 'fmt ', position); // Subchunk1ID
    position = this.dataviewWriteUint32(dataview, 16, position); // Subchunk1Size
    position = this.dataviewWriteUint16(dataview, 1, position); // AudioFormat
    position = this.dataviewWriteUint16(dataview, numChannels, position); // NumChannels
    position = this.dataviewWriteUint32(dataview, sampleRate, position); // SampleRate
    position = this.dataviewWriteUint32(dataview, byteRate, position); // ByteRate
    position = this.dataviewWriteUint16(dataview, blockAlign, position); // BlockAlign
    position = this.dataviewWriteUint16(dataview, bytesPerSample * 8, position); // BitsPerSample
    position = this.dataviewWriteString(dataview, 'data', position); // Subchunk2ID
    this.dataviewWriteUint32(dataview, chunkSize, position); //  Subchunk2Size

    return buffer;
  }

  public concatArrayBuffer(...buffers: ArrayBuffer[]): ArrayBuffer {
    const newBufferLength = buffers.reduce((total, buffer) => {
      total += buffer.byteLength;
      return total;
    }, 0);
    const newBuffer = new Uint8Array(newBufferLength);

    let bufferIndex = 0;
    buffers.forEach((buffer) => {
      newBuffer.set(new Uint8Array(buffer), bufferIndex);
      bufferIndex += buffer.byteLength;
    });

    return newBuffer.buffer;
  }

  private dataviewWriteString(
    dataview: DataView,
    str: string,
    position: number
  ): number {
    for (let i = 0; i < str.length; i++) {
      dataview.setUint8(position + i, str.charCodeAt(i));
    }
    position += str.length;
    return position;
  }

  private dataviewWriteUint32(
    dataview: DataView,
    num: number,
    position: number
  ): number {
    dataview.setUint32(position, num, true);
    position += 4;
    return position;
  }

  private dataviewWriteUint16(
    dataview: DataView,
    num: number,
    position: number
  ): number {
    dataview.setUint16(position, num, true);
    position += 2;
    return position;
  }
```

</details>

通过浏览器打印日志或者通过记事本打开 WAV 格式的音频 可以发现：

![wav 头部](/images/web-audio/arrayBuffer.png)

WAV文件格式的结构组成，对该内容进行分析如下：

```Javascript
52 49 46 46（ChunkID，4 字节） = ‘RIFF’

24 42 04 00 （ChunkSize，4 字节）=  279076  = 279084 - 8

57 41 56 45 （Format，4 字节） = ‘WAVE’

66 6D 74 20 （Subchunk1ID，4 字节） = ‘fmt ’

10 00 00 00 (Subchunk1 Size，4 字节) = 16

01 00（AudioFormate，2 字节） = 音频格式 = 1

01 00 （NumChannels，2 字节）= 声道数 = 1

80 3E 00 00（SampleRate，4 字节）= 采样率 = 16000

00 7D 00 00（ByteRate，4 字节）= 字节率 = 32000 = 16000 * 16 / 8

02 00 （BlockAlign，2 字节）= 内存对齐 = 2

10 00 （BitsPerSample）= 每个样本的位深度 =  16

64 61 74 61（Subchunk2ID，4 字节） = ‘data’

00 42 04 00 (Subchunk2 Size，4 字节) = 音频PCM数据大小 = 279040 = 279084 - 44
```

![wav 头部分析](/images/web-audio/wav-header-detail.jpeg)

可以通过 `file` 命令查看 wav 头部简要信息

```Bash
$file test.wav
```

![wav-file](/images/web-audio/wav-file-detail.png)

### 解码(decode)

通过 `AudioContext` 的 `decodeAudioData` API 解码 wav 文件中的 ArrayBuffer，转换为 Audiobuffer。

```Javascript
function playWav(wavBuffer: ArrayBuffer) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioContext();

  // Safari 不支持 decodeAudioData promise 模式
  audioCtx.decodeAudioData(
    wavBuffer,
    (audioBuffer) => {},
    (err) => {}
  );
}
```

### 降噪（消除毛刺）

播放短小的 Audiobuffer 时开始和结束可能会有细微的噪音出现，其中[降噪](https://stackoverflow.com/questions/53100047/why-state-can-be-invalid-in-web-audio-in-safari-after-resume)的方法如下：

```Javascript
function deNoising(buffer: AudioBuffer) {
  const fixRange = 100; // 该数值根据情况调整
  const audioBufferArray = buffer.getChannelData(0);
  const length = audioBufferArray.length;

  for (let i = 0; i < fixRange; i++) {
    audioBufferArray[i] = (audioBufferArray[i] * i) / fixRange; // fade in
    audioBufferArray[length - i - 1] =
      (audioBufferArray[length - i - 1] * i) / fixRange; // fade out
  }
}
```

### 播放

通过 createBufferSource() 方法用于创建一个新的 `AudioBufferSourceNode` 接口, 该接口可以通过 AudioBuffer 对象来播放音频数据。再连接到 AudioContext 中所有音频（节点）的最终目标节点，一般是音频渲染设备，比如扬声器。

```Javascript
function play(buffer: AudioBuffer) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioContext();
  const source = audioCtx.createBufferSource();

  source.buffer = buffer;
  source.connect(audioCtx.destination);
  source.start();
}
```

### PCM 播放工具

音频混音器：[Audacity](https://www.audacityteam.org/)

![audacity](/images/web-audio/audacity.png)

## ArrayBuffer

`ArrayBuffer` 对象用来表示通用的、*固定长度*的__原始二进制数据缓冲区__（预分配内存）。

```Javascript
 const buffer = new ArrayBuffer(16); // 16 字节长度的 ArrayBuffer
 console.log(buffer.byteLength);
```

- 单位是__字节__，它是一个字节数组，通常在其他语言中称为 byte array
- 不能__直接操作__ `ArrayBuffer` 的内容，只能通过 DataView 或者定型数组对象操作
- ArrayBuffer 分配的内存__不能超过__ Number.MAX_SAFE_INTEGER(2^53 - 1) 字节

### DataView

`DataView` 视图是一个可以从二进制 *ArrayBuffer* 对象中读写多种数值类型的底层接口，使用它时不用考虑不同平台的`字节序`问题。

> 必须在对已有的 ArrayBuffer 读取或写入时才能创建 DataView 实例。

```Javascript
 const buffer = new ArrayBuffer(16)

 const dataview = new DataView(buffer);
 dataview.setUint8(0, 255);
 dataview.setUint8(1, 0xff);
 console.log(dataview.byteOffset);
 console.log(dataview.byteLength);
 console.log(dataview.buffer === buffer); // DataViiew 维护着对该缓冲实例的引用
```

要通过 DataView 读取缓冲，还需要以下几点：

- 首先是要读或者写的字节偏移量。可以看出 DataView 中的某种“地址”
- DataView 应该使用 ElementType 来实现 Javascript 的 Number 类型到缓冲内二进制格式的转换
- 最后是内存中值的字节序。默认为大端字节序

### 定型数组

![DataView Element Type](/images/web-audio/dataview-type.jpeg)

### 字节序

[字节序](https://developer.mozilla.org/zh-CN/docs/Glossary/Endianness)，或字节顺序（"Endian"、"endianness" 或 "byte-order"），描述了计算机如何组织字节，组成对应的数字。

每一个字节可以存储一个 8 位（bit）的数字（0x00-0xff），存储更大数字需要多个字节，现在大部分需占用多字节的数字排列方式是 little-endian（低位字节排放在内存中低地址端，高字节排放在内存的高地址端），与 big-endian 相反。

举例：用不同字节序存储数字 `0x12345678`(即十进制中的 305 419 896)

- little-endian：`0x78 0x56 0x34 0x12`
- big-endian：`0x12 0x34 0x56 0x78`

## 问题总结

总结下处理音频时遇到的问题：iOS 和 Safari 问题就是特别多。

### iOS Q&A

#### 1. Safari 调用 AudioContext 的次数有限

问题：多次生成 AudioContext 实例会报错 `null is not an object`

方案：销毁  AudioContext 实例

```Javascript
AudioContext.close(); // 关闭一个音频环境, 释放任何正在使用系统资源的音频.
```

#### 2. Safari 不支持 AudioContext.decodeAudio Promise

问题：AudioContext.decodeAudio Promise Safari 下会报错

方案：直接使用回调函数，不使用 Promise

#### 3. iOS AudioContext 播放没有声音

问题：点击 Audio 标签播放有声音，AudioContext 播放没有声音

方案：检查后发现 AudioContext 在 iOS 静音模式下无法播放声音，其次判断 AudioContext 是否处于 running 状态，否则调用

```Javascript
audioContext.resume();
```

#### 4. iOS Safari 不触发 canplaythrough 事件

问题：iOS Audio 标签加载资源后 Safari 不触发 canplaythrough 事件

方案：设置 src 后调用 load 方法（iOS 14 及以上）

```Javascript
const audio = document.createElement('AUDIO');
audio.addEventListener('canplaythrough', loadedVideo, false);
audio.src = url;
audio.load(); // 关键代码
```

#### 5. iOS Safari 显示播放时间不正确

问题：iOS Safari Audio 标签加载资源后显示的时间长度不正确

方案：头部部分字段值不正确

#### 6. iPad 14.8 播放时间不正确

问题：iPad 14.8 AudioContext 播放的时间跟理论上（source.buffer.duration 或者 arraybuffer/samplerate/2）计算的时间不一致，实际上播放时间更短

方案：使用 source.onended 监听回调函数替代

最后寄语：WebRTC 和 FFmpeg 太多要学习的，后续再进一步研究。

参考文章：

[音频属性相关：声道、采样率、采样位数、样本格式、比特率](https://www.cnblogs.com/yongdaimi/p/10722355.html)

[让音视频学习变得简单之音频深度学习](https://rtcdeveloper.com/t/topic/21480)

[WebRTC在浏览器中如何获得指定格式的PCM数据](https://www.cnblogs.com/dashnowords/p/11795251.html)

[WAVE PCM soundfile format](http://soundfile.sapp.org/doc/WaveFormat/)

[ArrayBuffer MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)

Javascript 高级程序设计（第四版）：定型数组
