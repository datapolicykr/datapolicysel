"use client";

import { KOREA_MAP_PATHS } from "./korea-map-trace";

// KOREA_MAP_PATHS가 실제로 사용하는 좌표 범위에 맞춘 지역 중심점.
// viewBox(70 45 850 1440) 기준으로 지도와 마커가 같은 좌표계를 공유한다.
const REGION_COORDINATES: Record<string, { x: number; y: number }> = {
  "서울": { x: 368, y: 335 },
  "경기": { x: 461, y: 421 },
  "인천": { x: 283, y: 421 },
  "강원": { x: 640, y: 263 },
  "충북": { x: 521, y: 569 },
  "충남": { x: 368, y: 656 },
  "세종": { x: 427, y: 670 },
  "대전": { x: 444, y: 756 },
  "전북": { x: 427, y: 915 },
  "전남": { x: 317, y: 1145 },
  "광주": { x: 342, y: 1044 },
  "경북": { x: 665, y: 627 },
  "경남": { x: 563, y: 999 },
  "대구": { x: 648, y: 785 },
  "울산": { x: 725, y: 899 },
  "부산": { x: 691, y: 1086 },
  "제주": { x: 317, y: 1318 },
};

interface RegionalData {
  region: string;
  count: number;
}

export function RegionalMapChart({ regions, max }: { regions: RegionalData[]; max: number }) {
  const regionMap = new Map(regions.map(r => [r.region, r.count]));
  const safeMax = Math.max(1, max);

  return (
    <div className="regional-map-container">
      <svg
        viewBox="70 45 850 1440"
        width="100%"
        height="auto"
        className="korea-map-svg"
        preserveAspectRatio="xMidYMid meet"
        style={{ maxWidth: "600px", margin: "0 auto", display: "block" }}
      >
        <defs>
          <style>{`
            .map-path {
              fill: #eeeeee;
              stroke: #ffffff;
              stroke-width: 4;
              stroke-linejoin: round;
            }
            .region-marker {
              cursor: pointer;
            }
            .region-marker circle {
              transition: filter .15s ease, opacity .15s ease;
            }
            .region-marker:hover circle {
              filter: drop-shadow(0 0 12px rgba(230, 85, 24, 0.55));
            }
            .region-marker text {
              font-size: 24px;
              font-weight: 900;
              text-anchor: middle;
              dominant-baseline: middle;
              pointer-events: none;
              fill: #333;
            }
            .region-name {
              font-size: 20px !important;
              font-weight: 800 !important;
              fill: #555 !important;
            }
          `}</style>
        </defs>

        {KOREA_MAP_PATHS.map((path, idx) => (
          <path key={idx} d={path} className="map-path" />
        ))}

        {Object.entries(REGION_COORDINATES).map(([region, coords]) => {
          const count = regionMap.get(region) || 0;
          const opacity = count === 0 ? 0.18 : Math.min(0.42 + (count / safeMax) * 0.58, 1);
          const radius = count === 0 ? 18 : Math.max(24, 24 + (count / safeMax) * 34);
          const color = count === 0 ? "#bdbdbd" : "#e65518";

          return (
            <g key={region} className="region-marker">
              <circle
                cx={coords.x}
                cy={coords.y}
                r={radius}
                fill={color}
                opacity={opacity}
                stroke="#fff"
                strokeWidth="5"
              />
              <text x={coords.x} y={coords.y}>
                {count > 0 ? count : "-"}
              </text>
              <text className="region-name" x={coords.x} y={coords.y + radius + 28}>
                {region}
              </text>
              <title>{`${region}: ${count}건`}</title>
            </g>
          );
        })}
      </svg>

      <div className="regional-map-legend">
        <div className="legend-item">
          <span className="legend-color active"></span>
          <span>조사 수행 지역</span>
        </div>
        <div className="legend-item">
          <span className="legend-color inactive"></span>
          <span>조사 미수행 지역</span>
        </div>
        <p className="legend-note">원의 크기: 조사 건수</p>
      </div>

      <style>{`
        .regional-map-container{padding:14px 18px 12px;background:#fff;border-radius:8px}
        .korea-map-svg{border:0;border-radius:4px;overflow:visible}
        .regional-map-legend{margin-top:10px;padding:10px 12px;background:#f9f9f9;border-radius:6px;font-size:12px;display:flex;align-items:center;gap:18px;flex-wrap:wrap}
        .legend-item{display:flex;align-items:center;gap:7px}
        .legend-color{width:14px;height:14px;border-radius:50%;display:inline-block;border:1px solid #ccc}
        .legend-color.active{background:#e65518}.legend-color.inactive{background:#bdbdbd;opacity:.5}
        .legend-note{font-size:11px;color:#666;margin:0 0 0 auto}
      `}</style>
    </div>
  );
}
