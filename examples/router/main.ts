import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

const Home = () => import('./pages/Home.vue')
const Upload = () => import('./pages/Upload.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/upload', name: 'upload', component: Upload }
  ]
})

createApp(App).use(router).mount('#app')
