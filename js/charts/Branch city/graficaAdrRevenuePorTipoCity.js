export function graficaAdrRevenuePorTipoCity(data) {

  // Tamaño del gráfico
  const width = 900;
  const height = 700;

  // Márgenes gráfico
  const margin = { 
    top: 100, 
    right: 80, 
    bottom: 90, 
    left: 80 
  };

  // Creación del contenedor SVG donde se dibuja el gráfico
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Título principal del gráfico
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 45)
    .attr("text-anchor", "middle")
    .style("font-size", "28px")
    .style("font-weight", "bold")
    .text("ADR y Revenue medio por tipo de viaje");

  // Tooltip para mostrar información al pasar el ratón
  const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "rgba(0,0,0,0.8)")
    .style("color", "white")
    .style("padding", "8px 12px")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  // Filtrado de datos solo para City Hotel
  const filtered = data.filter(d => d.hotel === "City Hotel");

  // Agrupación por tipo de viaje calculando métricas medias
  const grouped = d3.rollups(
    filtered,
    v => ({
      adr: d3.mean(v, d => +d.adr) || 0,
      revenue: d3.mean(v, d => +d.revenue) || 0,
      count: v.length
    }),
    d => d.tipo
  );

  const top = grouped
    .map(([tipo, values]) => ({ tipo, ...values }))
    .sort((a, b) => d3.descending(a.revenue, b.revenue));

  const tipos = top.map(d => d.tipo);

  // Escala horizontal para los tipos de viaje
  const x = d3.scaleBand()
    .domain(tipos)
    .range([margin.left, width - margin.right])
    .padding(0.3);

  const barWidth = x.bandwidth() / 2;

  // Escala vertical común para ADR y Revenue
  const y = d3.scaleLinear()
    .domain([0, d3.max(top, d => Math.max(d.adr, d.revenue))])
    .nice()
    .range([height - margin.bottom, margin.top]);

  // Barras de ADR
  svg.selectAll(".adr")
    .data(top)
    .join("rect")
    .attr("x", d => x(d.tipo) + barWidth)
    .attr("y", d => y(d.adr))
    .attr("width", barWidth)
    .attr("height", d => y(0) - y(d.adr))
    .attr("fill", "black")

    // Tooltip ADR
    .on("mouseover", (event, d) => {
      tooltip.style("opacity", 1)
        .html(`<b>Tipo:</b> ${d.tipo}<br><b>ADR medio:</b> ${d.adr.toFixed(2)}`);
    })
    .on("mousemove", (event) => {
      tooltip.style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY + 10) + "px");
    })
    .on("mouseout", () => tooltip.style("opacity", 0));

  // Etiquetas de valores ADR
  svg.selectAll(".label-adr")
    .data(top)
    .join("text")
    .attr("x", d => x(d.tipo) + barWidth + barWidth / 2)
    .attr("y", d => y(d.adr) - 5)
    .attr("text-anchor", "middle")
    .style("font-size", "11px")
    .text(d => d.adr.toFixed(0));

  // Barras de Revenue
  svg.selectAll(".revenue")
    .data(top)
    .join("rect")
    .attr("x", d => x(d.tipo))
    .attr("y", d => y(d.revenue))
    .attr("width", barWidth)
    .attr("height", d => y(0) - y(d.revenue))
    .attr("fill", "steelblue")

    // Tooltip Revenue
    .on("mouseover", (event, d) => {
      tooltip.style("opacity", 1)
        .html(`<b>Tipo:</b> ${d.tipo}<br><b>Revenue medio:</b> ${d.revenue.toFixed(2)}`);
    })
    .on("mousemove", (event) => {
      tooltip.style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY + 10) + "px");
    })
    .on("mouseout", () => tooltip.style("opacity", 0));

  // Etiquetas de valores Revenue
  svg.selectAll(".label-revenue")
    .data(top)
    .join("text")
    .attr("x", d => x(d.tipo) + barWidth / 2)
    .attr("y", d => y(d.revenue) - 5)
    .attr("text-anchor", "middle")
    .style("font-size", "11px")
    .text(d => d.revenue.toFixed(0));

  // Eje X con tipos de viaje
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("text-anchor", "middle");

  // Etiqueta del eje X
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 30)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("Tipo de viaje");

  // Eje Y compartido para ambas métricas
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  // Etiqueta del eje Y
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(height / 2))
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("Valor medio (ADR / Revenue)");

  // Leyenda del gráfico
  const legend = svg.append("g")
    .attr("transform", `translate(${width - 180}, 120)`);

  const items = [
    { name: "ADR medio", color: "black" },
    { name: "Revenue medio", color: "steelblue" }
  ];

  items.forEach((d, i) => {

    const g = legend.append("g")
      .attr("transform", `translate(0, ${i * 25})`);

    g.append("rect")
      .attr("width", 14)
      .attr("height", 14)
      .attr("fill", d.color)
      .attr("stroke", "#333");

    g.append("text")
      .attr("x", 20)
      .attr("y", 12)
      .style("font-size", "12px")
      .text(d.name);
  });
}