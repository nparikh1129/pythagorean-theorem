"use strict";

const RED = '#ff3b30';
const GREEN = '#34c759'
const BLUE = '#007bff';
const GRAY = '#8e8e93';
const LIGHT_RED ='#ffb6b3';
const LIGHT_BLUE = '#b2d7ff';
const LIGHT_GREEN = '#aeeabd';
const DARK_GRAY = '#3a3a3c';


let draw = SVG().addTo('body').size(1200, 800).css({ 'background-color': '#ddd' })


SVG.RightTriangle = class extends SVG.G {

  constructor(maxSize, lengthA = maxSize, lengthB = maxSize) {
    super();

    this.maxSize = maxSize;

    this._lineA = draw.resizableLine(maxSize, lengthA, BLUE);

    this._lineB = draw.resizableLine(maxSize, lengthB, RED).rotate(90, 0, 0);

    this._verts = [
      [0, 0],
      [this._lineA.length, 0],
      [0, this._lineB.length],
    ];

    this._triangle = draw.polygon(this._verts).attr({
      fill: LIGHT_BLUE,
      stroke: GRAY,
      'stroke-width': 4,
      'stroke-linejoin': 'round',
    })

    this._rightAngleSymbol = draw.rect(15, 15)
    this._rightAngleSymbol.attr({
      'fill-opacity': 0,
      stroke: DARK_GRAY,
      'stroke-width': 1,
    })

    // Event handlers
    this._lineA.on('resize', () => {
      this.resize(this._lineA.length, this._lineB.length);
    });

    this._lineB.on('resize', () => {
      this.resize(this._lineA.length, this._lineB.length);
    });

    // Arrangement
    this.add(this._triangle);
    this.add(this._rightAngleSymbol);
    this.add(this._lineA);
    this.add(this._lineB);
  }

  get lengthA() {
    return this._lineA.length;
  }

  get lengthB() {
    return this._lineB.length;
  }

  get v0() {
    return this._verts[0];
  }

  get v1() {
    return this._verts[1];
  }

  get v2() {
    return this._verts[2];
  }

  resize(lengthA, lengthB) {
    this._lineA.length = lengthA;
    this._lineB.length = lengthB;
    this._verts[1][0] = this._lineA.length;
    this._verts[2][1] = this._lineB.length;
    this._triangle.plot(this._verts);

    if (this._lineA._resizeHandle.bbox().intersectsWith(this._rightAngleSymbol.bbox()) ||
        this._lineB._resizeHandle.bbox().intersectsWith(this._rightAngleSymbol.bbox())) {
      this._rightAngleSymbol.attr({stroke: '0'});
    }
    else {
      this._rightAngleSymbol.attr({stroke: DARK_GRAY});
    }
    this.fire('resize');
  }

  toggleResizeHandles() {
    this._lineA.toggleResizeHandle();
    this._lineB.toggleResizeHandle();
    return this;
  }

  toggleRightAngleSymbol() {
    if (this._rightAngleSymbol.visible()) {
      this._rightAngleSymbol.hide();
    }
    else {
      this._rightAngleSymbol.show();
    }
    return this;
  }
}
SVG.extend(SVG.Container, {
  rightTriangle: function(maxLength, lengthA, lengthB) {
    return this.put(new SVG.RightTriangle(maxLength, lengthA, lengthB));
  }
});


SVG.ResizableLine = class extends SVG.G {

  constructor(maxLength, initialLength = maxLength, color = "#000") {
    super();

    this.maxLength = maxLength;
    this.minLength = 8;

    this._line = draw.line(0, 0, initialLength, 0).stroke({
      color: color,
      width: 4,
      linecap: 'round',
    });

    this._resizeHandle = draw.circle({
      r: 5,
      fill: "#fff",
      stroke: "#000",
      'stroke-width': 1,
      style: "cursor: grab;"
    }).center(initialLength, 0).draggable();

    this._resizeHandle.on('beforedrag.namespace', e => {
      const { handler } = e.detail;
      handler.el.css('cursor', 'grabbing');
      draw.css('cursor', 'grabbing');
    });

    this._resizeHandle.on('dragend.namespace', e => {
      const { handler } = e.detail;
      handler.el.css('cursor', 'grab');
      draw.css('cursor', null);
    });

    this._resizeHandle.on('dragmove.namespace', e => {
      const { handler, box } = e.detail
      e.preventDefault()

      this.length = box.cx;
      this.fire('resize')
    })

    this.add(this._line);
    this.add(this._resizeHandle);
  }

  get length() {
    return this._line.attr('x2');
  }

  set length(newLength) {
    if (newLength <= this.minLength) {
      newLength = this.minLength;
    }
    else if (newLength >= this.maxLength) {
      newLength = this.maxLength;
    }
    this._resizeHandle.center(newLength, 0);
    this._line.attr('x2', newLength);
  }

  toggleResizeHandle() {
    if (this._resizeHandle.visible()) {
      this._resizeHandle.hide();
    }
    else {
      this._resizeHandle.show();
    }
    return this;
  }
}
SVG.extend(SVG.Container, {
  resizableLine: function(maxLength, initialLength, color) {
    return this.put(new SVG.ResizableLine(maxLength, initialLength, color));
  }
});



let triangle = draw.rightTriangle(200).translate(200, 400).rotate(-90, 0, 0);

let triangleSymbol = draw.symbol().rightTriangle(triangle.maxSize, triangle.lengthA, triangle.lengthB)
triangleSymbol.toggleResizeHandles().toggleRightAngleSymbol()
triangle.on('resize', () => {
  triangleSymbol.resize(triangle.lengthA, triangle.lengthB);
});


draw.on("dblclick", () => {
  let squareCenter = [750, 250];
  let squareSize = triangle.lengthA + triangle.lengthB;
  let square = draw.rect(squareSize, squareSize).attr({
    fill: LIGHT_GREEN,
    stroke: GREEN,
    'stroke-width': 4,
    'stroke-linejoin': 'round',
  }).transform({
    position: squareCenter,
  });
  let box;

  let t1  = draw.use(triangleSymbol);
  let t2  = draw.use(triangleSymbol);
  let t3  = draw.use(triangleSymbol);
  let t4  = draw.use(triangleSymbol);

  function resize() {
    squareSize = triangleSymbol.lengthA + triangleSymbol.lengthB;

    square.size(squareSize).transform({
      position: squareCenter,
    });

    box = square.tbox();

    t1.transform({
      origin: [0, 0],
      rotate: -90,
      translate: [box.x, box.y2],
    })
    t2.transform({
      translate: [box.x, box.y],
    });
    t3.transform({
      origin: [0, 0],
      rotate: 90,
      translate: [box.x2, box.y],
    });
    t4.transform({
      origin: [0, 0],
      rotate: 180,
      translate: [box.x2, box.y2],
    });
  }

  resize();
  triangleSymbol.on('resize', resize);


  t4.rotate(-90, ...triangleSymbol.v1);
  t3.rotate(90, ...triangleSymbol.v2);

  // let dx = box.x2 - new SVG.Point(triangleSymbol.v0).transform(t3.matrix()).x
  // t3.translate(dx);
  // t2.translate(dx);
});
