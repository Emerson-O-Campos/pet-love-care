// ==============================
//  RACAS-API.JS - Pet Love Care
//  Carrega raças automaticamente via The Dog API
// ==============================

document.addEventListener("DOMContentLoaded", () => {
  const selectRaca = document.getElementById("raca");
  if (!selectRaca) return;

  const API_KEY = "live_DlsrZQfxtRMcCdDyH7AN15iJ50XwBonUfGC6D6SKczexHVw84UG5EEjWLVLoEA7R";

  async function carregarRacas() {
    try {
      selectRaca.innerHTML = `<option value="">Carregando raças...</option>`;

      const res = await fetch("https://api.thedogapi.com/v1/breeds", {
        headers: {
          "x-api-key": API_KEY
        }
      });

      if (!res.ok) throw new Error("Falha ao buscar raças");

      const data = await res.json();

      data.sort((a, b) => a.name.localeCompare(b.name));

      selectRaca.innerHTML = `<option value="">Selecione a raça</option>`;
      selectRaca.innerHTML += `<option value="SRD (Vira-lata)">SRD (Vira-lata)</option>`;

      data.forEach((breed) => {
        const opt = document.createElement("option");
        opt.value = breed.name;
        opt.textContent = breed.name;
        selectRaca.appendChild(opt);
      });

      selectRaca.innerHTML += `<option value="Outra raça">Outra raça</option>`;

    } catch (err) {
      console.error("Erro ao carregar raças:", err);
      selectRaca.innerHTML = `<option value="">Erro ao carregar raças</option>`;
    }
  }

  carregarRacas();
});