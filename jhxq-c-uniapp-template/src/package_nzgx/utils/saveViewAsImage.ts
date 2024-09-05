import { ref } from 'vue';

export function saveViewAsImage(viewId: string, canvasId: string,user:string,role:string,time:string,location:string,dm:string) {
  return new Promise<void>((resolve, reject) => {
        // 下载网络图片到本地
        uni.downloadFile({
          url: 'https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/pg.png', // 你要绘制的网络图片地址
          success: (downloadResult) => {
            if (downloadResult.statusCode === 200) {
              const ctx = uni.createCanvasContext(canvasId);
              // 绘制背景
              ctx.setFillStyle('#fff'); // 设置背景色
              ctx.fillRect(0, 0, 1080, 1920); // 填充背景色
              ctx.font="bold 28px PingFang SC"
              ctx.setFillStyle('#000000');
              // 使用本地临时路径绘制图片
              ctx.drawImage(downloadResult.tempFilePath, 0, 0, 1080, 1920);
              ctx.fillText(user, 170, 1122);
              ctx.fillText(role, 455, 1122);
              ctx.fillText(time, 730, 1122);
              ctx.fillText(location, 170, 1288);
              ctx.fillText(dm, 455, 1288);
              ctx.draw(false, () => {
                // 将canvas转换为图片
                uni.canvasToTempFilePath({
                  canvasId,
                  success: (res) => {
                    const tempFilePath = res.tempFilePath;

                    // 保存到相册
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
                        reject(err);
                      },
                    });
                  },
                  fail: (err) => {
                    console.error(err);
                    reject(err);
                  },
                });
              });
            } else {
              reject('图片下载失败');
            }
          },
          fail: (err) => {
            console.error('下载图片失败:', err);
            reject('下载图片失败');
          }
        });
  });
}
