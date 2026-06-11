
// =========================
// MODO CLIENTE
// =========================
function modoCliente() {
  const nome = prompt("Digite seu nome:");

  carregarAgendamentosCliente(nome);
  const user = await supabaseClient.auth.getUser();
}

async function carregarAgendamentosCliente(nome) {
  const { data } = await supabaseClient
    .from("agendamentos")
    .select("*")
    .eq("cliente_nome", nome)
    .order("data", { ascending: true });

  renderPainelCliente(data || []);
}

function renderPainelCliente(lista) {
  const div = document.getElementById("painelConteudo");
  div.innerHTML = "<h3>Meus agendamentos</h3>";

  lista.forEach(item => {
    const el = document.createElement("div");

    el.innerHTML = `
      <p><strong>${item.servico}</strong></p>
      <p>${item.data} - ${item.hora}</p>
      <p>${item.barbeiro}</p>
      <button onclick="cancelar(${item.id})">Cancelar</button>
      <hr>
    `;

    div.appendChild(el);
  });
}

// =========================
// CANCELAR AGENDAMENTO
// =========================
async function cancelar(id) {
  await supabaseClient
    .from("agendamentos")
    .update({ status: "cancelado" })
    .eq("id", id);

  alert("Cancelado!");
}

// =========================
// MODO BARBEIRO
// =========================
function modoBarbeiro() {
  const data = prompt("Digite a data (YYYY-MM-DD):");
  carregarAgendaBarbeiro(data);
}

async function carregarAgendaBarbeiro(data) {
  const { data: lista } = await supabaseClient
    .from("agendamentos")
    .select("*")
    .eq("data", data)
    .order("hora", { ascending: true });

  renderPainelBarbeiro(lista || []);
}

function renderPainelBarbeiro(lista) {
  const div = document.getElementById("painelConteudo");
  div.innerHTML = "<h3>Agenda do dia</h3>";

  lista.forEach(item => {
    const el = document.createElement("div");

    el.innerHTML = `
      <p><strong>${item.hora}</strong> - ${item.cliente_nome}</p>
      <p>${item.servico}</p>
      <p>${item.barbeiro}</p>
      <hr>
    `;

    div.appendChild(el);
  });
}


// =========================
// LOGIN
// =========================
async function login() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password: senha
  });

  if (error) {
    alert("Erro no login");
    return;
  }

  document.getElementById("auth").style.display = "none";
  document.getElementById("painel").style.display = "block";

  carregarPainel(data.user);
}

// =========================
// LOGOUT
// =========================
async function logout() {
  await supabaseClient.auth.signOut();

  document.getElementById("auth").style.display = "block";
  document.getElementById("painel").style.display = "none";
}

// =========================
// CARREGAR PAINEL
// =========================
async function carregarPainel(user) {

  const email = user.email;

  const { data } = await supabaseClient
    .from("agendamentos")
    .select("*")
    .eq("cliente_email", email)
    .order("data", { ascending: true });

  renderPainel(data || []);
}

// =========================
// RENDER
// =========================
function renderPainel(lista) {
  const div = document.getElementById("painelConteudo");
  div.innerHTML = "<h3>Meus agendamentos</h3>";

  lista.forEach(item => {
    const el = document.createElement("div");

    el.innerHTML = `
      <p><strong>${item.servico}</strong></p>
      <p>${item.data} - ${item.hora}</p>
      <p>${item.barbeiro}</p>
      <button onclick="cancelarAgendamento(${item.id})">Cancelar</button>
      <hr>
    `;

    div.appendChild(el);
  });
}
  // INSERT

await supabaseClient.from("agendamentos").insert([
  {
    cliente_nome: nome,
    cliente_telefone: telefone,
    cliente_email: user.data.user.email, // 👈 AQUI
    servico,
    data,
    hora,
    barbeiro,
    status: "confirmado"
  }
]);


//agendar 
async function agendar() {
  console.log("ENTROU NA FUNÇÃO");

  const { data, error } = await supabaseClient
    .from("agendamentos")
    .insert([
      {
        cliente_nome: "teste",
        cliente_telefone: "123",
        servico: "corte",
        data: "2026-01-01",
        hora: "10:00",
        barbeiro: "joao",
        status: "confirmado"
      }
    ]);

  console.log("DATA:", data);
  console.log("ERROR:", error);
}
