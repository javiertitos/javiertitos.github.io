export function graficaTreeMapCancelaciones(data) {

  // Tamaño del gráfico
  const width = 900;
  const height = 700;

  // Márgenes gráfico
  const margin = { 
    top: 90, 
    right: 150, 
    bottom: 70, 
    left: 50 
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
    .text("Cancelaciones según zona de procedencia");

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

  // 🌍 MAPA DE REGIONES
  const continentMap = {
    SRB: "Rest of Europe", GRC: "Rest of Europe", HRV: "Rest of Europe",
    ITA: "ITA", DNK: "Rest of Europe", FRA: "FRA",
    CZE: "Rest of Europe", DEU: "DEU", AUT: "Rest of Europe",
    BEL: "Rest of Europe", HUN: "Rest of Europe", NOR: "Rest of Europe",
    NLD: "Rest of Europe", CHE: "Rest of Europe", SWE: "Rest of Europe",
    FIN: "Rest of Europe", ROU: "Rest of Europe", POL: "Rest of Europe",
    PRT: "PRT", ESP: "ESP", GBR: "GBR",
    IRL: "Rest of Europe", LUX: "Rest of Europe",

    USA: "Rest of the World", BRA: "Rest of the World", ARG: "Rest of the World",
    JPN: "Rest of the World", KOR: "Rest of the World", CHN: "Rest of the World",
    CN: "Rest of the World", IND: "Rest of the World",
    AGO: "Rest of the World", DZA: "Rest of the World", MAR: "Rest of the World",
    AUS: "Rest of the World",
    RUS: "Rest of the World"
  };

  // 🧹 REGIONES
  const enriched = data.map(d => ({
    ...d,
    region: continentMap[d.country] || "Rest of the World"
  }));

  // 📊 AGRUPACIÓN
  const grouped = d3.rollups(
    enriched,
    v => v.length,
    d => d.is_canceled,
    d => d.region
  );

  const flat = [];

  grouped.forEach(([canceled, regions]) => {

    regions.forEach(([region, value]) => {
      flat.push({ canceled, region, value });
    });
  });

  const totalReservas = d3.sum(flat, d => d.value);

  const xScale = d3.scaleBand()
    .domain([0, 1])
    .range([50, width - 50])
    .padding(0);

  const color = d3.scaleOrdinal()
    .domain([...new Set(flat.map(d => d.region))])
    .range(d3.schemePaired);

  // 🔥 COLUMNAS
  const xGroups = d3.groups(flat, d => d.canceled);

  xGroups.forEach(([canceled, values]) => {

    const x0 = xScale(canceled);
    const colWidth = xScale.bandwidth();

    const colTotal = d3.sum(values, d => d.value);

    const byRegion = d3.rollups(
      values,
      v => d3.sum(v, d => d.value),
      d => d.region
    );

    let yOffset = margin.top;

    byRegion.forEach(([region, value]) => {

      const h = (value / colTotal) * (height - margin.top - margin.bottom);

      const porcentaje = ((value / totalReservas) * 100).toFixed(2);

      svg.append("rect")
        .attr("x", x0)
        .attr("y", yOffset)
        .attr("width", colWidth)
        .attr("height", h)
        .attr("fill", color(region))
        .attr("stroke", "#333")
        .attr("stroke-width", 0.8)

        // 🎯 HOVER
        .on("mouseover", (event) => {

          tooltip
            .style("opacity", 1)
            .html(`
              <b>Zona:</b> ${region}<br>
              <b>Reservas:</b> ${value}<br>
              <b>Porcentaje del total:</b> ${porcentaje}%
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

      svg.append("text")
        .attr("x", x0 + colWidth / 2)
        .attr("y", yOffset + h / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "10px")
        .style("fill", "black")
        .text(region);

      yOffset += h;
    });
  });

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(
      d3.axisBottom(xScale)
        .tickFormat(d => d === 0 ? "No cancelado" : "Cancelado")
    );

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 30)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("Estado de cancelación");
}