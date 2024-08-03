<script setup lang="ts">
import { ref, watch, type PropType } from 'vue'
import OptionSelector from '../OptionSelector.vue'
import { NCollapseTransition } from 'naive-ui'
import { type BooleanOrNull, type TimeSinceObtainedBySellerOrNull } from '../Constants'

const props = defineProps(['show'])
const emit = defineEmits(['update-value'])

const boolOptions = [
  { name: '是', value: true },
  { name: '否', value: false }
]

const whetherOwnMoreThanFive = ref<boolean | null>(null)
const whetherOwnMoreThanTwo = ref<boolean | null>(null)

function onWhetherOwnMoreThanFiveUpdate(newVal: boolean) {
  // Reset 'whetherOwnMoreThanTwo' if 'whetherOwnMoreThanFive' is true.
  if (newVal === true) {
    whetherOwnMoreThanTwo.value = null
  }
}

function convertSelectedValuesToOutputValue(
  whetherOwnMoreThanFive: BooleanOrNull,
  whetherOwnMoreThanTwo: BooleanOrNull
) {
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
  return timeSinceObtainedBySeller
}

function reset() {
  whetherOwnMoreThanFive.value = null
  whetherOwnMoreThanTwo.value = null
}

watch(
  () => props.show,
  (newShow) => {
    if (newShow === false) {
      reset()
    }
  }
)

watch(
  [whetherOwnMoreThanFive, whetherOwnMoreThanTwo],
  async ([whetherOwnMoreThanFive, whetherOwnMoreThanTwo]) => {
    const timeSinceObtainedBySeller = convertSelectedValuesToOutputValue(
      whetherOwnMoreThanFive,
      whetherOwnMoreThanTwo
    )
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
        @update:selected-value="onWhetherOwnMoreThanFiveUpdate"
      />
    </div>

    <n-collapse-transition :show="whetherOwnMoreThanFive === false">
      <div class="subsection">
        <OptionSelector
          title="卖方是否取得房产证满 2 年？"
          :options="boolOptions"
          v-model:selected-value="whetherOwnMoreThanTwo"
        />
      </div>
    </n-collapse-transition>
  </div>
</template>
<style scoped></style>
