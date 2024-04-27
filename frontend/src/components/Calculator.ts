/**
 * 假设：
 * - 网签价高于核定价。
 *
 * 没考虑：
 * - “城市维护建设税” 为 5% 的区域（影响增值税附加）。
 */

interface HousePriceArgument {
  propertyType:
    | 'commercial'
    | 'purchased_public'
    | 'first_class_affordable'
    | 'second_class_affordable'
  buyerPropertyNumber: number
  timeSinceObtainedBySeller: 'longer_than_5' | '2_to_5' | 'shorter_than_2' // merge whetherOwnMoreThanTwo and whetherOwnMoreThanFive
  whetherSellerOnlyProperty: boolean
  largerThan90: boolean
  generalHouse: boolean
  ringRoadRegion: 'inside_5' | 'between_5_and_6' | 'outside_6'
  insideSixUrbanDistrict: boolean

  signedPrice: number
  buildingArea: number

  originalPrice: number
  originalDeedTax: number
  sellerPaidInterest: number

  purchasedPublicAtDiscountedPrice: boolean
  firstClassAffordableBuyBefore20080411: boolean
}

interface HousePriceItem {
  name: string
  price: number
}

interface HousePriceResult {
  total: number
  breakdown: HousePriceItem[]
}

class HousePriceCalculator {
  _arg: HousePriceArgument

  _calculators = [
    { name: '契税', calculator: this.calculateDeedTax },
    { name: '个人所得税', calculator: this.calculatePersonalIncomeTax },
    { name: '增值税', calculator: this.calculateVAT },
    { name: '增值税附加税', calculator: this.calculateVATAddons },
    { name: '【已购公房】土地出让金', calculator: this.calculatePurchasedPublicLandTransferFee },
    { name: '【已购公房】补全成本价', calculator: this.calculatePurchasedPublicRemainCostPrice },
    {
      name: '【一类经适房】综合地价款',
      calculator: this.calculateFirstClassAffordableComprehensiveLandFee
    },
    {
      name: '【二类经适房】土地出让金',
      calculator: this.calculateSecondClassAffordableLandTransferFee
    }
  ]

  constructor(arg: HousePriceArgument) {
    this._arg = arg
  }

  calculate(): HousePriceResult {
    const priceItems: HousePriceItem[] = [{ name: '网签价', price: this._arg.signedPrice }]
    for (const { name, calculator } of this._calculators) {
      priceItems.push({
        name,
        price: calculator.bind(this)()
      })
    }
    const total = priceItems.reduce((sum, curr) => sum + curr.price, 0)

    return {
      total,
      breakdown: priceItems
    }
  }

  // 计算契税。
  calculateDeedTax(): number {
    const taxable = this._arg.signedPrice - this.calculateVAT()

    let rate = 0
    if (this._arg.buyerPropertyNumber === 1) {
      if (!this._arg.largerThan90) {
        rate = 0.01
      } else {
        rate = 0.015
      }
    } else {
      rate = 0.03
    }

    return taxable * rate
  }

  // 计算个人所得税。
  calculatePersonalIncomeTax(): number {
    if (
      this._arg.timeSinceObtainedBySeller === 'longer_than_5' &&
      this._arg.whetherSellerOnlyProperty
    ) {
      return 0
    }

    // TODO(yanqingwang): 查不到原值的情况。
    return (
      (this._arg.signedPrice * 0.9 -
        this._arg.originalPrice -
        this.calculateVAT() -
        this.calculateVATAddons() -
        this._arg.originalDeedTax -
        this._arg.sellerPaidInterest) *
      0.2
    )
  }

  // 计算增值税。
  calculateVAT(): number {
    // 这里，二类经适、已购公房也按普宅处理
    const consideredAsGeneral =
      this._arg.generalHouse ||
      ['purchased_public', 'second_class_affordable'].includes(this._arg.propertyType)

    // case: 满二，普宅
    if (this._obtainedForMoreThanTwo() && consideredAsGeneral) {
      return 0
    }

    // case: 满二，非普宅
    if (this._obtainedForMoreThanTwo()) {
      // TODO(yanqingwang): 查不到原值的情况。
      return ((this._arg.signedPrice - this._arg.originalPrice) / 1.05) * 0.05
    }

    // case: 不满二
    return (this._arg.signedPrice / 1.05) * 0.05
  }

  // 计算增值税的三个附加税之和。
  calculateVATAddons(): number {
    const vat = this.calculateVAT()
    return vat * 0.06
  }

  // 计算已购公房的土地出让金。
  calculatePurchasedPublicLandTransferFee(): number {
    if (this._arg.propertyType !== 'purchased_public') {
      return 0
    }

    const costPrice = this._arg.insideSixUrbanDistrict ? 1560 : 1290
    return this._arg.buildingArea * costPrice * 0.01
  }

  // 计算已购公房的补全成本价。
  calculatePurchasedPublicRemainCostPrice(): number {
    if (this._arg.propertyType !== 'purchased_public') {
      return 0
    }

    if (!this._arg.purchasedPublicAtDiscountedPrice) {
      return 0
    }

    const costPrice = this._arg.insideSixUrbanDistrict ? 1560 : 1290
    return this._arg.buildingArea * costPrice * 0.06
  }

  // 计算一类经适房的综合地价款。
  calculateFirstClassAffordableComprehensiveLandFee(): number {
    if (this._arg.propertyType !== 'first_class_affordable') {
      return 0
    }

    if (this._arg.firstClassAffordableBuyBefore20080411) {
      return (this._arg.signedPrice - this.calculateVAT()) * 0.1
    }

    return (this._arg.signedPrice - this.calculateVAT() - this._arg.originalPrice) * 0.7
  }

  // 计算二类经适房的土地出让金。
  calculateSecondClassAffordableLandTransferFee(): number {
    if (this._arg.propertyType !== 'second_class_affordable') {
      return 0
    }
    return (this._arg.signedPrice - this.calculateVAT()) * 0.03
  }

  // 是否满二。
  _obtainedForMoreThanTwo() {
    return this._arg.timeSinceObtainedBySeller !== 'shorter_than_2'
  }

  _check(arg: HousePriceArgument) {
    if (arg.signedPrice < arg.originalPrice) {
      return {
        valid: false,
        message: '网签价比原值还低？真的嘛？这样的话，我还不知道怎么算哦。'
      }
    }
    return {
      valid: true,
      message: ''
    }
  }
}

export { type HousePriceResult, HousePriceCalculator }
