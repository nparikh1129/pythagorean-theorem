export const draw = SVG()
  .id("canvas")
  .addTo('#canvas-container')
  .viewbox(0, 0, 1200, 900)



// Set up the background layer
let pattern = draw.pattern(100, 100, function(add) {
  add.rect(100,100).attr({
    fill: "#1c1c1e",
    stroke: "#48484a",
    'stroke-width': 0.8,
  })
});

draw.rect(4800, 3600)
  .fill(pattern)
  .move(-1800, -1350)
  .background()

// TODO: Remove this edit mode helper
draw.circle(10).fill("gray").center(0, 0)


// Viewbox animation helper
const Viewbox = class {

  static width = 1200;
  static height = 900;

  static animation(vars) {
    let viewbox = draw.viewbox();

    let zoomFactor = vars.zoomFactor ?? (Viewbox.width / viewbox.w);
    let width = Viewbox.width / zoomFactor;
    let height = Viewbox.height / zoomFactor;

    let [cx, cy] = [viewbox.cx, viewbox.cy];
    if (vars.element && vars.origin) {
      const pos = vars.element.getPosition(vars.origin);
      cx = pos.x;
      cy = pos.y;
    }
    else {
      if (vars.cx != undefined && vars.cx != null) {
        cx = vars.cx;
      }
      if (vars.cy != undefined && vars.cy != null) {
        cy = vars.cy;
      }
    }
    let x = cx - (width / 2);
    let y = cy - (height / 2);

    const value = `${x} ${y} ${width} ${height}`;
    return gsap.to(draw.node, {
      attr:{viewBox: value},
      ease:"none",
      duration: 1,
    })
  }

  static reset() {
    const value = `0 0 ${Viewbox.width} ${Viewbox.height}`;
    return gsap.to(draw.node, {
      attr:{viewBox: value},
      ease:"none",
      duration: 1,
    })
  }
}
export {Viewbox as viewbox};





document.addEventListener('keydown', function(e) {
  if (e.repeat) {
    return;
  }
  if (e.key == "ArrowUp") {
    gsap.to(draw.node, {
      attr:{viewBox:"0 0 1200 900"},
      ease:"none",
      duration: 1,
    })
  }
  else if (e.key == "ArrowDown") {
    gsap.to("#canvas", {
      attr:{viewBox:"0 0 960 720"},
      ease:"none",
      duration: 1,
    })
  }
});
  