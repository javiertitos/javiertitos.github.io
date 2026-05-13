export function graficaPaisesTipos(data) {

  // Tamaño del gráfico
  const width = 900;
  const height = 700;

  // Márgenes gráfico
  const margin = {
    top: 40,
    right: 80,
    bottom: 80,
    left: 80
  };

  const titleHeight = 80;

  // Creación del contenedor SVG donde se dibuja el gráfico
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Título principal del gráfico
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 50)
    .attr("text-anchor", "middle")
    .style("font-size", "32px")
    .style("font-weight", "bold")
    .text("Top países separados por tipo de viaje");

  // Grupo desplazado hacia abajo para dejar espacio al título
  const g = svg.append("g")
    .attr("transform", `translate(0, ${titleHeight})`);

  const tipos = ["Business", "Family", "Weekend Leisure", "Long Stay", "Leisure"];

  const colors = {
    Business: "#1f77b4",
    Family: "#ff7f0e",
    "Weekend Leisure": "#2ca02c",
    "Long Stay": "#d62728",
    Leisure: "#9467bd"
  };

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

  const grouped = d3.rollups(
    data,
    v => {
      const obj = {};
      tipos.forEach(t => {
        obj[t] = v.filter(d => d.tipo === t).length;
      });
      return obj;
    },
    d => d.country
  );

  const top = grouped
    .map(d => {

      const country = d[0];
      const values = d[1];

      const totalReservas = tipos.reduce(
        (sum, t) => sum + (values[t] || 0),
        0
      );

      return {
        country,
        ...values,
        totalReservas
      };
    })
    .sort((a, b) => d3.descending(a.totalReservas, b.totalReservas))
    .slice(0, 10);

  const x = d3.scaleBand()
    .domain(top.map(d => d.country))
    .range([margin.left, width - margin.right])
    .padding(0.5);

  const y = d3.scaleLinear()
    .domain([0, d3.max(top, d => d.totalReservas)])
    .nice()
    .range([height - margin.bottom - titleHeight, margin.top]);

  const barWidth = x.bandwidth();

  // Barras apiladas
  top.forEach(d => {

    let y0 = 0;

    tipos.forEach(t => {

      const val = d[t] || 0;
      const total = d.totalReservas;
      const percent = total > 0 ? ((val / total) * 100).toFixed(1) : 0;

      g.append("rect")
        .attr("x", x(d.country))
        .attr("y", y(y0 + val))
        .attr("width", barWidth)
        .attr("height", y(y0) - y(y0 + val))
        .attr("fill", colors[t])
        .attr("stroke", "#333")
        .on("mouseover", (event) => {

          tooltip
            .style("opacity", 1)
            .html(
              `<b>País: ${d.country}</b><br>` +
              `Tipo: ${t}<br>` +
              `Reservas: ${val}<br>` +
              `% del país: ${percent}%`
            );
        })
        .on("mousemove", (event) => {

          tooltip
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY + 10) + "px");
        })
        .on("mouseout", () => {

          tooltip.style("opacity", 0);
        });

      y0 += val;
    });
  });

  // Eje X
  g.append("g")
    .attr("transform", `translate(0,${height - margin.bottom - titleHeight})`)
    .call(d3.axisBottom(x))
    .selectAll("text");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 30)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("País");

  // Eje Y
  g.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("Número de reservas");

  // Leyenda
  const legend = g.append("g")
    .attr("transform", `translate(${width - margin.right - 50}, ${margin.top})`);

  const legendItems = legend.selectAll("g")
    .data(tipos)
    .join("g")
    .attr("transform", (d, i) => `translate(0, ${i * 25})`);

  legendItems.append("rect")
    .attr("width", 14)
    .attr("height", 14)
    .attr("fill", d => colors[d])
    .attr("stroke", "#333");

  legendItems.append("text")
    .attr("x", 20)
    .attr("y", 12)
    .style("font-size", "12px")
    .text(d => d);
}