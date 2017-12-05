export interface Reducer<State> {
  (action: any, state: State): State 
}

export interface Subscription<State> {
  (state: State): void 
}

export interface Store<State> {
  getState: () => State,
  dispatch: (action: any) => void,
  subscribe: (cb: (state: State) => void) => void
}

export interface ReducerMapObject {
  [key: string]: Reducer<any>
}

export function combineReducers(reducers: ReducerMapObject) {
  return (action: any, state: any) => {
    Object.keys(reducers).forEach((reducerId: string) => {
      const reducer = reducers[reducerId]
      state[reducerId] = reducer(action, state[reducerId])
    })
    return state
  }
}

export function createStore<State>(reducers: Reducer<State>[], middlewares: any[] = []) {
  let state: State = $.global.state || {}
  const subscriptions: Subscription<State>[] = []
  const store: Store<State> = {
    getState: () => state,
    dispatch: (action: any) => {
      reducers.forEach(reducer => {
        state = reducer(action, state)
      })
      $.global.state = state
      subscriptions.forEach(cb =>
        cb(state)
      )
    },
    subscribe: (cb) => {
      subscriptions.push(cb)
      cb(state)
    }
  }
  middlewares = middlewares.slice()
  middlewares.reverse()
  let dispatch = store.dispatch
  middlewares.forEach(middleware =>
    dispatch = middleware(store)(dispatch)
  )
  store.dispatch = dispatch
  store.dispatch({ type: '__INIT__' })
  return store
}
