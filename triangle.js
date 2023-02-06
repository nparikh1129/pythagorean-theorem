"use strict";

const RED = '#ff3b30';
const GREEN = '#34c759'
const BLUE = '#007bff';
const GRAY = '#8e8e93';
const WHITE = "#ffffff";
const GOLD = "#ffcc01";
const LIGHT_RED ='#ffb6b3';
const LIGHT_BLUE = '#b2d7ff';
const LIGHT_GREEN = '#aeeabd';
const DARK_GRAY = '#3a3a3c';

const LABEL_FONT = {
  family: 'Arial',
  size: 40,
  anchor: 'middle',
  "alignment-baseline": "middle",
  // fill: "white",
};

const LABEL_EXPONENT_FONT = Object.assign({}, LABEL_FONT, {
  size: 18,
  'baseline-shift': "super",
});



let draw = SVG()
  .addTo('body')
  .size(document.body.clientWidth, window.visualViewport.height)
  .css({ 'background-color': '#1c1c1e' });
// TODO: Handle onResize event

window.addEventListener("resize", () => {
  draw.size(document.body.clientWidth, window.visualViewport.height)
})



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
    this.square.back()

    this.labelA2 = draw.text(function(add) {
      add.tspan('a').font(LABEL_FONT)
      add.tspan('2').font(LABEL_EXPONENT_FONT)
    }).fill(WHITE);
    this.add(this.labelA2);

    this.labelB2 = draw.text(function(add) {
      add.tspan('b').font(LABEL_FONT)
      add.tspan('2').font(LABEL_EXPONENT_FONT)
    }).fill(WHITE);
    this.add(this.labelB2);

    this.labelC2 = draw.text(function(add) {
      add.tspan('c').font(LABEL_FONT)
      add.tspan('2').font(LABEL_EXPONENT_FONT)
    }).fill(WHITE);
    this.add(this.labelC2);

    this.labelsList = new SVG.List([this.labelA2, this.labelB2, this.labelC2]);

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
    return this;
  };

  gatherChildren() {
    let tbox = this.square.tbox();
    let [cx, cy] = [tbox.cx, tbox.cy];
    this.square.transform({
      translate: [0, 0],
    });
    this.arrange();
    this.transform({
      translate: [cx, cy],
    });
    this.labelsList.front();
    // HACK: Unpoison gsap's cache
    // TODO: Don't poison gsap's cache (by mixing transformations with svgjs?)
    //        Could this be due to a clash with a parent class field/method
    this.trianglesList.forEach((t) => {
        gsap.set(t.node, { transform: t.matrix() });
    });
    gsap.set(this.square.node, { transform: this.square.matrix() });
  }

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



SVG.Equation = class{

  constructor() {

    this.a2 = draw.text(function(add) {
      add.tspan('a').font(LABEL_FONT)
      add.tspan('2').font(LABEL_EXPONENT_FONT)
    }).fill(WHITE);

    this.b2 = draw.text(function(add) {
      add.tspan('b').font(LABEL_FONT)
      add.tspan('2').font(LABEL_EXPONENT_FONT)
    }).fill(WHITE);

    this.c2 = draw.text(function(add) {
      add.tspan('c').font(LABEL_FONT)
      add.tspan('2').font(LABEL_EXPONENT_FONT)
    }).fill(WHITE);

    this.plus = draw.plain('+').font(LABEL_FONT).fill(WHITE);
    this.equals = draw.plain('=').font(LABEL_FONT).fill(WHITE);

    this.g = draw.group()
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

    let box = this.g.bbox();
    this.list.each((c) => { c.translate(-box.cx, -box.cy) });
  };

  translate(...args) {
    this.g.translate(...args);
    return this;
  };
  fill(...args) {
    this.list.fill(...args);
    return this;
  };
  scale(...args) {
    this.g.scale(...args);
    return this;
  };
  hide(...args) {
    this.g.hide(...args);
    return this;
  };
  hideChildren() {
    this.list.forEach((c) => { c.hide() });
    return this;
  }
}




class TimelineCoordinator {

