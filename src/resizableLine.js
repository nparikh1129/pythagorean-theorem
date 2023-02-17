import {draw} from "./canvas.js";

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