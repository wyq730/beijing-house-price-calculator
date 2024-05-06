<script setup lang="ts">
import OptionSelector from '../OptionSelector.vue'

const boolOptions = [
  { name: '是', value: true },
  { name: '否', value: false }
]

const model = defineModel()
</script>

<template>
  <div class="section">
    <OptionSelector
      title="是否在城六区内？"
      :options="boolOptions"
      v-model:selected-value="model"
    />
  </div>
</template>

<style scoped></style>
