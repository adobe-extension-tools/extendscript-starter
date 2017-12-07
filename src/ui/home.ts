import { RootState } from '../reducers/index'
import { Store } from '../core/miniRedux'

const pages = ['Home', 'About']
const pageKeys = ['home', 'about']

export default (window: Window, store: Store<RootState>) => {
  const state = store.getState()
  const home = window.add('group', state.app.bounds)
  const pageSelector = home.add('dropdownlist', state.app.pageSelectorBounds, pages);
  pageSelector.selection = 0;
  pageSelector.onChange = () => {
    const activePageIndex = typeof pageSelector.selection === 'number' ? pageSelector.selection : pageSelector.selection.index
    store.dispatch({
      type: 'SHOW_PAGE',
      page: pageKeys[activePageIndex]
    })
  }
  return function onState(state: RootState) {
    home.bounds = state.app.bounds
    pageSelector.bounds = state.app.pageSelectorBounds
    pageSelector.selection = pageKeys.indexOf(state.router.activePage)
    home.visible = state.router.activePage === 'home'
  }
}
