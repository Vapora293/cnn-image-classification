import { createApp } from 'vue';
import App from './App.vue';
import VueLazyload from 'vue-lazyload';

const app = createApp(App);

app.use(VueLazyload, {
  loading: '/path-to-loading-image', // You can set a default loading image
  error: './src/assets/logo.png', // You can set a default error image
});

app.mount('#app');
