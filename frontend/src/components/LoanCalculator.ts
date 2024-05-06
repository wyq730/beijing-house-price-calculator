import { assert } from './Utils'

type LoanArgs = {
  principle: number
  durationInYears: number
  annualInterestRatePercentage: number
  repaymentMethod: RepaymentMethod
}
type RepaymentPlanData = { principle: number; interest: number }[]
type RepaymentMethod = 'equal_principle' | 'equal_principle_and_interest'

class RepaymentPlan {
  _args: LoanArgs
  _planData: RepaymentPlanData

  constructor(loanArgs: LoanArgs, repaymentPlan: RepaymentPlanData) {
    this._args = loanArgs
    this._planData = repaymentPlan
  }

  detail() {
    const detail = []
    let remainPrinciple = this.principle()
    for (const monthPlanData of this._planData) {
      detail.push({
        principle: monthPlanData.principle,
        interest: monthPlanData.interest,
        remainPrinciple: remainPrinciple
      })
      remainPrinciple -= monthPlanData.interest
    }
    return detail
  }

  total(): number {
    return this.principle() + this.interest()
  }

  interest(): number {
    return this._planData.reduce((sum, curr) => sum + curr.interest, 0)
  }

  principle(): number {
    return this._args.principle
  }

  durationInYears(): number {
    return this._args.durationInYears
  }

  annualInterestRate(): number {
    return this._args.annualInterestRatePercentage
  }
}

function calculateRepaymentPlan(arg: LoanArgs) {
  if (arg.repaymentMethod === 'equal_principle') {
    return new RepaymentPlan(
      arg,
      calculateRepaymentPlanForEqualPrinciple(
        arg.principle,
        arg.durationInYears,
        arg.annualInterestRatePercentage
      )
    )
  } else if (arg.repaymentMethod === 'equal_principle_and_interest') {
    return new RepaymentPlan(
      arg,
      calculateRepaymentPlanForEqualPrincipleAndInterest(
        arg.principle,
        arg.durationInYears,
        arg.annualInterestRatePercentage
      )
    )
  }
  assert(false, `Invalid repayment method: ${arg.repaymentMethod}`)
}

function calculateRepaymentPlanForEqualPrinciple(
  principle: number,
  durationInYears: number,
  annualInterestRatePercentage: number
): RepaymentPlanData {
  const durationInMonth = durationInYears * 12
  const monthlyInterestRate = annualInterestRatePercentage / 12 / 100
  let remainPrinciple = principle
  const repaymentPlan: RepaymentPlanData = []
  for (let month = 0; month < durationInMonth; ++month) {
    const principlePart = principle / durationInMonth
    repaymentPlan.push({
      principle: principlePart,
      interest: remainPrinciple * monthlyInterestRate
    })
    remainPrinciple -= principlePart
  }
  return repaymentPlan
}

function calculateRepaymentPlanForEqualPrincipleAndInterest(
  principle: number,
  durationInYears: number,
  annualInterestRatePercentage: number
): RepaymentPlanData {
  const durationInMonth = durationInYears * 12
  const monthlyInterestRate = annualInterestRatePercentage / 12 / 100

  const monthlyTotal =
    (principle * (monthlyInterestRate * (1 + monthlyInterestRate) ** durationInMonth)) /
    ((1 + monthlyInterestRate) ** durationInMonth - 1)

  const repaymentPlan: RepaymentPlanData = []
  let remainPrinciple = principle
  for (let month = 0; month < durationInMonth; ++month) {
    const interestPart = remainPrinciple * monthlyInterestRate
    const principlePart = monthlyTotal - interestPart
    repaymentPlan.push({
      interest: interestPart,
      principle: principlePart
    })
    remainPrinciple -= principlePart
  }
  return repaymentPlan
}

export { calculateRepaymentPlan, type RepaymentMethod }
