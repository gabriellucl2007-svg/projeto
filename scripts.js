// =============================================
// ESTAÇÃO BARBER — scripts.js
// =============================================

const SUPABASE_URL = "https://vsvlfkddhebxutugtniu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzdmxma2RkaGVieHV0dWd0bml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NjYyOTQsImV4cCI6MjA5NjU0MjI5NH0.uOveZk9BJ7WvIgR8E3_Cd65Svq6Nm5r7mfctpxoj3S8";

let supabase;

async function initSupabase() {
    if (window.supabase && window.supabase.createClient) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log("Supabase inicializado");
        verificarLoginAoAbrir();
    } else {
        setTimeout(initSupabase, 100);
    }
}

initSupabase();

async function verificarLoginAoAbrir() {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    if (data.session) {
        mostrarApp();
    } else {
        mostrarLogin();
    }
}

function mostrarLogin() {
    const loginBox = document.getElementById("loginBox");
    const app = document.getElementById("app");
    if (loginBox) loginBox.style.display = "block";
    if (app) app.style.display = "none";
}

function mostrarApp() {
    const loginBox = document.getElementById("loginBox");
    const app = document.getElementById("app");
    if (loginBox) loginBox.style.display = "none";
    if (app) app.style.display = "block";
    bloquearDatasPassadas();
    renderizar();
}

function bloquearDatasPassadas() {
    const dataInput = document.getElementById("data");
    if (dataInput) {
        const hoje = new Date().toISOString().split("T")[0];
        dataInput.min = hoje;
    }
}

async function login() {
    if (!supabase) {
        alert("Sistema carregando... tente novamente");
        return;
    }
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    if (!email || !password) {
        alert("Preencha email e senha");
        return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        alert("Email ou senha incorretos");
        console.log(error);
        return;
    }
    mostrarApp();
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
}

async function fazerCadastro() {
    if (!supabase) {
        alert("Sistema carregando... tente novamente");
        return;
    }
    const email = document.getElementById("emailCadastro").value;
    const password = document.getElementById("passwordCadastro").value;
    const nome = document.getElementById("nomeCadastro").value;
    if (!email || !password || !nome) {
        alert("Preencha todos os campos");
        return;
    }
    if (password.length < 6) {
        alert("Senha deve ter pelo menos 6 caracteres");
        return;
    }
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nome } }
    });
    if (error) {
        alert("Erro ao cadastrar: " + error.message);
        return;
    }
    alert("Cadastro feito! Verifique seu email para confirmar e faça login.");
    document.getElementById("emailCadastro").value = "";
    document.getElementById("passwordCadastro").value = "";
    document.getElementById("nomeCadastro").value = "";
    mostrarAbaLogin();
}

async function fazerLogout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    mostrarLogin();
}

async function renderizar() {
    if (!supabase) return;
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

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formAgendamento");
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (!supabase) {
                alert("Sistema carregando... tente novamente");
                return;
            }
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
            renderizar();
        });
    }
});

async function cancelarAgendamento(id) {
    if (!supabase) {
        alert("Sistema carregando... tente novamente");
        return;
    }
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
    alert("Agendamento cancelado!");
    renderizar();
}

function mostrarAbaLogin() {
    const abLogin = document.getElementById('abLogin');
    const abCadastro = document.getElementById('abCadastro');
    if (abLogin) abLogin.style.display = 'block';
    if (abCadastro) abCadastro.style.display = 'none';
}

function mostrarAbaCadastro() {
    const abLogin = document.getElementById('abLogin');
    const abCadastro = document.getElementById('abCadastro');
    if (abLogin) abLogin.style.display = 'none';
    if (abCadastro) abCadastro.style.display = 'block';
}

function mostrarAbaLogin() {
    const abLogin = document.getElementById('abLogin');
    const abCadastro = document.getElementById('abCadastro');

    if (abLogin) abLogin.style.display = 'block';
    if (abCadastro) abCadastro.style.display = 'none';
}

function mostrarAbaCadastro() {
    const abLogin = document.getElementById('abLogin');
    const abCadastro = document.getElementById('abCadastro');

    if (abLogin) abLogin.style.display = 'none';
    if (abCadastro) abCadastro.style.display = 'block';
