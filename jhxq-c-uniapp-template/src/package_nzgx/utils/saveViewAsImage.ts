

export function saveViewAsImage(instance: any, viewId: string, canvasId: string, user: string, role: string, time: string, location: string, dm: string) {
  return new Promise<void>((resolve, reject) => {
    // 下载网络图片到本地
    uni.downloadFile({
      url: 'https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/pg.png', // 你要绘制的网络图片地址
      success: (downloadResult) => {
        if (downloadResult.statusCode === 200) {
          uni.createSelectorQuery().in(instance)
            .select(`#${canvasId}`) // 获取 WXML 中的 Canvas 节点
            .fields({ node: true, size: true })
            .exec((res) => {
              // 获取 Canvas 对象和实际宽高
              const canvas = res[0].node;
              const renderWidth = 767;
              const renderHeight = 1363;

              // 获取设备像素比 (dpr) 并调整 canvas 尺寸
              // const dpr = uni.getWindowInfo().pixelRatio;
              canvas.width = 600;
              canvas.height = 1293;

              // 获取 2D 绘制上下文，并设置缩放比例
              const ctx = canvas.getContext('2d');
              // ctx.scale(dpr, dpr);

              // 绘制背景色
              // ctx.fillStyle = '#fff';
              // ctx.fillRect(0, 0, renderWidth, renderHeight);

              // 设置字体样式
              ctx.font = "bold 20px PingFang SC";
              ctx.fillStyle = '#000000';

              // 创建图片对象并加载图片
              const img = canvas.createImage();
              img.src = downloadResult.tempFilePath;

              img.onload = () => {
                // 绘制下载的图片
                // 绘制图片的中间部分
                ctx.drawImage(
                  img,
                  118, 50,      // 裁剪的起点
                  1080, 1920, // 裁剪的宽高
                  0, 0,                // 在canvas中绘制的起点
                  767, 1363 // 绘制到canvas的宽高
                );

                // 绘制文本
                ctx.fillText(user, 120, 796.6);
                ctx.fillText(role, 322, 796.6);
                ctx.fillText(time, 518, 796.6);
                ctx.fillText(location, 120, 914);
                ctx.fillText(dm, 322, 914);

                // 将 canvas 内容保存为图片
                uni.canvasToTempFilePath({
                  canvas: canvas,
                  success: (res) => {
                    const tempFilePath = res.tempFilePath;

                    // 保存图片到相册
                    uni.saveImageToPhotosAlbum({
                      filePath: tempFilePath,
                      success: () => {
                        uni.showToast({
                          title: '图片保存成功',
                          icon: 'success',
                        });
                        resolve();
                      },
                      fail: (err) => {
                        uni.showToast({
                          title: '图片保存失败',
                          icon: 'none',
                        });
                        console.error(err);
                        reject('保存图片到相册失败');
                      },
                    });
                  },
                  fail: (err) => {
                    console.error('canvas 转换图片失败:', err);
                    reject('canvas 转换图片失败');
                  }
                });
              };

              img.onerror = (err) => {
                console.error('图片加载失败:', err);
                reject('图片加载失败');
              };
            });
        } else {
          reject('图片下载失败，状态码错误');
        }
      },
      fail: (err) => {
        console.error('下载图片失败:', err);
        reject('下载图片失败');
      }
    });
  });
}
