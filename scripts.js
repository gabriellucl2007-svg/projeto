document.addEventListener("DOMContentLoaded", () => {

const SUPABASE_URL = "https://vsvlfkddhebxutugtniu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzdmxma2RkaGVieHV0dWd0bml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NjYyOTQsImV4cCI6MjA5NjU0MjI5NH0.uOveZk9BJ7WvIgR8E3_Cd65Svq6Nm5r7mfctpxoj3S8";

const form = document.getElementById("formAgendamento");
const lista = document.getElementById("listaAgendamentos");

// Bloqueia datas passadas
const hoje = new Date().toISOString().split("T")[0];
document.getElementById("data").min = hoje;

// Busca todos os agendamentos e mostra na tela
async function renderizar() {
    const resposta = await fetch(
        `${SUPABASE_URL}/rest/v1/agendamentos?order=data.asc,hora.asc`,
        {
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`
            }
        }
    );

    const agendamentos = await resposta.json();

    if (agendamentos.length === 0) {
        lista.innerHTML = "<p>Nenhum agendamento ainda.</p>";
        return;
    }

    lista.innerHTML = agendamentos.map(a => `
        <div class="card">
            <p><strong>${a.nome}</strong></p>
            <p>Barbeiro: ${a.barbeiro}</p>
            <p>Data: ${a.data}</p>
            <p>Horário: ${a.hora}</p>
        </div>
    `).join("");
}

// Verifica se o horário já está ocupado
async function verificarConflito(barbeiro, data, hora) {
    const resposta = await fetch(
        `${SUPABASE_URL}/rest/v1/agendamentos?barbeiro=eq.${barbeiro}&data=eq.${data}&hora=eq.${hora}`,
        {
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`
            }
        }
    );

    const resultado = await resposta.json();
    return resultado.length > 0;
}

// Salva um novo agendamento no banco
async function salvar(nome, barbeiro, data, hora) {
    await fetch(
        `${SUPABASE_URL}/rest/v1/agendamentos`,
        {
            method: "POST",
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nome, barbeiro, data, hora })
        }
    );
}

// Quando o cliente clica em Agendar
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const barbeiro = document.getElementById("barbeiro").value;
    const data = document.getElementById("data").value;
    const hora = document.getElementById("hora").value;

    const ocupado = await verificarConflito(barbeiro, data, hora);

    if (ocupado) {
        alert("Este horário já está ocupado! Escolha outro.");
        return;
    }

    await salvar(nome, barbeiro, data, hora);

    const telefone = "5537998619864";
    const mensagem =
`Olá, gostaria de agendar.

Nome: ${nome}
Barbeiro: ${barbeiro}
Data: ${data}
Horário: ${hora}`;

    window.open(
        `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`,
        "_blank"
    );

    await renderizar();
    form.reset();
});

renderizar();

});
