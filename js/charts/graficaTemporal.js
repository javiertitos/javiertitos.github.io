export function graficaTemporal(data, order = "normal") {

  // Tamaño del gráfico
  const width = 900;
  const height = 700;

  // Márgenes gráfico
  const margin = {
    top: 100,
    right: 150,
    bottom: 90,
    left: 75
  };

  // Creación del contenedor SVG donde se dibuja el gráfico
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Tooltip para mostrar información al pasar el ratón
  const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "rgba(0,0,0,0.8)")
    .style("color", "white")
    .style("padding", "6px 10px")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  // Título principal del gráfico
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 50)
    .attr("text-anchor", "middle")
    .style("font-size", "32px")
    .style("font-weight", "bold")
    .text("Número de reservas por semana 2015-2017");

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const color = {
    "2015 - City Hotel": "steelblue",
    "2015 - Resort Hotel": "blue",
    "2016 - City Hotel": "seagreen",
    "2016 - Resort Hotel": "green",
    "2017 - City Hotel": "salmon",
    "2017 - Resort Hotel": "red"
  };

  let keys = Object.keys(color);

  if (order === "reverse") {
    keys = [
      "2015 - Resort Hotel",
      "2015 - City Hotel",
      "2016 - Resort Hotel",
      "2016 - City Hotel",
      "2017 - Resort Hotel",
      "2017 - City Hotel"
    ];
  }

  // Agrupación por semana
  const grouped = d3.groups(data, d => d.week);

  // Mapa semana → mes-año
  const weekToMonth = new Map();

  const dataset = grouped.map(([week, values]) => {

    const obj = {
      week,
      "2015 - City Hotel": 0,
      "2015 - Resort Hotel": 0,
      "2016 - City Hotel": 0,
      "2016 - Resort Hotel": 0,
      "2017 - City Hotel": 0,
      "2017 - Resort Hotel": 0
    };

    const monthCount = new Map();

    values.forEach(v => {
      const key = `${v.arrival_date_year} - ${v.hotel}`;
      if (obj[key] !== undefined) obj[key]++;

      monthCount.set(v.year_month, (monthCount.get(v.year_month) || 0) + 1);
    });

    const bestMonth = [...monthCount.entries()]
      .sort((a, b) => d3.descending(a[1], b[1]))[0]?.[0];

    weekToMonth.set(week, bestMonth);

    return obj;
  });

  dataset.sort((a, b) => d3.ascending(a.week, b.week));

  const stack = d3.stack().keys(keys);
  const series = stack(dataset);

  const x = d3.scaleBand()
    .domain(dataset.map(d => d.week))
    .range([0, innerWidth])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(dataset, d =>
      keys.reduce((s, k) => s + d[k], 0)
    )])
    .nice()
    .range([innerHeight, 0]);

  g.selectAll("g.layer")
    .data(series)
    .join("g")
    .attr("fill", d => color[d.key])
    .selectAll("rect")
    .data(d => d)
    .join("rect")
    .attr("x", d => x(d.data.week))
    .attr("y", d => y(d[1]))
    .attr("height", d => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth())
    .attr("stroke", "#333")

    .on("mouseover", (event, d) => {

      const weekData = d.data;
      const week = weekData.week;

      const totalWeek = keys.reduce((sum, k) => sum + weekData[k], 0);

      const value = d[1] - d[0];
      const percent = totalWeek > 0
        ? ((value / totalWeek) * 100).toFixed(1)
        : 0;

      tooltip
        .style("opacity", 1)
        .html(`
          <b>Semana:</b> ${week}<br>
          <b>Reservas:</b> ${value}<br>
          <b>% de la semana:</b> ${percent}%
        `);
    })

    .on("mousemove", (event) => {

      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY + 10) + "px");
    })

    .on("mouseout", () => {

      tooltip.style("opacity", 0);
    });

  // Eje X
  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(
      d3.axisBottom(x)
        .tickValues(x.domain().filter((d, i) => i % 4 === 0))
        .tickFormat(d => weekToMonth.get(d))
    )
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg.append("text")
    .attr("x", margin.left + innerWidth / 2)
    .attr("y", height - 20)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("Año y mes");

  g.append("g")
    .call(d3.axisLeft(y));

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(margin.top + innerHeight / 2))
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("Número de reservas");

  // Leyenda
  const legend = svg.append("g")
    .attr("transform", `translate(${width - margin.right + 20}, 100)`);

  const legendKeys = [
    "2015 - City Hotel",
    "2015 - Resort Hotel",
    "2016 - City Hotel",
    "2016 - Resort Hotel",
    "2017 - City Hotel",
    "2017 - Resort Hotel"
  ];

  legendKeys.forEach((k, i) => {

    const row = legend.append("g")
      .attr("transform", `translate(0, ${i * 22})`);

    row.append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", color[k])
      .attr("stroke", "#333");

    row.append("text")
      .attr("x", 25)
      .attr("y", 12)
      .text(k)
      .style("font-size", "11px");
  });
}