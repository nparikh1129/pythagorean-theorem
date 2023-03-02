SVG._getPosition = function(origin, box) {
  origin = origin.toLowerCase();
  let x, y;
  if (origin.includes("left")) {
    x = box.x;
  } else if (origin.includes("right")) {
    x = box.x2;
  } else {
    x = box.cx;
  }
  if (origin.includes("top")) {
    y = box.y; 
  } else if (origin.includes("bottom")) {
    y = box.y2;
  } else {
    y = box.cy;
  }
  return new SVG.Point(x, y);
},

SVG.Box.merge = function(boxes) {
  return boxes.reduce((merged, box) => merged.merge(box));
};
SVG.extend(SVG.Box, {
  // https://stackoverflow.com/questions/20925818/algorithm-to-check-if-two-boxes-overlap
  // TODO: Make static?
  intersectsWith: function(box) {
    let x1min, x1max, y1min, y1max;
    let x2min, x2max, y2min, y2max;

    [x1min, x1max] = this.x <= this.x2 ? [this.x, this.x2] : [this.x2, this.x];
    [y1min, y1max] = this.y <= this.y2 ? [this.y, this.y2] : [this.y2, this.y];
    [x2min, x2max] = box.x <= box.x2 ? [box.x, box.x2] : [box.x2, box.x];
    [y2min, y2max] = box.y <= box.y2 ? [box.y, box.y2] : [box.y2, box.y];

    return (x1min < x2max && x2min < x1max) && (y1min < y2max && y2min < y1max);
  },

  getPosition: function(origin) {
    return SVG._getPosition(origin, this);
  },
});


SVG.extend(SVG.Element, {

  background: function() {
    this.node.dataset.svgBackground = "";
    this.back();
    return this;
  },

  back: function() {
    const parent = this.parent();
    this.remove();

    let index = 0;
    if (parent.node.hasChildNodes()) {
      if ("svgBackground" in parent.node.firstChild.dataset)
        index = 1;
    }
    // Move node to back
    parent.add(this, index);

    return this
  },

  setFill: function(color) {
    gsap.set(this.node, {
      attr: { fill: color },
    });
    return this;
  },

  translateBy: function(dx, dy) {
    gsap.set(this.node, {
      x: "+=" + dx,
      y: "+=" + dy,
    });
    return this;
  },

  getPosition: function(origin) {
    return SVG._getPosition(origin, this.rbox(this.root()));
  },

  setPosition: function(origin, x, y) {
    src = this.getPosition(origin);
    let dx = x - src.x;
    let dy = y - src.y;
    this.translate(dx, dy);
    return this;
  },

  alignPosition: function(origin, elem, elemOrigin) {
    src = this.getPosition(origin);
    dst = elem.getPosition(elemOrigin);
    let dx = dst.x - src.x;
    let dy = dst.y - src.y;
    this.translate(dx, dy);
    // gsap.set(this.node, {
    //   x: "+=" + dx,
    //   y: "+=" + dy,
    // })
    return this;
  },

  alignPositionX: function(origin, elem, elemOrigin, offset = 0) {
    src = this.getPosition(origin);
    dst = elem.getPosition(elemOrigin);
    let dx = (dst.x - src.x) + offset;
    this.translate(dx, 0);
    return this;
  },

  alignPositionY: function(origin, elem, elemOrigin, offset = 0) {
    src = this.getPosition(origin);
    dst = elem.getPosition(elemOrigin);
    let dy = (dst.y - src.y) + offset;
    this.translate(0, dy);
    return this;
  },

  setRotation: function(origin, angle) {
    let pivot = this.getPosition(origin);
    let da = angle - this.transform().rotate;
    this.rotate(da, this.point(pivot.x, pivot.y));
    // gsap.set(this.node, {
    //   transformOrigin: origin,
    //   rotate: "+=" + da,
    // })
    return this;
  },

  scaleToWidth: function(elem) {
    let dst = elem.rbox(elem.root()).w;
    let src = this.rbox(this.root()).w;
    let ds = dst / src;
    this.scale(ds);
    return this;
  },

  getAbsoluteMatrix: function() {
    let m = this.matrix();
    for(let p of this.parents()) {
      m = m.transform(p.matrix());
      if (p === this.root())
        break;
    }
    return m;
  },

  getAbsoluteTransform: function() {
    let m = this.getAbsoluteMatrix();
    let t = m.decompose();
    let keys = ["a", "b", "c", "d", "e", "f", "originX", "originY"];
    keys.forEach(k => delete t[k]);
    return t;
  },

  alignTransform: function(elem) {
    this.transform(elem.getAbsoluteMatrix());
    return this;
  },

  saveState: function() {
    let attrs = this.attr();
    if (!attrs.transform) {
      attrs.transform = "matrix(1,0,0,1,0,0)";
    }
    if (!attrs.opacity) {
      attrs.opacity = 1;
    }
    this.remember("oldAttrs", attrs);
    return this;
  },

  diffState: function(mergeVars = {}, immediate = false) {
    let attr = this.attr();
    this.attr(this.remember("oldAttrs"));
    let vars = { attr: attr }
    let transformVars = {}

    if (!immediate) {
      let m = attr.transform;
      m = m.substring(7, m.length-1);
      let matrix = new SVG.Matrix(m);
      delete attr.transform;
      let t = matrix.decompose();
      transformVars = {
        x: t.translateX,
        y: t.translateY,
        rotate: t.rotate,
        // TODO: Something about the scaling is throwing the positioning off (origin?)
        scaleX: t.scaleX,
        scaleY: t.scaleY,
      }
    }
    Object.assign(vars, transformVars, mergeVars);
    return vars;
  },

  addToTimeline: function(timeline) {
    this.remember("timeline", timeline);
    this.saveState();
    return this;
  },

  to: function(vars = {}) {
    let timeline = this.remember("timeline");
    timeline.to(this.node, this.diffState(vars));
  },

  set: function(vars = {}) {
    let timeline = this.remember("timeline");
    timeline.set(this.node, this.diffState(vars));
  },
});


SVG.EventTarget.pubsubBroker = {};

SVG.extend(SVG.EventTarget, {
  publish: function(event) {
    SVG.EventTarget.pubsubBroker[event] = [];
  },
  subscribe: function(event, handler) {
    SVG.EventTarget.pubsubBroker[event].push(handler)
  },
  broadcast: function(event) {
    SVG.EventTarget.pubsubBroker[event].forEach(function(handler) {
      handler()
    })
  },
});
