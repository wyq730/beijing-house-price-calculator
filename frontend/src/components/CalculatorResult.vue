<script setup lang="ts">
import { watch, type PropType, ref, nextTick, computed } from 'vue'
import { type HousePriceResult } from './RuleBasedCalculator'
import { NNumberAnimation, NumberAnimationInst, NButton } from 'naive-ui'
import { type RepaymentPlan } from './LoanCalculator'

const displayDigitNumberAfterDecimalPoint = 0

const props = defineProps({
  result: {
    type: Object as PropType<HousePriceResult>
  },
  repaymentPlan: {
    type: Object as PropType<RepaymentPlan>
  }
})

const totalNumberAnimationInstRef = ref<NumberAnimationInst | null>(null)
const showAll = ref<boolean>(false)
const showRepaymentDetail = ref<boolean>(false)

const isResultReady = computed(() => props.result !== null)
const isRepaymentPlanReady = computed(() => props.repaymentPlan !== null)
const totalInterest = computed(() => {
  if (props.repaymentPlan === null) {
    return null
  }

  return props.repaymentPlan.interest()
})
const loanRate = computed(() => {
  if (props.repaymentPlan === null) {
    return null
  }

  return props.repaymentPlan.loanRate()
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

const currentTotal = ref<number | null>(null)
const lastTotal = ref<number | null>(null)
watch(
  () => props.result,
  async (newResult) => {
    currentTotal.value = newResult === null ? null : newResult.total
    await nextTick()
    totalNumberAnimationInstRef.value.play()
    lastTotal.value = currentTotal.value
  }
)

const topBarHeight = computed(() => {
  if (!showAll.value) {
    return '28px'
  }
  return '400px'
})
</script>

<template>
  <div id="calculator-result" :style="{ height: topBarHeight }" @click="toggle">
    <!-- set 'line-height' to align the left part and the right part. -->
    <div v-if="isResultReady" style="line-height: 28px">
      <span class="total-text">总费用</span>
      <span class="total-number">
        <n-number-animation
          ref="totalNumberAnimationInstRef"
          :duration="500"
          :from="lastTotal"
          :to="currentTotal"
          :active="false"
          :precision="displayDigitNumberAfterDecimalPoint"
        />
      </span>
      <Transition>
        <span class="total-interest" v-if="isRepaymentPlanReady">（本金）</span>
      </Transition>
      <div class="toggle-hint">{{ !showAll ? '（点击展开详情）' : '（点击收起详情）' }}</div>
    </div>
    <div v-else>
      <span class="total-not-ready">请回答下面的问题</span>
    </div>

    <!-- Breakdown of the expense. -->
    <Transition>
      <div v-if="showAll" style="margin-top: 18px">
        <div v-for="item in props.result === null ? [] : props.result.breakdown" :key="item.name">
          <span class="breakdown-text">{{ item.name }}</span>
          <span class="breakdown-number">{{
            item.price.toFixed(displayDigitNumberAfterDecimalPoint)
          }}</span>
        </div>
      </div>
    </Transition>

    <!-- Detail of the repayment plan. -->
    <Transition>
      <div v-if="isRepaymentPlanReady" style="margin-top: 22px">
        <div class="repayment-summary">贷款</div>
        <div style="margin-top: 10px">
          <div>
            <span class="repayment-text">利息</span>
            <span class="repayment-number">
              {{ totalInterest.toFixed(displayDigitNumberAfterDecimalPoint) }}
            </span>
          </div>

          <div>
            <span class="repayment-text">利率</span>
            <span class="repayment-number"> {{ loanRate }}% </span>
          </div>
        </div>

        <n-button
          class="expand-repayment-btn"
          type="success"
          ghost
          size="small"
          @click="
            (e) => {
              showRepaymentDetail = !showRepaymentDetail
              e.stopPropagation()
            }
          "
        >
          展开还款计划
        </n-button>

        <div v-if="showRepaymentDetail">detail</div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
#calculator-result {
  transition: height 400ms;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
  padding: 20px;
  cursor: pointer;
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

.total-interest {
  font-size: 16px;
  font-weight: normal;
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

.repayment-summary {
  font-size: 16px;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.6);
}

.repayment-text {
  font-weight: bold;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.4);
}

.repayment-number {
  margin-left: 8px;

  font-size: 16px;
  font-weight: bold;
  color: forestgreen;
}

.expand-repayment-btn {
  margin-top: 12px;
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
