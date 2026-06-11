
// =========================
// HORÁRIOS (30 EM 30 MIN)
// =========================
function gerarHorarios() {
  const horarios = [];

  function gerarPeriodo(inicio, fim) {
    let h = inicio;
    let m = 0;

    while (h < fim || (h === fim && m === 0)) {
      horarios.push(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
      );

      m += 30;
      if (m === 60) {
        m = 0;
        h++;
      }
    }
  }

  // manhã
  gerarPeriodo(8, 12);

  // tarde/noite
  gerarPeriodo(13, 20);

  return horarios;
}

const horariosPadrao = gerarHorarios();

// =========================
// VERIFICAR HORÁRIO LIVRE
// =========================
async function horarioDisponivel(barbeiro, data, hora) {
  const { data: agendamentos } = await supabaseClient
    .from("agendamentos")
    .select("*")
    .eq("barbeiro", barbeiro)
    .eq("data", data)
    .eq("hora", hora)
    .neq("status", "cancelado");

  return !agendamentos || agendamentos.length === 0;
}

// =========================
// PEGAR HORÁRIOS LIVRES
// =========================
async function horariosLivres(barbeiro, data) {
  const { data: agendamentos } = await supabaseClient
    .from("agendamentos")
    .select("hora")
    .eq("barbeiro", barbeiro)
    .eq("data", data)
    .neq("status", "cancelado");

  const ocupados = (agendamentos || []).map(a => a.hora);

  return horariosPadrao.filter(h => !ocupados.includes(h));
}

// =========================
// CRIAR AGENDAMENTO
// =========================
console.log("AGENDAR FOI CHAMADO");
async function criarAgendamento(cliente, telefone, barbeiro, servico, data, hora) {

  const livre = await horarioDisponivel(barbeiro, data, hora);

  if (!livre) {
    alert("Horário já está ocupado!");
    return;
  }

  const { error } = await supabaseClient
    .from("agendamentos")
    .insert([{
      cliente_nome: cliente,
      cliente_telefone: telefone,
      barbeiro,
      servico,
      data,
      hora,
      status: "confirmado"
    }]);

  if (error) {
    console.log(error);
    alert("Erro ao criar agendamento");
  } else {
    alert("Agendamento realizado com sucesso!");
  }
}

// =========================
// CANCELAR AGENDAMENTO
// =========================
async function cancelarAgendamento(id) {
  const { error } = await supabaseClient
    .from("agendamentos")
    .update({ status: "cancelado" })
    .eq("id", id);

  if (!error) {
    alert("Agendamento cancelado!");
  }
}

// =========================
// AGENDA DO BARBEIRO
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
// HISTÓRICO DO CLIENTE
// =========================
async function historicoCliente(telefone) {
  const { data } = await supabaseClient
    .from("agendamentos")
    .select("*")
    .eq("cliente_telefone", telefone)
    .order("data", { ascending: false });

  return data || [];
}

document.getElementById("formAgendamento").addEventListener("submit", async function (e) {
  e.preventDefault();

  console.log("FORM ENVIADO");

  const nome = document.getElementById("nome").value;
  const barbeiro = document.getElementById("barbeiro").value;
  const servico = document.getElementById("servico").value;
  const data = document.getElementById("data").value;
  const hora = document.getElementById("hora").value;

  const { error } = await supabaseClient
    .from("agendamentos")
    .insert([
      {
        cliente_nome: nome,
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
});
