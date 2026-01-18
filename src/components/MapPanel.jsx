import mapContent from "../data/mapContent";

export default function MapPanel() {
  return (
    <div className="w-full">
      <div className="border-b border-[rgba(90,50,20,0.4)] pb-4 text-center text-[#2a160c]">
        <p className="text-[11px] uppercase tracking-[3px] text-[rgba(70,40,20,0.7)]">
          {mapContent.header.strapline}
        </p>
        <h2 className="text-[28px] uppercase tracking-[2px]">
          {mapContent.header.title}
        </h2>
        <p className="mt-1 text-[12px] uppercase tracking-[2px] text-[rgba(70,40,20,0.7)]">
          {mapContent.header.subtitle}
        </p>
      </div>

      <div className="mt-6 w-full overflow-hidden rounded-[12px] border border-[rgba(90,50,20,0.45)] bg-[rgba(30,18,10,0.08)] p-3 shadow-[inset_0_0_30px_rgba(60,35,15,0.25)]">
        <svg
          viewBox="0 0 1536 1024"
          className="h-auto w-full"
          aria-label="Mapa del reino"
        >
          <image href="/map.png" x="0" y="0" width="1536" height="1024" />

          {mapContent.points.map((point) => (
            <g key={point.id} className="map-point">
              <a href={point.href}>
                <circle
                  className="map-point-core"
                  cx={point.x}
                  cy={point.y}
                  r="10"
                />
                <circle
                  className="map-point-ring"
                  cx={point.x}
                  cy={point.y}
                  r="24"
                />
                <circle
                  className="map-point-wave"
                  cx={point.x}
                  cy={point.y}
                  r="14"
                />
                <text
                  x={point.x + 18}
                  y={point.y - 18}
                  className="map-point-label"
                >
                  {point.label}
                </text>
                <g transform={`translate(${point.x + 22} ${point.y - 12})`}>
                  <g className="map-tooltip">
                    <rect x="0" y="0" width="190" height="48" rx="8" />
                    <text x="12" y="20" className="map-tooltip-title">
                      {point.label}
                    </text>
                    <text x="12" y="36" className="map-tooltip-detail">
                      {point.detail}
                    </text>
                  </g>
                </g>
              </a>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
