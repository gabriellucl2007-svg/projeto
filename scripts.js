// =============================================
// ESTAÇÃO BARBER — scripts.js
// =============================================

const SUPABASE_URL = "https://vsvlfkddhebxutugtniu.supabase.co";;
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzdmxma2RkaGVieHV0dWd0bml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NjYyOTQsImV4cCI6MjA5NjU0MjI5NH0.uOveZk9BJ7WvIgR8E3_Cd65Svq6Nm5r7mfctpxoj3S8";
if (!window._supabaseClient) {
    window._supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}
var supabase = window._supabaseClient || (window._supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY));
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
    document.// =============================================
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
    if (error) 
    {
