"use strict";

gsap.registerPlugin(Flip, CustomEase);

import {draw} from "./src/canvas.js";
import {A2, B2, C2} from "./src/defs.js";
import "./src/resizableLine.js";
import "./src/rightTriangle.js";
import "./src/proofSquare.js";
import "./src/equation.js";
import {timelineCoordinator as tlc} from "./src/timelineCoordinator.js";
import "./src/sidenav.js";


let triangle = draw.rightTriangle(150, 150, 300)
  .setLabelsVisible(false)
  .setResizeHandlesVisible(false)
  .setRotation('center', -90)
  .setPosition("bottom left", 500, 600)
  .setResizeHandlesVisible(true)

let proofSquare = draw.proofSquare(triangle)
  .back()
  .hideChildren()
  .alignPosition("center", draw, "center")

proofSquare.arrangement = "TWISTED_SQUARES";

proofSquare.square
  .attr({ opacity: 0 })
  .front()
  .show()

let proofSquare2 = draw.proofSquare(triangle)
  .setLabelsVisible(true)
  .setArrangement('ALIGNED_SQUARES')
  .front()
  .hide();

proofSquare2.arrangement = "ALIGNED_SQUARES";

let equation = draw.equation()
  .scale(3)
  .alignPositionX('center', draw, 'center')
  .translate(0, 600)
  .setChildrenVisible(false);

let a2 = draw.use(A2).hide();
let b2 = draw.use(B2).hide();
let c2 = draw.use(C2).hide();

let ps = proofSquare;
let ps2 = proofSquare2;
// TODO: Make this part of the initial layout
let box = ps.square.rbox(draw);



const triangleSideLengths = function(tl) {
  
  tlc.addKeyframe({label: "TriangleSideLengths"});

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
}


const buildProofSquare = function(tl) {
  /*** Square Construction Timeline ***/

  tlc.addKeyframe({label: "BuildProofSquare"});

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
}


const alignedSquares = function(tl) {

  tlc.addKeyframe({label: "AlignedSquaresArrangement"});

  tl.fadeOut(ps.c2.node);

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
}


const compareArrangements = function(tl) {

  tlc.addKeyframe({label: "CompareArrangements"});

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
}


const buildEquation = function(tl) {

  tlc.addKeyframe({label: "BuildEquation"});

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
}


let buildTimeline = function() {

  let tl = gsap.timeline();
  tlc.timeline(tl);

  tlc.addKeyframeStart();

  triangleSideLengths(tl);

  buildProofSquare(tl);

  alignedSquares(tl);

  compareArrangements(tl);

  buildEquation(tl);

  tlc.addKeyframeEnd();

  tl.eventCallback('onComplete', () => tlc.completed(tl));
}

buildTimeline();
