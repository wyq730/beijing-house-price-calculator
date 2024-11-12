"""
Mortgage calcultor.
"""

from dataclasses import dataclass, field
from typing import List
import math
from abc import ABC, abstractmethod
from enum import Enum
from copy import copy


class PrepaymentMethod(Enum):
    REDUCE_DURATION = 1
    REDUCE_AMOUNT = 2


@dataclass
class Prepayment:
    month: int
    amount: float
    method: PrepaymentMethod


@dataclass
class RepaymentArgs:
    principle: float
    duration_in_years: float
    annual_interest_rate_percentage: float
    prepayments: List[Prepayment] = field(default_factory=list)


class Repayment:
    def __init__(self, principle, interest):
        self.principle = principle
        self.interest = interest

    @property
    def total(self):
        return self.principle + self.interest


def _round_money(amount):
    """
    Round to what money can be.

    TODO(yanqingwang): remove this.
    """
    return round(amount, 2)


class PlanCalculator(ABC):
    def __init__(self, arg: RepaymentArgs) -> None:
        self._arg = arg

    def _calculate_plan(self) -> List[Repayment]:
        plan = self._calculate_remain_plan(self._arg.principle, self._arg.duration_in_years * 12,
                                           self._arg.annual_interest_rate_percentage)

        for prepayment in self._arg.prepayments:
            assert prepayment.month < len(
                plan), f'The plan consist of {len(plan)} only month(s), so we cannot prepay on month {prepayment.month}.'
            old_plan_of_next_month = copy(plan[prepayment.month])
            plan = plan[:prepayment.month]
            plan[-1].principle += prepayment.amount

            remain_principle = self._arg.principle - sum(r.principle for r in plan)
            assert remain_principle >= 0, f'Prepayment exceeds the remain amount.'

            if prepayment.method == PrepaymentMethod.REDUCE_AMOUNT:
                remain_duration_in_months = self._arg.duration_in_years * 12 - len(plan)
                remain_plan = self._calculate_remain_plan(
                    remain_principle, remain_duration_in_months, self._arg.annual_interest_rate_percentage)
            elif prepayment.method == PrepaymentMethod.REDUCE_DURATION:
                remain_duration_in_months = self._calculate_remain_duration_after_prepayment(
                    remain_principle, old_plan_of_next_month)
                remain_plan = self._calculate_remain_plan(
                    remain_principle, remain_duration_in_months, self._arg.annual_interest_rate_percentage)
            else:
                raise ValueError(f'Invalid PrepaymentMethod: {PrepaymentMethod}')

            plan += remain_plan

        return plan

    @abstractmethod
    def _calculate_remain_duration_after_prepayment(self, remain_principle: float, old_plan_of_next_month: Repayment):
        pass

    def print_plan(self):
        plan = self._calculate_plan()
        remain_principle = self._arg.principle
        for idx, plan_single_month in enumerate(plan):
            year = idx // 12 + 1
            month = idx + 1 - (year - 1) * 12
            remain_principle -= plan_single_month.principle
            print(f'{idx + 1}\t{year} - {month}\t{plan_single_month.total:.2f}\t{plan_single_month.principle:.2f}\t'
                  f'{plan_single_month.interest:.2f}\t{remain_principle:.2f}')


class EqualPrinciplePlanCalculator(PlanCalculator):
    def __init__(self, arg: RepaymentArgs) -> None:
        super().__init__(arg)

    @staticmethod
    def _calculate_remain_plan(principle: float, duration_in_months: int, annual_interest_rate_percentage: float):
        monthly_interest_rate = annual_interest_rate_percentage / 12 / 100
        principle_per_month = principle / duration_in_months

        repayment_plan = []
        remain_principle = principle
        for _ in range(duration_in_months):
            interest = remain_principle * monthly_interest_rate
            remain_principle -= principle_per_month
            repayment_plan.append(Repayment(principle_per_month, interest))

        return repayment_plan

    def _calculate_remain_duration_after_prepayment(self, remain_principle: float, old_plan_of_next_month: Repayment):
        # It seems that we use the rounded number to do the division.
        # An example which can prove this is necessary:
        #    principle: 2500000
        #    duration_in_years: 30
        #    annual_interest_rate_percentage: 3.15
        #    prepayments:
        #      - Prepayment(120, 1000000, PrepaymentMethod.REDUCE_DURATION)
        # TODO(yanqingwang): this is actually what I have not been able to think clear about.
        return math.ceil(
            _round_money(remain_principle) / _round_money(old_plan_of_next_month.principle))


