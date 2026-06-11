console.log("JS carregado");

// =========================
// HORÁRIOS (30 EM 30 MIN)
// =========================
function gerarHorarios() {
  const horarios = [];

  function gerarPeriodo(inicio, fim) {
    let h = inicio;
    let m = 0;

    while (h < fim || (h === fim && m === 0)) {
      horarios.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);

      m += 30;
      if (m === 60) {
        m = 0;
        h++;
      }
    }
  }

  gerarPeriodo(8, 12);
  gerarPeriodo(13, 20);

  return horarios;
}

const horariosPadrao = gerarHorarios();

// =========================
// VERIFICAR HORÁRIO
// =========================
async function horarioDisponivel(barbeiro, data, hora) {
  const { data: agendamentos } = await window.supabaseClient
    .from("agendamentos")
    .select("*")
    .eq("barbeiro", barbeiro)
    .eq("data", data)
    .eq("hora", hora)
    .neq("status", "cancelado");

  return !agendamentos || agendamentos.length === 0;
}

// =========================
// FORM PRINCIPAL (ÚNICO SISTEMA)
// =========================
document.getElementById("formAgendamento").addEventListener("submit", async function (e) {
  e.preventDefault();

  console.log("FORM ENVIADO");

  const nome = document.getElementById("nome").value;
  const telefone = document.getElementById("telefone")?.value || "";
  const barbeiro = document.getElementById("barbeiro").value;
  const servico = document.getElementById("servico").value;
  const data = document.getElementById("data").value;
  const hora = document.getElementById("hora").value;

  if (!nome || !barbeiro || !servico || !data || !hora) {
    alert("Preencha tudo!");
    return;
  }

  // checar disponibilidade
  const livre = await horarioDisponivel(barbeiro, data, hora);

  if (!livre) {
    alert("Horário já ocupado!");
    return;
  }

  const { error } = await supabaseClient
    .from("agendamentos")
    .insert([
      {
        nome: nome,
        telefone: telefone,
        barbeiro: barbeiro,
        servico: servico,
        data: data,
        hora: hora,
        status: "confirmado"
      }
    ]);

  if (error) {
    console.log(error);
    alert("Erro ao agendar");
    return;
  }

  alert("Agendado com sucesso!");
  this.reset();
});

// =========================
// CANCELAR
// =========================
async function cancelarAgendamento(id) {
  const { error } = await supabaseClient
    .from("agendamentos")
    .update({ status: "cancelado" })
    .eq("id", id);

  if (!error) alert("Cancelado!");
}

// =========================
// AGENDA BARBEIRO
// =========================
async function agendaDoBarbeiro(barbeiro, data) {
  const { data: agenda } = await supabaseClient
    .from("agendamentos")
    .select("*")
    .eq("barbeiro", barbeiro)
    .eq("data", data)
    .neq("status", "cancelado");

  return agenda || [];
}

// =========================
// HISTÓRICO CLIENTE
// =========================
async function historicoCliente(telefone) {
  const { data } = await supabaseClient
    .from("agendamentos")
    .select("*")
    .eq("telefone", telefone)
    .order("data", { ascending: false });

  return data || [];
}
