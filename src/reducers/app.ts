export default (action, state) => {
  if (action.type === 'SHOW_PAGE') {
    return {
      ...state,
      activePage: action.page,
      lastPage: state.activePage
    }
  }
  if (action.type === 'NAVIGATE_BACK') {
    return {
      ...state,
      activePage: state.lastPage
    }
  }
  return state
}
