import { createStore, applyMiddleware } from 'redux'
import { reducer, RootState } from '../reducers'
import LoggerMiddleware from '../middlewares/logger'
import { logToPackager } from './utils'

export default () => {
  const store = createStore<RootState>(
    reducer,
    applyMiddleware(
      LoggerMiddleware((...args: string[]) => $.writeln(args.join(', ')))
    )
  )
  return store
}