const SUPABASE_URL = "https://vsvlfkddhebxutugtniu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzdmxma2RkaGVieHV0dWd0bml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NjYyOTQsImV4cCI6MjA5NjU0MjI5NH0.uOveZk9BJ7WvIgR8E3_Cd65Svq6Nm5r7mfctpxoj3S8";

const form = document.getElementById("formAgendamento");
const lista = document.getElementById("listaAgendamentos");

// ===============================
// CONFIG
// ===============================
const headers = {
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json"
};

// ===============================
// BLOQUEAR DATAS PASSADAS
// ===============================
const hoje = new Date().toISOString().split("T")[0];
const dataInput = document.getElementById("data");
if (dataInput) dataInput.min = hoje;

// ===============================
// BUSCAR AGENDAMENTOS
// ===============================
async function buscarAgendamentos() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/agendamentos?select=*&order=data.asc,hora.asc`,
      { headers }
    );

    return await res.json();
  } catch (err) {
    console.error("Erro ao buscar agendamentos:", err);
    return [];
  }
}

// ===============================
// VERIFICAR CONFLITO
// ===============================
async function temConflito(barbeiro, data, hora) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/agendamentos?barbeiro=eq.${barbeiro}&data=eq.${data}&hora=eq.${hora}`,
    { headers }
  );

  const dataRes = await res.json();
  return dataRes.length > 0;
}

// ===============================
// SALVAR AGENDAMENTO
// ===============================
async function salvarAgendamento(dados) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/agendamentos`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(dados)
    }
  );

  if (!res.ok) {
    throw new Error("Erro ao salvar agendamento");
  }
}

// ===============================
// RENDER LISTA
// ===============================
async function renderizar() {
  const agendamentos = await buscarAgendamentos();

  if (!lista) return;

  if (!agendamentos.length) {
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

// ===============================
// SUBMIT FORM
// ===============================
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const barbeiro = document.getElementById("barbeiro").value;
    const data = document.getElementById("data").value;
    const hora = document.getElementById("hora").value;

    if (!nome || !barbeiro || !data || !hora) {
      alert("Preencha todos os campos");
      return;
    }

    try {
      // VERIFICAR CONFLITO
      const conflito = await temConflito(barbeiro, data, hora);

      if (conflito) {
        alert("Este horário já está ocupado!");
        return;
      }

      // SALVAR
      await salvarAgendamento({
        nome,
        barbeiro,
        data,
        hora
      });

      // WHATSAPP (não obrigatório pro sistema)
      const telefone = "5537998619864";
      const mensagem = `Olá! Novo agendamento:
Nome: ${nome}
Barbeiro: ${barbeiro}
Data: ${data}
Hora: ${hora}`;

      window.open(
        `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`,
        "_blank"
      );

      form.reset();
      await renderizar();

      alert("Agendamento realizado com sucesso!");

    } catch (err) {
      console.error(err);
      alert("Erro ao criar agendamento");
    }
  });
}

// ===============================
// INICIAL
// ===============================
renderizar();
