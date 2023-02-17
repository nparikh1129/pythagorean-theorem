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
      console.log('playing');
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

let jumpPrev = draw.rect(50, 50).fill("red");
jumpPrev.on("click", () => {
  timelineCoordinator.jumpPrev();
})

let playReverse = draw.rect(50, 50).fill("green").translate(50, 0);
playReverse.on("click", () => {
  timelineCoordinator.playReverse();
})

let play = draw.rect(50, 50).fill("blue").translate(100, 0);
play.on("click", () => {
  timelineCoordinator.play();
})

let jumpNext = draw.rect(50, 50).fill("yellow").translate(150, 0);
jumpNext.on("click", () => {
  timelineCoordinator.jumpNext();
})
