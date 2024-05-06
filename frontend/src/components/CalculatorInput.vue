<script setup lang="ts">
import { ref, watch } from 'vue'
import { NInputNumber, NCollapseTransition } from 'naive-ui'
import OptionSelector from './OptionSelector.vue'
import RuleBasedCalculator from './RuleBasedCalculator'
import TimeSinceObtainedBySellerInput from './ItemInput/TimeSinceObtainedBySellerInput.vue'
import InsideSixUrbanDistrictInput from './ItemInput/InsideSixUrbanDistrictInput.vue'
import GeneralHouseInput from './ItemInput/GeneralHouseInput.vue'
import BuyerPropertyNumberInput from './ItemInput/BuyerPropertyNumberInput.vue'

const emit = defineEmits(['update'])

function TenThousandRMBToRMB(value: number | null): number | null {
  return value === null ? null : value * 10000
}

const boolOptions = [
  { name: '是', value: true },
  { name: '否', value: false }
]

const propertyTypeOptions = [
  { name: '商品房', value: 'commercial' },
  { name: '已购公房', value: 'purchased_public' },
  { name: '一类经济适用房', value: 'first_class_affordable' },
  { name: '二类经济适用房', value: 'second_class_affordable' }
]

const ringRoadRegionOptions = [
  { name: '五环内', value: 'inside_5' },
  { name: '五环和六环之间', value: 'between_5_and_6' },
  { name: '六环外', value: 'outside_6' }
]

const firstClassAffordableBuyBefore20080411Options = [
  { name: '2008/04/11 前', value: true },
  { name: '2008/04/11 后', value: false }
]

const propertyType = ref<string | null>(null)
const buyerPropertyNumber = ref<number | null>(null)
const timeSinceObtainedBySeller = ref<number | null>(null)
const whetherSellerOnlyProperty = ref<boolean | null>(null)
const largerThan90 = ref<boolean | null>(null)
const generalHouse = ref<boolean | null>(null) // 是否为普通住宅。
const ringRoadRegion = ref<string | null>(null)
const insideSixUrbanDistrict = ref<boolean | null>(null) // 是否在城六区内。

const signedPrice = ref<number | null>(null)
const buildingArea = ref<number | null>(null)

const originalPrice = ref<number | null>(null)
const originalDeedTax = ref<number | null>(null)
const sellerPaidInterest = ref<number | null>(null)

const purchasedPublicAtDiscountedPrice = ref<number | null>(null)

const firstClassAffordableBuyBefore20080411 = ref<boolean | null>(null)

const currentRequiredInputs = ref<Set<string>>(new Set())
watch(
  [
    propertyType,
    buyerPropertyNumber,
    timeSinceObtainedBySeller,
    whetherSellerOnlyProperty,
    largerThan90,
    generalHouse,
    ringRoadRegion,
    insideSixUrbanDistrict,

    signedPrice,
    buildingArea,

    originalPrice,
    originalDeedTax,
    sellerPaidInterest,

    purchasedPublicAtDiscountedPrice,
    firstClassAffordableBuyBefore20080411
  ],
  async ([
    propertyType,
    buyerPropertyNumber,
    timeSinceObtainedBySeller,
    whetherSellerOnlyProperty,
    largerThan90,
    generalHouse,
    ringRoadRegion,
    insideSixUrbanDistrict,

    signedPrice,
    buildingArea,

    originalPrice,
    originalDeedTax,
    sellerPaidInterest,

    purchasedPublicAtDiscountedPrice,
    firstClassAffordableBuyBefore20080411
  ]) => {
    const arg = {
      propertyType,
      buyerPropertyNumber,
      timeSinceObtainedBySeller,
      whetherSellerOnlyProperty,
      largerThan90,
      generalHouse,
      ringRoadRegion,
      insideSixUrbanDistrict,
      signedPrice: TenThousandRMBToRMB(signedPrice),
      buildingArea,

      originalPrice: TenThousandRMBToRMB(originalPrice),
      originalDeedTax: TenThousandRMBToRMB(originalDeedTax),
      sellerPaidInterest: TenThousandRMBToRMB(sellerPaidInterest),

      purchasedPublicAtDiscountedPrice,
      firstClassAffordableBuyBefore20080411
    }

    const calculator = new RuleBasedCalculator(arg)
    const res = calculator.calculateOrFindMissedInputs()
    currentRequiredInputs.value = new Set(calculator.requiredInputs())
    emit('update', arg, res, currentRequiredInputs.value)
  },
  { immediate: true }
)
</script>

