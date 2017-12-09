const bounds: Bounds = [1200, 0, 1400, 200]

const panel = new Window('dialog', 'Starter Panel', bounds, {
  closeButton: true,
  resizeable: true
})

panel.add('statictext', [0, 0, 200, 200], 'Hello world!!')
panel.show()