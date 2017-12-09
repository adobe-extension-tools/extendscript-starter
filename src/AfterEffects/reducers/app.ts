import { AnyAction, Action, Reducer } from 'redux'

export interface AppState {
  readonly bounds: Bounds;
  readonly pageSelectorBounds: Bounds;
}

const initialState: AppState = {
  bounds: [0, 0, 0, 0],
  pageSelectorBounds: [0, 0, 0, 0]
}

export enum TypeKeys {
  SET_BOUNDS = 'SET_BOUNDS'
}

export interface SetBoundsAction extends Action {
  readonly type: TypeKeys.SET_BOUNDS,
  readonly bounds: Bounds
}

export type ActionTypes = SetBoundsAction

export const actionCreators = {
  setBounds(bounds: Bounds): SetBoundsAction {
    return {
      type: TypeKeys.SET_BOUNDS,
      bounds
    }
  }
}

export type AppActionCreators = typeof actionCreators

export const reducer: Reducer<AppState> = (state: AppState = initialState, action: AnyAction) => {
  switch (action.type) {
    case TypeKeys.SET_BOUNDS:
      return {
        ...state,
        bounds: action.bounds,
        pageSelectorBounds: [5, 5, action.bounds[2] - 10, 35]
      }
    default:
      return state
  }
}
