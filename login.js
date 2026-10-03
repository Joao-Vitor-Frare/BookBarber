let configFinal = config;

const formLogin = document.getElementById('formLogin');
const formCadastro = document.getElementById('formCadastro');
const mensagem = document.getElementById('mensagemLogin');

function mostrarMensagem(texto, erro = true) {
  mensagem.textContent = texto;
  mensagem.classList.toggle('erro', erro && Boolean(texto));
  mensagem.classList.toggle('sucesso', !erro && Boolean(texto));
}

async function carregarNomeBarbearia() {
  try {
    configFinal = await BookBarberAPI.getConfig();
  } catch {
    configFinal = config;
  }
  document.getElementById('nomeBarbearia').textContent = configFinal.nomeBanner || 'BookBarber';
}

function destinoDepoisDoLogin(usuario) {
  const redirect = new URLSearchParams(window.location.search).get('redirect');
  if (redirect === 'admin.html' && usuario?.perfil === 'ADMIN') return 'admin.html';
  return 'index.html';
}

// ALTERNAR ENTRE LOGIN E CRIAR CONTA

document.getElementById('irCadastro').addEventListener('click', function (e) {
  e.preventDefault();
  formLogin.hidden = true;
  formCadastro.hidden = false;
  mostrarMensagem('');
});

document.getElementById('irLogin').addEventListener('click', function (e) {
  e.preventDefault();
  formCadastro.hidden = true;
  formLogin.hidden = false;
  mostrarMensagem('');
});

// LOGIN

formLogin.addEventListener('submit', async function (e) {
  e.preventDefault();
  const botao = formLogin.querySelector('button[type="submit"]');

  const dados = {
    email: document.getElementById('loginEmail').value.trim(),
    senha: document.getElementById('loginSenha').value,
  };

  botao.disabled = true;
  botao.textContent = 'Entrando...';
  mostrarMensagem('');

  try {
    const resultado = await BookBarberAPI.login(dados);
    mostrarMensagem('Login realizado com sucesso.', false);
    window.location.href = destinoDepoisDoLogin(resultado.usuario);
  } catch (erro) {
    mostrarMensagem(erro.message || 'Email ou senha incorretos.');
  } finally {
    botao.disabled = false;
    botao.textContent = 'Entrar';
  }
});

// CRIAR CONTA

formCadastro.addEventListener('submit', async function (e) {
  e.preventDefault();

  const senha = document.getElementById('cadSenha').value;
  const confirmar = document.getElementById('cadConfirmar').value;

  if (senha !== confirmar) {
    mostrarMensagem('As senhas não são iguais.');
    return;
  }

  const dados = {
    nome: document.getElementById('cadNome').value.trim(),
    telefone: document.getElementById('cadTelefone').value.trim(),
    email: document.getElementById('cadEmail').value.trim(),
    senha,
  };

  const botao = formCadastro.querySelector('button[type="submit"]');
  botao.disabled = true;
  botao.textContent = 'Criando conta...';
  mostrarMensagem('');

  try {
    await BookBarberAPI.cadastrar(dados);
    formCadastro.reset();
    formCadastro.hidden = true;
    formLogin.hidden = false;
    document.getElementById('loginEmail').value = dados.email;
    mostrarMensagem('Conta criada! Agora é só entrar.', false);
  } catch (erro) {
    mostrarMensagem(erro.message || 'Não foi possível criar a conta.');
  } finally {
    botao.disabled = false;
    botao.textContent = 'Criar conta';
  }
});

carregarNomeBarbearia();