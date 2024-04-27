<script setup lang="ts">
import { NRadio, NRadioGroup } from 'naive-ui'

defineProps(['title', 'options'])
const model = defineModel('selectedValue')
</script>

<template>
  <div class="title">{{ title }}</div>
  <div>
    <n-radio-group v-model:value="model">
      <n-radio
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :label="option.name"
      ></n-radio>
    </n-radio-group>
  </div>
</template>

<style scoped></style>
