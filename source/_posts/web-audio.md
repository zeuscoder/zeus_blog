---
title: WEB：Audio 音频基础
date: 2021-06-27 11:01:01
tags:
---

Web Audio（AduioContext） 的 API 实在太多了，玩起来也会很有趣。

<!-- more -->

![PCM](/images/web-audio/audio.jpeg)

### 基础概念

声音：因为气压的变化会产生声音信号，声音是由物体振动产生的__声波__，声音是一种波。我们可以测量压力变化的强度，并绘制随时间变化的测量值。

其中音频采样，是把声音从模拟信号转换为数字信号，所得的被称为 `PCM` 。

### PCM

 `PCM` (脉冲编码调制）有[三要素](https://www.cnblogs.com/yongdaimi/p/10722355.html)：声道数（channel number）、采样率（sample rate）、采样位数或位深（bit depth）。

![PCM](/images/web-audio/audio-steps.png)
bit
> PCM 是一种编码格式，WAV 是一种文件格式。

![PCM](/images/web-audio/pcm.png)

#### 声道数

声道数，常见的声道（喇叭数量）类型：

- 单声道：Mono，单喇叭或者两个喇叭输出同一个声道的声音（**ASR 录音用的是单声道**）
- 双声道：Stereo，分左声道和右声道，更加有空间效果

![双声道](/images/web-audio/channel.png)

#### 采样率

采样率：每秒对声音进行采集的次数，同样也是所得的数字信号的每秒样本数，单位为 Hz。**采样率越高，声音的质量就越好，声音的还原就越真实越自然。**

当然人耳对频率识别范围有限，超过 48k 的采样率意义不大，一般 20k 可以满足， **22050 Hz** 为常用的采样频率。

![采样率](/images/web-audio/sample-rate.png)

#### 采样位数

采样位数：采样后，将采样的单个样本进行量化，用来衡量声音波动变化的一个参数，也可以说是声卡的分辨率。**它的数值越大，分辨率也就越高，所发出声音的能力就越强。**

n-bit 指的是声音的强度（振幅）被均分为 2^n 级，常用的有 8bit（1字节）、`16bit（2字节）`、32bit（4字节）。

在把量化所得的结果，即单个声道的样本，以`二进制`的码字进行存放。

> B for Byte (字节)， b for bit（位）。1 Byte = 8 bit

![采样位数](/images/web-audio/bit-depth.png)

#### 比特率

比特率：每秒的传输速率，单位为 bps。

采样率为 16khz，位深为 16 bit，单声道的比特率为 `16000 * 16 * 1 = 256000 b/s（比特/秒）`，转化为字节 `256000 / 8 = 32000 B/s（字节/秒）`。

> 通常说的 10M 带宽为 10Mbps（这里是比特），下载速率为 10M / 8 = 1.25 MB/s（这里是字节）

### 音频采集

讲述 PCM 的基础概念后，如何通过浏览器实现音频采集。

#### getUserMedia

实现媒体音频采集的 `WebRTC` 技术，使用的方法是 `navigator.mediaDevices.getUserMedia()`。麦克风或摄像头的启用涉及到安全隐私，通常网页中会有弹框提示，用户确认后才可启用相关功能，调用成功后，回调函数中就可以得到多媒体流对象，后续的工作就是围绕这个流媒体展开的。

![wav-audio-api](/images/web-audio/web-audio-api.png)

#### HTTPS vs HTTP

获取麦克风权限时需要 https 协议下验证，如何能在 http 网站情况下也可以获取[权限](chrome://flags/#unsafely-treat-insecure-origin-as-secure)。

> chrome://flags/#unsafely-treat-insecure-origin-as-secure

#### 设备兼容情况

Android WebView 和 Chrome 支持程度较好，Mac 和 iPhone Safari 支持系统版本 11 及以上，**iOS WKWebView 支持系统版本 14.3 及以上（iOS 微信内置浏览器和小程序 web-view 使用的是 WKWebView）**。

![getUserMedia](/images/web-audio/getUserMedia.jpeg)

### 音频播放

如何播放音频采集后得到的 PCM：AudioContext 不能直接播放 PCM，需要给 PCM __添加 wav 头部__，才能通过 AudioContext 转换为 AudioBuffer 播放。

#### WAV

wav 格式是一种无损格式，是依据规范在 pcm 数据前添加 __44__ 个__字节__长度用来填充一些声明信息的。wav 头部有 44 个字节，具体对应如下：

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

#### 降噪（消除毛刺）

通过 `AudioContext` 的 `decodeAudioData` API 生成的 Audiobuffer，连续播放短小的 Audiobuffer 时可能会有细微的噪音出现，其中[降噪](https://stackoverflow.com/questions/53100047/why-state-can-be-invalid-in-web-audio-in-safari-after-resume)的方法如下：

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

<!-- #### AudioContext -->

#### PCM 播放工具

音频混音器：[Audacity](https://www.audacityteam.org/)

![audacity](/images/web-audio/audacity.png)

### ArrayBuffer 缓冲

`ArrayBuffer` 对象用来表示通用的、固定长度的原始二进制数据缓冲区（预分配内存）。

```Javascript
 const buffer = new ArrayBuffer(16); // 16 字节长度的 ArrayBuffer
 console.log(buffer.byteLength);
```

- 单位是__字节__，它是一个字节数组，通常在其他语言中称为 byte array
- 不能__直接操作__ `ArrayBuffer` 的内容，只能通过 DataView 或者定型数组对象操作
- ArrayBuffer 分配的内存__不能超过__ Number.MAX_SAFE_INTEGER(2^53 - 1) 字节

#### DataView

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

#### 定型数组

![DataView Element Type](/images/web-audio/dataview-type.jpeg)

#### 字节序

[字节序](https://developer.mozilla.org/zh-CN/docs/Glossary/Endianness)，或字节顺序（"Endian"、"endianness" 或 "byte-order"），描述了计算机如何组织字节，组成对应的数字。

每一个字节可以存储一个 8 位（bit）的数字（0x00-0xff），存储更大数字需要多个字节，现在大部分需占用多字节的数字排列方式是 little-endian（低位字节排放在内存中低地址端，高字节排放在内存的高地址端），与 big-endian 相反。

举例：用不同字节序存储数字 `0x12345678`(即十进制中的 305 419 896)

- little-endian：`0x78 0x56 0x34 0x12`
- big-endian：`0x12 0x34 0x56 0x78`

### 其他

#### iOS Q&A

#### 缓冲（Buffer） vs 缓存（Cache）

寄语：WebRTC 太多要学习的，后续再进一步研究。

参考文章：

[音频属性相关：声道、采样率、采样位数、样本格式、比特率](https://www.cnblogs.com/yongdaimi/p/10722355.html)

[让音视频学习变得简单之音频深度学习](https://rtcdeveloper.com/t/topic/21480)

[WAVE PCM soundfile format](http://soundfile.sapp.org/doc/WaveFormat/)

[ArrayBuffer MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)

Javascript 高级程序设计（第四版）：定型数组