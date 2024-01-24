import { createApp } from 'vue'
import App from './App.vue'
import UserList from './components/UserList.vue'
import './assets/main.css'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import VirtualScroller from 'vue-virtual-scroller'

let app
if (location.hash === '#singlepage') {
  document.title = '抽奖名单！！'
  app = createApp(UserList, { isSinglePage: true});
} else {
  app = createApp(App);
  app.use(VirtualScroller);
}

app.mount('#app')

