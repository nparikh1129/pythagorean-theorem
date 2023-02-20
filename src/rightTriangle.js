import {RED, BLUE, LIGHT_BLUE, DARK_GRAY, GRAY, WHITE} from "./constants.js";
import {LABEL_FONT} from "./constants.js";
import {draw} from "./canvas.js";

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