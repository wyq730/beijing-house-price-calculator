/**
 * 计算模块。
 *
 * 假设：
 * - 网签价高于核定价。
 *
 * 没考虑：
 * - “城市维护建设税” 为 5% 的区域（影响增值税附加）。
 */

import type { HousePriceArgument, HousePriceResult } from './Calculator'
import { rules, type ItemCalculator } from './Rules'
import { assert } from './Utils'

class RuleBasedCalculator {
  _arg
  _ruleIDToRule
  _ruleStates
  _ruleResults
  _waitUpstreamFlags
  _requiredInputs: Set<keyof HousePriceArgument>

  constructor(arg: HousePriceArgument) {
    this._arg = arg

    this._ruleIDToRule = Object.fromEntries(rules.map((rule) => [rule.id, rule]))
    assert(Object.keys(this._ruleIDToRule).length === rules.length, 'Duplicate rule ID is found.')
    this._ruleStates = Object.fromEntries(rules.map((rule) => [rule.id, 'pending']))

    // Used to detect dependency cycles.
    this._waitUpstreamFlags = Object.fromEntries(rules.map((rule) => [rule.id, false]))
    this._ruleResults = Object.fromEntries(rules.map((rule) => [rule.id, null]))
    this._requiredInputs = new Set()
  }

  requiredInputs() {
    return this._requiredInputs
  }

  /**
   * Calculate if we can, or find the additional inputs we need.
   */
  calculateOrFindMissedInputs(): HousePriceResult | null {
    for (const rule of rules) {
      if (this._ruleStates[rule.id] === 'pending') {
        this.calculateOrFindMissedInputsForSingleRule(rule)
      }
    }

    console.log('missing:', this._missingArgs())

    if (!this._isPriceReady()) {
      return null
    }

    const total = Object.values(this._ruleResults).reduce((sum, curr) => sum + curr, 0)
    const breakdown = []
    for (const [ruleID, ruleResult] of Object.entries(this._ruleResults)) {
      breakdown.push({ name: this._ruleIDToRule[ruleID].name, price: ruleResult })
    }
    return {
      total,
      breakdown
    }
  }

  calculateOrFindMissedInputsForSingleRule(rule: ItemCalculator) {
    assert(this._ruleStates[rule.id] !== 'finish')

    let selectedCalculator = null
    for (const calculator of rule.cases) {
      // 1. Check conditions.
      let shouldUseCurrentCalculator = true
      if (calculator.conditions === undefined) {
        selectedCalculator = calculator
        break
      } else {
        for (const condition of calculator.conditions) {
          assert(Object.keys(condition).length === 1, 'A condition must have only one key.')

          const requiredField: keyof HousePriceArgument = Object.keys(condition)[0]
          const filter = condition[requiredField]

          this._requiredInputs.add(requiredField)
          if (this._arg[requiredField] === null) {
            this._ruleStates[rule.id] = 'wait_input'
            return
          }

          if (!filter(this._arg[requiredField])) {
            shouldUseCurrentCalculator = false
            break
          }
        }

        if (shouldUseCurrentCalculator) {
          selectedCalculator = calculator
          break
        }
      }
    }

    assert(selectedCalculator !== null, `No case is satisfied for ${rule.id}.`)

    // 2. Check upstreams.
    const upstreamRules = selectedCalculator.calculator.upstreams
      ? selectedCalculator.calculator.upstreams
      : []

    this._waitUpstreamFlags[rule.id] = true
    for (const upstreamRule of upstreamRules) {
      assert(this._waitUpstreamFlags[upstreamRule] === false, 'Dependency cycle detected.')
      if (this._ruleStates[upstreamRule] === 'pending') {
        this.calculateOrFindMissedInputsForSingleRule(this._ruleIDToRule[upstreamRule])
      }

      if (this._ruleStates[upstreamRule] === 'wait_input') {
        this._ruleStates[rule.id] = 'wait_input'
        return
      } else if (this._ruleStates[upstreamRule] === 'finish') {
        // pass
      } else {
        assert(false, `Invalid rule state of ${upstreamRule}: ${this._ruleStates[upstreamRule]}`)
      }
    }
    this._waitUpstreamFlags[rule.id] = false

    const upstreamValues = upstreamRules.map((ruleID) => {
      assert(this._ruleResults[ruleID] !== null, 'Rule results have not been retrieved.')
      return this._ruleResults[ruleID]
    })

    // 3. Check calculation dependencies.
    const args = selectedCalculator.calculator.args ? selectedCalculator.calculator.args : []
    for (const requiredInput of args) {
      this._requiredInputs.add(requiredInput)
    }

    for (const arg of args) {
      if (this._arg[arg] === null) {
        this._ruleStates[rule.id] = 'wait_input'
        return
      }
    }

    const value = selectedCalculator.calculator.func(
      ...args.map((arg) => this._arg[arg]),
      ...upstreamValues
    )
    this._ruleResults[rule.id] = value
    this._ruleStates[rule.id] = 'finish'
    return
  }

  _isPriceReady() {
    return Object.values(this._ruleStates).every((state) => state === 'finish')
  }

  _missingArgs() {
    const missingArgs = []
    for (const requiredInput of this._requiredInputs) {
      assert(requiredInput in this._arg)
      if (this._arg[requiredInput] === null) {
        missingArgs.push(requiredInput)
      }
    }
    return missingArgs
  }
}

export default RuleBasedCalculator
