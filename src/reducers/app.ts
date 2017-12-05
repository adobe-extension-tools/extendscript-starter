export interface AppState {
  readonly bounds: Bounds;
  readonly pageSelectorBounds: Bounds;
}

const initialState: AppState = {
  bounds: [0, 0, 0, 0],
  pageSelectorBounds: [0, 0, 0, 0]
}

enum TypeKeys {
  SET_BOUNDS = 'SET_BOUNDS'
}

export interface SetBoundsAction {
  type: TypeKeys.SET_BOUNDS,
  bounds: Bounds
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

export default (action: ActionTypes, state: AppState = initialState) => {
  switch (action.type) {
    case TypeKeys.SET_BOUNDS:
      return {
        ...state,
        bounds: action.bounds,
        pageSelectorBounds: [5, 5, action.bounds[2] - 10, 23]
      }
    default:
      return state
  }
}
