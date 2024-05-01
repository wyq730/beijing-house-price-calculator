/**
 * 定义一套计算规则。
 *
 * 根据这套规则，可以根据已填的选项解析出还需要填哪些选项才可以完成计算。
 *
 * 每个分项的计算规则定义按照如下格式：
 * - 若 (arg1 满足 condition1 且 arg2 满足 condition2 且 arg3 满足 condition3)，则计算参数为 arg4、arg5，以及分项 i1、i2，计算公式为：...
 * - (和上述同样格式)
 * - (和上述同样格式)
 * - ...
 *
 * 解析方式：
 * - 对每个分项：
 *   - 对规则 1，将 arg1 加入 deps，若：
 *     - arg1 没有：等待输入
 *     - arg1 满足：则
 *       - 若未完成此规则：对 arg2 进行同样操作
 *       - 若完成此规则：
 *         - 将 calculator 的所有 args 加入 deps，若没有则等待输入，若有则继续。
 *         - 若 upstreams 未完成，则 wait_upstream，若完成，则计算。
 *     - arg1 不满足：则对下一条规则进行同样操作
 * - 按以上规则，每个分项各走各的，都在等待时，若有等待 upstream 的，就迭代一次，否则就等待用户输入。
 *   - 相关状态：每个规则的状态（pending / finish / wait_input / wait_upstream）, deps
 */

import { type HousePriceArgument } from './RuleBasedCalculator'

// What I actually want:
//
// interface FieldBasedCondition {
//   field: keyof HousePriceArgument
//   condition: (v: HousePriceArgument[field]) => boolean
// }
//
// But it's not valid TypeScript. For now, I can only find the type declaration below as an
// alternative, though not perfect because it can have many keys (I only need one).
type FieldBasedCondition = {
  [k in keyof HousePriceArgument]?: (v: HousePriceArgument[k]) => boolean
}

type ConditionedCalculator = {
  conditions?: FieldBasedCondition[] // To trigger the calculator, ALL of the conditions must be satisfied.
  calculator: {
    args?: (keyof HousePriceArgument)[]
    upstreams?: string[]
    func: (...args: any[]) => number
  }
}
type ItemCalculator = {
  id: string
  name: string
  cases: ConditionedCalculator[]
}

const signedPriceRule: ItemCalculator = {
  id: 'signed_price',
  name: '网签价',
  cases: [
    {
      calculator: {
        args: ['signedPrice'],
        func: (signedPrice) => signedPrice
      }
    }
  ]
}

const deedTaxRule: ItemCalculator = {
  id: 'deed_tax',
  name: '契税',
  cases: [
    // 非首套
    {
      conditions: [{ buyerPropertyNumber: (v) => v !== 1 }],
      calculator: {
        args: ['signedPrice'],
        upstreams: ['vat_tax'],

        func: (signedPrice, vatTax) => {
          const taxable = signedPrice - vatTax
          return taxable * 0.03
        }
      }
    },

    // 首套，大于 90 平米
    {
      conditions: [{ largerThan90: (v) => v }],
      calculator: {
        args: ['signedPrice'],
        upstreams: ['vat_tax'],

        func: (signedPrice, vatTax) => {
          const taxable = signedPrice - vatTax
          return taxable * 0.015
        }
      }
    },

    // 首套，小于 90 平米
    {
      calculator: {
        args: ['signedPrice'],
        upstreams: ['vat_tax'],
        func: (signedPrice, vatTax) => {
          const taxable = signedPrice - vatTax
          return taxable * 0.01
        }
      }
    }
  ]
}

const personalIncomeTaxRule: ItemCalculator = {
  id: 'personal_income_tax',
  name: '个人所得税',
  cases: [
    // 满五唯一
    {
      conditions: [
        { timeSinceObtainedBySeller: (v) => v === 'longer_than_5' },
        { whetherSellerOnlyProperty: (v) => v }
      ],
      calculator: {
        func: () => 0
      }
    },

    // 不 "满五唯一"。
    {
      calculator: {
        args: ['signedPrice', 'originalPrice', 'originalDeedTax', 'sellerPaidInterest'],
        upstreams: ['vat_tax', 'vat_tax_addons'],
        func: (
          signedPrice,
          originalPrice,
          originalDeedTax,
          sellerPaidInterest,
          vatTax,
          vatTaxAddons
        ) =>
          (signedPrice * 0.9 -
            originalPrice -
            vatTax -
            vatTaxAddons -
            originalDeedTax -
            sellerPaidInterest) *
          0.2
      }
    }
  ]
}

