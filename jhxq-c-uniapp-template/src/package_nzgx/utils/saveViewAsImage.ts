export function saveViewAsImage(viewId: string, canvasId: string, user: string, role: string, time: string, location: string, dm: string) {
  return new Promise<void>((resolve, reject) => {
    // 下载网络图片到本地
    uni.downloadFile({
      url: 'https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/pg.png', // 你要绘制的网络图片地址
      success: (downloadResult) => {
        if (downloadResult.statusCode === 200) {
          uni.createSelectorQuery()
            .select(`#${canvasId}`) // 获取 WXML 中的 Canvas 节点
            .node(({ node: canvas }) => {
              // 设置 canvas 的宽高，确保和绘制内容一致
              canvas.width = 1080;
              canvas.height = 1920;
              const ctx = canvas.getContext('2d'); // 获取 2D 渲染上下文

              // 绘制背景
              ctx.fillStyle = '#fff'; // 设置背景色
              ctx.fillRect(0, 0, 1080, 1920); // 填充背景色
              ctx.font = "bold 28px PingFang SC";
              ctx.fillStyle = '#000000';

              // 使用本地临时路径绘制图片
              const img = canvas.createImage(); // 创建一个图片对象
              img.src = downloadResult.tempFilePath; // 使用下载的图片临时路径

              img.onload = () => {
                ctx.drawImage(img, 0, 0, 1080, 1920); // 绘制图片

                ctx.fillText(user, 170, 1122);
                ctx.fillText(role, 455, 1122);
                ctx.fillText(time, 730, 1122);
                ctx.fillText(location, 170, 1288);
                ctx.fillText(dm, 455, 1288);

                uni.canvasToTempFilePath({
                  canvas: canvas, // 使用刚刚获取的 canvas 对象
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
                  }
                });
              };

              img.onerror = (err) => {
                console.error('图片加载失败:', err);
                reject('图片加载失败');
              };
            })
            .exec();
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
