let agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];

/* =========================
   SALVAR
========================= */
function salvar() {
  localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
}

/* =========================
   HORÁRIOS BASE
========================= */
const horariosBase = [
  "08:00","09:00","10:00","11:00",
  "13:00","14:00","15:00","16:00","17:00","18:00","19:00"
];

/* =========================
   HORÁRIOS DISPONÍVEIS
========================= */
function horariosDisponiveis(data, barbeiro) {
  const ocupados = agendamentos
    .filter(a => a.data === data && a.barbeiro === barbeiro)
    .map(a => a.hora);

  return horariosBase.filter(h => !ocupados.includes(h));
}

/* =========================
   ATUALIZAR HORÁRIOS
========================= */
function atualizarHorarios() {
  const data = document.getElementById("data")?.value;
  const barbeiro = document.getElementById("barbeiro")?.value;
  const select = document.getElementById("hora");

  if (!data || !barbeiro || !select) return;

  const disponiveis = horariosDisponiveis(data, barbeiro);

  select.innerHTML = "<option value=''>Escolha o horário</option>";

  disponiveis.forEach(h => {
    const opt = document.createElement("option");
    opt.value = h;
    opt.textContent = h;
    select.appendChild(opt);
  });
}

/* =========================
   CRIAR AGENDAMENTO
========================= */
function agendar() {
  const nome = document.getElementById("nome").value;
  const barbeiro = document.getElementById("barbeiro").value;
  const servico = document.getElementById("servico").value;
  const data = document.getElementById("data").value;
  const hora = document.getElementById("hora").value;

  if (!nome || !barbeiro || !servico || !data || !hora) {
    alert("Preencha todos os campos");
    return;
  }

  const conflito = agendamentos.find(a =>
    a.data === data &&
    a.hora === hora &&
    a.barbeiro === barbeiro
  );

  if (conflito) {
    alert("Esse horário já está ocupado!");
    return;
  }

  agendamentos.push({
    id: Date.now(),
    nome,
    barbeiro,
    servico,
    data,
    hora
  });

  salvar();
  render();
  alert("Agendamento confirmado!");
}

/* =========================
   CANCELAR
========================= */
function cancelar(id) {
  agendamentos = agendamentos.filter(a => a.id !== id);
  salvar();
  render();
}

/* =========================
   MINHA CONTA (CLIENTE)
========================= */
function meusAgendamentos(nome) {
  return agendamentos.filter(a => a.nome === nome);
}

/* =========================
   RENDER LISTA
========================= */
function render() {
  const lista = document.getElementById("listaAgendamentos");
  if (!lista) return;

  lista.innerHTML = "";

  agendamentos.forEach(a => {
    const div = document.createElement("div");

    div.innerHTML = `
      <div class="card-agendamento">
        <h3>${a.servico}</h3>
        <p><b>Cliente:</b> ${a.nome}</p>
        <p><b>Barbeiro:</b> ${a.barbeiro}</p>
        <p><b>Data:</b> ${a.data}</p>
        <p><b>Hora:</b> ${a.hora}</p>

        <button onclick="cancelar(${a.id})">Cancelar</button>
      </div>
    `;

    lista.appendChild(div);
  });
}

/* =========================
   INICIAR SISTEMA
========================= */
document.addEventListener("DOMContentLoaded", () => {
  render();

  document.getElementById("data")?.addEventListener("change", atualizarHorarios);
  document.getElementById("barbeiro")?.addEventListener("change", atualizarHorarios);
});
