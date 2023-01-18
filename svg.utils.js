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
  }
});


SVG.extend(SVG.Element, {
  tbox: function() {
    return this.bbox().transform(this.matrix());
  }
});


SVG.TimelineBuilder = class {

  constructor() {
    this._timeline = new SVG.Timeline();
    this._time = 0;
  }

  append(runner, delay = 0) {
    this._time += delay;
    if (!Array.isArray(runner)) {
      runner = [runner];
    }
    let duration = 0;
    for (let r of runner) {
      this._timeline.schedule(r, this._time, 'absolute');
      duration = Math.max(duration, r.duration());
    }
    this._time += duration;
  }

  appendFunction(func, delay = 0) {
    this._time += delay;
    let runner = new SVG.Runner();
    runner.queue(func);
    this._timeline.schedule(runner, this._time, 'absolute');
  }

  play() {
    this._timeline.play();
  }
}