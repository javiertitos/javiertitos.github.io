export function cargaDatos() {

  return fetch("hotel_bookings.json")
    .then(r => r.json())
    .then(raw => preprocesarDatos(raw));
}

export function preprocesarDatos(raw) {

    // Se filtran registros con valores extremos de ciertas feature
    const datos = raw
      .filter(d => d.adults < 10)
      .filter(d => d.children < 5 && d.babies < 5)
      .filter(d => d.adr > 0 && d.adr < 1000)
      .map(d => ({
        ...d,
        children: d.children ?? 0
      }));

    // Se calcula el revenue total de la reserva
    datos.forEach(d => {

      const weekend = +d.stays_in_weekend_nights || 0;
      const week = +d.stays_in_week_nights || 0;

      d.total_nights = weekend + week;

      const adr = +d.adr || 0;

      d.revenue = adr * d.total_nights;
    });

    // Ahora creo dos clasificaciones geográficas. Son distintas porque son para distintas
    // gráficas y por tanto podemos usar un nivel de detalle distinto
    const clasificacionGeografica = {
        SRB: "Rest of Europe", GRC: "Rest of Europe", HRV: "Rest of Europe",
        ITA: "ITA", DNK: "Rest of Europe", FRA: "FRA",
        CZE: "Rest of Europe", DEU: "DEU", AUT: "Rest of Europe",
        BEL: "Rest of Europe", HUN: "Rest of Europe", NOR: "Rest of Europe",
        NLD: "Rest of Europe", CHE: "Rest of Europe", SWE: "Rest of Europe",
        FIN: "Rest of Europe", ROU: "Rest of Europe", POL: "Rest of Europe",
        PRT: "PRT", ESP: "ESP", GBR: "GBR",
        IRL: "Rest of Europe", LUX: "Rest of Europe"
      };

    datos.forEach(d => {
      d.clasificacionGeografica = clasificacionGeografica[d.country] || "Rest of the World";
    });

    const continente = {

      "PRT": "Portugal",

      // Europa
      "ALB": "Europa", "AND": "Europa", "AUT": "Europa", "BEL": "Europa", "BGR": "Europa",
      "BIH": "Europa", "BLR": "Europa", "CHE": "Europa", "CYP": "Europa", "CZE": "Europa",
      "DEU": "Europa", "DNK": "Europa", "ESP": "Europa", "EST": "Europa", "FIN": "Europa",
      "FRA": "Europa", "GBR": "Europa", "GRC": "Europa", "HRV": "Europa", "HUN": "Europa",
      "IRL": "Europa", "ISL": "Europa", "ITA": "Europa", "LTU": "Europa", "LUX": "Europa",
      "LVA": "Europa", "MCO": "Europa", "MDA": "Europa", "MKD": "Europa", "MLT": "Europa",
      "MNE": "Europa", "NLD": "Europa", "NOR": "Europa", "POL": "Europa", "ROU": "Europa",
      "RUS": "Europa", "SRB": "Europa", "SVK": "Europa", "SVN": "Europa", "SWE": "Europa",
      "UKR": "Europa",

      // Asia
      "ARE": "Asia", "ARM": "Asia", "AZE": "Asia", "BGD": "Asia", "BHR": "Asia",
      "CHN": "Asia", "GEO": "Asia", "HKG": "Asia", "IDN": "Asia", "IND": "Asia",
      "IRN": "Asia", "IRQ": "Asia", "ISR": "Asia", "JPN": "Asia", "JOR": "Asia",
      "KAZ": "Asia", "KHM": "Asia", "KOR": "Asia", "KWT": "Asia", "LAO": "Asia",
      "LBN": "Asia", "LKA": "Asia", "MMR": "Asia", "MNG": "Asia", "MYS": "Asia",
      "NPL": "Asia", "OMN": "Asia", "PAK": "Asia", "PHL": "Asia", "QAT": "Asia",
      "SAU": "Asia", "SGP": "Asia", "SYR": "Asia", "THA": "Asia", "TJK": "Asia",
      "TWN": "Asia", "TUR": "Asia", "UZB": "Asia", "VNM": "Asia",

      // África
      "AGO": "África", "BDI": "África", "BEN": "África", "BFA": "África", "BWA": "África",
      "CAF": "África", "CIV": "África", "CMR": "África", "COM": "África", "CPV": "África",
      "DJI": "África", "DZA": "África", "EGY": "África", "ETH": "África", "GAB": "África",
      "GHA": "África", "GIN": "África", "GMB": "África", "GNB": "África", "KEN": "África",
      "LBY": "África", "MAR": "África", "MDG": "África", "MLI": "África", "MOZ": "África",
      "MRT": "África", "MUS": "África", "MWI": "África", "NAM": "África", "NGA": "África",
      "RWA": "África", "SDN": "África", "SEN": "África", "SLE": "África", "SOM": "África",
      "STP": "África", "TGO": "África", "TUN": "África", "TZA": "África", "UGA": "África",
      "ZAF": "África", "ZMB": "África", "ZWE": "África",

      // América
      "ARG": "América", "BHS": "América", "BLZ": "América", "BOL": "América",
      "BRA": "América", "BRB": "América", "CAN": "América", "CHL": "América",
      "COL": "América", "CRI": "América", "CUB": "América", "DOM": "América",
      "ECU": "América", "GTM": "América", "GUY": "América", "HND": "América",
      "JAM": "América", "MEX": "América", "NIC": "América", "PAN": "América",
      "PER": "América", "PRI": "América", "PRY": "América", "SUR": "América",
      "URY": "América", "USA": "América", "VEN": "América",

      // Oceanía
      "AUS": "Oceanía", "FJI": "Oceanía", "NZL": "Oceanía", "PNG": "Oceanía"
    };

    datos.forEach(d => {
      d.continente = continente[d.country] || "Desconocido";
    });

    // Creo una variable que combine el año de la reserva y el tipo de hotel.
    // Usada para la gráfica temporal
    datos.forEach(d => {
      d.year_hotel = `${d.arrival_date_year} - ${d.hotel}`;
    });

    // Paso los meses a formato número para poder crear fechas
    const monthMap = {
      January: 0, February: 1, March: 2,
      April: 3, May: 4, June: 5,
      July: 6, August: 7, September: 8,
      October: 9, November: 10, December: 11
    };

    // Creo fecha completa con formato adecuado, también me quedo la semana y 
    // la combinación año mes para los índices del eje
    datos.forEach(d => {

      const year = +d.arrival_date_year;
      const month = monthMap[d.arrival_date_month];
      const day = +d.arrival_date_day_of_month;

      d.date = new Date(year, month, day);

      // Incluyo la semana para la división del eje X
      d.week = d3.timeFormat("%Y-W%U")(d.date);

      // Pese a que la división sea por semanas, los índices del eje  
      // serán por año y mes
      d.year_month = d3.timeFormat("%Y-%m")(d.date);
    });

    // Categorizo los viajes en función del número de hijos/bebés con
    // los que se viaja, del número de noches y de si son en fin de
    // semana o no
    datos.forEach(d => {

      const adults = +d.adults || 0;
      const children = +d.children || 0;
      const babies = +d.babies || 0;

      const week = +d.stays_in_week_nights;
      const weekend = +d.stays_in_weekend_nights;

      const totalPeople = adults + children + babies;

      const dayOfWeek = d.date.getDay(); // 0 domingo - 6 sábado

      const isFamily = children > 0 || babies > 0;
      const isBusiness = (
        adults <= 2 &&
        isFamily === false &&
        week <= 3
      );

      const isShortStay = week + weekend <= 2;

      if (isBusiness) {
        d.tipo = "Business";

      } else if (isFamily) {
        d.tipo = "Family";

      } else if (isShortStay && dayOfWeek >= 5) {
        d.tipo = "Weekend Leisure";

      } else if (week > 3) {
        d.tipo = "Long Stay";

      } else {
        d.tipo = "Leisure";
      }
    });

    return datos

  }
  