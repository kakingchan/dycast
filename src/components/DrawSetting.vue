<template>
  <div class="l-box">
    <div class="draw-setting-box">
      <div class="draw-setting-title">
        <span>抽奖设置</span> 
        <button @click="reStart" v-if="drawStatus === DrawStatus.Completed">重新开始</button>
      </div>
      <div
        class="input-box">
        <div class="input-tag">关键字</div>
        <input v-model="keyword" type="text" class="input-body" placeholder="请输入至少一位关键字" :disabled="drawStatus !== DrawStatus.NotStarted" @focus="isKeywordEmpty = false"/>

        <button class="input-btn" @click="startLog" v-if="drawStatus === DrawStatus.NotStarted">开始登记</button>
        <button class="input-btn" @click="stopLog" v-if="drawStatus === DrawStatus.InProgress">停止登记</button>
        <div v-if="drawStatus === DrawStatus.Completed">登记结束</div>
      </div>
      <div v-if="isKeywordEmpty">关键字不能为空！</div>

      <template v-if="drawStatus === DrawStatus.Completed">
        <div class="draw-setting-title">输入结果</div>
        <div
          class="input-box">
          <div class="input-tag">中奖号码</div>
          <input v-model="winnerNum" type="number" class="input-body" placeholder="不能大于" @focus="isWinnerNumWrong = false"/>
          <button class="input-btn" @click="confirmWinner">确定</button>
        </div>
        <div v-if="isWinnerNumWrong">请输入正确的中奖号！</div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, provide, readonly } from 'vue';
import emitter from '@/utils/eventBus';

enum DrawStatus {
  NotStarted = "未开始",
  InProgress = "进行中",
  Completed = "已结束"
}

const keyword = ref<string | null>(null);
const drawStatus = ref<DrawStatus>(DrawStatus.NotStarted);
const winnerNum = ref<number>(0);

const isKeywordEmpty = ref<boolean>(false);
const isWinnerNumWrong = ref<boolean>(false);


const startLog = () => {
  if (!keyword.value) {
    isKeywordEmpty.value = true
    return
  }
  emitter.emit('startLog', keyword.value)
  advanceTaskStatus()
}

const stopLog = () => {
  emitter.emit('stopLog', true)
  advanceTaskStatus()
}

const reStart = () => {
  emitter.emit('reStart', true)
  keyword.value = null
  winnerNum.value = 0
  advanceTaskStatus()
}

const confirmWinner = () => {
  if (winnerNum.value < 1) {
    isWinnerNumWrong.value = true
    return 
  }

  emitter.emit('setWinner', winnerNum.value)
}

const advanceTaskStatus = () =>{
  switch (drawStatus.value) {
    case DrawStatus.NotStarted:
      drawStatus.value = DrawStatus.InProgress;
      break;
    case DrawStatus.InProgress:
      drawStatus.value = DrawStatus.Completed;
      break;
    case DrawStatus.Completed:
      drawStatus.value = DrawStatus.NotStarted;
      break;
  }
}

</script>


<style lang="less" scoped>
.draw-setting-box{
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  padding: 24px 36px;
  flex-direction: column;
  .draw-setting-title {
    position: relative;
    font-size: 18px;
    font-weight: bold;
    padding: 8px 5px;
    border-bottom: 1px solid #ccc;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
  }

  .input-box {
    max-width: 420px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid #9aa7b1;
    border-radius: 5px;
    overflow: hidden;
    box-sizing: border-box;
    margin: 12px 8px;
    margin-bottom: 24px;
    flex-shrink: 0;
    .input-tag {
      flex-shrink: 0;
      text-align: center;
      padding: 0 12px;
      box-sizing: border-box;
    }
    .input-body {
      min-width: 114px;
      height: 100%;
      font-size: 14px;
      color: #5c4f55;
      flex-grow: 1;
      height: 100%;
      outline: none;
      border: none;
      padding: 0;
    }
    .input-btn {
      cursor: pointer;
      user-select: none;
      flex-shrink: 0;
      outline: none;
      height: 100%;
      border: none;
      padding: 0;
      box-sizing: border-box;
      padding: 0 24px;
      background-color: #a9b7c2;
    }
  }
}
</style>