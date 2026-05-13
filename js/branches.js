import { graficaTopPaisADRCity } from "./charts/Branch city/graficaTopPaisADRCity.js";
import { graficaTopPaisRevenueCity } from "./charts/Branch city/graficaTopPaisRevenueCity.js";
import { graficaAdrRevenuePorTipoCity } from "./charts/Branch city/graficaAdrRevenuePorTipoCity.js";

import { graficaTopPaisADRResort } from "./charts/Branch resort/graficaTopPaisADRResort.js";
import { graficaTopPaisRevenueResort } from "./charts/Branch resort/graficaTopPaisRevenueResort.js";
import { graficaAdrRevenuePorTipoResort } from "./charts/Branch resort/graficaAdrRevenuePorTipoResort.js";

export function branchCityResort(datos) {
  d3.select("#chart").html(`
    <div style="
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      height:100%;
      color:#444;
      padding:40px;
      text-align:center;
    ">

      <h2>📊 Indicadores clave por tipo de hotel</h2>

      <p style="max-width:420px;">
        Este panel muestra métricas relevantes para la toma de decisiones en el sector hotelero,
        comparando el comportamiento entre <b>Resort Hotel</b> y <b>City Hotel</b>.
      </p>

      <div style="margin-top:20px; font-size:14px; opacity:0.7;">
        Selecciona un tipo de hotel con los botones 👈
      </div>

    </div>
  `);
  
  document.getElementById("btnResort").onclick = () => {
    branchResort(datos);
  };

  document.getElementById("btnCity").onclick = () => {
    branchCity(datos);
  };

}

function branchResort(datos) {

  // Ocultar historia principal
  document.getElementById("mainStory").style.display = "none";

  const branch = document.getElementById("branchStory");

  branch.style.display = "block";

  branch.scrollTop = 0;

  branch.innerHTML = `

    <section class="step branch-step" data-branch="1">
      <h2>🏖 Resort · Países más rentables por noche</h2>
      <p>Top países con mayor ADR medio por reserva, incluyendo número de reservas,
      de cancelaciones y porcentaje de cancelaciones</p>
    </section>

    <section class="step branch-step" data-branch="2">
      <h2>🏖 Resort · Países más rentables por reserva</h2>
      <p>Top países con mayor Revenue medio por reserva, incluyendo número de reservas,
      de cancelaciones y porcentaje de cancelaciones</p>
    </section>

    <section class="step branch-step" data-branch="3">
      <h2>🏖 Resort · Rentabilidad por tipo de viaje</h2>
      <p>ADR y Revenue medio por tipo de viaje</p>
    </section>

    <div class="backContainer">
      <button id="btnBack">
        ⬅ Volver al storytelling principal
      </button>
    </div>

  `;

  document.getElementById("btnBack").onclick = volverStoryOriginal;

  scrollBranchResort(datos);
}

function scrollBranchResort(datos) {

  const steps = document.querySelectorAll(".branch-step");

  const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

      if (!entry.isIntersecting) return;

      const step = entry.target.dataset.branch;

      d3.select("#chart").html("");

      if (step === "1") {
        graficaTopPaisADRResort(datos);
      }

      if (step === "2") {
        graficaTopPaisRevenueResort(datos);
      }

      if (step === "3") {
        graficaAdrRevenuePorTipoResort(datos);
      }

    });

  }, { threshold: 0.6 });

  steps.forEach(s => observer.observe(s));
}

function branchCity(datos) {

  // ocultar historia principal
  document.getElementById("mainStory").style.display = "none";

  const branch = document.getElementById("branchStory");

  branch.style.display = "block";

  branch.scrollTop = 0;

  branch.innerHTML = `

    <section class="step branch-step" data-branch="1">
      <h2>🏖 Resort · Países más rentables por noche</h2>
      <p>Top países con mayor ADR medio por reserva, incluyendo número de reservas,
      de cancelaciones y porcentaje de cancelaciones</p>
    </section>

    <section class="step branch-step" data-branch="2">
      <h2>🏖 Resort · Países más rentables por reserva</h2>
      <p>Top países con mayor Revenue medio por reserva, incluyendo número de reservas,
      de cancelaciones y porcentaje de cancelaciones</p>
    </section>

    <section class="step branch-step" data-branch="3">
      <h2>🏖 Resort · Rentabilidad por tipo de viaje</h2>
      <p>ADR y Revenue medio por tipo de viaje</p>
    </section>

    <div class="backContainer">
      <button id="btnBack">
        ⬅ Volver al storytelling principal
      </button>
    </div>

  `;

  document.getElementById("btnBack").onclick = volverStoryOriginal;

  scrollBranchCity(datos);
}

function scrollBranchCity(datos) {

  const steps = document.querySelectorAll(".branch-step");

  const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

      if (!entry.isIntersecting) return;

      const step = entry.target.dataset.branch;

      d3.select("#chart").html("");

      if (step === "1") {
        graficaTopPaisADRCity(datos);
      }

      if (step === "2") {
        graficaTopPaisRevenueCity(datos);
      }

      if (step === "3") {
        graficaAdrRevenuePorTipoCity(datos);
      }

    });

  }, { threshold: 0.6 });

  steps.forEach(s => observer.observe(s));
}

function volverStoryOriginal() {

  // ocultar rama
  document.getElementById("branchStory").style.display = "none";

  // mostrar main
  document.getElementById("mainStory").style.display = "block";

  // limpiar gráfico
  d3.select("#chart").html("");

}


