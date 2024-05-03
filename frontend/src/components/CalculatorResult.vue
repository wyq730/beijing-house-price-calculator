<script setup lang="ts">
import { watch, type PropType, ref, nextTick } from 'vue'
import { type HousePriceResult } from './RuleBasedCalculator'
import { NNumberAnimation, NumberAnimationInst } from 'naive-ui'

const displayDigitNumberAfterDecimalPoint = 2

const props = defineProps({
  result: Object as PropType<HousePriceResult>
})

const numberAnimationInstRef = ref<NumberAnimationInst | null>(null)
const currentTotal = ref<number | null>(null)
const lastTotal = ref<number | null>(null)

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
  <div id="calculator-result">
    <div>
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
    </div>
    <!-- <div v-for="item in props.result?.breakdown" :key="item.name">
      - {{ item.name }}: {{ item.price.toFixed(displayDigitNumberAfterDecimalPoint) }}
    </div> -->
  </div>
</template>

<style scoped>
#calculator-result {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
  padding: 20px;
}

.total-text {
  font-weight: bold;
  color: rgba(0, 0, 0, 0.6);
}

.total-number {
  margin-left: 8px;

  font-size: 18px;
  font-weight: bold;
  color: forestgreen;
}
</style>
