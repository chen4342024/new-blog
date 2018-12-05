# 利用 canvas 压缩图片

## 前言

在一个移动端的项目中，图片上传是一个比较常用的功能。

但是，目前手机的随便拍的照片一张都要好几 M , 直接上传的话特别耗费流量，而且所需时间也比较长。

所以需要前端在上传之前先对图片进行压缩。

## 原理

要使用 js 实现图片压缩效果， 原理其实很简单，主要是：

1. 利用 `canvas` 的 `drawImage` 将目标图片画到画布上
2. 利用画布调整绘制尺寸，以及导出的 quality ，确定压缩的程度
3. 利用 `canvas`的 `toDataURL` 或者 `toBlob` 可以将画布上的内容导出成 base64 格式的数据。

## 注意点

#### IOS 下会出现图片翻转的问题

这个需要 `import EXIF from 'exif-js';`来获取到手机的方向，然后对 canvas 的宽高进行处理

#### 压缩到特定大小

`let imgDataLength = dataUrl.length;` 获取到数据后，判断压缩后的图片大小是否满足需求，否则就降低尺寸以及质量，再次压缩

#### quality 对 png 等无效，所以导出格式统一为 jpeg ，透明背景填充为白色

```javascript
// 填充白色背景
ctx.fillStyle = fillBgColor;
ctx.fillRect(0, 0, size.w, size.h);
```

## 具体源码

