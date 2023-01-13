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


SVG.ResizableRightTriangle = class extends SVG.G {
  
  constructor(maxSize) {
    super();
    
    this._lineA = draw.resizableLine(maxSize, BLUE);

    this._lineB = draw.resizableLine(maxSize, RED).rotate(90, 0, 0);

    this._verts = [
      [0, 0],
      [this._lineA.length, 0],
      [0, this._lineB.length],
    ];

    this._triangle = draw.polygon(this._verts).attr({
      fill: LIGHT_BLUE,
      stroke: GRAY,
      'stroke-width': 4,
    });

    this._rightAngleSymbol = draw.rect(15, 15)
    this._rightAngleSymbol.attr({
      'fill-opacity': 0,
      stroke: DARK_GRAY,
      'stroke-width': 1,
    })

    // Event handlers
    this._lineA.on('resize', () => {
      this._verts[1][0] = this._lineA.length;
      this._triangle.plot(this._verts);
      if (this._lineA._resizeHandle.bbox().intersectsWith(this._rightAngleSymbol.bbox())) {
        this._rightAngleSymbol.attr({stroke: '0'})
      }
      else {
        this._rightAngleSymbol.attr({stroke: DARK_GRAY})
      }
    });

    this._lineB.on('resize', () => {
      this._verts[2][1] = this._lineB.length;
      this._triangle.plot(this._verts);
      if (this._lineB._resizeHandle.bbox().intersectsWith(this._rightAngleSymbol.bbox())) {
        this._rightAngleSymbol.attr({stroke: '0'})
      }
      else {
        this._rightAngleSymbol.attr({stroke: DARK_GRAY})
      }
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
}
SVG.extend(SVG.Container, {
  resizableRightTriangle: function(maxLength) {
    return this.put(new SVG.ResizableRightTriangle(maxLength))
  }
});


SVG.ResizableLine = class extends SVG.G {
  
  constructor(maxLength, color = "#000") {
    super();

    this.maxLength = maxLength;
    this.minLength = 8;

    
    this._line = draw.line(0, 0, maxLength, 0).stroke({
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
    }).center(maxLength, 0).draggable();

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
      
      let x = box.cx;
      if (box.cx <= this.minLength) {
        x = this.minLength;
      }
      else if (box.cx >= this.maxLength) {
        x = this.maxLength;
      }
      handler.el.center(x, 0);
      this._line.attr('x2', x);
      this.fire('resize')
    })

    this.add(this._line);
    this.add(this._resizeHandle);
  }

  get length() {
    return this._line.attr('x2');
  }
}
SVG.extend(SVG.Container, {
  resizableLine: function(maxLength, color) {
    return this.put(new SVG.ResizableLine(maxLength, color))
  }
});


SVG.RightTriangle = class extends SVG.G {

  constructor(lengthA, lengthB) {
    super();

    this._lineA = draw.line(0, 0, lengthA, 0).stroke({
      color: BLUE,
      width: 4,
      linecap: 'round',
    });

    this._lineB = draw.line(0, 0, lengthB, 0).stroke({
      color: RED,
      width: 4,
      linecap: 'round',
    }).rotate(90, 0, 0);

    this._verts = [
      [0, 0],
      [lengthA, 0],
      [0, lengthB],
    ];

    this._triangle = draw.polygon(this._verts).attr({
      fill: LIGHT_BLUE,
      stroke: GRAY,
      'stroke-width': 4,
    });

    this.add(this._triangle);
    this.add(this._lineA);
    this.add(this._lineB);
  }
}
SVG.extend(SVG.Container, {
  rightTriangle: function(lengthA, lengthB) {
    return this.put(new SVG.RightTriangle(lengthA, lengthB))
  }
});


let resizableTriangle = draw.resizableRightTriangle(200).translate(200, 400).rotate(-90, 0, 0);

draw.on("dblclick", () => {
  let squareCenter = [750, 250];
  let squareSize = resizableTriangle.lengthA + resizableTriangle.lengthB;
  let square = draw.rect(squareSize, squareSize).fill(LIGHT_GREEN).transform({
    position: squareCenter
  });
  let box = square.bbox().transform(square.matrix());

  let t1 = draw.rightTriangle(resizableTriangle.lengthA, resizableTriangle.lengthB).transform({
    origin: [0, 0],
    rotate: -90,
    translate: [box.x, box.y2],
  });

  let t2 = draw.rightTriangle(resizableTriangle.lengthA, resizableTriangle.lengthB).transform({
    translate: [box.x, box.y],
  });

  let t3 = draw.rightTriangle(resizableTriangle.lengthA, resizableTriangle.lengthB).transform({
    origin: [0, 0],
    rotate: 90,
    translate: [box.x2, box.y],
  });

  let t4 = draw.rightTriangle(resizableTriangle.lengthA, resizableTriangle.lengthB).transform({
    origin: [0, 0],
    rotate: 180,
    translate: [box.x2, box.y2],
  });
});