<template>
  <div id="calculator-input">
    <h1>总费用计算</h1>
    <n-collapse-transition :show="currentRequiredInputs.has('signedPrice')">
      <div class="section">
        <div class="title">网签价多少？</div>
        <n-input-number
          v-model:value="signedPrice"
          clearable
          placeholder="网签价（万元）"
          style="width: 200px"
        />
      </div>
    </n-collapse-transition>

    <n-collapse-transition :show="currentRequiredInputs.has('propertyType')">
      <div class="section">
        <OptionSelector
          title="房屋性质是？"
          :options="propertyTypeOptions"
          v-model:selected-value="propertyType"
        />
      </div>
    </n-collapse-transition>

    <n-collapse-transition :show="currentRequiredInputs.has('buyerPropertyNumber')">
      <BuyerPropertyNumberInput v-model="buyerPropertyNumber" />
    </n-collapse-transition>

    <n-collapse-transition :show="currentRequiredInputs.has('timeSinceObtainedBySeller')">
      <TimeSinceObtainedBySellerInput
        @update-value="
          (v) => {
            timeSinceObtainedBySeller = v
          }
        "
      />
    </n-collapse-transition>

    <n-collapse-transition :show="currentRequiredInputs.has('whetherSellerOnlyProperty')">
      <div class="section">
        <OptionSelector
          title="是否为卖方的唯一住房？"
          :options="boolOptions"
          v-model:selected-value="whetherSellerOnlyProperty"
        />
      </div>
    </n-collapse-transition>

    <n-collapse-transition :show="currentRequiredInputs.has('largerThan90')">
      <div class="section">
        <OptionSelector
          title="是否大于 90 平米？"
          :options="boolOptions"
          v-model:selected-value="largerThan90"
        />
      </div>
    </n-collapse-transition>

    <n-collapse-transition :show="currentRequiredInputs.has('generalHouse')">
      <GeneralHouseInput v-model="generalHouse" />
    </n-collapse-transition>

    <n-collapse-transition :show="currentRequiredInputs.has('ringRoadRegion')">
      <div class="section">
        <OptionSelector
          title="在几环？"
          :options="ringRoadRegionOptions"
          v-model:selected-value="ringRoadRegion"
        />
      </div>
    </n-collapse-transition>

    <n-collapse-transition :show="currentRequiredInputs.has('insideSixUrbanDistrict')">
      <InsideSixUrbanDistrictInput v-model="insideSixUrbanDistrict" />
    </n-collapse-transition>

    <n-collapse-transition :show="currentRequiredInputs.has('buildingArea')">
      <div class="section">
        <div class="title">建筑面积是多少？</div>
        <n-input-number
          v-model:value="buildingArea"
          clearable
          placeholder="建筑面积（平米）"
          style="width: 200px"
        />
      </div>
    </n-collapse-transition>

    <n-collapse-transition :show="currentRequiredInputs.has('originalPrice')">
      <div class="section">
        <div class="title">原值多少？</div>
        <n-input-number
          v-model:value="originalPrice"
          clearable
          placeholder="原值（万元）"
          style="width: 200px"
        />
      </div>
    </n-collapse-transition>

    <n-collapse-transition :show="currentRequiredInputs.has('originalDeedTax')">
      <div class="section">
        <div class="title">原契税多少？</div>
        <n-input-number
          v-model:value="originalDeedTax"
          clearable
          placeholder="原契税（万元）"
          style="width: 200px"
        />
      </div>
    </n-collapse-transition>

    <n-collapse-transition :show="currentRequiredInputs.has('sellerPaidInterest')">
      <div class="section">
        <div class="title">卖方已经支付的贷款利息有多少？</div>
        <n-input-number
          v-model:value="sellerPaidInterest"
          clearable
          placeholder="卖方已经支付的贷款利息（万元）"
          style="width: 200px"
        />
      </div>
    </n-collapse-transition>

    <n-collapse-transition :show="currentRequiredInputs.has('purchasedPublicAtDiscountedPrice')">
      <div class="section">
        <OptionSelector
          title="该公房是否是按照优惠价（而不是标准价/成本价）购买的？"
          :options="boolOptions"
          v-model:selected-value="purchasedPublicAtDiscountedPrice"
        />
      </div>
    </n-collapse-transition>

    <n-collapse-transition
      :show="currentRequiredInputs.has('firstClassAffordableBuyBefore20080411')"
    >
      <div class="section">
        <OptionSelector
          title="该一类经适房是在什么时候签订购房合同的？"
          :options="firstClassAffordableBuyBefore20080411Options"
          v-model:selected-value="firstClassAffordableBuyBefore20080411"
        />
      </div>
    </n-collapse-transition>
  </div>
</template>

<style scoped></style>

<style>
h1 {
  font-size: 16px;
  margin-bottom: 16px;
}

.section {
  margin-bottom: 20px;
}

.subsection {
  margin-bottom: 20px;
}

.title {
  margin-bottom: 10px;
}
</style>
