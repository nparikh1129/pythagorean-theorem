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

  constructor(lengthA, lengthB, maxSize = Infinity) {
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



SVG.ProofSquare = class extends SVG.G {

  constructor(triangle, x, y) {
    super();

    this.triangle = triangle.toggleResizeHandles()
    this.v0 = this.triangle.v0;
    this.v1 = this.triangle.v1;
    this.v2 = this.triangle.v2;

    this._x = x;
    this._y = y;
    this.arrangement = 'TWISTED_SQUARES';

    this.t1 = draw.rightTriangle(triangle.lengthA, triangle.lengthB);
    this.t2 = draw.rightTriangle(triangle.lengthA, triangle.lengthB);
    this.t3 = draw.rightTriangle(triangle.lengthA, triangle.lengthB);
    this.t4 = draw.rightTriangle(triangle.lengthA, triangle.lengthB);

    this.initTriangle(this.t1);
    this.initTriangle(this.t2);
    this.initTriangle(this.t3);
    this.initTriangle(this.t4);
    this.add(this.t1).add(this.t2).add(this.t3).add(this.t4);

    this.square = null;
    this._size = null;
    this.initSquare()
    this.add(this.square);

    triangle.on('resize', () => { this.resize() });

    // this.resize();
  }

  initTriangle(t) {
    t.toggleResizeHandles().toggleRightAngleSymbol();
    t.transform(this.triangle.matrix())
  }

  initSquare() {
    this._size = this.triangle.lengthA + this.triangle.lengthB;
    this.square = draw.rect(this._size, this._size).attr({
      fill: LIGHT_GREEN,
      stroke: GREEN,
      'stroke-width': 4,
      'stroke-linejoin': 'round',
      opacity: 0,
    });
    this.square.transform({
      origin: [this._size / 2, this._size / 2],
      position: [this._x, this._y],
    });
  }

  animateTrianglesInitialPosition() {
    let box = this.square.tbox();
    let trianglesList = new SVG.List([this.t1, this.t2, this.t3, this.t4]);

    let r0 = this.t1.animate(1000).transform({
      origin: [0, 0],
      translate: [box.x, box.y],
    });

    let r1 = this.t2.animate(1000).transform({
      origin: [0, 0],
      rotate: 90,
      translate: [box.x2, box.y],
    })

    let r2 = this.t3.animate(1000).transform({
      origin: [0, 0],
      rotate: 180,
      translate: [box.x2, box.y2],
    });
    
    let r3 = this.t4.animate(1000).transform({
      origin: [0, 0],
      rotate: -90,
      translate: [box.x, box.y2],
    });

    let r4 = this.square.animate(1000).attr({ opacity: 1 });


    let r5 = trianglesList.animate(1500).ease('<').attr({ opacity: 1});

    let tb = new SVG.TimelineBuilder();

    tb.append(r0, 100);
    // tb.appendPause();
    tb.append(r1, 400);
    tb.append(r2, 400);
    tb.append(r3, 400);
    tb.append(r4, 400);
    tb.appendFunction(() => { trianglesList.front().attr({ opacity: 0}) });
    tb.append(r5, 400);
    tb.appendFunction(() => { 
      this.square.transform({});
      trianglesList.transform({});
      this.resize();
      this.triangle.toggleResizeHandles()
    });
    tb.play();
  }

  resize() {
    this.lengthA = this.triangle.lengthA;
    this.lengthB = this.triangle.lengthB;
    this.v0 = this.triangle.v0;
    this.v1 = this.triangle.v1;
    this.v2 = this.triangle.v2;

    this.t1.resize(this.lengthA, this.lengthB);
    this.t2.resize(this.lengthA, this.lengthB);
    this.t3.resize(this.lengthA, this.lengthB);
    this.t4.resize(this.lengthA, this.lengthB);

    this._size = this.lengthA + this.lengthB;
    this.square.size(this._size)
    let box = this.square.bbox();

    if (this.arrangement == 'TWISTED_SQUARES') {
      this.t1.transform({
        origin: [0, 0],
      });
      this.t2.transform({
        origin: [0, 0],
        rotate: 90,
        translate: [box.x2, box.y],
      });
      this.t3.transform({
        origin: [0, 0],
        rotate: 180,
        translate: [box.x2, box.y2],
      });
      this.t4.transform({
        origin: [0, 0],
        rotate: -90,
        translate: [box.x, box.y2],
      });
    }
    else {
      this.t1.transform({
        origin: this.v1,
        rotate: -90,
      });
      this.t2.transform({
        origin: [0, 0],
        rotate: 90,
        translate: [box.x2, box.y],
      });
      this.t3.transform({
        rotate: 180,
        translateY: this.lengthA,
      });
      this.t4.transform({
        translateY: this.lengthA,
      });
    }

    this.transform({
      origin: [this._size / 2, this._size / 2],
      position: [this._x, this._y],
    })
  }

  toggleArrangement({ animate = false } = {}) {
    if (this.arrangement == 'TWISTED_SQUARES') {
      this.arrangement = 'ALIGNED_SQUARES';

      // if (!animate) {
      //   this.resize();
      //   return;
      // }

      let r0 = this.t1.animate(1000).transform({
        origin: this.v1,
        rotate: -90,
      });

      let r1 = this.t4.animate(1000).transform({
        origin: this.v2,
        translate: [this.lengthB, this.lengthA],
      });

      let r2 = this.t4.animate(1000).transform({
        origin: this.v0,
        translate: [0, this.lengthA],
      });

      let r3 = this.t3.animate(1000).transform({
        origin: this.v0,
        rotate: 180,
        translate: [this.lengthA, this._size],
      });

      let tb = new SVG.TimelineBuilder();
      tb.appendFunction(() => { this.triangle.toggleResizeHandles() });
      tb.append(r0, 100);
      tb.append(r1, 400);
      tb.append([r2, r3], 400);
      tb.appendFunction(() => { this.triangle.toggleResizeHandles() });
      tb.play();

      // this.t1.animate(1000, 0, 'now').rotate(-90, ...this.triangle.v1);
      // this.t4.animate(1000, 1400, 'after').rotate(90, ...this.triangle.v2);
      // this.t4.animate(1000, 400, 'after').translate(-this.triangle.lengthB);
      // this.t3.animate(1000, 2800, 'after').translate(-this.triangle.lengthB);
    }
    else {
      this.arrangement = 'TWISTED_SQUARES';
      // if (!animate) {
      //   this.resize();
      //   return;
      // }

      let r0 = this.t3.animate(1000).transform({
        origin: this.v0,
        rotate: 180,
        translate: [this._size, this._size],
      });

      let r1 = this.t4.animate(1000).transform({
        origin: this.v0,
        translate: [this.lengthB, this.lengthA],
      });

      let r2 = this.t4.animate(1000).transform({
        origin: this.v2,
        rotate: -90,
        translate: [this.lengthB, this.lengthA],
      });

      let r3 = this.t1.animate(1000).transform({
        origin: this.v1,
      });

      let tb = new SVG.TimelineBuilder();
      tb.appendFunction(() => { this.triangle.toggleResizeHandles() });
      tb.append([r0, r1], 100);
      tb.append(r2, 400);
      tb.append(r3, 400);
      tb.appendFunction(() => { this.triangle.toggleResizeHandles() });
      tb.play();

      // this.t3.animate(1000, 0, 'now').translate(this.triangle.lengthB);
      // this.t4.animate(1000, 0, 'now').translate(this.triangle.lengthB);
      // this.t4.animate(1000, 400, 'after').rotate(-90, ...this.triangle.v2);
      // this.t1.animate(1000, 2800, 'after').rotate(90, ...this.triangle.v1);
    }
  }
}
SVG.extend(SVG.Container, {
  proofSquare: function(triangle, x, y) {
    return this.put(new SVG.ProofSquare(triangle, x, y));
  }
});


let triangle = draw.rightTriangle(100, 100, 200).translate(200, 400).rotate(-90, 0, 0);
let square = draw.proofSquare(triangle, 750, 250);

square.animateTrianglesInitialPosition()


draw.on("dblclick", () => {
  square.toggleArrangement({animate: true});
})
