// HIGHLY EXPERIMENTAL, dropping it here for others to continue (if interested)

interface Node {
  type: string;
  props: any;
  children: Node[]
}

function changed(node1: Node, node2: Node) {
  return typeof node1 !== typeof node2 ||
    node1.type !== node2.type ||
    JSON.stringify(node1.props) !== JSON.stringify(node2.props)
}

function appendNode(parent: any, node: Node, root: any) {
  $.writeln(root.bounds)
  switch (node.type) {
    case 'group':
      return parent.add('group', node.props.bounds || [0, 0, 100, 100])
    case 'button':
      return parent.add('button', node.props.bounds || [0, 0, 100, 100], node.props.label || 'No label')
    case 'statictext':
      return parent.add('statictext', node.props.bounds || [0, 0, 100, 100], node.props.text || 'No text', {
        multiline: node.props.multiline || false,
        scrolling: node.props.scrolling || false,
        truncate: node.props.truncate || false
      })
  }
}

export function render(parent: any, newNode: Node, oldNode?: Node, index = 0, root?: any) {
  if (!root) root = parent
  if (!oldNode) {
    $.writeln(`adding ${newNode.type} node`)
    const node = appendNode(parent, newNode, root)
    if (newNode.type === 'group') {
      newNode.children.forEach(child => {
        render(node, child)
      })
    }
  } else if (!newNode) {
    $.writeln('removing node')
    parent.remove(index)
  } else if (changed(newNode, oldNode)) {
    if (newNode.type !== oldNode.type) {
      $.writeln('replacing node')
      parent.remove(index)
      appendNode(parent, newNode, root)
    } else {
      $.writeln('updating node')
      if (newNode.props.bounds) {
        Object.keys(newNode.props).forEach(prop => {
          parent.children[index][prop] = newNode.props[prop]  
        })
      }
    }
  } else if (newNode.type) {
    const newLength = newNode.children.length;
    const oldLength = oldNode.children.length;
    for (let i = newLength > oldLength ? newLength - 1 : oldLength - 1; i >= 0; i--) {
      render(
        parent.children[index],
        newNode.children[i],
        oldNode.children[i],
        i,
        root
      )
    }
  }
}

export function h(type: string, props: any, children?: Node[]): Node {
  return {
    type,
    props,
    children: children || []
  }
}

/*

// EXAMPLE USAGE

import { h, render } from './core/miniReact'
import { getPanel } from './ui/panel'

const panel = getPanel('Test Panel')

function List(props: any) {
  return h('group', { bounds: [0, 0, 200, 200] }, props.items.map((item: string, i: number) => {
    return h('statictext', { bounds: [0, 30 * i, 200, 200], text: item })
  }))
}

var dogs = ['mick', 'luca', 'luna', 'lassi', 'juulke']
var cats = ['lara', 'frits', 'john']

render(panel, List({ items: dogs }))
$.sleep(1000)
render(panel, List({ items: cats }), List({ items: dogs }))

*/