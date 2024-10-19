import {timelineCoordinator as tlc} from "./timelineCoordinator.js";


ScrollTrigger.create({
  markers: true,
  scroller: "#sidetxt-content",
  trigger: "#hr1",
  start: "top+=10px ",
  // end: "bottom-=10px 50%+=100px",
  onEnter: self => tlc.play(),
  onEnterBack: () => tlc.playReverse(),
});

// let sidetxt = document.querySelector("#sidetxt-content")
// sidetxt.addEventListener('scroll', function() {
//   console.log(sidetxt.scrollTop);
// });