"use strict";


const RED = '#ff3b30';
const GREEN = '#34c759'
const BLUE = '#007bff';
const GRAY = '#8e8e93';
const LIGHT_RED ='#ffb6b3';
const LIGHT_BLUE = '#b2d7ff';
const LIGHT_GREEN = '#aeeabd';
const DARK_GRAY = '#3a3a3c';

const LABEL_FONT = {
  family: 'Helvetica',
  size: 40,
  anchor: 'middle',
  "alignment-baseline": "middle",
  fill: "white",
  // "font-weight": "bold",
};

const LABEL_EXPONENT_FONT = Object.assign({}, LABEL_FONT, {
  size: 18,
  'baseline-shift': "super",
});



let draw = SVG()
  .addTo('body')
  .size(window.screen.availWidth, window.screen.availHeight)
  .css({ 'background-color': '#1c1c1e' });
// TODO: Handle onResize event


SVG.RightTriangle = class extends SVG.G {

  constructor(lengthA, lengthB, maxSize = Infinity) {
    super();

    this.maxSize = maxSize;

    this._lineA = draw.resizableLine(maxSize, lengthA, BLUE);
    this._lineB = draw.resizableLine(maxSize, lengthB, RED).rotate(90, 0, 0);


    this.labelA = draw.plain('a').font(LABEL_FONT).rotate(90, 0, 0).translate(lengthA / 2, -30);
    this.labelB = draw.plain('b').font(LABEL_FONT).rotate(90, 0, 0).translate(-30, lengthB / 2);
    this.labelC = draw.plain('c').font(LABEL_FONT).rotate(90, 0, 0).translate((lengthA / 2) + 20, (lengthB / 2) + 20);


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
    this.add(this.labelA);
    this.add(this.labelB);
    this.add(this.labelC);
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

    let m = this.labelA.matrix()
    m.e = lengthA/2;
    this.labelA.transform(m);

    m = this.labelB.matrix()
    m.f = lengthB/2;
    this.labelB.transform(m);

    m = this.labelC.matrix()
    m.e = (lengthA / 2) + 20;
    m.f = (lengthB / 2) + 20;
    this.labelC.transform(m);


    if (this._lineA._resizeHandle.bbox().intersectsWith(this._rightAngleSymbol.bbox()) ||
        this._lineB._resizeHandle.bbox().intersectsWith(this._rightAngleSymbol.bbox())) {
      this._rightAngleSymbol.attr({stroke: '0'});
    }
    else {
      this._rightAngleSymbol.attr({stroke: DARK_GRAY});
    }
    this.fire('resize');
  }

  getResizeHandles() {
    let handleA = this._lineA._resizeHandle.node;
    let handleB = this._lineB._resizeHandle.node;
    return [handleA, handleB];
  }

  setResizeHandlesVisible(visible) {
    if (visible) {
      this._lineA.setResizeHandleVisible(true);
      this._lineB.setResizeHandleVisible(true);
    }
    else {
      this._lineA.setResizeHandleVisible(false);
      this._lineB.setResizeHandleVisible(false);
    }
    return this;
  }

  getRightAngleSymbol() {
    return this._rightAngleSymbol.node;
  }

  setRightAngleSymbolVisible(visible) {
    if (visible) {
      this._rightAngleSymbol.show();
    }
    else {
      this._rightAngleSymbol.hide();
    }
    return this;
  }

  getLabels() {
    return [this.labelA.node, this.labelB.node, this.labelC.node];
  }

  setLabelsVisible(visible) {
    if (visible) {
      this.labelA.show();
      this.labelB.show();
      this.labelC.show();
    }
    else {
      this.labelA.hide();
      this.labelB.hide();
      this.labelC.hide();
    }
    return this;
  }

  getNonPlainElements() {
    return [].concat(
      this.getResizeHandles(),
      this.getRightAngleSymbol(),
      this.getLabels()
    );
  }

  setNonPlainElementsVisible(visible) {
    this.getNonPlainElements().forEach((e) => {
      e.style.display = "none"
    });
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

  setResizeHandleVisible(visible) {
    visible ? this._resizeHandle.show() : this._resizeHandle.hide();
    return this;
  }
}
SVG.extend(SVG.Container, {
  resizableLine: function(maxLength, initialLength, color) {
    return this.put(new SVG.ResizableLine(maxLength, initialLength, color));
  }
});



SVG.ProofSquare = class extends SVG.G {

  constructor(triangle) {
    super();

    this.triangle = triangle;
    this.v0 = this.triangle.v0;
    this.v1 = this.triangle.v1;
    this.v2 = this.triangle.v2;

    this.arrangement = 'TWISTED_SQUARES';
    this._labelsVisible = true;

    this.t1 = draw.rightTriangle(triangle.lengthA, triangle.lengthB);
    this.t2 = draw.rightTriangle(triangle.lengthA, triangle.lengthB);
    this.t3 = draw.rightTriangle(triangle.lengthA, triangle.lengthB);
    this.t4 = draw.rightTriangle(triangle.lengthA, triangle.lengthB);

    this.trianglesList = new SVG.List([this.t1, this.t2, this.t3, this.t4]);
    this.trianglesList.each((t) => {
      t.setNonPlainElementsVisible(false);
      this.add(t);
    })

    this.square;
    this._size;
    this.initSquare();
    this.add(this.square);
    this.square.back()

    this.labelA2 = draw.text(function(add) {
      add.tspan('a').font(LABEL_FONT)
      add.tspan('2').font(LABEL_EXPONENT_FONT)
    });
    this.add(this.labelA2);

    this.labelB2 = draw.text(function(add) {
      add.tspan('b').font(LABEL_FONT)
      add.tspan('2').font(LABEL_EXPONENT_FONT)
    });
    this.add(this.labelB2);

    this.labelC2 = draw.text(function(add) {
      add.tspan('c').font(LABEL_FONT)
      add.tspan('2').font(LABEL_EXPONENT_FONT)
    });
    this.add(this.labelC2);

    triangle.on('resize', () => { this.arrange() });
    this.setLabelsVisible(this._labelsVisible);
    this.arrange();
  }

  initSquare() {
    this._size = this.triangle.lengthA + this.triangle.lengthB;
    this.square = draw.rect(this._size, this._size).attr({
      fill: LIGHT_GREEN,
      stroke: GREEN,
      'stroke-width': 4,
      'stroke-linejoin': 'round',
    }).cx(0).cy(0);
  }

  arrange() {
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
    this.square.attr({
      width: this._size,
      height: this._size,
    }).cx(0).cy(0);
    let box = this.square.bbox();

    if (this.arrangement == 'TWISTED_SQUARES') {
      this.t1.transform({
        origin: [0, 0],
        translate: [box.x, box.y],
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
      this.labelC2.transform({
        scale: this._size / 100,
      });
    }
    else {
      this.t1.transform({
        origin: [0, 0],
        rotate: -90,
        translate: [box.x + this.lengthA, box.y + this.lengthA],
      });
      this.t2.transform({
        origin: [0, 0],
        rotate: 90,
        translate: [box.x2, box.y],
      });
      this.t3.transform({
        origin: [0, 0],
        rotate: 180,
        translate: [box.x + this.lengthA, box.y2],
      });
      this.t4.transform({
        origin: [0, 0],
        translate: [box.x, box.y + this.lengthA],
      });
      this.labelA2.transform({
        translate: [box.x + (this.lengthA / 2), box.y + (this.lengthA / 2)],
        scale: this.lengthA / 80,
      });
      this.labelB2.transform({
        translate: [box.x2 - (this.lengthB / 2), box.y2 - (this.lengthB / 2)],
        scale: this.lengthB / 80,
      });
    }
  }

  setArrangement(arrangement) {
    this.arrangement = arrangement;
    this.setLabelsVisible(this._labelsVisible);
    this.arrange();
  }

  setLabelsVisible(visible) {
    this._labelsVisible = visible;
    if (visible) {
      if (this.arrangement == 'TWISTED_SQUARES') {
        this.labelC2.show();
        this.labelA2.hide();
        this.labelB2.hide();
      }
      else {
        this.labelA2.show();
        this.labelB2.show();
        this.labelC2.hide();
      }
    }
    else {
      this.labelA2.hide();
      this.labelB2.hide();
      this.labelC2.hide();
    }
  }



  copyShapes() {
    let shapes = {};

    let size = this.triangle.lengthA + this.triangle.lengthB;
    shapes.square = draw.rect(size, size).attr({
      fill: LIGHT_GREEN,
      stroke: GREEN,
      'stroke-width': 4,
      'stroke-linejoin': 'round',
    }).cx(0).cy(0).hide();

    shapes.t1 = draw.rightTriangle(this.triangle.lengthA, this.triangle.lengthB);
    shapes.t2 = draw.rightTriangle(this.triangle.lengthA, this.triangle.lengthB);
    shapes.t3 = draw.rightTriangle(this.triangle.lengthA, this.triangle.lengthB);
    shapes.t4 = draw.rightTriangle(this.triangle.lengthA, this.triangle.lengthB);

    shapes.trianglesList = new SVG.List([shapes.t1, shapes.t2, shapes.t3, shapes.t4]);
    shapes.trianglesNodes = [];
    shapes.trianglesList.each((t) => {
      t.setNonPlainElementsVisible(false);
      t.hide();
      shapes.trianglesNodes.push(t.node);
    });


    return shapes;
  }
}
SVG.extend(SVG.Container, {
  proofSquare: function(triangle, x, y) {
    return this.put(new SVG.ProofSquare(triangle, x, y));
  }
});



let canvasCX = window.visualViewport.width / 2; 
let canvasCY = window.visualViewport.height / 2;
let triangle = draw.rightTriangle(150, 150, 300).transform({
  origin: [0, 0],
  rotate: -90,
  translateX: canvasCX - 150,
  translateY: canvasCY + 300,
}).setLabelsVisible(false);

let ps1 = draw.proofSquare(triangle);
ps1.setArrangement('ALIGNED_SQUARES');

let ps2 = draw.proofSquare(triangle);
ps2.setArrangement('TWISTED_SQUARES');


gsap.set(ps1.node, {
  translateX: 300,
  translateY: 300,
})

gsap.set(ps2.node, {
  translateX: 900,
  translateY: 300,
})






// SVG.ProofSquare = class extends SVG.G {

//   constructor(triangle, x = 0, y = 0) {
//     super();

//     this.triangle = triangle;
//     this.v0 = this.triangle.v0;
//     this.v1 = this.triangle.v1;
//     this.v2 = this.triangle.v2;

//     this._x = x;
//     this._y = y;
//     this.arrangement = 'TWISTED_SQUARES';

//     this.t1 = draw.rightTriangle(triangle.lengthA, triangle.lengthB);
//     this.t2 = draw.rightTriangle(triangle.lengthA, triangle.lengthB);
//     this.t3 = draw.rightTriangle(triangle.lengthA, triangle.lengthB);
//     this.t4 = draw.rightTriangle(triangle.lengthA, triangle.lengthB);

//     this.trianglesList = new SVG.List([this.t1, this.t2, this.t3, this.t4]);
//     this.trianglesList.each((t) => {
//       t.toggleResizeHandles().toggleRightAngleSymbol();
//       this.add(t);
//     })

//     this.square;
//     this._size;
//     this.initSquare();
//     this.add(this.square);
//     this.square.back()

//     triangle.on('resize', () => { this.arrange() });
//     this.arrange();
//   }

//   initSquare() {
//     this._size = this.triangle.lengthA + this.triangle.lengthB;
//     this.square = draw.rect(this._size, this._size).attr({
//       fill: LIGHT_GREEN,
//       stroke: GREEN,
//       'stroke-width': 4,
//       'stroke-linejoin': 'round',
//     });
//   }

//   // Assumes that the resize handles are off
//   squareConstructionTB(tb) {
//     this.trianglesList.each((t) => {
//       let m1 = this.matrix().inverse();
//       let m2 = this.triangle.matrix();
//       t.transform(m2.transform(m1));
//     });

//     this.square.attr({ opacity: 0 });
//     this.square.front();

//     let box = this.square.tbox();

//     this.show();

//     let r0 = this.t4.animation(1000).transform({
//       origin: [0, 0],
//       rotate: -90,
//       translate: [box.x, box.y2],
//     });

//     let r1 = this.t1.animation(1000).transform({
//       origin: [0, 0],
//       translate: [box.x, box.y],
//     });

//     let r2 = this.t2.animation(1000).transform({
//       origin: [0, 0],
//       rotate: 90,
//       translate: [box.x2, box.y],
//     });

//     let r3 = this.t3.animation(1000).transform({
//       origin: [0, 0],
//       rotate: 180,
//       translate: [box.x2, box.y2],
//     });

//     let r4 = this.square.animation(1500).attr({ opacity: 1 });

//     let r5 = () => { this.trianglesList.front().attr({ opacity: 0}) };

//     // let r6 = this.trianglesList.animate(1500).ease('<').attr({ opacity: 1});
//     let r6_0 = this.t4.animation(500).ease('<').attr({ opacity: 1});
//     let r6_1 = this.t1.animation(500).ease('<').attr({ opacity: 1});
//     let r6_2 = this.t2.animation(500).ease('<').attr({ opacity: 1});
//     let r6_3 = this.t3.animation(500).ease('<').attr({ opacity: 1});

//     let r7 = () => { 
//       this.square.transform({});
//       this.trianglesList.transform({});
//       this.arrange();
//       this.triangle.toggleResizeHandles();
//     };

//     tb.append(r0);
//     tb.append(r1);
//     tb.append(r2);
//     tb.append(r3);
//     tb.append(r4);
//     tb.appendFunction(r5);
//     tb.append(r6_0);
//     tb.append(r6_1);
//     tb.append(r6_2);
//     tb.append(r6_3, {pause: false});
//     tb.appendFunction(r7);
//     return tb;
//   }

//   setPosition(x, y) {
//     this._x = x;
//     this._y = y;
//     this.transform({
//       origin: [this._size / 2, this._size / 2],
//       position: [this._x, this._y],
//     })
//   }

//   arrange() {
//     this.lengthA = this.triangle.lengthA;
//     this.lengthB = this.triangle.lengthB;
//     this.v0 = this.triangle.v0;
//     this.v1 = this.triangle.v1;
//     this.v2 = this.triangle.v2;

//     this.t1.resize(this.lengthA, this.lengthB);
//     this.t2.resize(this.lengthA, this.lengthB);
//     this.t3.resize(this.lengthA, this.lengthB);
//     this.t4.resize(this.lengthA, this.lengthB);

//     this._size = this.lengthA + this.lengthB;
//     this.square.size(this._size)
//     let box = this.square.bbox();

//     if (this.arrangement == 'TWISTED_SQUARES') {
//       this.t1.transform({
//         origin: [0, 0],
//         translate: [box.x, box.y],
//       });
//       this.t2.transform({
//         origin: [0, 0],
//         rotate: 90,
//         translate: [box.x2, box.y],
//       });
//       this.t3.transform({
//         origin: [0, 0],
//         rotate: 180,
//         translate: [box.x2, box.y2],
//       });
//       this.t4.transform({
//         origin: [0, 0],
//         rotate: -90,
//         translate: [box.x, box.y2],
//       });
//     }
//     else {
//       this.t1.transform({
//         origin: this.v1,
//         rotate: -90,
//       });
//       this.t2.transform({
//         origin: [0, 0],
//         rotate: 90,
//         translate: [box.x2, box.y],
//       });
//       this.t3.transform({
//         rotate: 180,
//         translateY: this.lengthA,
//       });
//       this.t4.transform({
//         translateY: this.lengthA,
//       });
//     }

//     this.transform({
//       origin: [this._size / 2, this._size / 2],
//       position: [this._x, this._y],
//     })
//   }

//   toggleArrangement({ animate = false } = {}) {
//     if (this.arrangement == 'TWISTED_SQUARES') {
//       this.arrangement = 'ALIGNED_SQUARES';

//       // if (!animate) {
//       //   this.resize();
//       //   return;
//       // }

//       let r0 = this.t1.animate(1000).transform({
//         origin: this.v1,
//         rotate: -90,
//       });

//       let r1 = this.t4.animate(1000).transform({
//         origin: this.v2,
//         translate: [this.lengthB, this.lengthA],
//       });

//       let r2 = this.t4.animate(1000).transform({
//         origin: this.v0,
//         translate: [0, this.lengthA],
//       });

//       let r3 = this.t3.animate(1000).transform({
//         origin: this.v0,
//         rotate: 180,
//         translate: [this.lengthA, this._size],
//       });

//       let tb = new SVG.TimelineBuilder();
//       tb.appendFunction(() => { this.triangle.toggleResizeHandles() });
//       tb.append(r0, 100);
//       tb.append(r1, 400);
//       tb.append([r2, r3], 400);
//       tb.appendFunction(() => { this.triangle.toggleResizeHandles() });
//       tb.play();
//     }
//     else {
//       this.arrangement = 'TWISTED_SQUARES';
//       // if (!animate) {
//       //   this.resize();
//       //   return;
//       // }

//       let r0 = this.t3.animate(1000).transform({
//         origin: this.v0,
//         rotate: 180,
//         translate: [this._size, this._size],
//       });

//       let r1 = this.t4.animate(1000).transform({
//         origin: this.v0,
//         translate: [this.lengthB, this.lengthA],
//       });

//       let r2 = this.t4.animate(1000).transform({
//         origin: this.v2,
//         rotate: -90,
//         translate: [this.lengthB, this.lengthA],
//       });

//       let r3 = this.t1.animate(1000).transform({
//         origin: this.v1,
//       });

//       let tb = new SVG.TimelineBuilder();
//       tb.appendFunction(() => { this.triangle.toggleResizeHandles() });
//       tb.append([r0, r1], 100);
//       tb.append(r2, 400);
//       tb.append(r3, 400);
//       tb.appendFunction(() => { this.triangle.toggleResizeHandles() });
//       tb.play();
//     }
//   }
// }
// SVG.extend(SVG.Container, {
//   proofSquare: function(triangle, x, y) {
//     return this.put(new SVG.ProofSquare(triangle, x, y));
//   }
// });