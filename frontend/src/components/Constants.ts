// TODO(yanqingwang): add more.

type PropertyType =
  | 'commercial'
  | 'purchased_public'
  | 'first_class_affordable'
  | 'second_class_affordable'
type PropertyTypeOrNull = PropertyType | null

type NumberOrNull = number | null

type BooleanOrNull = boolean | null

type TimeSinceObtainedBySeller = 'longer_than_5' | '2_to_5' | 'shorter_than_2'
type TimeSinceObtainedBySellerOrNull = TimeSinceObtainedBySeller | null

export {
  type PropertyType,
  type PropertyTypeOrNull,
  type NumberOrNull,
  type BooleanOrNull,
  type TimeSinceObtainedBySeller,
  type TimeSinceObtainedBySellerOrNull
}
