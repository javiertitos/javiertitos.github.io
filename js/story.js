import { graficaZonaProcedencia } from "./charts/graficaZonaProcedencia.js";
import { graficaPaisesTipos } from "./charts/graficaPaisesTipos.js";
import { graficaTemporal } from "./charts/graficaTemporal.js";
import { graficaProcedenciaSegunHotel } from "./charts/graficaProcedenciaSegunHotel.js";
import { graficaTreeMapCancelaciones } from "./charts/graficaTreeMapCancelaciones.js";
import { branchCityResort } from "./branches.js";

// Función principal del storytelling
export function historiaInicial(datos) {

  // Se seleccionan los pasos del scroll narrative
  const steps = document.querySelectorAll(".step");

  // Observer para detectar los cambios de step
  const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

      // Si el elemento no está visible, no hacemos nada
      if (!entry.isIntersecting) return;

      // Se identifica el step
      const step = entry.target.dataset.step;

      // Se limpia el contenedor donde se va a poner la gráfica
      d3.select("#chart").html("");

      // Gráfica 1
      if (step === "1") {
        graficaZonaProcedencia(datos);
      }

      // Gráfica 2
      if (step === "2") {
        graficaPaisesTipos(datos);
      }

      // Gráfica 3. Dividida en dos
      if (step === "3") {

        // 🔄 gráfica inicial (modo normal)
        graficaTemporal(datos, "normal");

        // 🎛️ botón: modo stacked normal
        document.getElementById("btnStackedNormal").onclick = () => {
          d3.select("#chart").html("");
          graficaTemporal(datos, "normal");
        };

        // 🎛️ botón: modo stacked invertido
        document.getElementById("btnStackedReverse").onclick = () => {
          d3.select("#chart").html("");
          graficaTemporal(datos, "reverse");
        };
      }

      // Gráfica 4
      if (step === "4") {
        graficaProcedenciaSegunHotel(datos);
      }

      // Gráfica 5
      if (step === "5") {
        graficaTreeMapCancelaciones(datos);
      }

      // Gráfica 6
      if (step === "6") {
        branchCityResort(datos);
      }

    });

  }, {
    // Límite para cuando cambiar de paso y por tanto de gráfica
    threshold: 0.6
  });

  // Se activamos observer sobre cada sección del scroll
  steps.forEach(s => observer.observe(s));
}