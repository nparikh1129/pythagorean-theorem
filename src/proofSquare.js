import {GREEN, LIGHT_GREEN} from "./constants.js";
import {A2, B2, C2} from "./defs.js";
import {draw} from "./canvas.js";


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