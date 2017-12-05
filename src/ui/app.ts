import { RootState } from '../reducers/index'
import { Store } from '../core/miniRedux'

const pages = ['Home', 'Preferences', 'About']
const pageKeys = ['home', 'preferences', 'about']

export default (window: Window, store: Store<RootState>) => {
  const state = store.getState()
  const app = window.add('group', state.app.bounds)
  const pageSelector = app.add('dropdownlist', state.app.pageSelectorBounds, pages);
  pageSelector.selection = 0;
  pageSelector.onChange = () => {
    const activePageIndex = typeof pageSelector.selection === 'number' ? pageSelector.selection : pageSelector.selection.index
    store.dispatch({
      type: 'SHOW_PAGE',
      page: pageKeys[activePageIndex]
    })
  }
  return function onState(state: RootState) {
    app.bounds = state.app.bounds
    pageSelector.bounds = state.app.pageSelectorBounds
    app.visible = pageKeys.indexOf(state.router.activePage) > -1
  }
}
