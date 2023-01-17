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

    this.triangle = triangle
    this.x = x;
    this.y = y;
    this.arrangement = 'TWISTED_SQUARES';

    this.t1 = draw.rightTriangle(triangle.lengthA, triangle.lengthB).toggleResizeHandles().toggleRightAngleSymbol();
    this.t2 = draw.rightTriangle(triangle.lengthA, triangle.lengthB).toggleResizeHandles().toggleRightAngleSymbol();
    this.t3 = draw.rightTriangle(triangle.lengthA, triangle.lengthB).toggleResizeHandles().toggleRightAngleSymbol();
    this.t4 = draw.rightTriangle(triangle.lengthA, triangle.lengthB).toggleResizeHandles().toggleRightAngleSymbol();

    this.size = this.triangle.lengthA + this.triangle.lengthB;
    this.square = draw.rect(this.size, this.size).attr({
      fill: LIGHT_GREEN,
      stroke: GREEN,
      'stroke-width': 4,
      'stroke-linejoin': 'round',
    })

    triangle.on('resize', () => { this.resize() });

    this.add(this.square);
    this.add(this.t1).add(this.t2).add(this.t3).add(this.t4);

    this.resize();
  }

  resize() {
    let lengthA = this.triangle.lengthA;
    let lengthB = this.triangle.lengthB;
    let size = lengthA + lengthB;
    
    this.square.size(size)
    this.t1.resize(lengthA, lengthB);
    this.t2.resize(lengthA, lengthB);
    this.t3.resize(lengthA, lengthB);
    this.t4.resize(lengthA, lengthB);

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
    }
    else {
      this.t1.transform({
        origin: this.t1.v1,
        rotate: -90,
      });
      this.t2.transform({
        origin: [0, 0],
        rotate: 90,
        translate: [box.x2, box.y],
      });
      this.t3.transform({
        rotate: 180,
        translateY: lengthA,
      });
      this.t4.transform({
        translateY: lengthA,
      });
    }

    this.transform({
      origin: [size / 2, size / 2],
      position: [this.x, this.y],
    })
  }

  toggleArrangement({ animate = false } = {}) {
    if (this.arrangement == 'TWISTED_SQUARES') {
      this.arrangement = 'ALIGNED_SQUARES';

      // if (!animate) {
      //   this.resize();
      //   return;
      // }

      this.t1.animate(1000, 0, 'now').transform({
        origin: [this.triangle.lengthA, 0],
        rotate: -90,
      })
      this.t4.animate(1000, 1400, 'after').transform({
        origin: [0, this.triangle.lengthB],
        translate: [this.triangle.lengthB, this.triangle.lengthA],
      })
      this.t4.animate(1000, 400, 'after').transform({
        origin: [0, 0],
        translate: [0, this.triangle.lengthA],
      })
      this.t3.animate(1000, 2800, 'after').transform({
        origin: [0, 0],
        rotate: 180,
        translate: [this.triangle.lengthA, this.square.height()],
      });
      
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


      this.t3.animate(1000, 0, 'now').transform({
        origin: [0, 0],
        rotate: 180,
        translate: [this.square.width(), this.square.height()],
      })
      this.t4.animate(1000, 0, 'now').transform({
        origin: [0, 0],
        translate: [this.triangle.lengthB, this.triangle.lengthA],
      })
      this.t4.animate(1000, 400, 'after').transform({
        origin: [0, this.triangle.lengthB],
        rotate: -90,
        translate: [this.triangle.lengthB, this.triangle.lengthA],
      })
      this.t1.animate(1000, 2800, 'after').transform({
        origin: [this.triangle.lengthA, 0],
      })


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

draw.on("dblclick", () => {
  square.toggleArrangement({animate: true})
})




// else {
//   this.t1.transform({
//     translateX: this.t1.lengthB,
//   });
//   this.t2.transform({
//     rotate: 180,
//     translateX: this.t2.lengthB,
//   });
//   this.t3.transform({
//     origin: this.t3.v2,
//     rotate: 90,
//   });
//   this.t4.transform({
//     origin: [0, 0],
//     rotate: -90,
//     translate: [box.x, box.y2],
//   });
// }







// let triangleSymbol = draw.symbol().rightTriangle(triangle.maxSize, triangle.lengthA, triangle.lengthB)
// triangleSymbol.toggleResizeHandles().toggleRightAngleSymbol()
// triangle.on('resize', () => {
//   triangleSymbol.resize(triangle.lengthA, triangle.lengthB);
// });


// draw.on("dblclick", () => {
//   let squareCenter = [750, 250];
//   let squareSize = triangle.lengthA + triangle.lengthB;
//   let square = draw.rect(squareSize, squareSize).attr({
//     fill: LIGHT_GREEN,
//     stroke: GREEN,
//     'stroke-width': 4,
//     'stroke-linejoin': 'round',
//   }).transform({
//     position: squareCenter,
//   });
//   let box;

//   let t1  = draw.use(triangleSymbol);
//   let t2  = draw.use(triangleSymbol);
//   let t3  = draw.use(triangleSymbol);
//   let t4  = draw.use(triangleSymbol);

//   function resize() {
//     squareSize = triangleSymbol.lengthA + triangleSymbol.lengthB;

//     square.size(squareSize).transform({
//       position: squareCenter,
//     });

//     box = square.tbox();

//     t1.transform({
//       origin: [0, 0],
//       rotate: -90,
//       translate: [box.x, box.y2],
//     })
//     t2.transform({
//       translate: [box.x, box.y],
//     });
//     t3.transform({
//       origin: [0, 0],
//       rotate: 90,
//       translate: [box.x2, box.y],
//     });
//     t4.transform({
//       origin: [0, 0],
//       rotate: 180,
//       translate: [box.x2, box.y2],
//     });
//   }

//   resize();
//   triangleSymbol.on('resize', resize);


//   t4.rotate(-90, ...triangleSymbol.v1);
//   t3.rotate(90, ...triangleSymbol.v2);

//   // let dx = box.x2 - new SVG.Point(triangleSymbol.v0).transform(t3.matrix()).x
//   // t3.translate(dx);
//   // t2.translate(dx);
// });
