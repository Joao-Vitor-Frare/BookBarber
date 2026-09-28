const configFinal = localStorage.getItem("configBarbearia")
  ? JSON.parse(localStorage.getItem("configBarbearia"))
  : config;

document.getElementById("nomeBarbearia").textContent = configFinal.nomeBanner;

const formLogin = document.getElementById("formLogin");
const formCadastro = document.getElementById("formCadastro");
const mensagem = document.getElementById("mensagemLogin");

function mostrarMensagem(texto, erro = true) {
  mensagem.textContent = texto;
  mensagem.classList.toggle("erro", erro);
  mensagem.classList.toggle("sucesso", !erro);
}

//ALTERNAR ENTRE LOGIN E CRIAR CONTA

document.getElementById("irCadastro").addEventListener("click", function(e) {
  e.preventDefault();
  formLogin.hidden = true;
  formCadastro.hidden = false;
  mostrarMensagem("");
});

document.getElementById("irLogin").addEventListener("click", function(e) {
  e.preventDefault();
  formCadastro.hidden = true;
  formLogin.hidden = false;
  mostrarMensagem("");
});

//LOGIN

formLogin.addEventListener("submit", async function(e) {
  e.preventDefault();

  const dados = {
    email: document.getElementById("loginEmail").value.trim(),
    senha: document.getElementById("loginSenha").value,
  };

  try {
    // 👇 troca pelo endereço real do back-end
    const resposta = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    if (!resposta.ok) {
      mostrarMensagem("Email ou senha incorretos.");
      return;
    }

    // se o back devolver um token, é aqui que você pega e guarda:
    // const resultado = await resposta.json();

    window.location.href = "index.html";
  } catch (erro) {
    mostrarMensagem("Não foi possível conectar. Tente novamente.");
  }
});

// CRIAR CONTA

formCadastro.addEventListener("submit", async function(e) {
  e.preventDefault();

  const senha = document.getElementById("cadSenha").value;
  const confirmar = document.getElementById("cadConfirmar").value;

  if (senha !== confirmar) {
    mostrarMensagem("As senhas não são iguais.");
    return;
  }

  const dados = {
    nome: document.getElementById("cadNome").value.trim(),
    email: document.getElementById("cadEmail").value.trim(),
    senha,
  };

  try {
    // 👇 troca pelo endereço real do back-end
    const resposta = await fetch("/api/cadastro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    if (!resposta.ok) {
      mostrarMensagem("Não foi possível criar a conta. Esse email já pode estar em uso.");
      return;
    }

    formCadastro.hidden = true;
    formLogin.hidden = false;
    mostrarMensagem("Conta criada! Agora é só entrar.", false);
  } catch (erro) {
    mostrarMensagem("Não foi possível conectar. Tente novamente.");
  }
});