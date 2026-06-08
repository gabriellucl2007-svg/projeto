form.addEventListener("submit", (e) => {

    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const barbeiro = document.getElementById("barbeiro").value;
    const data = document.getElementById("data").value;
    const hora = document.getElementById("hora").value;

    const existe = agendamentos.some(
        agendamento =>
        agendamento.barbeiro === barbeiro &&
        agendamento.data === data &&
        agendamento.hora === hora
    );

    if (existe) {

        alert("Este horário já está ocupado!");

        return;
    }

    agendamentos.push({
        nome,
        barbeiro,
        data,
        hora
    });

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

    salvar();

    renderizar();

    form.reset();

});

renderizar();

const hoje = new Date().toISOString().split("T")[0];
document.getElementById("data").min = hoje;
