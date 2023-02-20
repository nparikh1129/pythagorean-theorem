export const draw = SVG()
  .addTo('body')
  .size(document.body.clientWidth, window.visualViewport.height)
  .css({ 'background-color': '#1c1c1e' });

// export const draw = SVG()
//   .addTo('body')
//   .attr({ width: "100%", height: "100%" })
//   .css({ 'background-color': '#1c1c1e' })
//   .viewbox(0, 0, 1200, 900);

window.addEventListener("resize", () => {
  draw.size(document.body.clientWidth, window.visualViewport.height)
})