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
  },

  animation: function(duration, delay, when) {
    return this.animate(duration, delay, when).active(false);
  }
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


SVG.TimelineBuilder = class extends SVG.EventTarget {

  constructor({pause = false, unpauseEvent} = {}) {
    super();

    this.config = {
      pause: pause,
      unpauseEvent: unpauseEvent,
    }
    this._timeline = new SVG.Timeline();
    this._time = 0;
    this._active = false;
    this._after;

    this._unpauseHandler = () => {
      if (this._active) {
        this._timeline.play();
      }
    }
    if (unpauseEvent) {
      this.subscribe(unpauseEvent, this._unpauseHandler);
    }
  }

  _halt() {
    this._active = false;
    this._timeline.pause();
  }

  _proceed() {
    this._active = true;
    this._timeline.play();
  }

  play() {
    this._proceed();
  }

  append(runner, {delay = 0, pause = this.config.pause} = {}) {
    if (!Array.isArray(runner)) {
      runner = [runner];
    }
    this._time += delay;
    
    let duration = 0;
    for (let r of runner) {
      this._timeline.schedule(r, this._time, 'absolute');
      r.active(true);
      duration = Math.max(duration, r.duration());
    }
    this._time += duration;

    if (pause) {
      this.appendPause();
    }
  }

  //TODO: Add an option to block the timeline (pause and make unpauseable) until after the function completes
  // queue this in runner () => {this._halt(); func(); this._resume()}
  // Then the default duration can be 0 removed as an option
  appendFunction(func, {delay = 0, pause = false, duration = 20} = {}) {
    this._time += delay;
    let runner = new SVG.Runner();
    runner.queue(func);
    this._timeline.schedule(runner, this._time, 'absolute');
    this._time += duration;

    if (pause) {
      this.appendPause();
    }
  }

  appendPause() {
    let runner = new SVG.Runner();
    runner.queue(() => { this._timeline.pause() });
    this._timeline.schedule(runner, this._time, 'absolute');
    this._time += 20;
  }

  appendTimelineBuilder(tb, {delay = 0, pause = false} = {}) {
    this.appendFunction(() => {
      this._halt()
      tb.appendFunction(() => this._proceed());
      tb.play();
    }, { delay: delay, pause: pause});
  }

  
  // appendFromTimelineBuilder(tb, {delay = 0, pause = false} = {}) {
  //   this._time += delay;

  //   let events = [];
  //   for (let r of tb._timeline._runners) {
  //     events.push({
  //       start: r.start,
  //       runner: r.runner,
  //     });
  //   }
  //   for (let e of events) {
  //     let runner = e.runner;
  //     let time = this._time + e.start;
  //     this._timeline.schedule(runner, time, 'absolute');
  //   }
  //   this._time += tb._time;

  //   if (pause) {
  //     this.appendPause();
  //   }
  // }

}
