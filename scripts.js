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
// HORÁRIO DISPONÍVEL
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
// FORM
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

  const { data: userData } = await window.supabaseClient.auth.getUser();
const user = userData.user;

if (!user) {
  alert("Usuário não encontrado");
  return;
}

const { error } = await window.supabaseClient
  .from("agendamentos")
  .insert([
    {
      nome,
      telefone,
      barbeiro,
      servico,
      data,
      hora,
      status: "confirmado",
      user_id: user.id
    }
  ]);

if (error) {
  console.log(error);
  alert("Erro ao agendar");
  return;
}

alert("Agendado com sucesso!");

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
  const { error } = await window.supabaseClient
    .from("agendamentos")
    .update({ status: "cancelado" })
    .eq("id", id);

  if (!error) alert("Cancelado!");
}

// =========================
// LOGIN
// =========================
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await window.supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert("Erro no login");
    return;
  }

  alert("Logado com sucesso!");
}

const supabaseClient = supabase.createClient(
  "https://vsvlfkddhebxutugtniu.supabase.co",
  "SUA_ANON_KEY"
);

// 🔐 LOGIN
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert("Erro no login");
    return;
  }

  mostrarApp();
}

// ✔ MOSTRAR SITE
function mostrarApp() {
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("app").style.display = "block";
}

// ✔ VERIFICAR AO ENTRAR NA PÁGINA
async function verificarLogin() {
  const { data } = await supabaseClient.auth.getUser();

  if (data.user) {
    mostrarApp();
  } else {
    document.getElementById("loginBox").style.display = "block";
    document.getElementById("app").style.display = "none";
  }
}

verificarLogin();
