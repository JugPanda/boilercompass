import {
  buildChartPoints,
  buildLinePath,
  formatCount,
} from "@/lib/analytics/activity-ui";

type ChartSeries = {
  label: string;
  values: number[];
  style: "solid-circle" | "dashed-square";
};

type ActivityChartProps = {
  id: string;
  title: string;
  description: string;
  summary: string;
  labels: string[];
  firstColumnLabel: string;
  series: ChartSeries[];
};

const width = 640;
const height = 240;
const padding = 32;

export function ActivityChart({
  id,
  title,
  description,
  summary,
  labels,
  firstColumnLabel,
  series,
}: ActivityChartProps) {
  const domainValues = [0, ...series.flatMap((item) => item.values)];
  const maxValue = Math.max(...domainValues);
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;

  return (
    <figure className="activity-chart" data-testid={`${id}-chart`}>
      <div className="activity-chart-heading">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <ul className="activity-chart-legend" aria-label={`${title} legend`}>
          {series.map((item) => (
            <li key={item.label}>
              <span className={`legend-key ${item.style}`} aria-hidden="true" />
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      {labels.length > 0 ? (
        <div className="activity-chart-plot">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-labelledby={`${titleId} ${descriptionId}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <title id={titleId}>{title}</title>
            <desc id={descriptionId}>
              {description} {summary}
            </desc>
            {[padding, height / 2, height - padding].map((y) => (
              <line
                key={y}
                className="chart-grid-line"
                x1={padding}
                x2={width - padding}
                y1={y}
                y2={y}
              />
            ))}
            <text className="chart-axis-label" x={padding} y={padding - 9}>
              {formatCount(maxValue)}
            </text>
            <text
              className="chart-axis-label"
              x={padding}
              y={height - padding + 18}
            >
              0
            </text>
            {series.map((item) => {
              const points = buildChartPoints(
                item.values,
                width,
                height,
                padding,
                domainValues,
              );
              return (
                <g key={item.label} className={`chart-series ${item.style}`}>
                  <path d={buildLinePath(points)} />
                  {points.map((point, index) =>
                    item.style === "dashed-square" ? (
                      <rect
                        key={`${point.x}-${point.y}-${index}`}
                        x={point.x - 3}
                        y={point.y - 3}
                        width="6"
                        height="6"
                      />
                    ) : (
                      <circle
                        key={`${point.x}-${point.y}-${index}`}
                        cx={point.x}
                        cy={point.y}
                        r="3"
                      />
                    ),
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      ) : (
        <p className="activity-empty-chart">
          No exact samples are available for this chart yet.
        </p>
      )}

      <figcaption>
        <p className="activity-chart-summary">{summary}</p>
        <details>
          <summary>View exact values</summary>
          <div className="activity-table-wrap">
            <table>
              <caption>{title} exact values</caption>
              <thead>
                <tr>
                  <th scope="col">{firstColumnLabel}</th>
                  {series.map((item) => (
                    <th scope="col" key={item.label}>
                      {item.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {labels.map((label, index) => (
                  <tr key={`${label}-${index}`}>
                    <th scope="row">{label}</th>
                    {series.map((item) => (
                      <td key={item.label}>
                        {formatCount(item.values[index] ?? null)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </figcaption>
    </figure>
  );
}
