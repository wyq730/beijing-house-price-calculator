<script setup lang="ts">
import { ref, watch, defineEmits, PropType, computed } from 'vue'
import { NInputNumber } from 'naive-ui'
import { type RepaymentMethod } from './LoanCalculator'
import OptionSelector from './OptionSelector.vue'
import { calculateRepaymentPlan } from './LoanCalculator'
import { type HousePriceArgument } from './RuleBasedCalculator'
import { NCollapseTransition } from 'naive-ui'
import { assert, TenThousandRMBToRMB } from './Utils'
import BuyerPropertyNumberInput from './ItemInput/BuyerPropertyNumberInput.vue'
import RingRoadRegionInput from './ItemInput/RingRoadRegionInput.vue'

const emit = defineEmits(['update-result'])
const props = defineProps({
  priceArgs: {
    type: Object as PropType<HousePriceArgument>
  },
  priceRequiredInputs: Set<string>
})

const repaymentMethodOptions: { name: string; value: RepaymentMethod }[] = [
  { name: '等额本息', value: 'equal_principle_and_interest' },
  { name: '等额本金', value: 'equal_principle' }
]

const loanPrinciple = ref<number | null>(null)
const loanTermInYears = ref<number | null>(null)
const repaymentMethod = ref<RepaymentMethod | null>(null)

// For the following argument, refer to props.priceArgs first. If it's null, use the input in the current component.
const buyerPropertyNumberInputValue = ref<number | null>(null)
const ringRoadRegionInputValue = ref<boolean | null>(null)

const buyerPropertyNumber = computed(() => {
  if (props.priceArgs === undefined) {
    return null
  }
  if (props.priceArgs.buyerPropertyNumber !== null) {
    return props.priceArgs.buyerPropertyNumber
  }

  return buyerPropertyNumberInputValue.value
})

const ringRoadRegion = computed(() => {
  if (props.priceArgs === undefined) {
    return null
  }
  if (props.priceArgs.ringRoadRegion !== null) {
    return props.priceArgs.ringRoadRegion
  }
  return ringRoadRegionInputValue.value
})

const insideFifthRingRoad = computed(() => {
  if (ringRoadRegion.value === null) {
    return null
  }
  return ringRoadRegion.value == 'inside_5'
})

function calculateCommercialLoanInterestRate(
  buyerPropertyNumber: number,
  insideFifthRingRoad: boolean
) {
  if (buyerPropertyNumber === 1 && insideFifthRingRoad === true) {
    return 3.5
  }
  if (buyerPropertyNumber === 1 && insideFifthRingRoad === false) {
    return 3.5
  }
  if (buyerPropertyNumber === 2 && insideFifthRingRoad === true) {
    return 3.9
  }
  if (buyerPropertyNumber === 2 && insideFifthRingRoad === false) {
    return 3.7
  }
  assert(
    false,
    `Invalid buyerPropertyNumber (${buyerPropertyNumber}) or insideFifthRingRoad (${insideFifthRingRoad})`
  )
}

function calculateRepaymentPlanFromInputs(
  loanPrinciple: number | null,
  loanTermInYears: number | null,
  repaymentMethod: RepaymentMethod | null,
  buyerPropertyNumber: number | null,
  insideFifthRingRoad: boolean | null
) {
  if (
    [
      loanPrinciple,
      loanTermInYears,
      repaymentMethod,
      buyerPropertyNumber,
      insideFifthRingRoad
    ].some((v) => v === null)
  ) {
    return null
  }

  const interestRate = calculateCommercialLoanInterestRate(buyerPropertyNumber, insideFifthRingRoad)

  return calculateRepaymentPlan({
    principle: loanPrinciple,
    durationInYears: loanTermInYears,
    repaymentMethod: repaymentMethod,
    annualInterestRatePercentage: interestRate
  })
}

watch(
  [loanPrinciple, loanTermInYears, repaymentMethod, buyerPropertyNumber, insideFifthRingRoad],
  ([loanPrinciple, loanTermInYears, repaymentMethod, buyerPropertyNumber, insideFifthRingRoad]) => {
    emit(
      'update-result',
      calculateRepaymentPlanFromInputs(
        TenThousandRMBToRMB(loanPrinciple),
        loanTermInYears,
        repaymentMethod,
        buyerPropertyNumber,
        insideFifthRingRoad
      )
    )
  }
)
</script>

<template>
  <div>
    <h1>贷款计算 (可选)</h1>

    <div class="section">
      <div class="title">贷款金额是多少？</div>
      <n-input-number
        v-model:value="loanPrinciple"
        clearable
        placeholder="贷款金额（万元）"
        style="width: 200px"
      />
    </div>

    <div class="section">
      <div class="title">贷款年限是多少？</div>
      <n-input-number
        v-model:value="loanTermInYears"
        clearable
        placeholder="贷款年限"
        style="width: 200px"
      />
    </div>

    <div class="section">
      <OptionSelector
        title="还款方式是？"
        :options="repaymentMethodOptions"
        v-model:selected-value="repaymentMethod"
      />
    </div>

    <n-collapse-transition
      :show="priceRequiredInputs !== undefined && !priceRequiredInputs.has('buyerPropertyNumber')"
    >
      <BuyerPropertyNumberInput v-model="buyerPropertyNumberInputValue" />
    </n-collapse-transition>

    <n-collapse-transition
      :show="priceRequiredInputs !== undefined && !priceRequiredInputs.has('ringRoadRegion')"
    >
      <RingRoadRegionInput v-model="ringRoadRegionInputValue" />
    </n-collapse-transition>
  </div>
</template>

<style scoped></style>
