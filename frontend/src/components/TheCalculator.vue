<script setup lang="ts">
import { ref, computed } from 'vue'
import CalculatorInput from './CalculatorInput.vue'
import CalculatorResult from './CalculatorResult.vue'
import LoanCalculatorInput from './LoanCalculatorInput.vue'
import { HousePriceArgument, type HousePriceResult } from './RuleBasedCalculator'

const priceArgs = ref<HousePriceArgument>()
const requiredInputs = ref<Set<string>>()
const result = ref<HousePriceResult | null>(null) // 'null' means no result.

function update(
  newInput: HousePriceArgument,
  newResult: HousePriceResult | null,
  currentRequiredInputs: Set<string>
) {
  priceArgs.value = newInput
  result.value = newResult
  requiredInputs.value = currentRequiredInputs
}

const isResultReady = computed(() => {
  return result.value !== null
})
</script>

<template>
  <CalculatorResult :result="isResultReady ? result : undefined" />
  <CalculatorInput style="margin: 20px" @update="update" />
  <LoanCalculatorInput
    style="margin: 20px"
    :price-args="priceArgs"
    :price-required-inputs="requiredInputs"
  />
</template>

<style scoped></style>
