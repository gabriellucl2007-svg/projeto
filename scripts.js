const supabase = window.supabaseClient;

// LOGIN
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert("Email ou senha inválidos");
    return;
  }

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("app").style.display = "block";
}

  mostrarApp();
}

// =========================
// MOSTRAR SITE
// =========================
function mostrarApp() {
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("app").style.display = "block";
}

// =========================
// VERIFICAR LOGIN AO ABRIR
// =========================
async function verificarLogin() {
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    mostrarApp();
  } else {
    document.getElementById("loginBox").style.display = "block";
    document.getElementById("app").style.display = "none";
  }
}

verificarLogin();

// =========================
// AGENDAMENTO
// =========================
document.getElementById("formAgendamento").addEventListener("submit", async function (e) {
  e.preventDefault();

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

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    alert("Você precisa estar logado");
    return;
  }

  const { error } = await supabase
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
  this.reset();
});
