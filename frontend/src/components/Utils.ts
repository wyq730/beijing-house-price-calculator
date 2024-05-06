function assert(pass: boolean, message?: string) {
  if (pass) {
    return
  }
  if (message === undefined) {
    throw 'An assertion failed.'
  }
  throw message
}

function TenThousandRMBToRMB(value: number | null): number | null {
  return value === null ? null : value * 10000
}

export { assert, TenThousandRMBToRMB }
