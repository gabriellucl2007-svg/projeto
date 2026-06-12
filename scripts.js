// Inicializa Supabase
const SUPABASE_URL = "https://vsvlfkddhebxutugtniu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzdmxma2RkaGVieHV0dWd0bml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NjYyOTQsImV4cCI6MjA5NjU0MjI5NH0.uOveZk9BJ7WvIgR8E3_Cd65Svq6Nm5r7mfctpxoj3S8";

// Cria cliente Supabase
const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_KEY;
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

// Quando a página carrega
document.addEventListener("DOMContentLoaded", async () => {
    // Verifica se tem usuário logado
    const { data } = await supabase.auth.getSession();
    
    if (data.session) {
        mostrarApp();
    } else {
        mostrarLogin();
    }
});

// Mostra tela de login
function mostrarLogin() {
    const loginBox = document.getElementById("loginBox");
    const app = document.getElementById("app");
    if (loginBox) loginBox.style.display = "block";
    if (app) app.style.display = "none";
}

// Mostra área de agendamento
function mostrarApp() {
    const loginBox = document.getElementById("loginBox");
    const app = document.getElementById("app");
    if (loginBox) loginBox.style.display = "none";
    if (app) app.style.display = "block";
    renderizar();
    bloquearDatasPassadas();
}

// Bloqueia datas passadas
function bloquearDatasPassadas() {
    const dataInput = document.getElementById("data");
    if (dataInput) {
        const hoje = new Date().toISOString().split("T")[0];
        dataInput.min = hoje;
    }
}

// FAZER LOGIN
async function fazerLogin() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Preencha email e senha");
        return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        alert("Email ou senha incorretos");
        console.log(error);
        return;
    }

    mostrarApp();
}

// FAZER CADASTRO
async function fazerCadastro() {
    const email = document.getElementById("emailCadastro").value;
    const password = document.getElementById("passwordCadastro").value;
    const nome = document.getElementById("nomeCadastro").value;

    if (!email || !password || !nome) {
        alert("Preencha todos os campos");
        return;
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                nome: nome
            }
        }
    });

    if (error) {
        alert("Erro ao cadastrar: " + error.message);
        return;
    }

    alert("Cadastro feito! Verifique seu email para confirmar.");
    document.getElementById("emailCadastro").value = "";
    document.getElementById("passwordCadastro").value = "";
    document.getElementById("nomeCadastro").value = "";
}

// FAZER LOGOUT
async function fazerLogout() {
    await supabase.auth.signOut();
    mostrarLogin();
}

// BUSCAR E RENDERIZAR AGENDAMENTOS
async function renderizar() {
    const { data } = await supabase.auth.getSession();
    
    if (!data.session) {
        mostrarLogin();
        return;
    }

    const userId = data.session.user.id;

    const { data: agendamentos, error } = await supabase
        .from("agendamentos")
        .select("*")
        .eq("user_id", userId)
        .order("data", { ascending: true });

    if (error) {
        console.log("Erro ao buscar agendamentos:", error);
        return;
    }

    const lista = document.getElementById("listaAgendamentos");
    if (!lista) return;

    if (!agendamentos || agendamentos.length === 0) {
        lista.innerHTML = "<p style='color: #888; text-align: center;'>Nenhum agendamento ainda.</p>";
        return;
    }

    lista.innerHTML = agendamentos.map(a => `
        <div class="card">
            <p><strong>${a.nome}</strong></p>
            <p>Barbeiro: ${a.barbeiro}</p>
            <p>Serviço: ${a.servico}</p>
            <p>Data: ${a.data}</p>
            <p>Horário: ${a.hora}</p>
            <p>Status: ${a.status}</p>
            <button onclick="cancelarAgendamento(${a.id})" style="color: #e74c3c; margin-top: 10px; padding: 8px 16px; border: 1px solid #e74c3c; background: transparent; border-radius: 4px; cursor: pointer;">Cancelar Agendamento</button>
        </div>
    `).join("");
}

// AGENDAR
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formAgendamento");
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const { data } = await supabase.auth.getSession();
            
            if (!data.session) {
                alert("Você precisa estar logado");
                mostrarLogin();
                return;
            }

            const userId = data.session.user.id;
            const nome = document.getElementById("nome").value;
            const barbeiro = document.getElementById("barbeiro").value;
            const servico = document.getElementById("servico").value;
            const dataAgend = document.getElementById("data").value;
            const hora = document.getElementById("hora").value;

            if (!nome || !barbeiro || !servico || !dataAgend || !hora) {
                alert("Preencha tudo!");
                return;
            }

            // Verifica conflito
            const { data: conflito } = await supabase
                .from("agendamentos")
                .select("id")
                .eq("barbeiro", barbeiro)
                .eq("data", dataAgend)
                .eq("hora", hora);

            if (conflito && conflito.length > 0) {
                alert("Este horário já está ocupado! Escolha outro.");
                return;
            }

            const { error } = await supabase
                .from("agendamentos")
                .insert([{
                    user_id: userId,
                    nome,
                    barbeiro,
                    servico,
                    data: dataAgend,
                    hora,
                    status: "confirmado"
                }]);

            if (error) {
                alert("Erro ao agendar");
                console.log(error);
                return;
            }

            alert("Agendado com sucesso!");
            form.reset();
            await renderizar();
        });
    }
});

// CANCELAR AGENDAMENTO
async function cancelarAgendamento(id) {
    if (!confirm("Tem certeza que quer cancelar este agendamento?")) return;

    const { error } = await supabase
        .from("agendamentos")
        .delete()
        .eq("id", id);

    if (error) {
        alert("Erro ao cancelar");
        console.log(error);
        return;
    }

    alert("Agendamento canceladoconsole.log("JS carregado");

// LOGIN
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await window.supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert("Erro no login");
    console.log(error);
    return;
  }

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("app").style.display = "block";
}

// CADASTRO
async function cadastro() {
  const nome = document.getElementById("nomeCadastro").value;
  const email = document.getElementById("emailCadastro").value;
  const password = document.getElementById("passwordCadastro").value;

  const { data, error } = await window.supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: { nome }
    }
  });

  if (error) {
    alert("Erro no cadastro");
    console.log(error);
    return;
  }

  alert("Conta criada! Agora faça login.");
}

// LOGOUT
async function logout() {
  await window.supabaseClient.auth.signOut();
  document.getElementById("loginBox").style.display = "flex";
  document.getElementById("app").style.display = "none";
}

// VERIFICAR LOGIN AO ABRIR SITE
async function checkLogin() {
  const { data } = await window.supabaseClient.auth.getUser();

  if (data.user) {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("app").style.display = "block";
  } else {
    document.getElementById("loginBox").style.display = "flex";
    document.getElementById("app").style.display = "none";
  }
}

checkLogin();
