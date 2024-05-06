<script setup lang="ts">
import { ref, computed } from 'vue'
import CalculatorInput from './CalculatorInput.vue'
import CalculatorResult from './CalculatorResult.vue'
import LoanCalculatorInput from './LoanCalculatorInput.vue'
import { type HousePriceArgument, type HousePriceResult } from './RuleBasedCalculator'
import { type RepaymentPlan } from './LoanCalculator'

const priceArgs = ref<HousePriceArgument>()
const requiredInputs = ref<Set<string>>()
const result = ref<HousePriceResult | null>(null) // 'null' means no result.
const repaymentPlan = ref<RepaymentPlan | null>(null)

function update(
  newInput: HousePriceArgument,
  newResult: HousePriceResult | null,
  currentRequiredInputs: Set<string>
) {
  priceArgs.value = newInput
  result.value = newResult
  requiredInputs.value = currentRequiredInputs
}

function updateLoan(result: RepaymentPlan | null) {
  repaymentPlan.value = result
}
</script>

<template>
  <CalculatorResult :result="result" :repayment-plan="repaymentPlan" />
  <CalculatorInput style="margin: 20px" @update="update" />
  <LoanCalculatorInput
    style="margin: 20px"
    :price-args="priceArgs"
    :price-required-inputs="requiredInputs"
    @update-result="updateLoan"
  />
</template>

<style scoped></style>
