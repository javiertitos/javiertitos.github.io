export function graficaZonaProcedencia(data) {

  // Tamaño del gráfico
  const width = 900;
  const height = 700;

  // Márgenes gráfico
  const titleHeight = 80;   
  const legendHeight = 100;

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
    .text("Distribución de reservas por zona de origen");

  // 📊 agrupar datos
  const grouped = d3.rollups(
    data,
    v => v.length,
    d => d.continente || d.clasificacionGeografica
  );

  const dataset = grouped.map(([zona, value]) => ({
    name: zona,
    value
  }));

  const root = d3.hierarchy({ children: dataset })
    .sum(d => d.value);

  // 👇 IMPORTANTE: restamos espacio de título + leyenda
  const chartHeight = height - titleHeight - legendHeight;

  const chartG = svg.append("g")
    .attr("transform", `translate(0, ${titleHeight})`);

  d3.treemap()
    .size([width, chartHeight])
    .padding(4)(root);

  const color = d3.scaleOrdinal()
    .domain(dataset.map(d => d.name))
    .range(d3.schemeTableau10);

  // 📦 nodos
  const nodes = chartG.selectAll("g.node")
    .data(root.leaves())
    .join("g")
    .attr("transform", d => `translate(${d.x0},${d.y0})`);

  nodes.append("rect")
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("fill", d => color(d.data.name))
    .attr("stroke", "#000");

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

  nodes.each(function(d) {

    const w = d.x1 - d.x0;
    const h = d.y1 - d.y0;

    const node = d3.select(this);

    if (w > 90 && h > 45) {

      node.append("text")
        .attr("x", 8)
        .attr("y", 20)
        .style("fill", "black")
        .style("font-size", "13px")
        .style("font-weight", "bold")
        .text(d.data.name);

      nodes.select("rect")
        .on("mouseover", (event, d) => {
          tooltip
            .style("opacity", 1)
            .html(`<b>${d.data.name}</b><br>${d.data.value}`);
        })
        .on("mousemove", (event) => {
          tooltip
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY + 10) + "px");
        })
        .on("mouseout", () => {
          tooltip.style("opacity", 0);
        });
    }
  });

  // 📚 LEYENDA (abajo)
  const legend = svg.append("g")
    .attr("transform", `translate(5, ${titleHeight + chartHeight + 20})`);

  const itemWidth = 150;
  const itemsPerRow = Math.floor((width) / itemWidth);

  const item = legend.selectAll("g")
    .data(dataset)
    .join("g")
    .attr("transform", (d, i) => {
      const row = Math.floor(i / itemsPerRow);
      const col = i % itemsPerRow;
      return `translate(${col * itemWidth}, ${row * 25})`;
    });

  item.append("rect")
    .attr("width", 14)
    .attr("height", 14)
    .attr("stroke", "#000")
    .attr("fill", d => color(d.name));

  item.append("text")
    .attr("x", 20)
    .attr("y", 12)
    .style("font-size", "16px")
    .text(d => d.name);
}