import {LABEL_FONT, LABEL_EXPONENT_FONT, WHITE} from "./constants.js";
import {draw} from "./canvas.js";


export const A2 = draw.text(function(add) {
  add.tspan('a').font(LABEL_FONT)
  add.tspan('2').font(LABEL_EXPONENT_FONT)
}).fill(WHITE).center(0, 0);
draw.defs().add(A2);

export const B2 = draw.text(function(add) {
  add.tspan('b').font(LABEL_FONT)
  add.tspan('2').font(LABEL_EXPONENT_FONT)
}).fill(WHITE).center(0, 0);
draw.defs().add(B2);

export const C2 = draw.text(function(add) {
  add.tspan('c').font(LABEL_FONT)
  add.tspan('2').font(LABEL_EXPONENT_FONT)
}).fill(WHITE).center(0, 0);
draw.defs().add(C2);