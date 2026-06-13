// =============================================
// ESTAÇÃO BARBER — scripts.js
// =============================================

const SUPABASE_URL = "https://vsvlfkddhebxutugtniu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzdmxma2RkaGVieHV0dWd0bml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NjYyOTQsImV4cCI6MjA5NjU0MjI5NH0.uOveZk9BJ7WvIgR8E3_Cd65Svq6Nm5r7mfctpxoj3S8";

const EMAILJS_SERVICE  = "service_adfhhbl";
const EMAILJS_TEMPLATE = "template_6h7955l";
const EMAILJS_PUBLIC   = "uAeU1pmkfahwGGcbd";

const SITE_URL = "https://gabriellucl2007-svg.github.io/projeto";

var _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =============================================
// INICIALIZAÇÃO
// =============================================
document.addEventListener("DOMContentLoaded", async () => {
    const dataInput = document.getElementById("data");
    if (dataInput) dataInput.min = new Date().toISOString().split("T")[0];

    const form = document.getElementById("formAgendamento");
    if (form) form.addEventListener("submit", agendarHorario);

    // Atualiza horários disponíveis quando barbeiro ou data muda
    const barbeiro = document.getElementById("barbeiro");
    const data     = document.getElementById("data");
    if (barbeiro) barbeiro.addEventListener("change", atualizarHorarios);
    if (data)     data.addEventListener("change", atualizarHorarios);

    // Se tiver email salvo, mostra agendamentos
    const emailSalvo = sessionStorage.getItem("emailCliente");
    if (emailSalvo) {
        const emailInput = document.getElementById("emailCliente");
        if (emailInput) emailInput.value = emailSalvo;
        await buscarMeusAgendamentos(emailSalvo);
    }
});

// =============================================
// ATUALIZAR HORÁRIOS DISPONÍVEIS
// =============================================
const TODOS_HORARIOS = [
    "08:00","08:30","09:00","09:30","10:00","10:30",
    "11:00","11:30","13:00","13:30","14:00","14:30",
    "15:00","15:30","16:00","16:30","17:00","17:30",
    "18:00","18:30","19:00","19:30"
];

async function atualizarHorarios() {
    const barbeiro  = document.getElementById("barbeiro")?.value;
    const data      = document.getElementById("data")?.value;
    const horaSelect = document.getElementById("hora");
    if (!barbeiro || !data || !horaSelect) return;

    // Busca horários já ocupados
    const { data: ocupados } = await _sb
        .from("agendamentos")
        .select("hora")
        .eq("barbeiro", barbeiro)
        .eq("data", data)
        .eq("status", "confirmado");

    const horasOcupadas = ocupados ? ocupados.map(o => o.hora) : [];

    // Atualiza o select
    horaSelect.innerHTML = TODOS_HORARIOS.map(h => {
        const ocupado = horasOcupadas.includes(h);
        return `<option value="${h}" ${ocupado ? 'disabled style="color:#555"' : ''}>${h}${ocupado ? ' — Ocupado' : ''}</option>`;
    }).join('');

    // Seleciona primeiro horário disponível
    const disponivel = TODOS_HORARIOS.find(h => !horasOcupadas.includes(h));
    if (disponivel) horaSelect.value = disponivel;
}

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

    // Verifica conflito novamente (segurança)
    const { data: conflito } = await _sb
        .from("agendamentos")
        .select("id")
        .eq("barbeiro", barbeiro)
        .eq("data", dataAgend)
        .eq("hora", hora)
        .eq("status", "confirmado");

    if (conflito && conflito.length > 0) {
        alert("Este horário acabou de ser ocupado! Escolha outro.");
        await atualizarHorarios();
        btn.textContent = "Confirmar Agendamento";
        btn.disabled = false;
        return;
    }

    // Token único para cancelamento
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);

    const { error } = await _sb
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
        }]);

    if (error) {
        alert("Erro ao agendar. Tente novamente.");
        console.error(error);
        btn.textContent = "Confirmar Agendamento";
        btn.disabled = false;
        return;
    }

    // Envia email
    const linkCancelamento = `${SITE_URL}/cancelamento.html?token=${token}`;
    await enviarEmail(emailCliente, nome, barbeiro, servico, dataAgend, hora, linkCancelamento);

    sessionStorage.setItem("emailCliente", emailCliente);

    alert(`Agendamento confirmado! Enviamos um email para ${emailCliente} com os detalhes e o link para cancelar.`);

    document.getElementById("formAgendamento").reset();
    document.getElementById("data").min = new Date().toISOString().split("T")[0];
    document.getElementById("emailCliente").value = emailCliente;

    btn.textContent = "Confirmar Agendamento";
    btn.disabled = false;

    await buscarMeusAgendamentos(emailCliente);
    await atualizarHorarios();
}

