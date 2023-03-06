import {timelineCoordinator as tlc} from "./timelineCoordinator.js";

let sidenav = document.querySelector("#sidenav");
let sidenavToggle = document.querySelector("#sidenav-toggle");
let contentContainer = document.querySelector("#content-container");

sidenavToggle.addEventListener("click", () => {
  if (contentContainer.style.marginLeft != "250px") {
    sidenav.style.left = "0px";
    contentContainer.style.marginLeft= "250px";
  } else {
    sidenav.style.left = "-250px";
    contentContainer.style.marginLeft= "0px";
  }
});

let triangleSideLengths = document.querySelector("#link-triangle-side-lengths");
triangleSideLengths.onclick = function() {
  tlc.jumpLabel("TriangleSideLengths");
}

let buildProofSquare = document.querySelector("#link-twisted-squares-arrangement");
buildProofSquare.onclick = function() {
  tlc.jumpLabel("BuildProofSquare");
}

let alignedSquaresArrangement = document.querySelector("#link-aligned-squares-arrangement");
alignedSquaresArrangement.onclick = function() {
  tlc.jumpLabel("AlignedSquaresArrangement");
}

let compareArrangements = document.querySelector("#link-compare-arrangements");
compareArrangements.onclick = function() {
  tlc.jumpLabel("CompareArrangements");
}

let buildEquation = document.querySelector("#link-build-equation");
buildEquation.onclick = function() {
  tlc.jumpLabel("BuildEquation");
}


