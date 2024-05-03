<script setup lang="ts">
import { watch, type PropType, ref, nextTick } from 'vue'
import { type HousePriceResult } from './RuleBasedCalculator'
import { NNumberAnimation, NumberAnimationInst } from 'naive-ui'

const displayDigitNumberAfterDecimalPoint = 0

const props = defineProps({
  result: Object as PropType<HousePriceResult>
})

const numberAnimationInstRef = ref<NumberAnimationInst | null>(null)
const currentTotal = ref<number | null>(null)
const lastTotal = ref<number | null>(null)
const showAll = ref<boolean>(false)

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
  <div
    id="calculator-result"
    :style="{ height: !showAll ? '28px' : '280px' }"
    style="z-index: -1"
    @click="showAll = !showAll"
  >
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
