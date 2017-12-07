import { reducer as appReducer, AppState } from './app'
import { reducer as routerReducer, RouterState } from './router'
import { combineReducers, Reducer } from 'redux'

export interface RootState {
  readonly app: AppState;
  readonly router: RouterState;
}

export const reducer: Reducer<RootState> = combineReducers({
  app: appReducer,
  router: routerReducer
})