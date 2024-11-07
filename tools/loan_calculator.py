"""
Mortgage calcultor.
"""

from collections import namedtuple
from typing import List

RepaymentArgs = namedtuple(
    'RepaymentArgs', ['principle', 'duration_in_years', 'annual_interest_rate_percentage'])


class RepaymentPlanSingleMonth:
    def __init__(self, principle, interest):
        self.principle = principle
        self.interest = interest

    @property
    def total(self):
        return self.principle + self.interest


def calculate_repayment_plan_for_equal_principle(arg: RepaymentArgs):
    duration_in_months = arg.duration_in_years * 12
    monthly_interest_rate = arg.annual_interest_rate_percentage / 12 / 100
    principle_per_month = arg.principle / duration_in_months

    repayment_plan = []
    remain_principle = arg.principle
    for _ in range(duration_in_months):
        interest = remain_principle * monthly_interest_rate
        remain_principle -= principle_per_month
        repayment_plan.append(RepaymentPlanSingleMonth(principle_per_month, interest))

    return repayment_plan


def calculate_repayment_plan_for_equal_principle_and_interest(arg: RepaymentArgs):
    duration_in_months = arg.duration_in_years * 12
    monthly_interest_rate = arg.annual_interest_rate_percentage / 12 / 100
    monthly_total = arg.principle * (monthly_interest_rate * (1 + monthly_interest_rate)
                                     ** duration_in_months) / ((1 + monthly_interest_rate) ** duration_in_months - 1)

    repayment_plan = []
    remain_principle = arg.principle
    for _ in range(duration_in_months):
        interest_for_this_month = remain_principle * monthly_interest_rate
        principle_for_this_month = monthly_total - interest_for_this_month
        repayment_plan.append(
            RepaymentPlanSingleMonth(principle_for_this_month, interest_for_this_month))
        remain_principle -= principle_for_this_month

    return repayment_plan


def print_repayment_plan(arg: RepaymentArgs, plan: List[RepaymentPlanSingleMonth]):
    remain_principle = arg.principle
    for idx, plan_single_month in enumerate(plan):
        year = idx // 12 + 1
        month = idx + 1 - (year - 1) * 12
        remain_principle -= plan_single_month.principle
        print(f'{idx + 1}\t{year} - {month}\t{plan_single_month.total:.2f}\t{plan_single_month.principle:.2f}\t{plan_single_month.interest:.2f}\t{remain_principle:.2f}')


if __name__ == '__main__':
    arg = RepaymentArgs(principle=2500000, duration_in_years=30,
                        annual_interest_rate_percentage=3.15)
    # arg = RepaymentArgs(principle=1228695.23, duration_in_years=25,
    # annual_interest_rate_percentage=3.15)

    plan = calculate_repayment_plan_for_equal_principle_and_interest(arg)

    # total = 0
    # for i, plan_single_month in enumerate(reversed(plan)):
    #     total += plan_single_month.principle
    #     if total >= 1000000:
    #         break
    # print(i + 1)

    print_repayment_plan(arg, plan)
