// ==============================
//  AGENDAMENTO.JS - Pet Love Care
//  Modal + WhatsApp + EmailJS
// ==============================

// CONFIGURAÇÃO DO WHATSAPP
const whatsappNumber = "5519987155840";

// CONFIGURAÇÃO EMAILJS
const EMAILJS_SERVICE_ID = "service_3owjlp4";
const EMAILJS_TEMPLATE_ID = "template_ifcl6qo";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formAgendamento");
  if (!form) return;

  const statusMsg = document.getElementById("mensagemStatus");
  const submitBtn = form.querySelector("button[type='submit']");

  // Modal
  const modal = document.getElementById("modalConfirmacao");
  const btnEditar = document.getElementById("btnEditar");
  const btnConfirmarEnvio = document.getElementById("btnConfirmarEnvio");

  // Tutor
  const inputTelefone = document.getElementById("telefone");

  // Pet
  const inputTipoPet = document.getElementById("tipoPet");
  const inputRaca = document.getElementById("raca");
  const inputPorte = document.getElementById("porte");
  const vacinaV8 = document.getElementById("vacinaV8");
  const vacinaRaiva = document.getElementById("vacinaRaiva");

  const grupoRaca = document.getElementById("grupoRaca");
  const grupoPorte = document.getElementById("grupoPorte");
  const grupoVacinas = document.getElementById("grupoVacinas");
  const grupoCastrado = document.getElementById("grupoCastrado");

  // Serviço
  const inputServico = document.getElementById("servico");
  const inputData = document.getElementById("data");
  const inputHora = document.getElementById("hora");

  const inputCheckin = document.getElementById("checkin");
  const inputCheckout = document.getElementById("checkout");

  const grupoData = document.getElementById("grupoData");
  const grupoHora = document.getElementById("grupoHora");
  const grupoHospedagem = document.getElementById("grupoHospedagem");
  const grupoPeriodoHospedagem = document.getElementById("grupoPeriodoHospedagem");

  // Limite Hospedagem
  const inputQtdPetsHospedagem = document.getElementById("qtdPetsHospedagem");
  const grupoQtdPetsHospedagem = document.getElementById("grupoQtdPetsHospedagem");

  // Guardar dados para enviar somente após confirmação
  let dadosConfirmacao = null;

  // ==========================
  // FUNÇÕES AUXILIARES
  // ==========================
  function setStatus(message, type) {
    statusMsg.textContent = message;
    if (type === "success") statusMsg.style.color = "#1b7f3b";
    else if (type === "error") statusMsg.style.color = "#b00020";
    else statusMsg.style.color = "#333";
  }

  function limparNumero(valor) {
    return valor.replace(/\D/g, "");
  }

  function aplicarMascaraTelefone(valor) {
    let numeros = limparNumero(valor);
    if (numeros.length > 11) numeros = numeros.slice(0, 11);

    if (numeros.length <= 2) return `(${numeros}`;
    if (numeros.length <= 6) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    if (numeros.length <= 10) return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;

    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  }

  function validarData(dataSelecionada) {
    if (!dataSelecionada) return false;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const data = new Date(dataSelecionada);
    data.setHours(0, 0, 0, 0);

    return data >= hoje;
  }

  function validarHorario(horaSelecionada) {
    if (!horaSelecionada) return false;

    const [h, m] = horaSelecionada.split(":").map(Number);
    const minutos = h * 60 + m;

    return minutos >= 8 * 60 && minutos <= 20 * 60;
  }

  function formatarDataBR(dataISO) {
    if (!dataISO) return "Não informado";
    const [a, m, d] = dataISO.split("-");
    return `${d}/${m}/${a}`;
  }

  // Formata uma string de várias datas ("2026-05-10, 2026-05-11") para BR
  function formatarDatasBR(datasStr) {
    if (!datasStr) return "Não informado";
    return datasStr
      .split(",")
      .map((d) => formatarDataBR(d.trim()))
      .join(", ");
  }

  function getRadioValue(name) {
    const selecionado = document.querySelector(`input[name="${name}"]:checked`);
    return selecionado ? selecionado.value : "";
  }

