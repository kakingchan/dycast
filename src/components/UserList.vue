<template>
  <div class="r-box">
    <div class="user-list-box">
      <ul class="user-list">
        <li v-for="(item, index) in userList"> {{index + 1}} - {{ item }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">

import emitter from '@/utils/eventBus';
import { ref, reactive, provide, readonly, onMounted, onUnmounted } from 'vue'

const userList = ref<Set<string>>(new Set())

// for (let index = 0; index < 200; index++) {
//   userList.value.add('fajsklfjsakl'+ index)
// }

const keyword = ref<string>()

onMounted(() => {
  emitter.on('startLog', handleStartLog);
  emitter.on('stopLog', handleStopLog);
  emitter.on('reStart', handleRestart);
});

onUnmounted(() => {
  handleStopLog()
  emitter.off('startLog', handleStartLog);
  emitter.off('stopLog', handleStopLog);
  emitter.off('reStart', handleRestart);
  
});

const handleStartLog = (_keyword: unknown) => {
  keyword.value = _keyword as string
  emitter.on('newMsg', handleNewMsg);
}

const handleStopLog = () => {
  emitter.off('newMsg', handleNewMsg);
}

const handleRestart = () => {
  // 清空用户列表
  keyword.value = undefined
  userList.value = new Set()
}

const handleNewMsg = (data: unknown) => {
  const msg = data as Mess
  console.log(msg.content)
  if (keyword.value === msg.content) {
    userList.value.add(msg.nickname);
  }
}


</script>


<style lang="less" scoped>

.user-list-box{
  padding: 0 24px;
  .user-list{
    padding: 0;
    list-style-type: none;
    display: grid;
    grid-template-columns: repeat(auto-fill, 180px);
    grid-gap: 10px;
    li{
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      height: 30px;
      line-height: 30px;
      align-items: center;
    }
  }
}

</style>