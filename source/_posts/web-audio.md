---
title: WEB：Audio 音频基础
date: 2021-06-27 11:01:01
tags:
---

Web Audio 的 API 实在太多了！

<!-- more -->

### 基础概念

音频采样，是把声音从模拟信号转换为数字信号，所得的 `PCM` (脉冲编码调制）有[三要素](https://www.cnblogs.com/yongdaimi/p/10722355.html)：声道数（channel number）、采样率（sample rate）、采样位数或位深（bit depth）。

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

#### 比特率

比特率：每秒的传输速率，单位为 bps。

采样率为 16khz，位深为 16 bit，单声道的比特率为 `16000 * 16 * 1 = 256000 b/s（比特/秒）`，转化为字节 `256000 / 8 = 32000 B/s（字节/秒）`。

> 通常说的 10M 带宽为 10Mbps（这里是比特），下载速率为 10M / 8 = 1.25 MB/s（这里是字节）

### 音频采集

#### getUserMedia

`navigator.mediaDevices.getUserMedia()`

#### 设备兼容情况

Android WebView 和 Chrome 支持程度较好，Mac 和 iPhone Safari 支持系统版本 11 及以上，**iOS WKWebView 支持系统版本 14.3 及以上（iOS 微信内置浏览器和小程序 web-view 使用的是 WKWebView）**。

![getUserMedia](/images/web-audio/getUserMedia.jpeg)

### 音频播放

AudioContext 或者 Audio 标签

![wav 头部](/images/web-audio/wav-header.png)

#### 降噪（消除毛刺）

audiobuffer 播放有细微的噪音

```Javascript
  function deNoising(buffer: AudioBuffer) {
    const numberOfChannels = buffer.numberOfChannels;
    const fixRange = 100; // 该数值根据情况调整

    for (let channel = 0; channel < numberOfChannels; channel++) {
      const audioBufferArray = buffer.getChannelData(channel);
      const length = audioBufferArray.length;

      for (let i = 0; i < fixRange; i++) {
        audioBufferArray[i] = (audioBufferArray[i] * i) / fixRange; // fade in
        audioBufferArray[length - i - 1] =
          (audioBufferArray[length - i - 1] * i) / fixRange; // fade out
      }
    }
  }
```

参考文章：

[音频属性相关：声道、采样率、采样位数、样本格式、比特率](https://www.cnblogs.com/yongdaimi/p/10722355.html)
