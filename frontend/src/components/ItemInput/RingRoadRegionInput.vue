<script setup lang="ts">
import OptionSelector from '../OptionSelector.vue'

const ringRoadRegionOptions = [
  { name: '五环内', value: 'inside_5' },
  { name: '五环和六环之间', value: 'between_5_and_6' },
  { name: '六环外', value: 'outside_6' }
]

const model = defineModel()
</script>

<template>
  <div class="section">
    <OptionSelector
      title="在几环？"
      :options="ringRoadRegionOptions"
      v-model:selected-value="model"
    />
  </div>
</template>

<style scoped></style>