class EqualPrincipleAndInterestCalculator:
    """
    Given 3 of the 4 argument, calculate the remain one.
    """

    def __init__(self, *, principle: float = None, duration_in_months: int = None, annual_interest_rate_percentage: float = None, monthly_total: float = None) -> None:
        count = (principle is not None) + (duration_in_months is not None) + \
            (annual_interest_rate_percentage is not None) + (monthly_total is not None)
        assert count == 3, f'Must provide exactly 3 of the 4 argument for {self.__class__.__name__}. But we have {count}.'

        if monthly_total is None:
            self.principle = principle
            self.duration_in_months = duration_in_months
            self.annual_interest_rate_percentage = annual_interest_rate_percentage
            self.monthly_total = self._calculate_monthly_total()

        elif duration_in_months is None:
            self.principle = principle
            self.annual_interest_rate_percentage = annual_interest_rate_percentage
            self.monthly_total = monthly_total
            self.duration_in_months = self._calculate_duration_in_months()

        else:
            raise ValueError('Unsupported input.')

    def _calculate_monthly_total(self):
        return self.principle * (self.monthly_interest_rate * (1 + self.monthly_interest_rate)
                                 ** self.duration_in_months) / ((1 + self.monthly_interest_rate) ** self.duration_in_months - 1)

    def _calculate_duration_in_months(self):
        return math.log(self.monthly_total / (self.monthly_total - self.monthly_interest_rate * self.principle), 1 + self.monthly_interest_rate)

    @property
    def monthly_interest_rate(self) -> float:
        return self.annual_interest_rate_percentage / 12 / 100


class EqualPrincipleAndInterestPlanCalculator(PlanCalculator):
    def __init__(self, arg: RepaymentArgs) -> None:
        super().__init__(arg)

    @staticmethod
    def _calculate_remain_plan(principle: float, duration_in_months: int, annual_interest_rate_percentage: float):
        calculator = EqualPrincipleAndInterestCalculator(principle=principle, duration_in_months=duration_in_months,
                                                         annual_interest_rate_percentage=annual_interest_rate_percentage)
        monthly_total = calculator.monthly_total

        repayment_plan = []
        remain_principle = principle
        for _ in range(calculator.duration_in_months):
            interest_for_this_month = remain_principle * calculator.monthly_interest_rate
            principle_for_this_month = monthly_total - interest_for_this_month
            repayment_plan.append(
                Repayment(principle_for_this_month, interest_for_this_month))
            remain_principle -= principle_for_this_month

        return repayment_plan

    def _calculate_remain_duration_after_prepayment(self, remain_principle: float, old_plan_of_next_month: Repayment):
        c = EqualPrincipleAndInterestCalculator(principle=remain_principle, monthly_total=old_plan_of_next_month.total,
                                                annual_interest_rate_percentage=self._arg.annual_interest_rate_percentage)
        return math.ceil(c.duration_in_months)


if __name__ == '__main__':
    arg = RepaymentArgs(principle=1100000, duration_in_years=20,
                        annual_interest_rate_percentage=3.15,
                        prepayments=[
                            Prepayment(120, 500000, PrepaymentMethod.REDUCE_DURATION),
                            # Prepayment(240, 200000, PrepaymentMethod.REDUCE_AMOUNT),
                        ])
    c = EqualPrinciplePlanCalculator(arg)
    c.print_plan()
