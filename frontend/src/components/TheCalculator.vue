<script setup lang="ts">
import { ref } from 'vue'
import CalculatorInput from './CalculatorInput.vue'
import CalculatorResult from './CalculatorResult.vue'
import { type HousePriceResult } from './Calculator'

const result = ref<HousePriceResult | null>(null)
function updateResult(newResult) {
  result.value = newResult
}
</script>

<template>
  <div id="calculator">
    <CalculatorInput @update-result="updateResult" />
    <hr />
    <CalculatorResult style="margin-top: 20px" :result="result ? result : undefined" />
  </div>
</template>

<style scoped>
#calculator {
  margin: 20px;
}
</style>
