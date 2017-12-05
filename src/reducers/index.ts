import app, { AppState } from './app'
import router, { RouterState } from './router'
import { combineReducers, Reducer } from '../core/miniRedux'

export interface RootState {
  readonly app: AppState;
  readonly router: RouterState;
}

export const reducer: Reducer<RootState> = combineReducers({
  app,
  router
})