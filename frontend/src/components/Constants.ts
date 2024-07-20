// TODO(yanqingwang): add more.

type PropertyType =
  | 'commercial'
  | 'purchased_public'
  | 'first_class_affordable'
  | 'second_class_affordable'
type PropertyTypeOrNull = PropertyType | null

type NumberOrNull = number | null

type BooleanOrNull = boolean | null

export { type PropertyType, type PropertyTypeOrNull, type NumberOrNull, type BooleanOrNull }
