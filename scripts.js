// =============================================
// ESTAÇÃO BARBER — scripts.js
// =============================================

const SUPABASE_URL = "https://vsvlfkddhebxutugtniu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzdmxma2RkaGVieHV0dWd0bml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NjYyOTQsImV4cCI6MjA5NjU0MjI5NH0.uOveZk9BJ7WvIgR8E3_Cd65Svq6Nm5r7mfctpxoj3S8";

// EmailJS — substitua com suas chaves em emailjs.com
const EMAILJS_SERVICE  = "service_adfhhbl";
const EMAILJS_TEMPLATE = "template_6h7955l";
const EMAILJS_PUBLIC   = "uAeU1pmkfahwGGcbd";
// URL base do site (para link de cancelamento)
const SITE_URL = "https://gabriellucl2007-svg.github.io/projeto";

var _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =============================================
// INICIALIZAÇÃO
// =============================================
document.addEventListener("DOMContentLoaded", () => {
    // Bloqueia datas passadas
    const dataInput = document.getElementById("data");
    if (dataInput) {
        dataInput.min = new Date().toISOString().split("T")[0];
    }

    // Formulário
    const form = document.getElementById("formAgendamento");
    if (form) form.addEventListener("submit", agendarHorario);
});

// =============================================
// AGENDAR
// =============================================
async function agendarHorario(e) {
    e.preventDefault();

    const btn = document.getElementById("btnAgendar");
    btn.textContent = "Agendando...";
    btn.disabled = true;

    const nome         = document.getElementById("nome").value.trim();
    const emailCliente = document.getElementById("emailCliente").value.trim();
    const barbeiro     = document.getElementById("barbeiro").value;
    const servico      = document.getElementById("servico").value;
    const dataAgend    = document.getElementById("data").value;
    const hora         = document.getElementById("hora").value;

    if (!nome || !emailCliente || !barbeiro || !servico || !dataAgend || !hora) {
        alert("Preencha todos os campos.");
        btn.textContent = "Confirmar Agendamento";
        btn.disabled = false;
        return;
    }

    // Verifica conflito de horário
    const { data: conflito } = await _sb
        .from("agendamentos")
        .select("id")
        .eq("barbeiro", barbeiro)
        .eq("data", dataAgend)
        .eq("hora", hora)
        .eq("status", "confirmado");

    if (conflito && conflito.length > 0) {
        alert("Este horário já está ocupado! Por favor, escolha outro.");
        btn.textContent = "Confirmar Agendamento";
        btn.disabled = false;
        return;
    }

    // Gera token único para cancelamento
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);

    // Salva no banco
    const { data: novo, error } = await _sb
        .from("agendamentos")
        .insert([{
            nome,
            email_cliente: emailCliente,
            barbeiro,
            servico,
            data: dataAgend,
            hora,
            status: "confirmado",
            token_cancelamento: token
        }])
        .select()
        .single();

    if (error) {
        alert("Erro ao agendar. Tente novamente.");
        console.error(error);
        btn.textContent = "Confirmar Agendamento";
        btn.disabled = false;
        return;
    }

    // Envia email de confirmação com link de cancelamento
    const linkCancelamento = `${SITE_URL}/cancelamento.html?token=${token}`;
    await enviarEmail(emailCliente, nome, barbeiro, servico, dataAgend, hora, linkCancelamento);

    alert(`Agendamento confirmado! Enviamos um email para ${emailCliente} com os detalhes e o link para cancelar caso precise.`);
    document.getElementById("formAgendamento").reset();
    document.getElementById("data").min = new Date().toISOString().split("T")[0];

    btn.textContent = "Confirmar Agendamento";
    btn.disabled = false;
}

// =============================================
// ENVIAR EMAIL (EmailJS)
// =============================================
async function enviarEmail(emailCliente, nome, barbeiro, servico, data, hora, linkCancelamento) {
    try {
        await emailjs.init(EMAILJS_PUBLIC);
        await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
            to_email:   emailCliente,
            to_name:    nome,
            barbeiro:   barbeiro,
            servico:    servico,
            data:       formatarData(data),
            hora:       hora,
            link_cancelamento: linkCancelamento
        });
        console.log("Email enviado!");
    } catch (err) {
        console.error("Erro ao enviar email:", err);

    
        // Não bloqueia o agendamento se o email falhar
    }
}

// =============================================
// LOGOUT (usado no index com login)
// =============================================
async function fazerLogout() {
    await _sb.auth.signOut();
    window.location.href = "login.html";
}

// =============================================
// UTILITÁRIO
// =============================================
function formatarData(d) {
    if (!d) return '';
    const [a, m, dia] = d.split('-');
    return `${dia}/${m}/${a}`;
}


