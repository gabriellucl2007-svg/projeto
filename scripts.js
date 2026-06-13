const SUPABASE_URL = "https://vsvlfkddhebxutugtniu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzdmxma2RkaGVieHV0dWd0bml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NjYyOTQsImV4cCI6MjA5NjU0MjI5NH0.uOveZk9BJ7WvIgR8E3_Cd65Svq6Nm5r7mfctpxoj3S8";

let supabase;

async function initSupabase() {
    if (window.supabase && window.supabase.createClient) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log("✓ Supabase conectado");
        verificarLogin();
    } else {
        setTimeout(initSupabase, 100);
    }
}

initSupabase();

async function verificarLogin() {
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
    renderizarAgendamentos();
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
        alert("Sistema carregando...");
        return;
    }
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    if (!email || !password) {
        alert("Preencha email e senha");
        return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        alert("Email ou senha incorretos");
        return;
    }
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
    mostrarApp();
}

async function fazerCadastro() {
    if (!supabase) {
        alert("Sistema carregando...");
        return;
    }
    const nome = document.getElementById("nomeCadastro").value.trim();
    const email = document.getElementById("emailCadastro").value.trim();
    const password = document.getElementById("passwordCadastro").value;
    const tipo = document.getElementById("tipoConta")?.value || "cliente";
    if (!nome || !email || !password) {
        alert("Preencha todos os campos");
        return;
    }
    if (password.length < 6) {
        alert("Senha deve ter pelo menos 6 caracteres");
        return;
    }
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nome, tipo } }
    });
    if (error) {
        alert("Erro: " + error.message);
        return;
    }
    alert("Cadastro feito! Verifique seu email.");
    document.getElementById("nomeCadastro").value = "";
    document.getElementById("emailCadastro").value = "";
    document.getElementById("passwordCadastro").value = "";
    mostrarAbaLogin();
}

async function fazerLogout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    mostrarLogin();
}

async function renderizarAgendamentos() {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
        mostrarLogin();
        return;
    }
    const userId = data.session.user.id;
    const userType = data.session.user.user_metadata?.tipo || "cliente";
    let query = supabase.from("agendamentos").select("*");
    if (userType === "cliente") {
        query = query.eq("user_id", userId);
    }
    const { data: agendamentos } = await query.order("data", { ascending: true });
    const lista = document.getElementById("listaAgendamentos");
    if (!lista) return;
    if (!agendamentos || agendamentos.length === 0) {
        lista.innerHTML = "<p style='color:#888; text-align:center; padding:20px;'>Nenhum agendamento</p>";
        return;
    }
    lista.innerHTML = agendamentos.map(a => `
        <div class="card">
            <p><strong>${a.nome
