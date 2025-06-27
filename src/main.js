import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css' // 引入样式
import App from './App.vue'
import router from './router' // 引入路由

const app = createApp(App)

app.use(router) // 使用路由
app.use(ElementPlus)
app.mount('#app')