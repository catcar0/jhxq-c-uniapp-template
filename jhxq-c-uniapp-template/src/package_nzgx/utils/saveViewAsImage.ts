import { ref } from 'vue';

export function saveViewAsImage(viewId: string, canvasId: string) {
  return new Promise<void>((resolve, reject) => {
    uni.createSelectorQuery()
      .select(`#${viewId}`)
      .boundingClientRect(data => {
        if (!data) {
          reject('未找到对应的view');
          return;
        }

        const width = data.width;
        const height = data.height;

        const ctx = uni.createCanvasContext(canvasId);
        ctx.setFillStyle('#fff'); // 设置背景色
        ctx.fillRect(0, 0, width, height); // 填充背景色

        // 如果有复杂的内容需要绘制，可以在此添加绘制逻辑
        ctx.drawImage(data.id, 0, 0, width, height); // 绘制内容
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
      })
      .exec();
  });
}
