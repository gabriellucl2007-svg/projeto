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


const SUPABASE_URL = "https://vsvlfkddhebxutugtniu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzdmxma2RkaGVieHV0dWd0bml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NjYyOTQsImV4cCI6MjA5NjU0MjI5NH0.uOveZk9BJ7WvIgR8E3_Cd65Svq6Nm5r7mfctpxoj3S8";

const form = document.getElementById("formAgendamento");
const lista = document.getElementById("listaAgendamentos");

// ===============================
// CONFIG
// ===============================
const headers = {
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json"
};

// ===============================
// BLOQUEAR DATAS PASSADAS
// ===============================
const hoje = new Date().toISOString().split("T")[0];
const dataInput = document.getElementById("data");
if (dataInput) dataInput.min = hoje;

// ===============================
// BUSCAR AGENDAMENTOS
// ===============================
async function buscarAgendamentos() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/agendamentos?select=*&order=data.asc,hora.asc`,
      { headers }
    );

    return await res.json();
  } catch (err) {
    console.error("Erro ao buscar agendamentos:", err);
    return [];
  }
}

// ===============================
// VERIFICAR CONFLITO
// ===============================
async function temConflito(barbeiro, data, hora) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/agendamentos?barbeiro=eq.${barbeiro}&data=eq.${data}&hora=eq.${hora}`,
    { headers }
  );

  const dataRes = await res.json();
  return dataRes.length > 0;
}

// ===============================
// SALVAR AGENDAMENTO
// ===============================
async function salvarAgendamento(dados) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/agendamentos`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(dados)
    }
  );

  if (!res.ok) {
    throw new Error("Erro ao salvar agendamento");
  }
}

// ===============================
// RENDER LISTA
// ===============================
async function renderizar() {
  const agendamentos = await buscarAgendamentos();

  if (!lista) return;

  if (!agendamentos.length) {
    lista.innerHTML = "<p>Nenhum agendamento ainda.</p>";
    return;
  }

  lista.innerHTML = agendamentos.map(a => `
    <div class="card">
      <p><strong>${a.nome}</strong></p>
      <p>Barbeiro: ${a.barbeiro}</p>
      <p>Data: ${a.data}</p>
      <p>Horário: ${a.hora}</p>
    </div>
  `).join("");
}

// ===============================
// SUBMIT FORM
// ===============================
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const barbeiro = document.getElementById("barbeiro").value;
    const data = document.getElementById("data").value;
    const hora = document.getElementById("hora").value;

    if (!nome || !barbeiro || !data || !hora) {
      alert("Preencha todos os campos");
      return;
    }

    try {
      // VERIFICAR CONFLITO
      const conflito = await temConflito(barbeiro, data, hora);

      if (conflito) {
        alert("Este horário já está ocupado!");
        return;
      }

      // SALVAR
      await salvarAgendamento({
        nome,
        barbeiro,
        data,
        hora
      });

      // WHATSAPP (não obrigatório pro sistema)
      const telefone = "5537998619864";
      const mensagem = `Olá! Novo agendamento:
Nome: ${nome}
Barbeiro: ${barbeiro}
Data: ${data}
Hora: ${hora}`;

      window.open(
        `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`,
        "_blank"
      );

      form.reset();
      await renderizar();

      alert("Agendamento realizado com sucesso!");

    } catch (err) {
      console.error(err);
      alert("Erro ao criar agendamento");
    }
  });
}

// ===============================
// INICIAL
// ===============================
renderizar();
