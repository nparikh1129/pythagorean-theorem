import {WHITE} from "./constants.js";
import {LABEL_FONT} from "./constants.js";
import {A2, B2, C2} from "./defs.js";
import {draw} from "./canvas.js";


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