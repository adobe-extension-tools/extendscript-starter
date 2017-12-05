/// <reference path="../types/aftereffects.d.ts/ae.d.ts" />
/// <reference path="./index.d.ts" />

require('./vendor/json')
require('extendscript-es5-shim/Object/defineProperty')
require('extendscript-es5-shim/Array/forEach')
require('extendscript-es5-shim/Array/filter')
require('extendscript-es5-shim/Array/indexOf')
require('extendscript-es5-shim/Array/map')
require('extendscript-es5-shim/Object/keys')

import getPanel from './panel'
import { createStore } from './core/miniRedux'
import { reducer, RootState } from './reducers'
import { getSettings } from './core/settings'
import logger from './middlewares/logger'

const panel = getPanel('Test Panel')
const store = createStore<RootState>([reducer], [logger])

function cleanBounds(bounds: Bounds): Bounds {
  return [bounds[0], bounds[1], bounds[2], bounds[3]]
}

store.dispatch({
  type: 'SET_BOUNDS',
  bounds: cleanBounds(panel.bounds)
})

let views = [
  require('./ui/home').default(panel, store),
  require('./ui/about').default(panel, store)
]

panel.onResize = () => {
  store.dispatch({
    type: 'SET_BOUNDS',
    bounds: cleanBounds(panel.bounds)
  })
}

store.subscribe(state =>
  views.forEach(onState =>
    onState(state)
  )
)
