<template>
  <div class="r-box" :class="{ 'single-page': isSinglePage }">
    <button class="new-window-btn" @click="openNewWindow" v-if="!isSinglePage && !subWindow">打开小窗</button>
    <div class="user-list-box" ref="scrollContainer">
      <ul class="user-list">
        <li :class="{ winner: winnerNum && index === winnerNum - 1 }" v-for="(item, index) in userList"> {{ index + 1 }}-{{ item }}</li>
      </ul>
    </div>

    <button v-if="isSinglePage" @click="toggleAutoScroll">{{ isAutoScroll ? '停止滚动' : '自动滚动' }}</button>
  </div>
</template>

<script setup lang="ts">

import emitter from '@/utils/eventBus';
import { ref, reactive, provide, readonly, onMounted, onUnmounted, defineProps } from 'vue'

interface Props {
  isSinglePage?: {
    types: boolean,
    default: false
  }
}

interface IinitMessage{
  keyword: string,
  winnerNum: number,
  userList: Set<string>
}

const { isSinglePage } = defineProps<Props>();
const issubWindowReady = ref<boolean>(false)

const userList = ref<Set<string>>(new Set())

// for (let index = 0; index < 200; index++) {
//   userList.value.add('fajsklfjsakl'+ index)
// }
const winnerNum = ref<number>()
const keyword = ref<string>()
const subWindow = ref<Window | null>()

const isAutoScroll = ref<boolean>(false);

const scrollContainer = ref<HTMLElement | null>(null);
let scrollInterval: number | null = null;
const startAutoScroll = () => {
  const container = scrollContainer.value;
  if (container) {
    scrollInterval = window.setInterval(() => {
      if (container.scrollLeft < container.scrollWidth - container.clientWidth) {
        container.scrollLeft += 1.5;
      } else {
        container.scrollLeft = 0;
      }
    }, 1); // 调整数字来改变滚动速度
  }
}

const toggleAutoScroll = () => {
  if (scrollInterval) {
    clearInterval(scrollInterval);
    scrollInterval = null;
  } else {
    startAutoScroll();
  }
  isAutoScroll.value = !isAutoScroll.value;
}

onMounted(() => {
  if (!isSinglePage) {
    initEmitter()
    window.addEventListener('message', handleSubWindowMessage)
  } else {
    initPostMessageListener()
    toggleAutoScroll();
  }
});

onUnmounted(() => {
  if (!isSinglePage) {
    window.removeEventListener('message', handleSubWindowMessage)
    destoryEmitter()
  }

  if (scrollInterval) {
    clearInterval(scrollInterval);
  }
});

const initPostMessageListener = () => {
  window.addEventListener('message', (event: MessageEvent) => {
    // 检查消息来源
    // if (event.origin !== expectedOrigin) {
    //   return;
    // }
    console.log(event.data)
    // 根据类型字段处理消息
    switch (event.data.type) {
      case 'startLog':
        // 处理 updateUser 类型的消息
        issubWindowReady && handleStartLog(event.data.payload);
        break;
      case 'reStart':
        issubWindowReady && handleRestart();
        break;
      case 'init':
        handleInitPostMessage(event.data.payload);
        break;
      case 'newMsg':
        issubWindowReady && handleNewMsg(event.data.payload);
        break;
      case 'setWinner':
        issubWindowReady &&handleSetWinner(event.data.payload);
        break;
    }
  });

  window.addEventListener('beforeunload', function() {
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage('childWindowClosed', '*');
      const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

      // 将宽度和高度存储到 localStorage 中
      localStorage.setItem('windowWidth', width + '');
      localStorage.setItem('windowHeight', height + '');
    }
  });
}


const initEmitter = () => {
  emitter.on('startLog', handleStartLog);
  emitter.on('stopLog', handleStopLog);
  emitter.on('reStart', handleRestart);
  emitter.on('setWinner', handleSetWinner);
}

const destoryEmitter = () => {
  handleStopLog()
  emitter.off('startLog', handleStartLog);
  emitter.off('stopLog', handleStopLog);
  emitter.off('reStart', handleRestart);
  emitter.off('setWinner', handleSetWinner);
}

const handleSubWindowMessage = (event: MessageEvent) => {
  if (event.data === 'childWindowClosed') {
    subWindow.value = null
  }
}

const handleStartLog = (_keyword: unknown) => {
  keyword.value = _keyword as string
  emitter.on('newMsg', handleNewMsg);
  if (subWindow.value) {
    subWindow.value.postMessage({ type: 'startLog', payload: keyword.value }, '*')
  }
}

const handleStopLog = () => {
  emitter.off('newMsg', handleNewMsg);
}

const handleSetWinner = (num: unknown) => {
  winnerNum.value = num as number
  if (subWindow.value) {
    subWindow.value.postMessage({ type: 'setWinner', payload: winnerNum.value }, '*')
  }
}

const handleRestart = () => {
  // 清空用户列表
  keyword.value = undefined
  winnerNum.value = undefined
  userList.value = new Set()
  if (subWindow.value) {
    subWindow.value.postMessage({ type: 'reStart', payload: null }, '*')
  }

}

const handleNewMsg = (data: unknown) => {
  const msg = data as Mess
  console.log(msg.content)
  if (keyword.value === msg.content) {
    userList.value.add(msg.nickname);
  }
  if (subWindow.value) {
    subWindow.value.postMessage({ type: 'newMsg', payload: msg }, '*')
  }
}

const handleInitPostMessage = (data:IinitMessage) => {
  issubWindowReady.value = true
  keyword.value = data.keyword
  winnerNum.value = data.winnerNum
  userList.value = new Set(data.userList)
}

const openNewWindow = () => {
  const width = localStorage.getItem('windowWidth') || '1080';
  const height = localStorage.getItem('windowHeight') || '600';
  const windowFeatures = `menubar=no,location=no,resizable=yes,scrollbars=yes,status=yes,width=${width},height=${height}`;
  subWindow.value = window.open(location.href + '#singlepage', '_blank', windowFeatures);
  subWindow.value!.onload = () => {
    subWindow.value?.postMessage({ type: 'init', payload: { keyword: keyword.value, winnerNum: winnerNum.value, userList: Array.from(userList.value) } }, '*');
  }
}

</script>

<style lang="less" scoped>
.user-list-box {
  padding: 0 24px;

  .user-list {
    padding: 0;
    list-style-type: none;
    display: grid;
    grid-template-columns: repeat(auto-fill, 180px);
    grid-gap: 10px;

    li {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      height: 36px;
      line-height: 36px;
      align-items: center;
    }

    .winner {
      color: #ff0059;
      border: #fff023 3px solid;
    }
  }
}

.single-page{
  overflow: hidden;
  background: #00ff00;
  min-height: 220px;
  .user-list-box{
    width: 100%; /* 根据需要调整宽度 */
    overflow-x: scroll;
    padding: 0;
    margin-top: 60px;
    padding-bottom: 60px;
    .user-list{
      padding: 0;
      margin: 0;
      display: flex;
      height: 75px;
      li{
        color: #ce3a00;
        height: 75px;
        line-height: 75px;
        font-size: 75px;
        display: inline-block;
        margin-right: 50px; /* 根据需要调整间距 */
        white-space:nowrap;
        overflow: unset;
        text-overflow: unset;
        font-weight: bold;
      }

      .winner {
        color: #e600ff;
        border: none;
      }
    }
  }
}
</style>