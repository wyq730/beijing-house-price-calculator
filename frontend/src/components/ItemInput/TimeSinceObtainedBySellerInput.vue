<script setup lang="ts">
import { ref, watch } from 'vue'
import OptionSelector from '../OptionSelector.vue'

const emit = defineEmits(['update-value'])

const boolOptions = [
  { name: '是', value: true },
  { name: '否', value: false }
]

const whetherOwnMoreThanFive = ref<boolean | null>(null)
const whetherOwnMoreThanTwo = ref<boolean | null>(null)

watch(
  [whetherOwnMoreThanFive, whetherOwnMoreThanTwo],
  async ([whetherOwnMoreThanFive, whetherOwnMoreThanTwo]) => {
    let timeSinceObtainedBySeller
    if (whetherOwnMoreThanFive === null) {
      timeSinceObtainedBySeller = null
    } else if (whetherOwnMoreThanFive === true) {
      timeSinceObtainedBySeller = 'longer_than_5'
    } else if (whetherOwnMoreThanTwo === null) {
      timeSinceObtainedBySeller = null
    } else if (whetherOwnMoreThanTwo === true) {
      timeSinceObtainedBySeller = '2_to_5'
    } else {
      timeSinceObtainedBySeller = 'shorter_than_2'
    }
    emit('update-value', timeSinceObtainedBySeller)
  }
)
</script>
<template>
  <div class="section">
    <div class="subsection">
      <OptionSelector
        title="卖方是否取得房产证满 5 年？"
        :options="boolOptions"
        v-model:selected-value="whetherOwnMoreThanFive"
      />
    </div>

    <div class="subsection" v-if="whetherOwnMoreThanFive === false">
      <OptionSelector
        title="卖方是否取得房产证满 2 年？"
        :options="boolOptions"
        v-model:selected-value="whetherOwnMoreThanTwo"
      />
    </div>
  </div>
</template>
<style scoped></style>
