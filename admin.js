// ===== DADOS BASE (config atual ou salvo anteriormente) =====

const diasSemana = [
  { chave: "segunda", label: "Segunda-feira" },
  { chave: "terca",   label: "Terça-feira" },
  { chave: "quarta",  label: "Quarta-feira" },
  { chave: "quinta",  label: "Quinta-feira" },
  { chave: "sexta",   label: "Sexta-feira" },
  { chave: "sabado",  label: "Sábado" },
  { chave: "domingo", label: "Domingo" },
];

// pega do localStorage se já existir, senão usa o config.js padrão
function carregarConfigAtual() {
  const salvo = localStorage.getItem("configBarbearia");
  return salvo ? JSON.parse(salvo) : config;
}

const configAtual = carregarConfigAtual();

// ===== PREENCHER O FORMULÁRIO COM OS DADOS ATUAIS =====

document.getElementById("inputNome").value = configAtual.nomeBanner || "";
document.getElementById("inputDesc").value = configAtual.descBanner || "";

// --- imagens ---

const listaImagens = document.getElementById("listaImagens");
const btnAddImagem = document.getElementById("btnAddImagem");

function criarCampoImagem(valor = "") {
  const div = document.createElement("div");
  div.classList.add("campo-imagem");

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "URL da imagem";
  input.value = valor;

  const btnRemover = document.createElement("button");
  btnRemover.type = "button";
  btnRemover.textContent = "Remover";
  btnRemover.addEventListener("click", () => {
    if (listaImagens.children.length > 2) { // nunca deixa ficar com menos de 2
      div.remove();
    } else {
      alert("Precisa ter pelo menos 2 imagens.");
    }
  });

  div.appendChild(input);
  div.appendChild(btnRemover);
  listaImagens.appendChild(div);
}

const imagensIniciais = configAtual.imagensBanner && configAtual.imagensBanner.length
  ? configAtual.imagensBanner
  : ["", ""];

imagensIniciais.forEach(img => criarCampoImagem(img));

btnAddImagem.addEventListener("click", () => {
  if (listaImagens.children.length >= 5) {
    alert("Máximo de 5 imagens.");
    return;
  }
  criarCampoImagem();
});

// --- horários por dia ---

const listaHorarios = document.getElementById("listaHorarios");

function criarCampoHorario(containerHorarios, valor = "") {
  const linha = document.createElement("div");
  linha.classList.add("campo-horario");

  const input = document.createElement("input");
  input.type = "time";
  input.value = valor;

  const btnRemover = document.createElement("button");
  btnRemover.type = "button";
  btnRemover.textContent = "×";
  btnRemover.addEventListener("click", () => linha.remove());

  linha.appendChild(input);
  linha.appendChild(btnRemover);
  containerHorarios.appendChild(linha);
}

diasSemana.forEach(dia => {
  const dadosDia = (configAtual.horariosSemana && configAtual.horariosSemana[dia.chave])
    || { aberto: true, horarios: [] };

  const blocoDia = document.createElement("div");
  blocoDia.classList.add("bloco-dia");
  blocoDia.dataset.dia = dia.chave;

  blocoDia.innerHTML = `
    <label class="check-aberto">
      <input type="checkbox" class="input-aberto" ${dadosDia.aberto ? "checked" : ""}>
      ${dia.label}
    </label>
    <div class="container-horarios"></div>
    <button type="button" class="btn-add-horario">+ Adicionar horário</button>
  `;

  const containerHorarios = blocoDia.querySelector(".container-horarios");

  // carrega os horários já salvos, ou deixa um campo vazio pra começar
  const horariosIniciais = dadosDia.horarios.length ? dadosDia.horarios : [""];
  horariosIniciais.forEach(h => criarCampoHorario(containerHorarios, h));

  blocoDia.querySelector(".btn-add-horario").addEventListener("click", () => {
    criarCampoHorario(containerHorarios);
  });

  listaHorarios.appendChild(blocoDia);
});

// ===== SALVAR =====

document.getElementById("formConfig").addEventListener("submit", function(e) {
  e.preventDefault();

  const imagensBanner = Array.from(listaImagens.querySelectorAll("input"))
    .map(input => input.value.trim())
    .filter(valor => valor !== "");

  const horariosSemana = {};
  document.querySelectorAll(".bloco-dia").forEach(blocoDia => {
    const chave = blocoDia.dataset.dia;

    const horarios = Array.from(blocoDia.querySelectorAll(".container-horarios input"))
      .map(input => input.value)
      .filter(valor => valor !== "")
      .sort(); // deixa em ordem crescente, tipo 08:00, 09:00, 14:00...

    horariosSemana[chave] = {
      aberto: blocoDia.querySelector(".input-aberto").checked,
      horarios,
    };
  });

  const novaConfig = {
    nomeBanner: document.getElementById("inputNome").value,
    descBanner: document.getElementById("inputDesc").value,
    imagensBanner,
    horariosSemana,
  };

  localStorage.setItem("configBarbearia", JSON.stringify(novaConfig));

  document.getElementById("mensagemStatus").textContent = "Configurações salvas! (por enquanto só neste navegador)";
});