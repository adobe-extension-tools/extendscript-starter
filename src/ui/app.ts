const pages = ["Hello!", "Preferences", "About"]
const pageKeys = ["main", "preferences", "about"]

export default (panel, store) => {
  const header = panel.add('group', [0, 0, 204, 24], 'undefined')
  const pageSelector = header.add('dropdownlist', [0, 0, 134, 24], pages);
  pageSelector.selection = 0;
  pageSelector.onChange = () => {
    store.dispatch({
      type: 'SHOW_PAGE',
      page: pageKeys[pageSelector.selection.index]
    })
  }
  return function onState(state) {
    header.visible = pageKeys.indexOf(state.activePage) > -1
  }
}
