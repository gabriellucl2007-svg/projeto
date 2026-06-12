console.log("JS carregado");

// =========================
// SUPABASE (usa o do HTML)
// =========================
const supabaseClient = window.supabaseClient;

// =========================
// LOGIN
// =========================
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.log(error);
    alert("Erro no login");
    return;
  }

  mostrarApp();
}

// =========================
// MOSTRAR / OCULTAR TELA
// =========================
function mostrarApp() {
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("app").style.display = "block";
}

function mostrarLogin() {
  document.getElementById("loginBox").style.display = "block";
  document.getElementById("app").style.display = "none";
}

// =========================
// VERIFICAR LOGIN AO ENTRAR
// =========================
async function verificarLogin() {
  const { data } = await supabaseClient.auth.getUser();

  if (data.user) {
    mostrarApp();
  } else {
    mostrarLogin();
  }
}

verificarLogin();

// =========================
// HORÁRIOS (30 min)
// =========================
function gerarHorarios() {
  const horarios = [];

  function periodo(inicio, fim) {
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

  periodo(8, 12);
  periodo(13, 20);

  return horarios;
}

const horariosPadrao = gerarHorarios();

// =========================
// VERIFICAR HORÁRIO
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
// AGENDAR (FORM)
// =========================
const form = document.getElementById("formAgendamento");

if (form) {
  form.addEventListener("submit", async function (e) {
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

    // usuário logado
    const { data: userData } = await supabaseClient.auth.getUser();
    const user = userData.user;

    if (!user) {
      alert("Faça login primeiro");
      return;
    }

    // checar horário
    const livre = await horarioDisponivel(barbeiro, data, hora);

    if (!livre) {
      alert("Horário ocupado");
      return;
    }

    const { error } = await supabaseClient
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
    form.reset();
  });
}

// =========================
// CANCELAR AGENDAMENTO
// =========================
async function cancelarAgendamento(id) {
  const { error } = await supabaseClient
    .from("agendamentos")
    .update({ status: "cancelado" })
    .eq("id", id);

  if (error) {
    console.log(error);
    return;
  }

  alert("Cancelado!");
}

verificarLogin();
