<script setup lang="ts">
import { type PropType } from 'vue'
import { type HousePriceResult } from './Calculator'

const props = defineProps({
  result: Object as PropType<HousePriceResult>
})

const displayDigitNumberAfterDecimalPoint = 2
</script>

<template>
  <div id="calculator-result">
    <div>总费用: {{ props.result?.total.toFixed(displayDigitNumberAfterDecimalPoint) }}</div>
    <div v-for="item in props.result?.breakdown" :key="item.name">
      {{ item.name }}: {{ item.price.toFixed(displayDigitNumberAfterDecimalPoint) }}
    </div>
  </div>
</template>

<style scoped></style>
