import { RootState } from '../reducers'
import { Store, Middleware, MiddlewareAPI, Dispatch } from 'redux'

export default function LoggerMiddleware(logImplementation: any): Middleware {
  return <RootState>(store: MiddlewareAPI<RootState>) =>
    (next: Dispatch<RootState>) =>
    (action: any): any => {
      next(action)
      const state: any = store.getState()
      logImplementation(JSON.stringify({
        action,
        state: store.getState()
      }))
    }
}