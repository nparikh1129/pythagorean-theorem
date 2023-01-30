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
};

const EXPONENT_FONT = Object.assign({}, LABEL_FONT, {
  size: 22,
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

    triangle.on('resize', () => { this.arrange() });
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


class TimelineCoordinator {
  

  constructor() {
    this._startId = 'TLC_START';
    this._curr = { vars: { id: this._startId } };
    this.data = {};
    this._order = [this._startId, "triangleSizing", "squareConstruction", "alignedArrangment"];
    this._transitions = {
      "triangleSizing": buildTriangleSizingTimeline,
      "squareConstruction": buildSquareConstructionTimeline,
      "alignedArrangment": buildAlignedArrangmentTimeline,
    };
  }

  started(tl) {
    this._curr = tl;
    tl.timeScale(1);
    console.log(this._curr.vars.id, 'started')
  }

  completed(tl) {
    console.log(this._curr.vars.id, 'completed');
    let currIndex = this._order.indexOf(this._curr.vars.id);
    let nextId = this._order[currIndex + 1];
    if (nextId == this._startId) {
      console.log('timeline sequence complete');
      return;
    }
    console.log(nextId);
    this._transitions[nextId]();
  }

  play() {
    if (this._curr) {
      this._curr.play();
      console.log(this._curr.vars.id, 'resumed');
    }
    else {
      console.log('play ignored');
    }
  }

  next() {
    console.log(this._curr.currentLabel(), this._curr.nextLabel(), this._curr.paused())
    let label = this._curr.nextLabel();
    if (label) {
      this._curr.seek(label, false);
    }
  }

  prev() {
    let label = this._curr.previousLabel();
    if (label) {
      this._curr.seek(label, false);
    }
  }

  reverse() {
    if (this._curr) {
      this._curr.reverse();
      console.log(this._curr.vars.id, 'reversed');
    }
    else {
      console.log('reverse ignored');
    }
  }

  start() {
    console.log('TimelineCoordinator started');
    this.completed(this._curr);
  }


}



let canvasCX = window.visualViewport.width / 2; 
let canvasCY = window.visualViewport.height / 2;
let triangle = draw.rightTriangle(150, 150, 300).transform({
  origin: [0, 0],
  rotate: -90,
  translateX: canvasCX - 150,
  translateY: canvasCY + 50,
}).setLabelsVisible(false);

let proofSquare = draw.proofSquare(triangle).back().hide();






// TODO: Should timelines be built deactivated?

let buildTriangleSizingTimeline = function() {

  let tl = gsap.timeline({ id: 'triangleSizing' });
  tl.eventCallback('onStart', () => tlCoord.started(tl));
  tl.eventCallback('onComplete', () => tlCoord.completed(tl));


  tl.addPause("+=1");
  tl.addLabel("key1");
  tl.set(triangle.getLabels(), {
    opacity: 0,
  });
  tl.to(triangle.labelA.node, {
    opacity: 1,
    display: "block",
    duration: 1,
  });
  tl.addPause();
  tl.addLabel("key2");
  tl.to(triangle.labelB.node, {
    opacity: 1,
    display: "block",
    duration: 1,
  });
  tl.addPause();
  tl.addLabel("key3");
  tl.to(triangle.labelC.node, {
    opacity: 1,
    display: "block",
    duration: 1,
  });
  tl.addPause();
  tl.addLabel("key4");
  tl.to(triangle.getNonPlainElements(), {
    opacity: 0,
    display: "none",
    duration: 1,
  });
  tl.addLabel("key5");
}


let buildSquareConstructionTimeline = function() {
  let tl = gsap.timeline({ id: 'squareConstruction' });
  tl.eventCallback('onStart', () => tlCoord.started(tl));
  tl.eventCallback('onComplete', () => squareConstruction());

  let ps = proofSquare.copyShapes();
  tlCoord.data.ps = ps;

  let canvasCX = window.visualViewport.width / 2; 
  let canvasCY = window.visualViewport.height / 2;
  ps.square.transform({
    translateX: canvasCX,
    translateY: canvasCY,
  });
  ps.square.attr({ opacity: 0 });
  ps.square.front();
  ps.square.show();
  let box = ps.square.tbox();

  tl.addPause("+=1");
  tl.addLabel("key1");
  tl.to(triangle.node, {
    translateX: box.x,
    translateY: box.y2,
    duration: 1,
  });
  tl.addLabel("key2");

  let squareConstruction = function() {

    let m = triangle.matrix();
    ps.trianglesList.transform(m).show();
    triangle.hide();

    tl.eventCallback('onComplete', () => tlCoord.completed(tl));

    tl.addPause("+=1");
    tl.to(ps.t1.node, {
      onStart: () => ps.t1.front(),
      rotate: "+=90",
      translateX: box.x,
      translateY: box.y,
      duration: 1.5,
      ease: "power.inOut",
    });
    tl.addPause();
    tl.addLabel("key3");
    tl.to(ps.t2.node, {
      onStart: () => ps.t2.front(),
      rotate: "-=180",
      translateX: box.x2,
      translateY: box.y,
      duration: 2,
      ease: "power.inOut",
    });
    tl.addPause();
    tl.addLabel("key4");
    tl.to(ps.t3.node, {
      onStart: () => ps.t3.front(),
      rotate: "-=90",
      translateX: box.x2,
      translateY: box.y2,
      duration: 1.5,
      ease: "power.inOut",
    });
    tl.addPause();
    tl.addLabel("key5");
    tl.to(ps.square.node, {
      onStart: () => ps.square.front(),
      attr: {
        opacity: 1,
      },
      duration: 1.5,
      ease: "power2.in",
    });
    tl.addPause();
    tl.addLabel("key6");
    tl.add(() => {
      if (!tl.reversed())
        ps.trianglesList.attr({ opacity: 0 }).front();
      else {
        ps.trianglesList.attr({ opacity: 1 }).back();
      }
    });
    tl.to(ps.t4.node, {
      attr: {opacity: 1},
      duration: 1,
    });
    tl.addPause();
    tl.addLabel("key7");
    tl.to(ps.t1.node, {
      attr: {opacity: 1},
      duration: 1,
    });
    tl.addPause();
    tl.addLabel("key8");
    tl.to(ps.t2.node, {
      attr: {opacity: 1},
      duration: 1,
    });
    tl.addPause();
    tl.addLabel("key9");
    tl.to(ps.t3.node, {
      attr: {opacity: 1},
      duration: 1,
    });
    tl.addLabel("key10");
  }
}


let buildAlignedArrangmentTimeline = function() {

  let tl = gsap.timeline({ id: 'alignedArrangement' });
  tl.eventCallback('onStart', () => tlCoord.started(tl));
  tl.eventCallback('onComplete', () => tlCoord.completed(tl));

  let ps = tlCoord.data.ps;

  tl.addPause("+=1");
  tl.addLabel("key1");
  tl.to(ps.t1.node, {
    transformOrigin: "100% 0%",
    rotate: "-=90",
    duration: 1,
  });
  tl.addPause();
  tl.addLabel("key2");
  tl.to(ps.t4.node, {
    transformOrigin: "0% 100%",
    rotate: "+=90",
    duration: 1,
  });
  tl.addPause();
  tl.addLabel("key3");
  tl.to([ps.t3.node, ps.t4.node], {
    translateX: `-=${triangle.lengthB}`,
    duration: 1,
  });
  tl.addLabel("key4");

  tl.addPause("+=0.005", () => console.log('alignedArrangement paused'));
  tl.addPause("+=0.005");
}



// let next = draw.rect(50, 50).fill("blue");
// next.on("click", () => {
//   tlCoord.next();
// })

// let prev = draw.rect(50, 50).fill("red").translate(100, 0);
// prev.on("click", () => {
//   tlCoord.prev();
// })

let tlCoord = new TimelineCoordinator();
draw.on("dblclick", () => {
  tlCoord.play();
});


tlCoord.start();
