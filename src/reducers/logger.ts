export default (action, state) => {
  $.writeln('ACTION: ' + JSON.stringify(action))
  $.writeln('STATE: ' + JSON.stringify(state))
  return state
}