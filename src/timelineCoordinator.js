import { draw } from "./canvas.js";


class TimelineCoordinator {

  constructor() {
    this.tl;
    this.data = {};
    this.keyframeIndex = 0;
  }

  timeline(tl) {
    if (tl) {
      this.tl = tl;
    }
    else {
      return this.tl;
    }
  }

  completed(tl) {
    console.log('completed');
  }

  play() {
    if (this.tl.paused() || this.tl.reversed()) {
      this.tl.play();
    }
    else {
      this.jumpNext();
    }
  }

  playReverse() {
    if (this.tl.paused() || !this.tl.reversed()) {
      this.tl.reverse();
    }
    else {
      this.jumpPrev();
    }
  }

  jumpNext() {
    let label = this.tl.nextLabel();
    if (label) {
      this.tl.seek(label, false);
    }
  }

  jumpPrev() {
    let label = this.tl.previousLabel();
    if (label) {
      this.tl.seek(label, false);
    }
  }

  jumpLabel(label) {
    this.tl.seek(label, false);
  }

  addKeyframe({pause = true, label = null} = {}) {
    if (!label) {
      label = "kf-" + this.keyframeIndex++;
    }
    this.tl.addLabel(
      label,
      "+=0.0001"
    );
    if (pause) {
      this.tl.addPause();
    }
    this.tl.add(() => {}, "+=0.0001");
    this.tl.seek("+=0", false);
  }

  addKeyframeStart() {
    this.addKeyframe({ pause: false });
  }

  addKeyframeEnd(seek = true) {
    this.addKeyframe({ pause: false });
    this.tl.seek(0, false);
    this.tl.invalidate();
  }

  applyChanges() {
    this.tl.add(() => {}, "+=0.0001");
    this.tl.seek("+=0", false);
  }
}

export const timelineCoordinator = new TimelineCoordinator();

let back = document.getElementById("button-back");
back.addEventListener("click" , () => {
  timelineCoordinator.playReverse();
});

let next = document.getElementById("button-next");
next.addEventListener("click" , () => {
  timelineCoordinator.play();
});

document.addEventListener('keydown', function(e) {
  if (e.repeat) {
    return;
  }
  if (e.key == "ArrowRight") {
    timelineCoordinator.play();
  }
  else if (e.key == "ArrowLeft") {
    timelineCoordinator.playReverse();
  }
});