function gerarMensagemWhatsApp(dados) {
  let infoPetExtra = "";

  if (dados.tipoPet === "Cachorro") {
    infoPetExtra += `*Raça:* ${dados.raca || "Não informado"}\n`;
    infoPetExtra += `*Porte/Peso:* ${dados.porte || "Não informado"}\n`;
    infoPetExtra += `*Vacinas:* ${dados.vacinas || "Não informado"}\n`;
  }

  if (dados.tipoPet === "Cachorro" || dados.tipoPet === "Gato") {
    infoPetExtra += `*Castrado:* ${dados.castrado || "Não informado"}\n`;
  }

  // ==========================
  // PREÇOS FIXOS
  // ==========================
  const PRECO_PASSEIO = 60;       // por hora
  const PRECO_VISITA = 80;        // por dia
  const PRECO_HOSPEDAGEM = 80;    // por dia

  // ==========================
  // FUNÇÕES DE CÁLCULO
  // ==========================
  function calcularQtdDiasHospedagem(checkin, checkout) {
    if (!checkin || !checkout) return 0;

    const dataCheckin = new Date(checkin);
    const dataCheckout = new Date(checkout);

    const diffMs = dataCheckout - dataCheckin;
    const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    // mínimo 1 dia
    return diffDias <= 0 ? 1 : diffDias;
  }

  function contarDatasSelecionadas(datasStr) {
    if (!datasStr) return 0;

    return datasStr
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean).length;
  }

  function contarDatasSelecionadasFlatpickr() {
    if (!flatpickrData) return 0;
    return flatpickrData.selectedDates.length;
  }

  // ==========================
  // CALCULAR VALOR TOTAL
  // ==========================
  let valorServico = "";
  let valorTotal = 0;

  if (dados.servico === "Passeio") {
    const qtdDias = contarDatasSelecionadasFlatpickr();
    const horasPorDia = 1; // padrão 1 hora por dia
    valorTotal = qtdDias * horasPorDia * PRECO_PASSEIO;
    valorServico = `R$ ${PRECO_PASSEIO.toFixed(2)} / hora`;
  }

  if (dados.servico === "Visita em Casa") {
    const qtdDias = contarDatasSelecionadasFlatpickr();
    valorTotal = qtdDias * PRECO_VISITA;
    valorServico = `R$ ${PRECO_VISITA.toFixed(2)} / dia`;
  }

  if (dados.servico === "Hospedagem") {
    const qtdDias = calcularQtdDiasHospedagem(dados.checkin, dados.checkout);
    valorTotal = qtdDias * PRECO_HOSPEDAGEM;
    valorServico = `R$ ${PRECO_HOSPEDAGEM.toFixed(2)} / dia`;
  }

  // ==========================
  // BLOCO SERVIÇO
  // ==========================
  let blocoServico = "";

  if (dados.servico === "Hospedagem") {
    const qtdDias = calcularQtdDiasHospedagem(dados.checkin, dados.checkout);

    blocoServico =
      `*Check-in:* ${formatarDataBR(dados.checkin)}\n` +
      `*Check-out:* ${formatarDataBR(dados.checkout)}\n` +
      `*Período Entrada/Saída:* ${dados.periodoHospedagem || "Não informado"}\n` +
      `*Quantidade de Pets:* ${dados.qtdPetsHospedagem}\n` +
      `*Diárias:* ${qtdDias}\n` +
      `*Valor Unitário:* ${valorServico}\n` +
      `*Total Estimado:* R$ ${valorTotal.toFixed(2)}`;
  } else {
    const qtdDias = contarDatasSelecionadas(dados.data);

    blocoServico =
      `*Data(s):* ${formatarDatasBR(dados.data)}\n` +
      `*Horário:* ${dados.hora}\n` +
      `*Quantidade:* ${qtdDias} dia(s)\n` +
      `*Valor Unitário:* ${valorServico}\n` +
      `*Total Estimado:* R$ ${valorTotal.toFixed(2)}`;
  }

  // ==========================
  // TABELA COMPLETA
  // ==========================
  const tabelaPrecos =
    `━━━━━━━━━━━━━━━━━━\n` +
    `💰 *TABELA DE VALORES*\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `🐾 *Passeio:* R$ 60,00 / hora\n` +
    `🏠 *Visita a domicílio:* R$ 80,00 / dia\n` +
    `🏡 *Hospedagem:* R$ 80,00 / dia\n`;

  return `
Olá! Gostaria de agendar um serviço com a *Pet Love Care* 🐾

━━━━━━━━━━━━━━━━━━
👤 *DADOS DO TUTOR*
━━━━━━━━━━━━━━━━━━
*Nome:* ${dados.nome}
*WhatsApp:* ${dados.telefone}
*E-mail:* ${dados.email}

