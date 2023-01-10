var draw = SVG().addTo('body').size(500, 500).css({ 'background-color': '#888' })
    
let xPos = 50
let yMax = 300
let yMin = 50

let xMin = 50
let xMax = 300
let yPos = 300

let lineWidth = 4

let vertArray = [[xPos, yMax], [xPos, yMin], [yPos, xMax]]
let triangle = draw.polygon(vertArray).fill('#9CE1FF')

let rightAngleBox = draw.rect(15, 15)
rightAngleBox.attr({
  'fill-opacity': 0,
  stroke: '#3a3a3c',
  'stroke-width': 1,
})
rightAngleBox.dx(xMin)
rightAngleBox.dy(yPos - rightAngleBox.height())


let lineC =  draw.line(xPos, yMin, xMax, yPos)
lineC.stroke({ color: '#34c759', width: lineWidth, linecap: 'round' })


let lineA = draw.line(xPos, yMin, xPos, yMax)
lineA.stroke({ color: '#ff3b30', width: lineWidth, linecap: 'round' })

let circleA = draw.circle(10).center(xPos, yMin).fill('white').stroke({width: 1, color: 'black'})
circleA.draggable().css('cursor', 'grab')

circleA.on('beforedrag.namespace', e => {
  const { handler } = e.detail
  handler.el.css('cursor', 'grabbing')
  draw.css('cursor', 'grabbing')
})

circleA.on('dragend.namespace', e => {
  const { handler, box } = e.detail
  handler.el.css('cursor', 'grab')
  draw.css('cursor', null)
})

circleA.on('dragmove.namespace', e => {
  const { handler, box } = e.detail
  e.preventDefault()

  let x = xPos

  let y = box.cy;
  if (box.cy <= yMin) {
    y = yMin
  }
  if (box.cy >= yMax) {
    y = yMax
  }

  handler.el.center(x, y)
  lineA.attr('y1', y)
  lineC.attr('y1', y)
  vertArray[1] = [xPos, y]
  triangle.plot(vertArray)
})



let lineB = draw.line(xMin, yPos, xMax, yPos)
lineB.stroke({ color: '#007bff', width: lineWidth, linecap: 'round' })

let circleB = draw.circle(10).center(xMax, yPos).fill('#fff').stroke({width: 1, color: 'black'})
circleB.draggable().css('cursor', 'grab')

circleB.on('beforedrag.namespace', e => {
  const { handler } = e.detail
  handler.el.css('cursor', 'grabbing').attr({})
  draw.css('cursor', 'grabbing')
})

circleB.on('dragend.namespace', e => {
  const { handler, box } = e.detail
  handler.el.css('cursor', 'grab')
  draw.css('cursor', null)
})

circleB.on('dragmove.namespace', e => {
const { handler, box } = e.detail
  e.preventDefault()

  let x = box.cx;
  if (box.cx <= xMin) {
    x = xMin
  }
  if (box.cx >= xMax) {
    x = xMax
  }

  let y = yPos

  handler.el.center(x, y)
  lineB.attr('x2', x)
  lineC.attr('x2', x)
  vertArray[2] = [x, yPos]
  triangle.plot(vertArray)
})

circleA.front()
circleB.front()