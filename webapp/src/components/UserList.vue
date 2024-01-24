<template>
  <div class="r-box">
    <button class="new-window-btn" @click="openNewWindow" v-if="!isSinglePage && !subWindow">打开小窗</button>
    <div class="user-list-box">
      <ul class="user-list">
        <li :class="{ winner: winnerNum && index === winnerNum - 1 }" v-for="(item, index) in userList"> {{ index + 1 }} -
          {{ item }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">

import emitter from '@/utils/eventBus';
import { ref, reactive, provide, readonly, onMounted, onUnmounted, defineProps } from 'vue'

interface Props {
  isSinglePage?: {
    types: boolean,
    default: false,
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

onMounted(() => {
  if (!isSinglePage) {
    initEmitter()
    window.addEventListener('message', handleSubWindowMessage)
  } else {
    initPostMessageListener()
  }
});

onUnmounted(() => {
  if (!isSinglePage) {
    window.removeEventListener('message', handleSubWindowMessage)
    destoryEmitter()
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
  const windowFeatures = "menubar=no,location=no,resizable=yes,scrollbars=yes,status=yes";
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
      height: 30px;
      line-height: 30px;
      align-items: center;
    }

    .winner {
      color: #f7315d;
      border: #f7315d 1px solid;
    }
  }
}
</style>