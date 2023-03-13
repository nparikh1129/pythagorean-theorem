const heading = document.querySelector("#heading")

export const updateHeading = function(timeline, newHeading) {
  timeline.to(heading, {
    opacity: 0,
    duration: 0.5,
  });
  timeline.set(heading, {
    innerHTML: newHeading,
  });
  timeline.to(heading, {
    opacity: 1,
    duration: 0.5,
  });
}