  constructor() {
    this._startId = 'TLC_START';
    this.tl = { vars: { id: this._startId } };
    this.data = {};
    this._order = [this._startId, "triangleSizing", "squareConstruction", "alignedArrangment"];
    this._transitions = {
      "triangleSizing": buildTriangleSizingTimeline,
      "squareConstruction": buildSquareConstructionTimeline,
      "alignedArrangment": buildAlignedArrangmentTimeline,
    };
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

  start() {
    console.log('TimelineCoordinator started');
    this.completed(this.tl);
  };

  completed(tl) {
    console.log(this.tl.vars.id, 'completed');
    let tlIndex = this._order.indexOf(this.tl.vars.id);
    let nextId = this._order[tlIndex + 1];
    if (nextId == this._startId) {
      console.log('timeline sequence complete');
      return;
    }
    console.log(nextId);
    this._transitions[nextId]();
  };

  // TODO: If near the end of the tween, jump to next label, and then play to continue
  play() {
    if (this.tl?.paused() || this.tl.reversed()) {
      this.tl.play();
      console.log(this.tl.vars.id, 'playing');
    }
    else {
      console.log('play ignored');
    }
  };

  playReverse() {
    this.tl.reverse();
  };

  jumpNext() {
    console.log(this.tl.currentLabel(), this.tl.nextLabel(), this.tl.paused())
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
}



let canvasCX = draw.width() / 2; 
let canvasCY = draw.height() / 2;
let triangle = draw.rightTriangle(150, 150, 300).transform({
  origin: [0, 0],
  rotate: -90,
  translateX: canvasCX - 150,
  translateY: canvasCY + 50,
}).setLabelsVisible(false);

let proofSquare = draw.proofSquare(triangle)
  .back()
  .hideChildren();

let proofSquare2 = draw.proofSquare(triangle)
  .setLabelsVisible(true)
  .setArrangement('ALIGNED_SQUARES')
  .back()
  .hide();

let equation = new SVG.Equation().translate(canvasCX, 600).scale(3);
equation.g.ungroup();
let a2 = equation.a2;
let b2 = equation.b2;
let c2 = equation.c2;
let plus = equation.plus;
let equals = equation.equals;
a2.remember('matrix', a2.matrix()).hide();
b2.remember('matrix', b2.matrix()).hide();
c2.remember('matrix', c2.matrix()).hide();
plus.remember('matrix', plus.matrix()).hide();
equals.remember('matrix', equals.matrix()).hide();

function rmatrix(e) {
    let box = e.rbox(draw);
    let m = e.matrix();
    m.e = box.cx;
    m.f = box.cy;
    return m;
}






let buildTriangleSizingTimeline = function() {

  let tl = gsap.timeline({ id: 'triangleSizing', paused: true });
  tlc.timeline(tl);

  tlc.addKeyframeStart();

  tl.fadeOut(triangle.getLabels(), { duration: 0 });
  tl.fadeIn(triangle.labelA.node)

  tlc.addKeyframe();

  tl.fadeIn(triangle.labelB.node)

  tlc.addKeyframe();

  tl.fadeIn(triangle.labelC.node)

  tlc.addKeyframe();

  tl.fadeOut(triangle.getNonPlainElements());

  tlc.addKeyframe();

  tl.to(triangle, {
    lengthA: 175,
    lengthB: 125,
    duration: 1,
  });

  tlc.addKeyframeEnd();

  tl.eventCallback('onComplete', () => tlc.completed(tl));
}


let buildSquareConstructionTimeline = function() {
  let tl = gsap.timeline({ id: 'squareConstruction' });
  tl.eventCallback('onStart', () => tlc.timeline(tl));
  tl.eventCallback('onComplete', () => squareConstruction());

  let ps = proofSquare;

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
  let leftOfSquare = box.cx - (ps._size + 25);

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

    tl.eventCallback('onComplete', () => tlc.completed(tl));

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

    tl.to(ps.square.node, {
      x: leftOfSquare,
      duration: 1,
    })
    tl.addPause();
    tl.addLabel("key6.1");
    tl.to(ps.square.node, {
      onStart: () => ps.square.back(),
      onReverseComplete: () => ps.square.front(),
      x: box.cx,
      duration: 1,
    });

    tl.addPause();
    tl.addLabel("key6.2");
    tl.add(() => {}, "+=0.001");

    tl.add(() => {
      //TODO: Make this reversable
      ps.gatherChildren();
      console.log("Children gathered")
    });
    tl.fromTo(ps.labelC2.node, {
      display: "",
      attr: { opacity: 0 },
    }, {
      attr: { opacity: 1 },
      duration: 1,
    });

    tl.addPause();
    tl.addLabel("key11");

    tl.to(ps.labelC2.node, {
      attr: { opacity: 0 },
      duration: 1,
    });

    tl.addLabel("key12");
  }
}


let buildAlignedArrangmentTimeline = function() {

  let tl = gsap.timeline({ id: 'alignedArrangement' });
  tl.eventCallback('onStart', () => tlc.timeline(tl));
  tl.eventCallback('onComplete', () => tlc.completed(tl));

  let canvasCX = window.visualViewport.width / 2; 
  let ps = proofSquare;
  let ps2 = proofSquare2;
  let box = ps.square.tbox();

  tl.addPause("+=1");
  tl.addLabel("key1");

  tl.to(ps.t1.node, {
      transformOrigin: "right top",
      rotate: "-=90",
      duration: 1,
  });

  tl.addPause();
  tl.addLabel("key2");

  tl.to(ps.t4.node, {
    transformOrigin: "left bottom",
    rotate: "+=90",
    duration: 1,
  });
  tl.addPause();
  tl.addLabel("key3");

  tl.to([ps.t3.node, ps.t4.node], {
    x: `-=${ps.lengthB}`,
    duration: 1,
  });
  tl.add(() => ps.setArrangement("ALIGNED_SQUARES"));

  tl.addPause();
  tl.addLabel("key4");

  tl.fadeIn(ps.labelA2.node)

  tl.addPause();
  tl.addLabel("key5");

  tl.fadeIn(ps.labelB2.node);

  tl.addPause();
  tl.addLabel("key6");
  tl.add(() => {}, "+=0.001");

  tl.to(ps.node, {
    x: canvasCX - box.w/2 - 50,
    y: box.h/2 + 100,
    duration: 1,
  });

  tl.addPause();
  tl.addLabel("key7");
  tl.add(() => {}, "+=0.001");

  tl.set(ps2.node, {
    x: canvasCX - box.w/2 - 50,
    y: box.h/2 + 100,
    display: "block",
  });
  tl.to(ps2.node, {
    x: canvasCX + box.w/2 + 50,
    duration: 1,
  });

  tl.addPause();
  tl.addLabel("key8");
  tl.add(() => {}, "+=0.001");


  tl.fromTo([ps2.labelA2.node, ps2.labelB2.node], {
    display: "",
    attr: { opacity: 1 },
  }, {
    attr: { opacity: 0 },
    display: "none",
    duration: 1,
  });
  tl.to([ps2.t3.node, ps2.t4.node], {
    x: `+=${ps.lengthB}`,
    duration: 1,
  });
  tl.to(ps2.t4.node, {
    transformOrigin: "left bottom",
    rotate: "-=90",
    duration: 1,
  });
  tl.to(ps2.t1.node, {
    transformOrigin: "right top",
    rotate: "+=90",
    duration: 1,
  });
  tl.fromTo(ps2.labelC2.node, {
    display: "",
    attr: { opacity: 0 },
  }, {
    attr: { opacity: 1 },
    duration: 1,
  });


  tl.addPause();
  tl.addLabel("key9");
  tl.add(() => {}, "+=0.001");

  tl.add(() => {
    a2.transform(rmatrix(ps.labelA2));
    console.log('setting up area text');
  });
  tl.set(a2.node, {
    display: "",
  })
  tl.to(a2.node, {
    attr: {transform: a2.remember('matrix')},
    duration: 1.5,
  });

  // tl.add(() => {
  //   labelA2Clone.show();
  //   let box = ps.labelA2.rbox(draw);
  //   let m = ps.labelA2.matrix();
  //   m.e = box.cx;
  //   m.f = box.cy;
  //   labelA2Clone.transform(m);
  // });
  // tl.to(labelA2Clone.node, {
  //   y: 700,
  //   scale: 3,
  //   duration: 1.5,
  // });
  //
  // tl.addPause();
  // tl.addLabel("key10");
  // tl.add(() => {}, "+=0.001");

  // tl.add(() => {
  //   labelB2Clone.show();
  //   let box = ps.labelB2.rbox(draw);
  //   let m = ps.labelB2.matrix();
  //   m.e = box.cx;
  //   m.f = box.cy;
  //   labelB2Clone.transform(m);
  // });
  // tl.to(labelB2Clone.node, {
  //   x: 600,
  //   y: 700,
  //   scale: 3,
  //   duration: 1.5,
  // });

  // tl.addPause();
  // tl.addLabel("key11");
  // tl.add(() => {}, "+=0.001");

  // tl.add(() => {
  //   labelC2Clone.show();
  //   let box = ps2.labelC2.rbox(draw);
  //   let m = ps2.labelC2.matrix();
  //   m.e = box.cx;
  //   m.f = box.cy;
  //   labelC2Clone.transform(m);
  // });
  // tl.to(labelC2Clone.node, {
  //   x: 900,
  //   y: 700,
  //   scale: 3,
  //   duration: 1.5,
  // });

  // tl.addPause();
  // tl.addLabel("key12");
  // tl.add(() => {}, "+=0.001");

  // tl.to([labelA2Clone.node, labelB2Clone.node, labelC2Clone.node], {
  //   fill: GOLD,
  //   duration: 1,
  // })


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
tlc.start();






// triangle.setResizeHandlesVisible(false);

// let tl = gsap.timeline({ id: 'testTL', paused: true });
// tlc.timeline(tl);

// tlc.addKeyframeStart();

// let box = triangle.rbox();
// console.log(box);

// tl.to(triangle.node, {
//   y: "+=150",
//   duration: 1,
// });

// tlc.addKeyframe();

// box = triangle.rbox();
// console.log(box);

// tl.to(triangle.node, {
//   x: "+=" + box.w,
//   y: "+=" + box.h,
//   duration: 2,
// })

// tlc.addKeyframeEnd();

// box = triangle.rbox();
// console.log(box);


// tl.eventCallback('onStart', () => console.log("tl started"));
// tl.eventCallback('onComplete', () => console.log("tl ended"));






