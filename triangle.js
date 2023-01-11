"use strict";

let draw = SVG().addTo('body').size(1000, 500).css({ 'background-color': '#ddd' })


SVG.ResizableRightTriangle = class extends SVG.G {
  
  constructor(maxSize) {
    super();
    
    this._lineA = draw.resizableLine(maxSize, '#007bff');

    this._lineB = draw.resizableLine(maxSize, '#ff3b30').rotate(90, 0, 0);

    this._verts = [
      [0, 0],
      [this._lineA.length, 0],
      [0, this._lineB.length],
    ];

    this._triangle = draw.polygon(this._verts).attr({
      fill: "#9CE1FF",
      stroke: "#34c759",
      'stroke-width': 4,
    });


    this._lineA.on('resize', () => {
      this._verts[1][0] = this._lineA.length;
      this._triangle.plot(this._verts);
    });

    this._lineB.on('resize', () => {
      this._verts[2][1] = this._lineB.length;
      this._triangle.plot(this._verts);
    });


    this.add(this._lineA);
    this.add(this._lineB);
    this.add(this._triangle);

    this._triangle.back();
  }
}
SVG.extend(SVG.Container, {
  resizableRightTriangle: function(maxLength) {
    return this.put(new SVG.ResizableRightTriangle(maxLength))
  }
});


SVG.ResizableLine = class extends SVG.G {
  
  constructor(maxLength, color = "#000") {
    super();

    this.maxLength = maxLength;
    this.minLength = 8;

    
    this._line = draw.line(0, 0, maxLength, 0).stroke({
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
    }).center(maxLength, 0).draggable();

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
      
      let x = box.cx;
      if (box.cx <= this.minLength) {
        x = this.minLength;
      }
      else if (box.cx >= this.maxLength) {
        x = this.maxLength;
      }
      handler.el.center(x, 0);
      this._line.attr('x2', x);
      this.fire('resize')
    })

    this.add(this._line);
    this.add(this._resizeHandle);
  }

  get length() {
    return this._line.attr('x2');
  }
}
SVG.extend(SVG.Container, {
  resizableLine: function(maxLength, color) {
    return this.put(new SVG.ResizableLine(maxLength, color))
  }
});


let triangle = draw.resizableRightTriangle(200).animate(1000).translate(200, 400).rotate(-90, 0, 0)

// let rightAngleBox = draw.rect(15, 15)
// rightAngleBox.attr({
//   'fill-opacity': 0,
//   stroke: '#3a3a3c',
//   'stroke-width': 1,
// })
// rightAngleBox.dx(xMin)
// rightAngleBox.dy(yPos - rightAngleBox.height())


