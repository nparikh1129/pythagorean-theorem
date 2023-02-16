"use strict";

gsap.registerPlugin(Flip, CustomEase);

import {RED, GREEN, BLUE, LIGHT_BLUE, LIGHT_GREEN, DARK_GRAY, GRAY, WHITE} from "./constants.js";
import {LABEL_FONT, LABEL_EXPONENT_FONT} from "./constants.js";


let draw = SVG()
  .addTo('body')
  .size(document.body.clientWidth, window.visualViewport.height)
  .css({ 'background-color': '#1c1c1e' });

// let draw = SVG()
//   .addTo('body')
//   .attr({ width: "100%", height: "100%" })
//   .css({ 'background-color': '#1c1c1e' })
//   .viewbox(0, 0, 1200, 900);

window.addEventListener("resize", () => {
  draw.size(document.body.clientWidth, window.visualViewport.height)
})

const A2 = draw.text(function(add) {
  add.tspan('a').font(LABEL_FONT)
  add.tspan('2').font(LABEL_EXPONENT_FONT)
}).fill(WHITE).center(0, 0);
draw.defs().add(A2);

const B2 = draw.text(function(add) {
  add.tspan('b').font(LABEL_FONT)
  add.tspan('2').font(LABEL_EXPONENT_FONT)
}).fill(WHITE).center(0, 0);
draw.defs().add(B2);

const C2 = draw.text(function(add) {
  add.tspan('c').font(LABEL_FONT)
  add.tspan('2').font(LABEL_EXPONENT_FONT)
}).fill(WHITE).center(0, 0);
draw.defs().add(C2);



