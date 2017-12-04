import app from './reducers/app'
import logger from './reducers/logger'
import { getSettings } from './core/settings'

let state = $.global.state || {
  activePage: 'main',
  settings: getSettings()
}

const reducers = [
  app,
  logger
]

const subscriptions = []

const store = {
  dispatch: (action: any) => {
    reducers.forEach(reducer => {
      state = reducer(action, state)
    })
    $.global.state = state
    subscriptions.forEach(cb =>
      cb(state)
    )
  },
  subscribe: (cb: (state: any) => void) => {
    subscriptions.push(cb)
    cb(state)
  }
}

export default store
