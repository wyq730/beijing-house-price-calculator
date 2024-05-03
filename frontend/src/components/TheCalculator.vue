<script setup lang="ts">
import { ref, computed } from 'vue'
import CalculatorInput from './CalculatorInput.vue'
import CalculatorResult from './CalculatorResult.vue'
import { type HousePriceResult } from './RuleBasedCalculator'

const result = ref<HousePriceResult | null>(null)
function updateResult(newResult: HousePriceResult | null) {
  result.value = newResult
}

const isResultReady = computed(() => {
  return result.value !== null
})
</script>

<template>
  <div id="calculator">
    <CalculatorInput @update-result="updateResult" />
    <hr />
    <CalculatorResult :result="isResultReady ? result : undefined" />
  </div>
</template>

<style scoped>
#calculator {
  margin: 20px;
}
</style>
