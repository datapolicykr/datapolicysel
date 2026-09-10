"use client";

import { KOREA_MAP_PATHS } from "./korea-map-trace";

// 주요 지역의 대략적인 좌표 (SVG 좌표계 기준)
const REGION_COORDINATES: Record<string, { x: number; y: number }> = {
  "서울": { x: 350, y: 250 },
  "경기": { x: 300, y: 280 },
  "인천": { x: 250, y: 220 },
  "강원": { x: 420, y: 180 },
  "충북": { x: 360, y: 380 },
  "충남": { x: 320, y: 420 },
  "세종": { x: 340, y: 360 },
  "대전": { x: 340, y: 380 },
  "전북": { x: 280, y: 480 },
  "전남": { x: 240, y: 560 },
  "광주": { x: 260, y: 520 },
  "경북": { x: 480, y: 350 },
  "경남": { x: 480, y: 520 },
  "대구": { x: 460, y: 380 },
  "울산": { x: 520, y: 400 },
  "부산": { x: 500, y: 480 },
  "제주": { x: 280, y: 750 },
};

interface RegionalData {
  region: string;
  count: number;
}

export function RegionalMapChart({ regions, max }: { regions: RegionalData[]; max: number }) {
  // 지역별 데이터 맵 만들기
  const regionMap = new Map(regions.map(r => [r.region, r.count]));

  return (
    <div className="regional-map-container">
      <svg
        viewBox="0 0 900 1500"
        width="100%"
        height="auto"
        className="korea-map-svg"
        style={{ maxWidth: "600px", margin: "0 auto", display: "block" }}
      >
        {/* 지도 배경 */}
        <defs>
          <style>{`
            .map-path {
              fill: #f0f0f0;
              stroke: #999;
              stroke-width: 1;
            }
            .region-marker {
              cursor: pointer;
              transition: all 0.2s ease;
            }
            .region-marker:hover circle {
              r: 35;
              filter: drop-shadow(0 0 10px rgba(230, 85, 24, 0.6));
            }
            .region-marker text {
              font-size: 11px;
              font-weight: bold;
              text-anchor: middle;
              dominant-baseline: middle;
              pointer-events: none;
              fill: #333;
            }
          `}</style>
        </defs>

        {/* 지도 경로 */}
        {KOREA_MAP_PATHS.map((path, idx) => (
          <path key={idx} d={path} className="map-path" />
        ))}

        {/* 지역 마커 */}
        {Object.entries(REGION_COORDINATES).map(([region, coords]) => {
          const count = regionMap.get(region) || 0;
          const opacity = count === 0 ? 0.3 : Math.min(0.3 + (count / max) * 0.7, 1);
          const radius = Math.max(15, 15 + (count / max) * 25);
          const color = count === 0 ? "#ddd" : "#e65518";

          return (
            <g key={region} className="region-marker">
              <circle
                cx={coords.x}
                cy={coords.y}
                r={radius}
                fill={color}
                opacity={opacity}
                stroke="#fff"
                strokeWidth="2"
              />
              <text x={coords.x} y={coords.y}>
                {count > 0 ? count : "-"}
              </text>
              <title>{`${region}: ${count}건`}</title>
            </g>
          );
        })}
      </svg>

      <div className="regional-map-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: "#e65518" }}></span>
          <span>조사 수행 지역</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: "#ddd" }}></span>
          <span>조사 미수행 지역</span>
        </div>
        <p className="legend-note">원의 크기: 조사 건수</p>
      </div>

      <style>{`
        .regional-map-container {
          padding: 20px;
          background: #fff;
          border-radius: 8px;
        }
        .korea-map-svg {
          border: 1px solid #e0e0e0;
          border-radius: 4px;
        }
        .regional-map-legend {
          margin-top: 20px;
          padding: 12px;
          background: #f9f9f9;
          border-radius: 4px;
          font-size: 13px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .legend-item:last-of-type {
          margin-bottom: 0;
        }
        .legend-color {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: inline-block;
          border: 1px solid #ccc;
        }
        .legend-note {
          font-size: 12px;
          color: #666;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
}
