import React from 'react';

interface RadarChartProps {
  scores: {
    glycemic: number;
    adiposity: number;
    cardiovascular: number;
    lifestyle: number;
    hereditaryAge: number;
    symptomatic: number;
  };
}

export const RadarChart: React.FC<RadarChartProps> = ({ scores }) => {
  const axes = [
    { label: 'Glycemic', value: scores.glycemic, angle: 0 },
    { label: 'Adiposity', value: scores.adiposity, angle: 60 },
    { label: 'Cardiovascular', value: scores.cardiovascular, angle: 120 },
    { label: 'Lifestyle Risk', value: scores.lifestyle, angle: 180 },
    { label: 'Age & Genetics', value: scores.hereditaryAge, angle: 240 },
    { label: 'Symptom Load', value: scores.symptomatic, angle: 300 },
  ];

  const size = 300;
  const center = size / 2;
  const radius = 105;

  const getCoordinates = (value: number, angleDeg: number) => {
    const angleRad = (angleDeg - 90) * (Math.PI / 180);
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angleRad);
    const y = center + r * Math.sin(angleRad);
    return { x, y };
  };

  const getLabelCoordinates = (angleDeg: number) => {
    const angleRad = (angleDeg - 90) * (Math.PI / 180);
    const r = radius + 26;
    const x = center + r * Math.cos(angleRad);
    const y = center + r * Math.sin(angleRad);
    return { x, y };
  };

  const polygonPoints = axes
    .map(axis => {
      const { x, y } = getCoordinates(axis.value, axis.angle);
      return `${x},${y}`;
    })
    .join(' ');

  // Reference rings
  const rings = [25, 50, 75, 100];

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background grid rings */}
        {rings.map((ringVal) => {
          const ringPoints = axes
            .map(axis => {
              const { x, y } = getCoordinates(ringVal, axis.angle);
              return `${x},${y}`;
            })
            .join(' ');
          return (
            <polygon
              key={ringVal}
              points={ringPoints}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray={ringVal === 50 ? '3,3' : 'none'}
            />
          );
        })}

        {/* Spokes */}
        {axes.map((axis, i) => {
          const { x, y } = getCoordinates(100, axis.angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          );
        })}

        {/* Shaded Risk Polygon */}
        <polygon
          points={polygonPoints}
          fill="rgba(239, 68, 68, 0.22)"
          stroke="#dc2626"
          strokeWidth="2.5"
          className="transition-all duration-500 ease-out"
        />

        {/* Data points */}
        {axes.map((axis, i) => {
          const { x, y } = getCoordinates(axis.value, axis.angle);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4.5"
              fill="#dc2626"
              stroke="#ffffff"
              strokeWidth="2"
              className="transition-all duration-500 ease-out"
            />
          );
        })}

        {/* Axis Labels */}
        {axes.map((axis, i) => {
          const { x, y } = getLabelCoordinates(axis.angle);
          const isLeft = x < center - 10;
          const isRight = x > center + 10;
          const textAnchor = isLeft ? 'end' : isRight ? 'start' : 'middle';

          return (
            <text
              key={i}
              x={x}
              y={y + 4}
              textAnchor={textAnchor}
              className="text-[11px] font-medium fill-slate-600 select-none"
            >
              {axis.label} ({axis.value}%)
            </text>
          );
        })}
      </svg>
    </div>
  );
};
