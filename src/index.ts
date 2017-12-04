/// <reference path="../types/aftereffects.d.ts/ae.d.ts" />
/// <reference path="./index.d.ts" />

require('./vendor/json')
require('extendscript-es5-shim/Object/defineProperty')
require('extendscript-es5-shim/Array/forEach')
require('extendscript-es5-shim/Array/filter')
require('extendscript-es5-shim/Array/indexOf')
require('extendscript-es5-shim/Array/map')
require('extendscript-es5-shim/Object/keys')

import store from './store'
import panel from './ui/panel'

const views = [
  require('./ui/app').default(panel(globalThis), store)
]

store.subscribe(state =>
  views.forEach(onState =>
    onState(state)
  )
)