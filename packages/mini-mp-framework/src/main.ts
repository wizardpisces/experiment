import parent from './parent'
import worker from './worker'
import { Options } from './type'

const isWindow = typeof window !== 'undefined'

export function init(options: Options) {
  let internalOptions: Options = Object.assign(options, {
  })
  if (isWindow) {
    parent(internalOptions)
  } else {
    worker(internalOptions)
  }
}