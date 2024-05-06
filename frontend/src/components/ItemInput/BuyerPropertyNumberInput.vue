<script setup lang="ts">
import OptionSelector from '../OptionSelector.vue'

const houseNumberOptions = [
  { name: '首套', value: 1 },
  { name: '二套', value: 2 }
]

const model = defineModel()
</script>

<template>
  <div class="section">
    <OptionSelector
      title="是买方的第几套住房？"
      :options="houseNumberOptions"
      v-model:selected-value="model"
    />
  </div>
</template>
