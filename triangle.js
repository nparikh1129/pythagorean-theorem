"use strict";


const RED = '#ff3b30';
const GREEN = '#34c759'
const BLUE = '#007bff';
const GRAY = '#8e8e93';
const LIGHT_RED ='#ffb6b3';
const LIGHT_BLUE = '#b2d7ff';
const LIGHT_GREEN = '#aeeabd';
const DARK_GRAY = '#3a3a3c';



let draw = SVG().addTo('body').size(window.screen.availWidth, window.screen.availHeight).css({ 'background-color': '#1c1c1e' })
// TODO: Handle onResize event


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

  setResizeHandlesVisible(visible) {
    if (visible) {
      this._lineA.setResizeHandleVisible(true);
      this._lineB.setResizeHandleVisible(true);
    }
    else {
      this._lineA.setResizeHandleVisible(false);
      this._lineB.setResizeHandleVisible(false);
    }
  }

  getResizeHandles() {
    let handleA = this._lineA._resizeHandle.node;
    let handleB = this._lineB._resizeHandle.node;
    return [handleA, handleB];
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
      t.toggleResizeHandles().toggleRightAngleSymbol();
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
    shapes.trianglesList.each((t) => {
      t.toggleResizeHandles().toggleRightAngleSymbol();
      t.hide();
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

  resume() {
    if (this._curr) {
      this._curr.resume();
      console.log(this._curr.vars.id, 'resumed');
    }
    else {
      console.log('resume ignored');
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
let triangle = draw.rightTriangle(100, 100, 200).transform({
  origin: [0, 0],
  rotate: -90,
  translateX: canvasCX - 50,
  translateY: canvasCY + 50,
})

let proofSquare = draw.proofSquare(triangle).back().hide();




// TODO: Should timelines be built deactivated?

let buildTriangleSizingTimeline = function() {

  let tl = gsap.timeline({ id: 'triangleSizing' });
  tl.eventCallback('onStart', () => tlCoord.started(tl));
  tl.eventCallback('onComplete', () => tlCoord.completed(tl));

  tl.addPause("+=0.005");
  tl.to(triangle.getResizeHandles(), {
    opacity: 0,
    duration: 0.75,
    onComplete: () => triangle.setResizeHandlesVisible(false),
  });
  tl.to(triangle._rightAngleSymbol.node, {
    opacity: 0,
    duration: 0.75,
  }, "<");
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

  tl.addPause("+=0.005");
  tl.to(triangle.node, {
    translateX: box.x,
    translateY: box.y2,
    duration: 1,
  });

  let squareConstruction = function() {

    let m = triangle.matrix();
    ps.trianglesList.each((t) => {
      t.transform(m);
      t.show();
    });
    triangle.hide();

    tl.eventCallback('onComplete', () => tlCoord.completed(tl));

    tl.addPause("+=0.005");
    tl.to(ps.t1.node, {
      onStart: () => ps.t1.front(),
      rotate: "+=90",
      translateX: box.x,
      translateY: box.y,
      duration: 2,
      ease: "power.inOut",
    });
    tl.addPause();
    tl.to(ps.t2.node, {
      onStart: () => ps.t2.front(),
      rotate: "-=180",
      translateX: box.x2,
      translateY: box.y,
      duration: 3,
      ease: "power.inOut",
    });
    tl.addPause();
    tl.to(ps.t3.node, {
      onStart: () => ps.t3.front(),
      rotate: "-=90",
      translateX: box.x2,
      translateY: box.y2,
      duration: 2,
      ease: "power.inOut",
    });
    tl.addPause();
    tl.to(ps.square.node, {
      onStart: () => ps.square.front(),
      opacity: 1,
      duration: 1.5,
      ease: "power2.in",
    });
    tl.addPause();
    tl.add(() => {
      if (!tl.reversed())
        ps.trianglesList.attr({ opacity: 0 }).front();
      else {
        ps.trianglesList.forEach((t) => t.node.style.opacity = 1);
        ps.trianglesList.back();
      }
    });
    tl.to(ps.t4.node, {
      opacity: 1,
      duration: 1,
    });
    tl.addPause();
    tl.to(ps.t1.node, {
      opacity: 1,
      duration: 1,
    });
    tl.addPause();
    tl.to(ps.t2.node, {
      opacity: 1,
      duration: 1,
    });
    tl.addPause();
    tl.to(ps.t3.node, {
      opacity: 1,
      duration: 1,
    });
    tl.add(() => {
      //
    });
  }
}


let buildAlignedArrangmentTimeline = function() {

  let tl = gsap.timeline({ id: 'alignedArrangement' });
  tl.eventCallback('onStart', () => tlCoord.started(tl));
  tl.eventCallback('onComplete', () => tlCoord.completed(tl));

  let ps = tlCoord.data.ps;
  // proofSquare.arrangement = 'ALIGNED_SQUARES';

  tl.addPause("+=0.005");

  tl.to(ps.t1.node, {
    transformOrigin: "100% 0%",
    rotate: "-=90",
    duration: 1,
  });
  tl.addPause();
  tl.to(ps.t4.node, {
    transformOrigin: "0% 100%",
    rotate: "+=90",
    duration: 1,
  });
  tl.addPause();
  tl.to([ps.t3.node, ps.t4.node], {
    translateX: `-=${triangle.lengthB}`,
    duration: 1,
  });

  tl.addPause("+=0.005", () => console.log('alignedArrangement paused'));
  tl.addPause("+=0.005");
}









let tlCoord = new TimelineCoordinator();
draw.on("dblclick", () => {
  console.log('coord sending resume');
  tlCoord.resume();
});

// let button = draw.rect(100, 100).fill('blue');
// button.on("click", () => {
//   console.log('coord sending reverse');
//   tlCoord.reverse();
// });




tlCoord.start();










// let squareConstruction = new SVG.TimelineBuilder({ pause: true, unpauseEvent: 'advance' });




// draw.publish('advance')
// draw.on("dblclick", () => {
//   draw.broadcast('advance');
// })


// let tb = new SVG.TimelineBuilder({ pause: true, unpauseEvent: 'advance' });
// tb.appendPause();
// tb.appendFunction(() => {
//   triangle.toggleResizeHandles();
//   triangle.front()
// });
// tb.append(triangle.animation(1000).translate(-150, 0));



// tb.appendFunction(() => { proofSquare.squareConstructionTB(squareConstruction) });
// tb.appendTimelineBuilder(squareConstruction);
// tb.play();


// square.toggleArrangement({animate: true});



