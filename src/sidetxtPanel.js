let panel = document.querySelector("#sidetxt");
let toggle = document.querySelector("#sidetxt-toggle");
let resizer = document.querySelector("#sidetxt-resizer");
let container = document.querySelector("#content-container");

let widthPx = "500px";
let width = 0;
let totalWidth = document.body.getBoundingClientRect().width;
let panelTransition = panel.style.transition;
let containerTransition = container.style.transition;

toggle.addEventListener("click", () => {
  if (panel.style.right != "0px") {
    // Open panel
    panel.style.right = "0px";
    panel.style.width = widthPx;
    container.style.marginRight = widthPx;
  } else {
    // Close panel
    panel.style.right = `-${widthPx}`;
    container.style.marginRight = "0px";
  }
});

resizer.addEventListener('mousedown', function (e) {
  // Save current state
  width = panel.getBoundingClientRect().width;
  totalWidth = document.body.getBoundingClientRect().width;
  panelTransition = panel.style.transition;
  containerTransition = container.style.transition;

  // Set new state for the rezising action
  panel.style.transition = "0s";
  container.style.transition = "0s";
  document.body.style.cursor = 'col-resize';

  // Attach the listeners to `document`
  document.addEventListener('mousemove', mouseMoveHandler);
  document.addEventListener('mouseup', mouseUpHandler);
});

const mouseMoveHandler = function (e) {
  width = totalWidth - e.clientX;
  widthPx = `${width}px`
  panel.style.width = widthPx;
  container.style.marginRight = widthPx;
};

const mouseUpHandler = function () {
  // Restore state to before resize action
  panel.style.transition = panelTransition;
  container.style.transition = containerTransition;
  document.body.style.removeProperty('cursor');

  // Remove the handlers of `mousemove` and `mouseup`
  document.removeEventListener('mousemove', mouseMoveHandler);
  document.removeEventListener('mouseup', mouseUpHandler);
};


