<script setup lang="ts">
import { watch, type PropType, ref, nextTick, computed } from 'vue'
import { type HousePriceResult } from './RuleBasedCalculator'
import { NNumberAnimation, NumberAnimationInst, NButton } from 'naive-ui'
import { calculateRepaymentPlan } from './LoanCalculator'

const displayDigitNumberAfterDecimalPoint = 0

const props = defineProps({
  result: Object as PropType<HousePriceResult>
})

const numberAnimationInstRef = ref<NumberAnimationInst | null>(null)
const currentTotal = ref<number | null>(null)
const lastTotal = ref<number | null>(null)
const showAll = ref<boolean>(false)

const isResultReady = computed(() => {
  return props.result !== undefined
})

function toggle() {
  if (isResultReady.value) {
    showAll.value = !showAll.value
  }
}

watch(isResultReady, (isResultReady) => {
  if (!isResultReady) {
    showAll.value = false
  }
})

watch(
  () => props.result,
  async (newResult) => {
    currentTotal.value = newResult === undefined ? null : newResult.total
    await nextTick()
    numberAnimationInstRef.value?.play()
    lastTotal.value = currentTotal.value
  }
)
</script>

<template>
  <div id="calculator-result" :style="{ height: !showAll ? '28px' : '280px' }" @click="toggle">
    <!-- set 'line-height' to align the left part and the right part. -->
    <div v-if="isResultReady" style="line-height: 28px">
      <span class="total-text">总费用</span>
      <span class="total-number">
        <n-number-animation
          ref="numberAnimationInstRef"
          :duration="500"
          :from="lastTotal"
          :to="currentTotal"
          :active="false"
          :precision="displayDigitNumberAfterDecimalPoint"
        />
      </span>
      <div class="toggle-hint">{{ !showAll ? '（点击展开详情）' : '（点击收起详情）' }}</div>
    </div>
    <div v-else>
      <span class="total-not-ready">请回答下面的问题</span>
    </div>
    <Transition>
      <div v-if="showAll" style="margin-top: 18px">
        <div v-for="item in props.result?.breakdown" :key="item.name">
          <span class="breakdown-text">{{ item.name }}</span>
          <span class="breakdown-number">{{
            item.price.toFixed(displayDigitNumberAfterDecimalPoint)
          }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
#calculator-result {
  transition: height 400ms;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
  padding: 20px;
}

.total-text {
  font-size: 16px;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.6);
}

.total-number {
  margin-left: 8px;

  font-size: 18px;
  font-weight: bold;
  color: forestgreen;
}

.toggle-hint {
  font-size: 16px;
  float: right;
  color: rgba(0, 0, 0, 0.4);
}

.total-not-ready {
  font-size: 18px;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.5);
}

.breakdown-text {
  font-weight: bold;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.4);
}

.breakdown-number {
  margin-left: 8px;

  font-size: 16px;
  font-weight: bold;
  color: rgba(34, 139, 34, 0.8);
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
