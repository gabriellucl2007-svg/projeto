
// =========================
// SUPABASE CONEXÃO
// =========================
const supabaseUrl = "https://vsvlfkddhebxutugtniu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzdmxma2RkaGVieHV0dWd0bml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NjYyOTQsImV4cCI6MjA5NjU0MjI5NH0.uOveZk9BJ7WvIgR8E3_Cd65Svq6Nm5r7mfctpxoj3S8";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

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
