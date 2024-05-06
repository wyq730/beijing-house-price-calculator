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
import InsideSixUrbanDistrictInput from './ItemInput/InsideSixUrbanDistrictInput.vue'

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
const insideSixUrbanDistrictInputValue = ref<boolean | null>(null)

const buyerPropertyNumber = computed(() => {
  if (props.priceArgs === undefined) {
    return null
  }
  if (props.priceArgs.buyerPropertyNumber !== null) {
    return props.priceArgs.buyerPropertyNumber
  }

  return buyerPropertyNumberInputValue.value
})

const insideSixUrbanDistrict = computed(() => {
  if (props.priceArgs === undefined) {
    return null
  }
  if (props.priceArgs.insideSixUrbanDistrict !== null) {
    return props.priceArgs.insideSixUrbanDistrict
  }
  return insideSixUrbanDistrictInputValue.value
})

function calculateCommercialLoanInterestRate(
  buyerPropertyNumber: number,
  insideSixUrbanDistrict: boolean
) {
  if (buyerPropertyNumber === 1 && insideSixUrbanDistrict === true) {
    return 4.05
  }
  if (buyerPropertyNumber === 1 && insideSixUrbanDistrict === false) {
    return 3.95
  }
  if (buyerPropertyNumber === 2 && insideSixUrbanDistrict === true) {
    return 4.55
  }
  if (buyerPropertyNumber === 2 && insideSixUrbanDistrict === false) {
    return 4.5
  }
  assert(
    false,
    `Invalid buyerPropertyNumber (${buyerPropertyNumber}) or insideSixUrbanDistrict (${insideSixUrbanDistrict})`
  )
}

function calculateRepaymentPlanFromInputs(
  loanPrinciple,
  loanTermInYears,
  repaymentMethod,
  buyerPropertyNumber,
  insideSixUrbanDistrict
) {
  if (
    [
      loanPrinciple,
      loanTermInYears,
      repaymentMethod,
      buyerPropertyNumber,
      insideSixUrbanDistrict
    ].some((v) => v === null)
  ) {
    return null
  }

  const interestRate = calculateCommercialLoanInterestRate(
    buyerPropertyNumber,
    insideSixUrbanDistrict
  )

  return calculateRepaymentPlan({
    principle: loanPrinciple,
    durationInYears: loanTermInYears,
    repaymentMethod: repaymentMethod,
    annualInterestRatePercentage: interestRate
  })
}

watch(
  [loanPrinciple, loanTermInYears, repaymentMethod, buyerPropertyNumber, insideSixUrbanDistrict],
  ([
    loanPrinciple,
    loanTermInYears,
    repaymentMethod,
    buyerPropertyNumber,
    insideSixUrbanDistrict
  ]) => {
    emit(
      'update-result',
      calculateRepaymentPlanFromInputs(
        TenThousandRMBToRMB(loanPrinciple),
        loanTermInYears,
        repaymentMethod,
        buyerPropertyNumber,
        insideSixUrbanDistrict
      )
    )
  }
)
</script>

<template>
  <div>
    <h1>贷款计算</h1>

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
      :show="
        priceRequiredInputs !== undefined && !priceRequiredInputs.has('insideSixUrbanDistrict')
      "
    >
      <InsideSixUrbanDistrictInput v-model="insideSixUrbanDistrictInputValue" />
    </n-collapse-transition>
  </div>
</template>

<style scoped></style>