SVG.RightTriangle = class extends SVG.G {

  constructor(lengthA, lengthB, maxSize = Infinity) {
    super();

    this.maxSize = maxSize;

    this._lineA = draw.resizableLine(maxSize, lengthA, BLUE);
    this._lineB = draw.resizableLine(maxSize, lengthB, RED).rotate(90, 0, 0);


    this.labelA = draw.plain('a')
      .font(LABEL_FONT)
      .rotate(90, 0, 0)
      .translate(lengthA / 2, -30)
      .fill(WHITE);

    this.labelB = draw.plain('b')
      .font(LABEL_FONT)
      .rotate(90, 0, 0)
      .translate(-30, lengthB / 2)
      .fill(WHITE);

    this.labelC = draw.plain('c')
      .font(LABEL_FONT)
      .rotate(90, 0, 0)
      .translate((lengthA / 2) + 20, (lengthB / 2) + 20)
      .fill(WHITE);

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

    this._rightAngleSymbol = draw.rect(15, 15).attr({
      'fill-opacity': 0,
      stroke: DARK_GRAY,
      'stroke-width': 2,
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
  set lengthA(length) {
    this.resize(length, this.lengthB);
  }

  get lengthB() {
    return this._lineB.length;
  }
  set lengthB(length) {
    this.resize(this.lengthA, length);
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

  setNonPlainElementsVisible(visible = true) {
    if (visible) {
      this.getNonPlainElements().forEach((e) => {
        e.show();
      });
    }
    else{
      this.getNonPlainElements().forEach((e) => {
        e.style.display = "none"
      });
    }
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
    this._labelsVisible = false;

    this.t1 = draw.rightTriangle(triangle.lengthA, triangle.lengthB);
    this.t2 = draw.rightTriangle(triangle.lengthA, triangle.lengthB);
    this.t3 = draw.rightTriangle(triangle.lengthA, triangle.lengthB);
    this.t4 = draw.rightTriangle(triangle.lengthA, triangle.lengthB);

    this.trianglesList = new SVG.List([this.t1, this.t2, this.t3, this.t4]);
    this.trianglesNodes = [];
    this.trianglesList.each((t) => {
      t.setNonPlainElementsVisible(false);
      this.trianglesNodes.push(t.node);
      this.add(t);
    });

    this.square;
    this._size;
    this.initSquare();
    this.add(this.square);
    this.square.back();

    this.a2 = draw.use(A2);
    this.b2 = draw.use(B2);
    this.c2 = draw.use(C2);
    this.add(this.a2);
    this.add(this.b2);
    this.add(this.c2);
    this.labelsList = new SVG.List([this.a2, this.b2, this.c2]);

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
    }).center(0, 0);
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

    this.a2.transform({
      translate: [box.x + (this.lengthA / 2), box.y + (this.lengthA / 2)],
      scale: this.lengthA / 80,
    });
    this.b2.transform({
      translate: [box.x2 - (this.lengthB / 2), box.y2 - (this.lengthB / 2)],
      scale: this.lengthB / 80,
    });
    this.c2.transform({
      scale: this._size / 100,
    });

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
    }
    return this;
  }

  setArrangement(arrangement) {
    this.arrangement = arrangement;
    this.setLabelsVisible(this._labelsVisible);
    this.arrange();
    return this;
  }

  setLabelsVisible(visible) {
    this._labelsVisible = visible;
    if (visible) {
      if (this.arrangement == 'TWISTED_SQUARES') {
        this.c2.show();
        this.a2.hide();
        this.b2.hide();
      }
      else {
        this.a2.show();
        this.b2.show();
        this.c2.hide();
      }
    }
    else {
      this.a2.hide();
      this.b2.hide();
      this.c2.hide();
    }
    return this;
  };

  hideChildren() {
    this.children().forEach((c) => {
      c.hide();
    });
    return this;
  };
}
SVG.extend(SVG.Container, {
  proofSquare: function(triangle, x, y) {
    return this.put(new SVG.ProofSquare(triangle, x, y));
  }
});


SVG.Equation = class extends SVG.G {

  constructor() {
    super();

    this.a2 = draw.use(A2);
    this.b2 = draw.use(B2);
    this.c2 = draw.use(C2);
    this.plus = draw.plain('+').font(LABEL_FONT).fill(WHITE).center(0, 0);
    this.equals = draw.plain('=').font(LABEL_FONT).fill(WHITE).center(0, 0);

    this
      .add(this.a2)
      .add(this.b2)
      .add(this.c2)
      .add(this.plus)
      .add(this.equals);

    this.list = new SVG.List([
      this.a2, 
      this.b2,
      this.c2,
      this.plus,
      this.equals
    ]);

    this.a2.translate(0, 0)
    this.plus.translate(50, 0)
    this.b2.translate(100, 0)
    this.equals.translate(150, 0)
    this.c2.translate(200, 0)
    let box = SVG.Box.merge(this.list.bbox())
    this.list.each((c) => { c.translate(-box.cx, -box.cy) });
  };

  fill(...args) {
    this.list.fill(...args);
    return this;
  };

  setChildrenVisible(visible = true) {
    if (visible)
      this.list.show();
    else
      this.list.hide();
    return this;
  };

  childNodes() {
    let nodes = []
    this.list.each((c) => nodes.push(c.node));
    return nodes;
  };
}
SVG.extend(SVG.Container, {
  equation: function() {
    return this.put(new SVG.Equation());
  }
});


class TimelineCoordinator {

  constructor() {
    this.tl;
    this.data = {};
    this.keyframeIndex = 0;
  };

  timeline(tl) {
    if (tl) {
      this.tl = tl;
    }
    else {
      return this.tl;
    }
  };

  completed(tl) {
    console.log('completed');
  };

  play() {
    if (this.tl.paused() || this.tl.reversed()) {
      this.tl.play();
      console.log('playing');
    }
    else {
      this.jumpNext();
    }
  };

  playReverse() {
    if (this.tl.paused() || !this.tl.reversed()) {
      this.tl.reverse();
    }
    else {
      this.jumpPrev();
    }
  };

  jumpNext() {
    let label = this.tl.nextLabel();
    if (label) {
      this.tl.seek(label, false);
    }
  };

  jumpPrev() {
    let label = this.tl.previousLabel();
    if (label) {
      this.tl.seek(label, false);
    }
  };

  addKeyframe({pause = true} = {}) {
    this.tl.addLabel(
      "kf-" + this.keyframeIndex++,
      "+=0.0001"
    );
    if (pause) {
      this.tl.addPause();
    }
    this.tl.add(() => {}, "+=0.0001");
    this.tl.seek("+=0", false);
  };

  addKeyframeStart() {
    this.addKeyframe({ pause: false });
  };

  addKeyframeEnd(seek = true) {
    this.addKeyframe({ pause: false });
    this.tl.seek(0, false);
    this.tl.invalidate();
  };

  applyChanges() {
    this.tl.add(() => {}, "+=0.0001");
    this.tl.seek("+=0", false);
  };
}


// console.log("Draw Pos", draw.getPosition("center"))
let triangle = draw.rightTriangle(150, 150, 300)
  .setLabelsVisible(false)
  .alignPosition('center', draw, 'center')
  .setRotation('center', -90);
// console.log("Triangle Pos", triangle.rbox(draw))

let proofSquare = draw.proofSquare(triangle)
  .back()
  .hideChildren();

let proofSquare2 = draw.proofSquare(triangle)
  .setLabelsVisible(true)
  .setArrangement('ALIGNED_SQUARES')
  .front()
  .hide();

let equation = draw.equation()
  .scale(3)
  .alignPositionX('center', draw, 'center')
  .translate(0, 600)
  .setChildrenVisible(false);

let a2 = draw.use(A2).hide();
let b2 = draw.use(B2).hide();
let c2 = draw.use(C2).hide();



let buildTimeline = function() {

  let ps = proofSquare;
  ps.alignPosition("center", draw, "center");
  ps.square.attr({ opacity: 0 });
  ps.square.front();
  ps.square.show();
  // TODO: Make this part of the initial layout
  let box = ps.square.rbox(draw);

  let ps2 = proofSquare2;
  ps.arrangement = "TWISTED_SQUARES";
  ps2.arrangement = "ALIGNED_SQUARES";


  let tl = gsap.timeline({ paused: true });
  tlc.timeline(tl);

  tlc.addKeyframeStart();

  tl.fadeIn(triangle.labelA.node)

  tlc.addKeyframe();

  tl.fadeIn(triangle.labelB.node)

  tlc.addKeyframe();

  tl.fadeIn(triangle.labelC.node)

  tlc.addKeyframe();

  tl.fadeOut(triangle.getNonPlainElements());

  tlc.addKeyframe();

  tl.add(gsap.to(triangle, {
    lengthA: 175,
    lengthB: 125,
    duration: 1,
    onReverseComplete: function() { this.invalidate() },
  }));

  tl.add(() => {
    ps.arrangement = "TWISTED_SQUARES";
    ps2.arrangement = "ALIGNED_SQUARES";
  });

  /*** Square Construction Timeline ***/

  tlc.addKeyframe();

  triangle.addToTimeline(tl)
    .alignPosition("bottom left", box, "bottom left")
    .to({ duration: 1 });

  tlc.addKeyframe();

  tl.show(ps.t4.node);
  triangle.addToTimeline(tl)
    .rotate(90)
    .alignPosition("top left", ps, "top left")
    .to({
      duration: 2,
      ease: "power2.inOut",
    });

  tlc.addKeyframe();

  tl.show(ps.t1.node);
  triangle.addToTimeline(tl)
    .rotate(90)
    .alignPosition("top right", ps, "top right")
    .to({
      duration: 2,
      ease: "power2.inOut",
    });

  tlc.addKeyframe();

  tl.fadeIn(ps.t2.node, {
    duration: 0
  });
  triangle
    .saveState()
    .rotate(90)
    .alignPosition("bottom right", ps, "bottom right");
  tl.to(triangle.node, triangle.diffState({
    duration: 2,
    ease: "power2.inOut",
  }));
  tl.fadeIn(ps.t3.node, {
    duration: 0
  });
  tl.fadeOut(triangle.node, {
    duration: 0
  });

  tlc.addKeyframe();

  tl.to(ps.square.node, {
    onStart: () => ps.square.front(),
    attr: {
      opacity: 1,
    },
    duration: 1.5,
    ease: "power2.in",
  });

  tlc.addKeyframe();

  ps.square
    .saveState()
    .alignPosition("right", box, "left")
    .translate(-25, 0);
  tl.to(ps.square.node, ps.square.diffState({
    duration: 1,
  }));

  tlc.addKeyframe();

  ps.square
    .saveState()
    .alignPosition("center", box, "center");
  tl.to(ps.square.node, ps.square.diffState({
    onStart: () => ps.square.back(),
    onReverseComplete: () => ps.square.front(),
    duration: 1,
  }));

  tlc.addKeyframe();

  tl.fadeIn(ps.c2.node);

  tlc.addKeyframe();

  tl.fadeOut(ps.c2.node);

  /*** Aligned Square Timeline ***/

  tlc.addKeyframe();

  tl.to(ps.t1.node, {
    transformOrigin: "right top",
    rotate: "-=90",
    duration: 1,
  });

  tlc.addKeyframe();

  tl.to(ps.t4.node, {
    transformOrigin: "left bottom",
    rotate: "+=90",
    duration: 1,
  });

  tlc.addKeyframe();

  tl.to([ps.t3.node, ps.t4.node], {
    x: `-=${ps.lengthB}`,
    duration: 1,
  });
  tl.add(() => {
    ps.arrangement = "ALIGNED_SQUARES";
  });

  tlc.addKeyframe();

  tl.fadeIn(ps.a2.node)

  tlc.addKeyframe();

  tl.fadeIn(ps.b2.node)

  tlc.addKeyframe();

  ps.saveState()
    .alignPositionX("right", draw, "center", -50)
    .alignPositionY("top", draw, "top", 100)
  tl.to(ps.node, ps.diffState({
    duration: 1,
  }));

  tlc.addKeyframe();

  // TODO: Lay this out from the begining
  ps2.saveState()
    .alignPosition("center", ps, "center")
  tl.set(ps2.node, ps2.diffState());

  tlc.applyChanges();

  ps2.saveState()
    .show()
    .alignPositionX("left", draw, "center", 50)
  tl.to(ps2.node, ps2.diffState({
    duration: 1.5,
    ease: "power2.inOut",
  }));

  tlc.addKeyframe();

  tl.fadeOut([ps2.a2.node, ps2.b2.node]);

  tlc.addKeyframe();

  tl.to([ps2.t3.node, ps2.t4.node], {
    x: `+=${ps.lengthB}`,
    duration: 1.2,
  });

  tlc.addKeyframe();

  tl.to(ps2.t4.node, {
    transformOrigin: "left bottom",
    rotate: "-=90",
    duration: 1.2,
  });

  tlc.addKeyframe();

  tl.to(ps2.t1.node, {
    transformOrigin: "right top",
    rotate: "+=90",
    duration: 1.2,
  });

  tlc.addKeyframe();

  tl.fadeIn(ps2.c2.node);
  tl.add(() => {
    ps2.arrangement = "TWISTED_SQUARES";
  });


  /*** Equation Timeline ***/

  tlc.addKeyframe();

  a2.saveState()
    .show()
    .alignTransform(ps.a2)
  tl.set(a2.node, a2.diffState({}, true));

  b2.saveState()
    .show()
    .alignTransform(ps.b2)
  tl.set(b2.node, b2.diffState({}, true));

  c2.saveState()
    .show()
    .alignTransform(ps2.c2)
  tl.set(c2.node, c2.diffState({}, true));

  tlc.applyChanges();

  a2.saveState()
    .alignTransform(equation.a2);
  tl.to(a2.node, a2.diffState({
    duration: 1.5,
  }, true));

  tlc.addKeyframe();

  b2.saveState()
    .alignTransform(equation.b2);
  tl.to(b2.node, b2.diffState({
    duration: 1.5,
  }, true));

  tlc.addKeyframe();

  tl.fadeIn(equation.plus.node);

  tlc.addKeyframe();

  c2.saveState()
    .alignTransform(equation.c2);
  tl.to(c2.node, c2.diffState({
    duration: 1.5,
  }, true));

  tlc.addKeyframe();

  tl.fadeIn(equation.equals.node);

  tlc.addKeyframe();

  tl.fadeOut([a2.node, b2.node, c2.node], {
    duration: 0,
  });
  tl.fadeIn(equation.childNodes(), {
    duration: 0,
  });
  tlc.applyChanges();

  equation.addToTimeline(tl)
    .scaleToWidth(ps2)
    .alignPositionX("center", ps2, "center")
    .to({ duration: 1 });

  tlc.addKeyframe();

  tl.show(triangle.node);
  triangle.addToTimeline(tl)
    .transform({rotate: -90})
    .alignPositionX("left", ps, "left")
    .alignPositionY("center", equation, "center")
    .set();
  tl.hide(triangle.node);
  tl.show(triangle.getNonPlainElements());
  tl.fadeIn(triangle.node);

  tl.add(gsap.from(triangle, {
    lengthA: 175,
    lengthB: 125,
    onComplete: function() { this.invalidate() },
    onReverseComplete: function() { this.invalidate() },
  }));

  tlc.addKeyframeEnd();

  tl.eventCallback('onComplete', () => tlc.completed(tl));
}


let jumpPrev = draw.rect(50, 50).fill("red");
jumpPrev.on("click", () => {
  tlc.jumpPrev();
})

let playReverse = draw.rect(50, 50).fill("green").translate(50, 0);
playReverse.on("click", () => {
  tlc.playReverse();
})

let play = draw.rect(50, 50).fill("blue").translate(100, 0);
play.on("click", () => {
  tlc.play();
})

let jumpNext = draw.rect(50, 50).fill("yellow").translate(150, 0);
jumpNext.on("click", () => {
  tlc.jumpNext();
})

let tlc = new TimelineCoordinator();
buildTimeline();
