export function graficaTopPaisADRCity(data) {

  // Tamaño del gráfico
  const width = 900;
  const height = 700;

  // Márgenes gráfico
  const margin = { 
    top: 100, 
    right: 40, 
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
    .style("font-size", "32px")
    .style("font-weight", "bold")
    .text("Top países con mayor ADR");

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

  // Filtrado de datos para City Hotel y normalización de campos numéricos
  const filtered = data
    .filter(d => d.hotel === "City Hotel")
    .map(d => ({
      ...d,
      adr: +d.adr || 0,
      is_canceled: +d.is_canceled || 0
    }));

  // Agrupación por país con cálculo de métricas agregadas
  const grouped = d3.rollups(
    filtered,
    v => {

      const total = v.length || 1;
      const canceled = d3.sum(v, d => d.is_canceled || 0);

      const rateCanceled = canceled / total;

      return {
        adr: d3.mean(v, d => d.adr) || 0,
        rateCanceled,
        rateNotCanceled: 1 - rateCanceled,
        totalReservations: total,
        totalCanceled: canceled
      };
    },
    d => d.country
  );

  // Selección de los 10 países con mayor ADR
  const top = grouped
    .map(([country, v]) => ({ country, ...v }))
    .sort((a, b) => d3.descending(a.adr, b.adr))
    .slice(0, 10);

  // Escala horizontal para países
  const x = d3.scaleBand()
    .domain(top.map(d => d.country))
    .range([margin.left, width - margin.right - 120])
    .padding(0.4);

  const barWidth = x.bandwidth() * 0.4;

  // Escala vertical para ADR y porcentaje
  const yAdr = d3.scaleLinear()
    .domain([0, d3.max(top, d => d.adr)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const yPct = d3.scaleLinear()
    .domain([0, 1])
    .range([height - margin.bottom, margin.top]);

  // Barras de ADR
  svg.selectAll(".adr")
    .data(top)
    .join("rect")
    .attr("x", d => x(d.country))
    .attr("y", d => yAdr(d.adr))
    .attr("width", barWidth)
    .attr("height", d => yAdr(0) - yAdr(d.adr))
    .attr("fill", "black")
    .attr("stroke", "black")

    // Tooltip de ADR
    .on("mouseover", (event, d) => {
      tooltip.style("opacity", 1)
        .html(`<b>País:</b> ${d.country}<br><b>ADR medio:</b> ${d.adr.toFixed(2)}`);
    })
    .on("mousemove", (event) => {
      tooltip.style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY + 10) + "px");
    })
    .on("mouseout", () => tooltip.style("opacity", 0));

  // Agrupación de barras de cancelación
  const stack = svg.selectAll(".stack")
    .data(top)
    .join("g")
    .attr("transform", d => `translate(${x(d.country) + barWidth + 5},0)`);

  stack.each(function(d) {

    const notC = Math.max(0, d.rateNotCanceled || 0);
    const c = Math.max(0, d.rateCanceled || 0);

    // Parte de reservas no canceladas
    d3.select(this)
      .append("rect")
      .attr("y", yPct(notC))
      .attr("width", barWidth)
      .attr("height", yPct(0) - yPct(notC))
      .attr("fill", "lightgray")
      .attr("stroke", "#333")

      // Tooltip no canceladas
      .on("mouseover", (event) => {
        tooltip.style("opacity", 1)
          .html(`<b>País:</b> ${d.country}<br><b>Total reservas:</b> ${d.totalReservations}<br><b>Total cancelaciones:</b> ${d.totalCanceled}<br><b>% cancelaciones:</b> ${(d.rateCanceled * 100).toFixed(2)}%`);
      })
      .on("mousemove", (event) => {
        tooltip.style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY + 10) + "px");
      })
      .on("mouseout", () => tooltip.style("opacity", 0));

    // Parte de reservas canceladas
    d3.select(this)
      .append("rect")
      .attr("y", yPct(notC + c))
      .attr("width", barWidth)
      .attr("height", yPct(notC) - yPct(notC + c))
      .attr("fill", "crimson")
      .attr("stroke", "#333")

      // Tooltip canceladas
      .on("mouseover", (event) => {
        tooltip.style("opacity", 1)
          .html(`<b>País:</b> ${d.country}<br><b>Total reservas:</b> ${d.totalReservations}<br><b>Total cancelaciones:</b> ${d.totalCanceled}<br><b>% cancelaciones:</b> ${(d.rateCanceled * 100).toFixed(2)}%`);
      })
      .on("mousemove", (event) => {
        tooltip.style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY + 10) + "px");
      })
      .on("mouseout", () => tooltip.style("opacity", 0));
  });

  // Eje X con países
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
    .text("País");

  // Eje Y izquierdo (ADR)
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yAdr));

  // Etiqueta del eje Y izquierdo
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(height / 2))
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("ADR medio");

  // Eje Y derecho (porcentaje cancelación)
  svg.append("g")
    .attr("transform", `translate(${width - margin.right - 120},0)`)
    .call(d3.axisRight(yPct).tickFormat(d3.format(".0%")));

  // Etiqueta del eje Y derecho
  svg.append("text")
    .attr("transform", `translate(${width - 100},${height / 2}) rotate(90)`)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("Porcentaje de cancelaciones (%)");

  // Leyenda del gráfico
  const legend = svg.append("g")
    .attr("transform", `translate(${width - 100}, ${margin.top})`);

  const items = [
    { name: "ADR medio", color: "black" },
    { name: "No canceladas", color: "lightgray" },
    { name: "Canceladas", color: "crimson" }
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