export const draw = SVG()
  .addTo('#canvas')
  .viewbox(0, 0, 1200, 900)



  let pattern = draw.pattern(100, 100, function(add) {
    add.rect(100,100).attr({
      fill: "#1c1c1e",
      stroke: "#48484a",
      'stroke-width': 0.8,
    })
  });

  let background = draw.rect(4800, 3600).fill(pattern).move(-1800, -1350);

  let circ = draw.circle(10).fill("blue").center(0, 0)


  document.addEventListener('keydown', function(e) {
    if (e.repeat) {
      return;
    }
    if (e.key == "ArrowUp") {
      gsap.to("svg", {
        attr:{viewBox:"0 0 1200 900"},
        ease:"none",
        duration: 1,
      })
    }
    else if (e.key == "ArrowDown") {
      gsap.to("svg", {
        // attr:{viewBox:"300 225 600 450"},
        attr:{viewBox:"0 0 960 720"},
        ease:"none",
        duration: 1,
      })
    }
  });
  