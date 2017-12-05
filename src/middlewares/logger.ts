import { RootState } from '../reducers'
import { Store } from '../core/miniRedux'

export default (store: Store<RootState>) => (next: any) => (action: any) => {
  next(action)
  const state = store.getState()
  $.writeln('ACTION: ' + JSON.stringify(action))
  $.writeln('STATE: ' + JSON.stringify(state))
}