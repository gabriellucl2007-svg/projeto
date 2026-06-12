// =============================================
// ESTAÇÃO BARBER — scripts.js
// =============================================

const SUPABASE_URL = "https://vsvlfkddhebxutugtniu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzdmxma2RkaGVieHV0dWd0bml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NjYyOTQsImV4cCI6MjA5NjU0MjI5NH0.uOveZk9BJ7WvIgR8E3_Cd65Svq6Nm5r7mfctpxoj3S8";
if (!window._supabaseClient) {
    window._supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}
const supabase = window._supabaseClient;
// =============================================
// INICIALIZAÇÃO (index.html)
// =============================================

document.addEventListener("DOMContentLoaded", async () => {
    // Só roda na index.html (tem loginBox)
    if (!document.getElementById("loginBox")) return;

    const { data } = await supabase.auth.getSession();

    if (data.session) {
        mostrarApp();
    } else {
        mostrarLogin();
    }

    // Bloqueia datas passadas
    const dataInput = document.getElementById("data");
    if (dataInput) {
        dataInput.min = new Date().toISOString().split("T")[0];
    }

    // Formulário de agendamento
    const form = document.getElementById("formAgendamento");
    if (form) {
        form.addEventListener("submit", agendarHorario);
    }
});

// =============================================
// NAVEGAÇÃO ENTRE TELAS
// =============================================

function mostrarLogin() {
    const loginBox = document.getElementById("loginBox");
    const app      = document.getElementById("app");
    if (loginBox) loginBox.classList.remove("hidden");
    if (app)      app.style.display = "none";
}

function mostrarApp() {
    const loginBox = document.getElementById("loginBox");
    const app      = document.getElementById("app");
    if (loginBox) loginBox.classList.add("hidden");
    if (app)      app.style.display = "block";
    renderizarAgendamentos();
}

// =============================================
// ABAS LOGIN / CADASTRO
// =============================================

function mostrarAbaLogin() {
    document.getElementById("abLogin").style.display    = "block";
    document.getElementById("abCadastro").style.display = "none";
}

function mostrarAbaCadastro() {
    document.getElementById("abLogin").style.display    = "none";
    document.getElementById("abCadastro").style.display = "block";
}

// =============================================
// AUTENTICAÇÃO
// =============================================

async function login() {
    const email    = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Preencha email e senha.");
        return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        alert("Email ou senha incorretos.");
        return;
    }

    mostrarApp();
}

async function fazerCadastro() {
    const nome     = document.getElementById("nomeCadastro").value.trim();
    const email    = document.getElementById("emailCadastro").value.trim();
    const password = document.getElementById("passwordCadastro").value;

    if (!nome || !email || !password) {
        alert("Preencha todos os campos.");
        return;
    }

    if (password.length < 6) {
        alert("A senha deve ter pelo menos 6 caracteres.");
        return;
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nome } }
    });

    if (error) {
        alert("Erro ao cadastrar: " + error.message);
        return;
    }

    alert("Cadastro realizado! Verifique seu email para confirmar a conta.");
    document.getElementById("nomeCadastro").value     = "";
    document.getElementById("emailCadastro").value    = "";
    document.getElementById("passwordCadastro").value = "";
    mostrarAbaLogin();
}

async function fazerLogout() {
    await supabase.auth.signOut();

    // Se estiver na admin, volta para index
    if (window.location.pathname.includes("admin")) {
        window.location.href = "index.html";
    } else {
        mostrarLogin();
    }
}

// =============================================
// AGENDAMENTO
// =============================================

async function agendarHorario(e) {
    e.preventDefault();

    const { data } = await supabase.auth.getSession();
    if (!data.session) {
        alert("Você precisa estar logado para agendar.");
        mostrarLogin();
        return;
    }

    const userId   = data.session.user.id;
    const nome     = document.getElementById("nome").value.trim();
    const barbeiro = document.getElementById("barbeiro").value;
    const servico  = document.getElementById("servico").value;
    const dataAgend = document.getElementById("data").value;
    const hora     = document.getElementById("hora").value;

    if (!nome || !barbeiro || !servico || !dataAgend || !hora) {
        alert("Preencha todos os campos antes de confirmar.");
        return;
    }

    // Verifica conflito de horário
    const { data: conflito } = await supabase
        .from("agendamentos")
        .select("id")
        .eq("barbeiro", barbeiro)
        .eq("data", dataAgend)
        .eq("hora", hora);

    if (conflito && conflito.length > 0) {
        alert("Este horário já está ocupado! Por favor, escolha outro.");
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
        alert("Erro ao realizar agendamento. Tente novamente.");
        console.error(error);
        return;
    }

    alert("Agendamento confirmado com sucesso!");
    document.getElementById("formAgendamento").reset();

    // Reaplica mínimo de data após reset
    const dataInput = document.getElementById("data");
    if (dataInput) dataInput.min = new Date().toISOString().split("T")[0];

    await renderizarAgendamentos();
}

// =============================================
// LISTAGEM DE AGENDAMENTOS (cliente)
// =============================================

async function renderizarAgendamentos() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) { mostrarLogin(); return; }

    const userId = data.session.user.id;

    const { data: agendamentos, error } = await supabase
        .from("agendamentos")
        .select("*")
        .eq("user_id", userId)
        .order("data",  { ascending: true })
        .order("hora",  { ascending: true });

    if (error) { console.error(error); return; }

    const lista = document.getElementById("listaAgendamentos");
    if (!lista) return;

    if (!agendamentos || agendamentos.length === 0) {
        lista.innerHTML = "<p style='color:#888; text-align:center; padding:20px 0;'>Você não tem agendamentos ainda.</p>";
        return;
    }

    lista.innerHTML = agendamentos.map(a => `
        <div class="card">
            <p><strong>${a.nome}</strong></p>
            <p>Barbeiro: ${a.barbeiro}</p>
            <p>Serviço: ${a.servico}</p>
            <p>Data: ${formatarData(a.data)}</p>
            <p>Horário: ${a.hora}</p>
            <p>Status: <span style="color:${a.status === 'confirmado' ? '#2ecc71' : '#e74c3c'}">${a.status}</span></p>
            <button onclick="cancelarAgendamento(${a.id})"
                style="color:#e74c3c; margin-top:10px; padding:8px 16px; border:1px solid #e74c3c;
                       background:transparent; border-radius:4px; cursor:pointer;">
                Cancelar
            </button>
        </div>
    `).join("");
}

// =============================================
// CANCELAR (cliente)
// =============================================

async function cancelarAgendamento(id) {
    if (!confirm("Tem certeza que quer cancelar este agendamento?")) return;

    const { error } = await supabase
        .from("agendamentos")
        .delete()
        .eq("id", id);

    if (error) { alert("Erro ao cancelar. Tente novamente."); return; }

    alert("Agendamento cancelado.");
    await renderizarAgendamentos();
}

// =============================================
// UTILITÁRIOS
// =============================================

function formatarData(dataStr) {
    if (!dataStr) return "";
    const [ano, mes, dia] = dataStr.split("-");
    return `${dia}/${mes}/${ano}`;
}
