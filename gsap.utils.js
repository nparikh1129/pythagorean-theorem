gsap.registerEffect({
  name: "fadeIn",
  effect: (targets, config) => {
      return gsap.fromTo(targets, {
        display: "none",
        attr: { opacity: 0 },
      }, {
        display: "",
        attr: { opacity: 1 },
        duration: config.duration,
      });
  },
  defaults: {duration: 1},
  extendTimeline: true,
});

gsap.registerEffect({
  name: "fadeOut",
  effect: (targets, config) => {
      return gsap.fromTo(targets, {
        attr: { opacity: 1 },
      }, {
        attr: { opacity: 0 },
        display: "none",
        duration: config.duration,
      });
  },
  defaults: {duration: 1},
  extendTimeline: true,
});