console.log("JS carregou com sucesso");

// =========================
// BOTÃO AGENDAR
// =========================
async function agendar() {
  console.log("clicou no agendar");

  const nome = document.getElementById("nome").value;
  const telefone = document.getElementById("telefone").value;
  const servico = document.getElementById("servico").value;
  const data = document.getElementById("data").value;

  if (!nome || !telefone || !servico || !data) {
    alert("Preencha tudo!");
    return;
  }

  const { error } = await supabaseClient
    .from("agendamentos")
    .insert([
      {
        cliente_nome: nome,
        cliente_telefone: telefone,
        servico: servico,
        data: data,
        hora: "10:00",
        barbeiro: "barbeiro1",
        status: "confirmado"
      }
    ]);

  if (error) {
    console.log(error);
    alert("Erro ao salvar");
    return;
  }

  alert("Agendado com sucesso!");
}
