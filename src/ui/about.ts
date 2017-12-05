import { RootState } from '../reducers/index'
import { actionCreators } from '../reducers/router'
import { Store } from '../core/miniRedux'

export default (window: Window, store: Store<RootState>) => {
  // UI
  const state = store.getState()
  const about = window.add('group', state.app.bounds)
  const backButton = about.add('button', [5, 5, 35, 35], '<');
  const aboutText = about.add('statictext', [5, 45, state.app.bounds[2] - 10, state.app.bounds[3] - 50], `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`, {
    multiline: true,
    scrolling: true
  })
  
  // UI HANDLERS
  backButton.onClick = () =>
    store.dispatch(actionCreators.navigateBack())

  // STATE HANDLER
  return function onState(state: RootState) {
    about.bounds = state.app.bounds
    aboutText.bounds = [5, 45, state.app.bounds[2] - 10, state.app.bounds[3] - 10]
    about.visible = state.router.activePage === 'about'
  }
}