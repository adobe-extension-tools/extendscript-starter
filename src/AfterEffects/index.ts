/// <reference path="./index.d.ts" />

import 'extendscript-es5-shim-ts'
import getPanel from './panel'
import { getSettings } from './core/settings'
import { cleanBounds, catchErrors } from './core/utils'
import { RootState } from './reducers/index'
import getStore from './core/getStore'
import home from './ui/home'
import about from './ui/about'

type OnStateCb = (state: RootState) => void

catchErrors(() => {
  const store = getStore()
  const panel = getPanel('Test Panel')

  const views = [
    home(panel, store),
    about(panel, store)
  ]

  store.subscribe(() => {
    catchErrors(() => {
      const state = store.getState()
      views.forEach((onState: OnStateCb) =>
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
