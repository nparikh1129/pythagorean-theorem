"use strict";
let draw = SVG().addTo('body').size(500, 500).css({ 'background-color': '#ddd' })


let sizeMax = 300;
let verts = [
  [0, 0],
  [sizeMax/2, 0],
  [0, sizeMax/2],
];

let triangle = draw.polygon(verts).fill('#9CE1FF');

let lineAttrs = {
  width: 4,
  linecap: 'round',
};

let lineA = draw.line([[0, 0], verts[1]]).stroke({
  color: '#ff3b30',
  ...lineAttrs,
});

let lineB = draw.line([[0, 0], verts[2]]).stroke({
  color: '#007bff',
  ...lineAttrs,
});

let lineC = draw.line([verts[1], verts[2]]).stroke({
  color: '#34c759',
  ...lineAttrs,
});

let circleAttrs = {
  r: 5,
  fill: "#fff",
  stroke: "#000",
  'stroke-width': 1,
  style: "cursor: grab;"
};

let circleBeforeDragHandler = function(e) {
  const { handler } = e.detail;
  console.log(handler.el)
  handler.el.css('cursor', 'grabbing');
  draw.css('cursor', 'grabbing');
}

let circleDragEndHandler = function(e) {
  const { handler } = e.detail;
  handler.el.css('cursor', 'grab');
  draw.css('cursor', null);
}

let circleA = draw.circle(circleAttrs).center(...verts[1]).draggable();
circleA.on('beforedrag.namespace', circleBeforeDragHandler);
circleA.on('dragend.namespace', circleDragEndHandler);
circleA.on('dragmove.namespace', e => {
  const { handler, box } = e.detail
  e.preventDefault()
  
  let x = box.cx;
  if (box.cx <= 0) {
    x = 0;
  }
  else if (box.cx >= sizeMax) {
    x = sizeMax;
  }

  handler.el.center(x, 0)
  lineA.attr('x2', x)
  lineC.attr('x1', x)
  verts[1] = [x, 0]
  triangle.plot(verts)
})

let circleB = draw.circle(circleAttrs).center(...verts[2]).draggable();
circleB.on('beforedrag.namespace', circleBeforeDragHandler);
circleB.on('dragend.namespace', circleDragEndHandler);
circleB.on('dragmove.namespace', e => {
  const { handler, box } = e.detail
  e.preventDefault()
  
  let y = box.cy;
  if (box.cy <= 0) {
    y = 0;
  }
  else if (box.cy >= sizeMax) {
    y = sizeMax;
  }

  handler.el.center(0, y)
  lineB.attr('y2', y)
  lineC.attr('y2', y)
  verts[2] = [0, y]
  triangle.plot(verts)
})



// let rightAngleBox = draw.rect(15, 15)
// rightAngleBox.attr({
//   'fill-opacity': 0,
//   stroke: '#3a3a3c',
//   'stroke-width': 1,
// })
// rightAngleBox.dx(xMin)
// rightAngleBox.dy(yPos - rightAngleBox.height())








// class ResizableRightTriangle {
//   constructor(width, height) {
//     this.verts = [[0, 0], [width, 0], [0, height]];

//     this.triangle = draw.polygon(this.verts).fill('#9CE1FF');
    
//     this.group = draw.group();
//     this.group.add(this.triangle);
//   }
// }
// triangle = new ResizableRightTriangle(300, 300);