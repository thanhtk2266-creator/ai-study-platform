"use client";

import { useMemo, useState } from "react";
import type { ScoreHistoryItem } from "@/types";
import { formatDate } from "@/lib/utils";

interface ScoreChartProps {
  data: ScoreHistoryItem[];
}

/**
 * Biểu đồ đường thể hiện điểm số (thang 10) theo thời gian.
 * Vẽ bằng SVG thuần để không cần thêm dependency.
 */
export function ScoreChart({ data }: ScoreChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const width = 720;
  const height = 260;
  const padding = { top: 20, right: 20, bottom: 36, left: 40 };

  const { points, path, areaPath, yTicks } = useMemo(() => {
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;
    const n = data.length;

    const step = n > 1 ? innerW / (n - 1) : 0;
    const xs = data.map((_, i) => padding.left + (n > 1 ? i * step : innerW / 2));
    const ys = data.map((d) =>
      padding.top + innerH - (d.score / 10) * innerH
    );

    const pts = data.map((d, i) => ({ x: xs[i], y: ys[i], item: d }));

    const pathD = pts
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(" ");

    const areaD =
      pts.length > 0
        ? `${pathD} L${pts[pts.length - 1].x.toFixed(1)},${padding.top + innerH} L${pts[0].x.toFixed(1)},${padding.top + innerH} Z`
        : "";

    const ticks = [0, 2.5, 5, 7.5, 10].map((v) => ({
      value: v,
      y: padding.top + innerH - (v / 10) * innerH,
    }));

    return { points: pts, path: pathD, areaPath: areaD, yTicks: ticks };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-gray-400">
        Chưa có dữ liệu — hãy làm bài đầu tiên để thấy tiến độ của bạn
      </div>
    );
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label="Biểu đồ tiến bộ điểm số"
      >
        <defs>
          <linearGradient id="scoreArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Lưới ngang + nhãn trục Y */}
        {yTicks.map((tick) => (
          <g key={tick.value}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={tick.y}
              y2={tick.y}
              stroke="#e5e7eb"
              strokeDasharray="4 4"
            />
            <text
              x={padding.left - 8}
              y={tick.y + 4}
              textAnchor="end"
              className="fill-gray-400 text-[11px]"
            >
              {tick.value}
            </text>
          </g>
        ))}

        {/* Vùng nền + đường điểm */}
        <path d={areaPath} fill="url(#scoreArea)" />
        <path
          d={path}
          fill="none"
          stroke="#6366f1"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Các điểm dữ liệu */}
        {points.map((p, i) => (
          <g key={p.item.attempt_id}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hovered === i ? 6 : 4}
              fill="#fff"
              stroke="#6366f1"
              strokeWidth="2.5"
              className="transition-all"
            />
            {/* Vùng bắt hover to hơn chấm */}
            <rect
              x={p.x - 20}
              y={0}
              width={40}
              height={height}
              fill="transparent"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          </g>
        ))}

        {/* Nhãn thời gian: hiện tối đa 6 mốc đều nhau */}
        {points
          .filter((_, i) => {
            const stride = Math.max(1, Math.ceil(points.length / 6));
            return i % stride === 0 || i === points.length - 1;
          })
          .map((p) => (
            <text
              key={`label-${p.item.attempt_id}`}
              x={p.x}
              y={height - 10}
              textAnchor="middle"
              className="fill-gray-400 text-[11px]"
            >
              {new Date(p.item.submitted_at).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
              })}
            </text>
          ))}
      </svg>

      {/* Tooltip */}
      {hovered !== null && points[hovered] && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg"
          style={{
            left: `${(points[hovered].x / width) * 100}%`,
            top: 0,
          }}
        >
          <p className="max-w-[220px] truncate font-semibold text-gray-900">
            {points[hovered].item.quiz_title}
          </p>
          <p className="mt-0.5 text-gray-500">
            {points[hovered].item.correct_count}/{points[hovered].item.total_questions} câu đúng
            · {points[hovered].item.score.toFixed(1)}/10
          </p>
          <p className="text-gray-400">{formatDate(points[hovered].item.submitted_at)}</p>
        </div>
      )}
    </div>
  );
}