const vatTaxRule: ItemCalculator = {
  id: 'vat_tax',
  name: '增值税',
  cases: [
    // 满二，普宅
    {
      conditions: [
        { timeSinceObtainedBySeller: (v) => v !== 'shorter_than_2' },
        { generalHouse: (v) => v }
      ],
      calculator: {
        func: () => 0
      }
    },

    // 满二，当做普宅处理
    {
      conditions: [
        { timeSinceObtainedBySeller: (v) => v !== 'shorter_than_2' },
        { propertyType: (v) => ['purchased_public', 'second_class_affordable'].includes(v) }
      ],
      calculator: {
        func: () => 0
      }
    },

    // 满二，非普宅
    {
      conditions: [{ timeSinceObtainedBySeller: (v) => v !== 'shorter_than_2' }],
      calculator: {
        args: ['signedPrice', 'originalPrice'],
        func: (signedPrice, originalPrice) => {
          // TODO(yanqingwang): 查不到原值的情况。
          return ((signedPrice - originalPrice) / 1.05) * 0.05
        }
      }
    },

    // 不满二
    {
      calculator: {
        args: ['signedPrice'],
        func: (signedPrice) => (signedPrice / 1.05) * 0.05
      }
    }
  ]
}

const vatAddonsTaxRule: ItemCalculator = {
  id: 'vat_tax_addons',
  name: '增值税附加税',
  cases: [
    {
      calculator: {
        upstreams: ['vat_tax'],
        func: (vatTax) => vatTax * 0.06
      }
    }
  ]
}

const purchasedPublicLandTransferFeeRule: ItemCalculator = {
  id: 'purchased_public_land_transfer_fee',
  name: '已购公房 - 土地出让金',
  cases: [
    // 不是已购公房
    {
      conditions: [{ propertyType: (v) => v !== 'purchased_public' }],
      calculator: { func: () => 0 }
    },

    // 是已购公房
    {
      calculator: {
        args: ['insideSixUrbanDistrict', 'buildingArea'],
        func: (insideSixUrbanDistrict, buildingArea) => {
          const costPrice = insideSixUrbanDistrict ? 1560 : 1290
          return buildingArea * costPrice * 0.01
        }
      }
    }
  ]
}

const purchasedPublicRemainCostPriceRule: ItemCalculator = {
  id: 'purchased_public_remain_cost_price',
  name: '已购公房 - 补全成本价',
  cases: [
    // 不是已购公房
    {
      conditions: [{ propertyType: (v) => v !== 'purchased_public' }],
      calculator: { func: () => 0 }
    },

    // 是已购公房，但是不是按优惠价购买
    {
      conditions: [{ purchasedPublicAtDiscountedPrice: (v) => !v }],
      calculator: { func: () => 0 }
    },

    // 是已购公房，且是按优惠价购买的
    {
      calculator: {
        args: ['insideSixUrbanDistrict', 'buildingArea'],
        func: (insideSixUrbanDistrict, buildingArea) => {
          const costPrice = insideSixUrbanDistrict ? 1560 : 1290
          return buildingArea * costPrice * 0.06
        }
      }
    }
  ]
}

const firstClassAffordableComprehensiveLandFeeRule: ItemCalculator = {
  id: 'first_class_affordable_comprehensive_land_fee_rule',
  name: '一类经适房 - 综合地价款',
  cases: [
    // 不是一类经适房
    {
      conditions: [{ propertyType: (v) => v !== 'first_class_affordable' }],
      calculator: { func: () => 0 }
    },

    // 2008/04/11 之前购买的一类经适房。
    {
      conditions: [{ firstClassAffordableBuyBefore20080411: (v) => v }],
      calculator: {
        args: ['signedPrice'],
        upstreams: ['vat_tax'],
        func: (signedPrice, vatTax) => (signedPrice - vatTax) * 0.1
      }
    },

    // 2008/04/11 之后购买的一类经适房。
    {
      calculator: {
        args: ['signedPrice', 'originalPrice'],
        upstreams: ['vat_tax'],
        func: (signedPrice, originalPrice, vatTax) => (signedPrice - vatTax - originalPrice) * 0.7
      }
    }
  ]
}

const secondClassAffordableLandTransferFeeRule: ItemCalculator = {
  id: 'second_class_affordable_land_transfer_fee_rule',
  name: '二类经适房 - 土地出让金',
  cases: [
    // 不是二类经适房。
    {
      conditions: [{ propertyType: (v) => v !== 'second_class_affordable' }],
      calculator: { func: () => 0 }
    },

    // 是二类经适房。
    {
      calculator: {
        args: ['signedPrice'],
        upstreams: ['vat_tax'],
        func: (signedPrice, vatTax) => (signedPrice - vatTax) * 0.03
      }
    }
  ]
}

const rules = [
  signedPriceRule,
  deedTaxRule,
  personalIncomeTaxRule,
  vatAddonsTaxRule,
  vatTaxRule,
  purchasedPublicLandTransferFeeRule,
  purchasedPublicRemainCostPriceRule,
  firstClassAffordableComprehensiveLandFeeRule,
  secondClassAffordableLandTransferFeeRule
]

export { rules, type ItemCalculator }
