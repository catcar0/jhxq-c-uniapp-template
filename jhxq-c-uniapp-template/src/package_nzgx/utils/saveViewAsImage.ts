

export function saveViewAsImage(instance:any,viewId: string, canvasId: string, user: string, role: string, time: string, location: string, dm: string) {
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
              canvas.width = 767;
              canvas.height = 1363;

              // 获取 2D 绘制上下文，并设置缩放比例
              const ctx = canvas.getContext('2d');
              // ctx.scale(dpr, dpr);

              // 绘制背景色
              ctx.fillStyle = '#fff';
              ctx.fillRect(0, 0, renderWidth, renderHeight);

              // 设置字体样式
              ctx.font = "bold 28px PingFang SC";
              ctx.fillStyle = '#000000';

              // 创建图片对象并加载图片
              const img = canvas.createImage();
              img.src = downloadResult.tempFilePath;

              img.onload = () => {
                // 绘制下载的图片
                ctx.drawImage(img, 0, 0, renderWidth, renderHeight);

                // 绘制文本
                ctx.fillText(user, 170, 1122);
                ctx.fillText(role, 455, 1122);
                ctx.fillText(time, 730, 1122);
                ctx.fillText(location, 170, 1288);
                ctx.fillText(dm, 455, 1288);

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