```javascript
/**
 * 文件读取并通过canvas压缩转成base64
 * @param files
 * @param callback
 */

//EXIF js 可以读取图片的元信息  https://github.com/exif-js/exif-js
import EXIF from 'exif-js';

// 压缩图片时 质量减少的值
const COMPRESS_QUALITY_STEP = 0.03;
const COMPRESS_QUALITY_STEP_BIG = 0.06;
// 压缩图片时，图片尺寸缩放的比例，eg：0.9, 等比例缩放为0.9
const COMPRESS_SIZE_RATE = 0.9;

let defaultOptions = {
    removeBase64Header: true,
    // 压缩后允许的最大值，默认：300kb
    maxSize: 200 * 1024,
    fillBgColor: '#ffffff'
};

/**
 *  将待上传文件列表压缩并转换base64
 *  ！！！！ 注意 ： 图片会默认被转为 jpeg ， 透明底会加白色背景
 *  files : 文件列表 ，必须是数组
 *  callback : 回调，每个文件压缩成功后都会回调,
 *  options ：配置
 *  options.removeBase64Header : 是否需要删除 'data:image/jpeg;base64,'这段前缀，默认true
 *  @return { base64Data: '',fileType: '' }， //fileType强制改为jpeg
 */
export function imageListConvert(files, callback, options = {}) {
    if (!files.length) {
        console.warn('files is null');
        return;
    }

    options = { ...defaultOptions, ...options };
    // 获取图片方向－－iOS拍照下有值
    EXIF.getData(files[0], function() {
        let orientation = EXIF.getTag(this, 'Orientation');
        for (let i = 0, len = files.length; i < len; i++) {
            let file = files[i];
            let fileType = getFileType(file.name);

            //强制改为jpeg
            fileType = 'jpeg';

            let reader = new FileReader();
            reader.onload = (function() {
                return function(e) {
                    let image = new Image();
                    image.onload = function() {
                        let data = convertImage(
                            image,
                            orientation,
                            fileType,
                            options.maxSize,
                            options.fillBgColor
                        );
                        if (options.removeBase64Header) {
                            data = removeBase64Header(data);
                        }
                        callback({
                            base64Data: data,
                            fileType: fileType
                        });
                    };
                    image.src = e.target.result;
                };
            })(file);
            reader.readAsDataURL(file);
        }
    });
}

/**
 * 将 image 对象 画入画布并导出base64数据
 */
export function convertImage(
    image,
    orientation,
    fileType = 'jpeg',
    maxSize = 200 * 1024,
    fillBgColor = '#ffffff'
) {
    let maxWidth = 1280,
        maxHeight = 1280,
        cvs = document.createElement('canvas'),
        w = image.width,
        h = image.height,
        quality = 0.9;

    /**
     * 这里用于计算画布的宽高
     */
    if (w > 0 && h > 0) {
        if (w / h >= maxWidth / maxHeight) {
            if (w > maxWidth) {
                h = (h * maxWidth) / w;
                w = maxWidth;
            }
        } else {
            if (h > maxHeight) {
                w = (w * maxHeight) / h;
                h = maxHeight;
            }
        }
    }

    let ctx = cvs.getContext('2d');
    let size = prepareCanvas(cvs, ctx, w, h, orientation);

    // 填充白色背景
    ctx.fillStyle = fillBgColor;
    ctx.fillRect(0, 0, size.w, size.h);

    //将图片绘制到Canvas上，从原点0,0绘制到w,h
    ctx.drawImage(image, 0, 0, size.w, size.h);

    let dataUrl = cvs.toDataURL(`image/${fileType}`, quality);

    //当图片大小 > maxSize 时，循环压缩,并且循环不超过5次
    let count = 0;
    while (dataUrl.length > maxSize && count < 10) {
        let imgDataLength = dataUrl.length;
        let isDoubleSize = imgDataLength / maxSize > 2;

        // 质量一次下降
        quality -= isDoubleSize
            ? COMPRESS_QUALITY_STEP_BIG
            : COMPRESS_QUALITY_STEP;
        quality = parseFloat(quality.toFixed(2));

        // 图片还太大的情况下，继续压缩 。 按比例缩放尺寸
        let scaleStrength = COMPRESS_SIZE_RATE;
        w = w * scaleStrength;
        h = h * scaleStrength;

        size = prepareCanvas(cvs, ctx, w, h, orientation);

        //将图片绘制到Canvas上，从原点0,0绘制到w,h
        ctx.drawImage(image, 0, 0, size.w, size.h);

        console.log(`imgDataLength：${imgDataLength} , maxSize --> ${maxSize}`);
        console.log(`size.w:${size.w}, size.h:${size.h}, quality：${quality}`);
        dataUrl = cvs.toDataURL(`image/jpeg`, quality);
        count++;
    }

    console.log(`imgDataLength：${dataUrl.length} , maxSize --> ${maxSize}`);
    console.log(`size.w:${size.w}, size.h:${size.h}, quality：${quality}`);

    cvs = ctx = null;
    return dataUrl;
}

/**
 * 准备画布
 * cvs 画布
 * ctx 上下文
 * w : 想要画的宽度
 * h : 想要画的高度
 * orientation : 屏幕方向
 */
function prepareCanvas(cvs, ctx, w, h, orientation) {
    cvs.width = w;
    cvs.height = h;
    //判断图片方向，重置canvas大小，确定旋转角度，iphone默认的是home键在右方的横屏拍摄方式
    let degree = 0;
    switch (orientation) {
        case 3:
            //iphone横屏拍摄，此时home键在左侧
            degree = 180;
            w = -w;
            h = -h;
            break;

        case 6:
            //iphone竖屏拍摄，此时home键在下方(正常拿手机的方向)
            cvs.width = h;
            cvs.height = w;
            degree = 90;
            // w = w;
            h = -h;
            break;
        case 8:
            //iphone竖屏拍摄，此时home键在上方
            cvs.width = h;
            cvs.height = w;
            degree = 270;
            w = -w;
            // h = h;
            break;
    }

    // console.log(`orientation --> ${orientation} , degree --> ${degree}`);
    // console.log(`w --> ${w} , h --> ${h}`);
    //使用canvas旋转校正
    ctx.rotate((degree * Math.PI) / 180);
    return { w, h };
}

/**
 * 截取 ‘data:image/jpeg;base64,’，
 * 截取到第一个逗号
 */
export function removeBase64Header(content) {
    if (content.substr(0, 10) === 'data:image') {
        let splitIndex = content.indexOf(',');
        return content.substring(splitIndex + 1);
    }
    return content;
}

export function getFileType(fileName = '') {
    return fileName.substring(fileName.lastIndexOf('.') + 1);
}

export function checkAccept(
    file,
    accept = 'image/jpeg,image/jpg,image/png,image/gif'
) {
    return accept.toLowerCase().indexOf(file.type.toLowerCase()) !== -1;
}
```
