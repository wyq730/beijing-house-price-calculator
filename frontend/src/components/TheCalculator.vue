<script setup lang="ts">
import { ref, computed } from 'vue'
import CalculatorInput from './CalculatorInput.vue'
import CalculatorResult from './CalculatorResult.vue'
import { type HousePriceResult } from './RuleBasedCalculator'

const result = ref<HousePriceResult | null>()
function updateResult(newResult: HousePriceResult | null) {
  result.value = newResult
}

const isResultReady = computed(() => {
  return result.value !== null
})
</script>

<template>
  <CalculatorResult :result="isResultReady ? result : undefined" />
  <CalculatorInput @update-result="updateResult" style="margin: 20px" />
</template>

<style scoped></style>
