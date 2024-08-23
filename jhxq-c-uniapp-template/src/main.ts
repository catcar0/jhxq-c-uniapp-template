import { createSSRApp } from "vue";
import { createPinia } from "pinia";
import persist from 'pinia-plugin-persistedstate'
import App from "./App.vue";
import Watermark from './components/Watermark/Watermark.vue';

const LoadFont = () => {
  uni.loadFontFace({
    global: true,
    family: 'AlimamaShuHeiTi-Bold',
    source: 'url("https://applet.cdn.wanjuyuanxian.com/b/fonts/AlimamaShuHeiTi-bold/AlimamaShuHeiTi-Bold.ttf")',
    // desc: {},
    fail(err: any) {
      console.log('--load-error-font')
      console.log(err)
    }
  })
}

export function createApp() {
  const app = createSSRApp(App);
  app.component('Watermark', Watermark)
  const pinia = createPinia();
  LoadFont();
  pinia.use(persist)
  app.use(pinia);
  return {
    app,
  };
}
