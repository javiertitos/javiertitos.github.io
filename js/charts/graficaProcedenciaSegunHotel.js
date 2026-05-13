export function graficaProcedenciaSegunHotel(data) {

  // Tamaño del gráfico
  const width = 925;
  const height = 700;

  // Creación del contenedor SVG donde se dibuja el gráfico
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const margin = { 
    top: 100, 
    right: 200, 
    bottom: 70, 
    left: 120 
  };

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Título principal del gráfico
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 50)
    .attr("text-anchor", "middle")
    .style("font-size", "32px")
    .style("font-weight", "bold")
    .text("Distribución de zona de procedencia según hotel");

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

  // Filtrar zonas pequeñas
  const counts = d3.rollup(data, v => v.length, d => d.clasificacionGeografica);

  const valid = new Set(
    [...counts.entries()]
      .filter(([k, v]) => v >= 100)
      .map(d => d[0])
  );

  const filtered = data.filter(d => valid.has(d.clasificacionGeografica));

  // Agrupación de datos
  const grouped = d3.rollups(
    filtered,
    v => v.length,
    d => d.hotel,
    d => d.clasificacionGeografica
  );

  // Construcción de tabla para stack (porcentajes)
  const table = grouped.map(([hotel, continents]) => {

    const obj = { hotel };
    let total = 0;

    continents.forEach(([cont, value]) => {
      obj[cont] = {
        count: value,
        percent: 0
      };
      total += value;
    });

    Object.keys(obj).forEach(k => {
      if (k !== "hotel") {
        obj[k].percent = (obj[k].count / total) * 100;
      }
    });

    return obj;
  });

  const continentTotals = d3.rollup(filtered, v => v.length, d => d.clasificacionGeografica);

  const continents = Array.from(continentTotals.entries())
    .sort((a, b) => d3.descending(a[1], b[1]))
    .map(d => d[0]);

  // Generación del stack para porcentajes
  const stack = d3.stack()
    .keys(continents)
    .value((d, key) => d[key].percent);

  const series = stack(table);

  const x = d3.scaleBand()
    .domain(table.map(d => d.hotel))
    .range([0, innerWidth])
    .padding(0.3);

  const y = d3.scaleLinear()
    .domain([0, 100])
    .range([innerHeight, 0]);

  const color = d3.scaleOrdinal()
    .domain(continents)
    .range(d3.schemePaired);

  const layers = g.selectAll("g.layer")
    .data(series)
    .join("g")
    .attr("fill", d => color(d.key));

  // Dibujado de barras apiladas
  layers.selectAll("rect")
    .data(d => d.map(v => ({
      ...v,
      zone: d.key
    })))
    .join("rect")
    .attr("x", d => x(d.data.hotel))
    .attr("y", d => y(d[1]))
    .attr("height", d => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth())
    .attr("stroke", "#333")

    .on("mouseover", (event, d) => {

      const zone = d.zone;
      const hotel = d.data.hotel;

      const dataObj = d.data[zone];

      const percent = (d[1] - d[0]).toFixed(1);
      const count = dataObj.count;

      tooltip
        .style("opacity", 1)
        .html(`
          <b>Zona:</b> ${zone}<br>
          <b>Hotel:</b> ${hotel}<br>
          <b>Reservas:</b> ${count}<br>
          <b>Porcentaje:</b> ${percent}%
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

  // Etiquetas dentro de las barras
  layers.selectAll("text")
    .data(d => d.map(v => ({ ...v, key: d.key })))
    .join("text")
    .attr("x", d => x(d.data.hotel) + x.bandwidth() / 2)
    .attr("y", d => y(d[0] + (d[1] - d[0]) / 2))
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em")
    .style("font-size", "10px")
    .style("fill", "#000")
    .text(d => {
      const h = y(d[0]) - y(d[1]);
      return h > 14 ? d.key : "";
    });

  // Eje X
  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x));

  svg.append("text")
    .attr("x", margin.left + innerWidth / 2)
    .attr("y", height - 30)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("Tipo de hotel");

  // Eje Y
  g.append("g")
    .call(d3.axisLeft(y));

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(margin.top + innerHeight / 2))
    .attr("y", 50)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("Porcentaje de reservas (%)");
}