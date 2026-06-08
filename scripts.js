const form = document.getElementById("formAgendamento");
const lista = document.getElementById("listaAgendamentos");

let agendamentos =
JSON.parse(localStorage.getItem("agendamentos")) || [];

function salvar(){

    localStorage.setItem(
        "agendamentos",
        JSON.stringify(agendamentos)
    );
}

function renderizar(){

    lista.innerHTML = "";

    agendamentos.forEach((item,index)=>{

        const card =
        document.createElement("div");

        card.className =
        "agendamento-card";

        card.innerHTML = `
        <div>
            <strong>${item.nome}</strong><br>
            Barbeiro: ${item.barbeiro}<br>
            Data: ${item.data}<br>
            Horário: ${item.hora}
        </div>

        <button
        class="excluir"
        onclick="excluir(${index})">
            Excluir
        </button>
        `;

        lista.appendChild(card);

    });

}

function excluir(index){

    agendamentos.splice(index,1);

    salvar();

    renderizar();

}

form.addEventListener("submit",(e)=>{

    e.preventDefault();

    const nome =
    document.getElementById("nome").value;

    const barbeiro =
    document.getElementById("barbeiro").value;

    const data =
    document.getElementById("data").value;

    const hora =
    document.getElementById("hora").value;

    const existe = agendamentos.some(
        agendamento =>
        agendamento.barbeiro === barbeiro &&
        agendamento.data === data &&
        agendamento.hora === hora
    );

    if(existe){

        alert(
        "Este horário já está ocupado!"
        );

        return;
    }

    agendamentos.push({

        nome,
        barbeiro,
        data,
        hora

    });

    salvar();

    renderizar();

    form.reset();

});

renderizar();

const telefone = "5537998619864";

const mensagem =
`Olá, gostaria de agendar.

Nome: ${nome}
Barbeiro: ${barbeiro}
Data: ${data}
Horário: ${hora}`;

document
.getElementById("whatsappBtn")
.href =
`https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;

const hoje = new Date().toISOString().split("T")[0];
document.getElementById("data").min = hoje;
