// ==============================
//  FORM-OPTIONS.JS - Pet Love Care
//  Compatibilidade total (sem :has())
//  Marca radio/checkbox como "selecionado"
// ==============================

document.addEventListener("DOMContentLoaded", () => {

  function atualizarGrupo(grupo) {
    if (!grupo) return;

    const inputs = grupo.querySelectorAll("input");
    const labels = grupo.querySelectorAll("label");

    // Remove seleção de todos
    labels.forEach((lbl) => lbl.classList.remove("option-selected"));

    // Marca apenas os selecionados
    inputs.forEach((inp) => {
      if (inp.checked) {
        const label = inp.closest("label");
        if (label) label.classList.add("option-selected");
      }
    });
  }

  function configurarGrupos(selector) {
    const grupos = document.querySelectorAll(selector);

    grupos.forEach((grupo) => {
      const inputs = grupo.querySelectorAll("input");

      // Atualiza ao carregar
      atualizarGrupo(grupo);

      // Atualiza ao mudar
      inputs.forEach((input) => {
        input.addEventListener("change", () => {
          atualizarGrupo(grupo);
        });
      });
    });
  }

  // Radio groups e checkbox groups
  configurarGrupos(".radio-group");
  configurarGrupos(".checkbox-group");

});