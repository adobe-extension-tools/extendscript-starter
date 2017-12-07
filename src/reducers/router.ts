import { Action, Reducer } from 'redux'

export interface RouterState {
  readonly activePage: string;
  readonly lastPage: string | null;
}

const initialState: RouterState = {
  activePage: 'home',
  lastPage: null
}

enum TypeKeys {
  SHOW_PAGE = 'SHOW_PAGE',
  NAVIGATE_BACK = 'NAVIGATE_BACK'
}

export interface ShowPageAction extends Action {
  type: TypeKeys.SHOW_PAGE,
  page: string
}

export interface NavigateBackAction extends Action {
  type: TypeKeys.NAVIGATE_BACK
}

export type ActionTypes = ShowPageAction | NavigateBackAction

export const actionCreators = {
  showPage(page: string): ShowPageAction {
    return {
      type: TypeKeys.SHOW_PAGE,
      page
    }
  },
  navigateBack(): NavigateBackAction {
    return {
      type: TypeKeys.NAVIGATE_BACK
    }
  }
}

export type AppActionCreators = typeof actionCreators

export const reducer: Reducer<RouterState> = (state: RouterState = initialState, action: ActionTypes) => {
  switch (action.type) {
    case TypeKeys.SHOW_PAGE:
      return {
        ...state,
        activePage: action.page,
        lastPage: state.activePage
      }
    case TypeKeys.NAVIGATE_BACK:
      return {
        ...state,
        activePage: state.lastPage,
        lastPage: null
      }
    default:
      return state
  }
}
