function assert(pass: boolean, message?: string) {
  if (pass) {
    return
  }
  if (message === undefined) {
    throw 'An assertion failed.'
  }
  throw message
}

export { assert }
