export function RouteMotif() {
  return (
    <svg
      className="hero-route-motif"
      viewBox="0 0 1200 640"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <path
        className="motif-bearing motif-bearing-outer"
        d="M920 52a270 270 0 1 1-1 0"
      />
      <path
        className="motif-bearing motif-bearing-inner"
        d="M920 156a166 166 0 1 1-1 0"
      />
      <path
        className="motif-route"
        d="M110 494c145-66 259-12 374-62 117-51 165-158 286-148 83 7 132 72 250 38"
      />
      <path className="motif-bearing-line" d="M770 284 930 102" />
      <circle className="motif-node" cx="268" cy="457" r="8" />
      <circle className="motif-node" cx="770" cy="284" r="8" />
      <circle className="motif-destination" cx="930" cy="102" r="10" />
      <path className="motif-cardinal" d="M930 76v-18m-8 8 8-8 8 8" />
    </svg>
  );
}
