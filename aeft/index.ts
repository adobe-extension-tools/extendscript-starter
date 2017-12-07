/// <reference path="./index.d.ts" />

// load shims
require('./vendor/json')
require('extendscript-es5-shim/Object/defineProperty')
require('extendscript-es5-shim/Object/getPrototypeOf')
require('extendscript-es5-shim/Array/forEach')
require('extendscript-es5-shim/Array/filter')
require('extendscript-es5-shim/Array/indexOf')
require('extendscript-es5-shim/Array/map')
require('extendscript-es5-shim/Object/keys')

import getPanel from './panel'
import { getSettings } from './core/settings'
import { cleanBounds, catchErrors } from './core/utils'
import getStore from './core/getStore'

catchErrors(() => {
  const store = getStore()
  const panel = getPanel('Test Panel')

  let views = [
    require('./ui/home').default(panel, store),
    require('./ui/about').default(panel, store)
  ]

  store.subscribe(() => {
    catchErrors(() => {
      const state = store.getState()
      views.forEach(onState =>
        onState(state)
      )
    })
  })

  store.dispatch({
    type: 'SET_BOUNDS',
    bounds: cleanBounds(panel.bounds)
  })

  panel.onResize = () => {
    store.dispatch({
      type: 'SET_BOUNDS',
      bounds: cleanBounds(panel.bounds)
    })
  }
})