// =============================================
// BUSCAR AGENDAMENTOS DO CLIENTE
// =============================================
async function buscarMeusAgendamentos(email) {
    const lista = document.getElementById("listaAgendamentos");
    if (!lista) return;

    lista.innerHTML = "<p style='color:#888;text-align:center;padding:16px'>Carregando...</p>";

    const { data: agendamentos, error } = await _sb
        .from("agendamentos")
        .select("*")
        .eq("email_cliente", email)
        .order("data", { ascending: true })
        .order("hora", { ascending: true });

    if (error || !agendamentos || agendamentos.length === 0) {
        lista.innerHTML = "";
        return;
    }

    lista.innerHTML = `
        <h3 style="font-family:'Playfair Display',serif;color:#C9A84C;font-size:18px;margin-bottom:16px;text-align:center;">
            Meus Agendamentos
        </h3>
        ${agendamentos.map(a => `
            <div style="background:#111;border:1px solid rgba(201,168,76,0.2);border-radius:8px;padding:16px 20px;margin-bottom:12px;">
                <p style="color:#f5f0e8;font-weight:600;margin-bottom:8px;">${a.nome}</p>
                <p style="color:#888;font-size:14px;">✂ ${a.barbeiro} — ${a.servico}</p>
                <p style="color:#888;font-size:14px;">📅 ${formatarData(a.data)} às ${a.hora}</p>
                <p style="margin-top:8px;">
                    <span style="display:inline-block;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:600;
                    background:${a.status === 'confirmado' ? 'rgba(46,204,113,0.15)' : 'rgba(231,76,60,0.15)'};
                    color:${a.status === 'confirmado' ? '#2ecc71' : '#e74c3c'}">
                        ${a.status}
                    </span>
                </p>
                ${a.status === 'confirmado' ? `
                <button onclick="cancelarAgendamentoCliente('${a.token_cancelamento}', '${email}')"
                   style="display:inline-block;margin-top:10px;color:#e74c3c;font-size:13px;border:1px solid #e74c3c;
                   padding:5px 14px;border-radius:4px;background:transparent;cursor:pointer;">
                   Cancelar
                </button>` : ''}
            </div>
        `).join('')}
    `;
}

// =============================================
// CANCELAR AGENDAMENTO (pelo cliente no site)
// =============================================
async function cancelarAgendamentoCliente(token, email) {
    if (!confirm("Tem certeza que quer cancelar este agendamento?")) return;

    const { error } = await _sb
        .from("agendamentos")
        .update({ status: "cancelado" })
        .eq("token_cancelamento", token);

    if (error) {
        alert("Erro ao cancelar. Tente novamente.");
        console.error(error);
        return;
    }

    alert("Agendamento cancelado!");
    await buscarMeusAgendamentos(email);
    await atualizarHorarios();
}

// =============================================
// VER AGENDAMENTOS (botão manual)
// =============================================
async function verMeusAgendamentos() {
    const email = document.getElementById("emailCliente").value.trim();
    if (!email) { alert("Digite seu email primeiro."); return; }
    sessionStorage.setItem("emailCliente", email);
    await buscarMeusAgendamentos(email);
}

// =============================================
// ENVIAR EMAIL
// =============================================
async function enviarEmail(emailCliente, nome, barbeiro, servico, data, hora, linkCancelamento) {
    try {
        emailjs.init(EMAILJS_PUBLIC);
        await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
            to_email: emailCliente,
            to_name:  nome,
            barbeiro, servico,
            data: formatarData(data),
            hora,
            link_cancelamento: linkCancelamento
        });
        console.log("Email enviado!");
    } catch (err) {
        console.error("Erro ao enviar email:", err);
    }
}

// =============================================
// LOGOUT (login.html)
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