━━━━━━━━━━━━━━━━━━
🐾 *SOBRE O PET*
━━━━━━━━━━━━━━━━━━
*Pet:* ${dados.pet}
*Tipo:* ${dados.tipoPet}
${infoPetExtra.trim()}

━━━━━━━━━━━━━━━━━━
🦴 *SERVIÇO*
━━━━━━━━━━━━━━━━━━
*Serviço:* ${dados.servico}
${blocoServico}

━━━━━━━━━━━━━━━━━━
📝 *OBSERVAÇÕES*
━━━━━━━━━━━━━━━━━━
${dados.obs || "Nenhuma"}

${tabelaPrecos}

⚠️ *Obs:* Valor estimado, pode variar conforme necessidades do pet.

Aguardo confirmação. Obrigado(a)! 😊
  `.trim();
}

  // ==========================
  // MODAL - FUNÇÕES
  // ==========================
  function abrirModalConfirmacao(dados) {
    if (!modal) return;

    document.getElementById("confNome").textContent = dados.nome;
    document.getElementById("confTelefone").textContent = dados.telefone;
    document.getElementById("confEmail").textContent = dados.email;

    document.getElementById("confPet").textContent = dados.pet;
    document.getElementById("confTipoPet").textContent = dados.tipoPet;

    document.getElementById("confRaca").textContent = dados.raca || "Não informado";
    document.getElementById("confPorte").textContent = dados.porte || "Não informado";

    document.getElementById("confCastrado").textContent = dados.castrado || "Não informado";
    document.getElementById("confVacinas").textContent = dados.vacinas || "Não informado";

    document.getElementById("confServico").textContent = dados.servico;

    document.getElementById("confData").textContent =
      dados.servico === "Hospedagem" ? "Não se aplica" : formatarDatasBR(dados.data);

    document.getElementById("confHora").textContent =
      dados.servico === "Hospedagem" ? "Não se aplica" : (dados.hora || "Não informado");

    document.getElementById("confCheckin").textContent =
      dados.servico === "Hospedagem" ? formatarDataBR(dados.checkin) : "Não se aplica";

    document.getElementById("confCheckout").textContent =
      dados.servico === "Hospedagem" ? formatarDataBR(dados.checkout) : "Não se aplica";

    document.getElementById("confPeriodoHospedagem").textContent =
      dados.servico === "Hospedagem" ? (dados.periodoHospedagem || "Não informado") : "Não se aplica";

    document.getElementById("confQtdPetsHospedagem").textContent =
      dados.servico === "Hospedagem" ? (dados.qtdPetsHospedagem || "Não informado") : "Não se aplica";

    document.getElementById("confObs").textContent = dados.obs || "Nenhuma";

    modal.style.display = "flex";
  }

  function fecharModalConfirmacao() {
    if (!modal) return;
    modal.style.display = "none";
  }

  // Fechar modal clicando fora
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        fecharModalConfirmacao();
      }
    });
  }

  // Botão Editar
  if (btnEditar) {
    btnEditar.addEventListener("click", () => {
      fecharModalConfirmacao();
    });
  }

  // Botão Confirmar Envio
  if (btnConfirmarEnvio) {
    btnConfirmarEnvio.addEventListener("click", () => {
      if (!dadosConfirmacao) return;

      // ==========================
      // ENVIO DE EMAIL AUTOMÁTICO
      // ==========================
      if (typeof emailjs !== "undefined") {
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          nome: dadosConfirmacao.nome,
          email: dadosConfirmacao.email,
          servico: dadosConfirmacao.servico,

          data: dadosConfirmacao.servico === "Hospedagem"
            ? `Check-in: ${formatarDataBR(dadosConfirmacao.checkin)} | Check-out: ${formatarDataBR(dadosConfirmacao.checkout)}`
            : formatarDatasBR(dadosConfirmacao.data),

          hora: dadosConfirmacao.servico === "Hospedagem"
            ? dadosConfirmacao.periodoHospedagem
            : dadosConfirmacao.hora
        })
          .then(() => {
            console.log("E-mail enviado com sucesso!");
          })
          .catch((error) => {
            console.log("Erro ao enviar e-mail:", error);
          });
      }

      // ==========================
      // ENVIO PARA WHATSAPP
      // ==========================
      submitBtn.disabled = true;
      submitBtn.textContent = "Abrindo WhatsApp...";
      setStatus("✅ Redirecionando para o WhatsApp...", "success");

      const mensagem = gerarMensagemWhatsApp(dadosConfirmacao);
      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensagem)}`;
      window.location.href = url;

      fecharModalConfirmacao();

      // RESET
      form.reset();
      if (flatpickrData) flatpickrData.clear();
      atualizarCamposServico();
      atualizarCamposPet();

      submitBtn.disabled = false;
      submitBtn.textContent = "📲 Enviar Agendamento para o WhatsApp";
    });
  }

  // ==========================
  // CONFIGURAÇÕES INICIAIS
  // ==========================
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  const minDate = `${ano}-${mes}-${dia}`;

  if (inputCheckin) inputCheckin.min = minDate;
  if (inputCheckout) inputCheckout.min = minDate;

  // Flatpickr - calendário com múltiplas datas para Passeio/Visita
  // Exibe em dd/mm/aaaa (BR) e salva internamente em aaaa-mm-dd
  let flatpickrData = null;
  if (inputData && typeof flatpickr !== "undefined") {
    flatpickrData = flatpickr(inputData, {
      mode: "multiple",
      dateFormat: "Y-m-d",
      altInput: true,
      altFormat: "d/m/Y",
      minDate: "today",
      locale: typeof flatpickr.l10ns !== "undefined" && flatpickr.l10ns.pt ? flatpickr.l10ns.pt : "default",
      conjunction: ", ",
      allowInput: false
    });
  }

  // Máscara WhatsApp
  if (inputTelefone) {
    inputTelefone.addEventListener("input", () => {
      inputTelefone.value = aplicarMascaraTelefone(inputTelefone.value);
    });
  }

  // ==========================
  // LÓGICA CONDICIONAL - PET
  // ==========================
  function atualizarCamposPet() {
    const tipo = inputTipoPet.value;

    if (grupoRaca) grupoRaca.style.display = "none";
    if (grupoPorte) grupoPorte.style.display = "none";
    if (grupoVacinas) grupoVacinas.style.display = "none";
    if (grupoCastrado) grupoCastrado.style.display = "none";

    if (inputRaca) inputRaca.required = false;
    if (inputPorte) inputPorte.required = false;

    if (tipo === "Cachorro") {
      grupoRaca.style.display = "";
      grupoPorte.style.display = "";
      grupoVacinas.style.display = "";
      grupoCastrado.style.display = "";

      inputRaca.required = true;
      inputPorte.required = true;
    }

    if (tipo === "Gato") {
      grupoCastrado.style.display = "";
    }
  }

  if (inputTipoPet) {
    inputTipoPet.addEventListener("change", atualizarCamposPet);
    atualizarCamposPet();
  }

  // ==========================
  // LÓGICA CONDICIONAL - SERVIÇO
  // ==========================
  function atualizarCamposServico() {
    const servico = inputServico.value;
    const ehHospedagem = servico === "Hospedagem";
    const ehPasseioOuVisita = servico === "Passeio" || servico === "Visita em Casa";

    if (grupoData) grupoData.style.display = ehPasseioOuVisita ? "" : "none";
    if (grupoHora) grupoHora.style.display = ehPasseioOuVisita ? "" : "none";

    if (grupoHospedagem) grupoHospedagem.style.display = ehHospedagem ? "" : "none";
    if (grupoPeriodoHospedagem) grupoPeriodoHospedagem.style.display = ehHospedagem ? "" : "none";

    if (grupoQtdPetsHospedagem) grupoQtdPetsHospedagem.style.display = ehHospedagem ? "" : "none";

    if (inputData) inputData.required = ehPasseioOuVisita;
    if (inputHora) inputHora.required = ehPasseioOuVisita;

    if (inputCheckin) inputCheckin.required = ehHospedagem;
    if (inputCheckout) inputCheckout.required = ehHospedagem;

    if (inputQtdPetsHospedagem) inputQtdPetsHospedagem.required = ehHospedagem;
  }

  if (inputServico) {
    inputServico.addEventListener("change", atualizarCamposServico);
    atualizarCamposServico();
  }

  // Validação horário
  if (inputHora) {
    inputHora.addEventListener("change", () => {
      if (!validarHorario(inputHora.value)) {
        setStatus("⚠️ Escolha um horário entre 08:00 e 20:00.", "error");
        inputHora.value = "";
        inputHora.focus();
      }
    });
  }

  // Garantir checkout >= checkin
  if (inputCheckin) {
    inputCheckin.addEventListener("change", () => {
      if (inputCheckin.value) {
        inputCheckout.min = inputCheckin.value;

        if (inputCheckout.value && inputCheckout.value < inputCheckin.value) {
          inputCheckout.value = "";
        }
      }
    });
  }

  // ==========================
  // SUBMIT DO FORMULÁRIO
  // ==========================
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const email = document.getElementById("email").value.trim();

    const pet = document.getElementById("pet").value.trim();
    const tipoPet = document.getElementById("tipoPet").value;

    const servico = document.getElementById("servico").value;

    const data = inputData ? inputData.value : "";
    const hora = inputHora ? inputHora.value : "";

    const checkin = inputCheckin ? inputCheckin.value : "";
    const checkout = inputCheckout ? inputCheckout.value : "";

    const qtdPetsHospedagem = inputQtdPetsHospedagem ? inputQtdPetsHospedagem.value : "";

    const obs = document.getElementById("obs").value.trim();

    const raca = inputRaca ? inputRaca.value.trim() : "";
    const porte = inputPorte ? inputPorte.value : "";

    const castrado = getRadioValue("castrado");
    const periodoHospedagem = getRadioValue("periodoHospedagem");

    // Vacinas
    let vacinas = "";
    if (tipoPet === "Cachorro") {
      const listaVacinas = [];
      if (vacinaV8 && vacinaV8.checked) listaVacinas.push("V8/V10");
      if (vacinaRaiva && vacinaRaiva.checked) listaVacinas.push("Antirrábica");

      vacinas = listaVacinas.length ? listaVacinas.join(", ") : "Nenhuma informada";
    }

    // Validação básica
    if (!nome || !telefone || !email || !pet || !tipoPet || !servico) {
      setStatus("⚠️ Por favor, preencha todos os campos obrigatórios.", "error");
      return;
    }

    // Validação de telefone
    const telLimpo = limparNumero(telefone);
    if (telLimpo.length < 10) {
      setStatus("⚠️ Digite um número de WhatsApp válido.", "error");
      return;
    }

    // Validação por serviço
    if (servico === "Hospedagem") {
      if (!checkin || !checkout) {
        setStatus("⚠️ Informe as datas de check-in e check-out.", "error");
        return;
      }

      if (!validarData(checkin)) {
        setStatus("⚠️ A data de check-in não pode ser no passado.", "error");
        return;
      }

      if (checkout < checkin) {
        setStatus("⚠️ A data de check-out deve ser igual ou posterior ao check-in.", "error");
        return;
      }

      if (!periodoHospedagem) {
        setStatus("⚠️ Selecione o período de entrada/saída.", "error");
        return;
      }

      if (!qtdPetsHospedagem) {
        setStatus("⚠️ Selecione a quantidade de pets para hospedagem (máx. 3).", "error");
        return;
      }
    } else {
      if (!data) {
        setStatus("⚠️ Selecione ao menos uma data.", "error");
        return;
      }

      const datasSelecionadas = data.split(",").map((d) => d.trim()).filter(Boolean);
      const algumaInvalida = datasSelecionadas.some((d) => !validarData(d));
      if (algumaInvalida) {
        setStatus("⚠️ Você não pode agendar para uma data passada.", "error");
        return;
      }

      if (!hora) {
        setStatus("⚠️ Selecione um horário.", "error");
        return;
      }

      if (!validarHorario(hora)) {
        setStatus("⚠️ O horário deve ser entre 08:00 e 20:00.", "error");
        return;
      }
    }

    // Validação pet cachorro
    if (tipoPet === "Cachorro") {
      if (!raca || !porte) {
        setStatus("⚠️ Preencha Raça e Porte/Peso do cachorro.", "error");
        return;
      }

      if (!castrado) {
        setStatus("⚠️ Informe se o pet é castrado.", "error");
        return;
      }
    }

    // Validação pet gato
    if (tipoPet === "Gato") {
      if (!castrado) {
        setStatus("⚠️ Informe se o pet é castrado.", "error");
        return;
      }
    }

    const dados = {
      nome,
      telefone,
      email,
      pet,
      tipoPet,
      raca,
      porte,
      vacinas,
      castrado,
      servico,
      data,
      hora,
      checkin,
      checkout,
      periodoHospedagem,
      qtdPetsHospedagem,
      obs
    };

    dadosConfirmacao = dados;

    setStatus("📋 Confirme os dados antes de enviar.", "success");
    abrirModalConfirmacao(dadosConfirmacao);
  });
});
