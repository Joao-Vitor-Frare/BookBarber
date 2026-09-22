const diasSemana = [
  { chave: 'segunda', label: 'Segunda-feira' },
  { chave: 'terca', label: 'Terça-feira' },
  { chave: 'quarta', label: 'Quarta-feira' },
  { chave: 'quinta', label: 'Quinta-feira' },
  { chave: 'sexta', label: 'Sexta-feira' },
  { chave: 'sabado', label: 'Sábado' },
  { chave: 'domingo', label: 'Domingo' },
];

let configAtual = config;
const listaImagens = document.getElementById('listaImagens');
const listaHorarios = document.getElementById('listaHorarios');

function mensagem(texto, erro = false) {
  const el = document.getElementById('mensagemStatus');
  el.textContent = texto;
  el.className = erro ? 'erro' : 'sucesso';
}

function precoParaCentavos(valor) {
  return Math.round(Number(valor) * 100);
}

function centavosParaPreco(valor) {
  return (Number(valor || 0) / 100).toFixed(2);
}

function formatarPreco(valor) {
  return (Number(valor || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function criarCampoImagem(valor = '') {
  const div = document.createElement('div');
  div.className = 'campo-imagem';
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'URL ou caminho da imagem';
  input.value = valor;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = 'Remover';
  btn.addEventListener('click', () => {
    if (listaImagens.children.length <= 2) return alert('Precisa ter pelo menos 2 imagens.');
    div.remove();
  });
  div.append(input, btn);
  listaImagens.appendChild(div);
}

function criarCampoHorario(container, valor = '') {
  const linha = document.createElement('div');
  linha.className = 'campo-horario';
  const input = document.createElement('input');
  input.type = 'time';
  input.value = valor;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = '×';
  btn.addEventListener('click', () => linha.remove());
  linha.append(input, btn);
  container.appendChild(linha);
}

function renderizarConfig() {
  document.getElementById('inputNome').value = configAtual.nomeBanner || '';
  document.getElementById('inputDesc').value = configAtual.descBanner || '';
  document.getElementById('inputTelefone').value = configAtual.contato?.telefone || '';
  document.getElementById('inputEndereco').value = configAtual.contato?.endereco || '';
  document.getElementById('inputInstagram').value = configAtual.contato?.instagram || '';
  document.getElementById('inputWhatsapp').value = configAtual.contato?.whatsapp || '';

  listaImagens.innerHTML = '';
  const imagens = configAtual.imagensBanner?.length ? configAtual.imagensBanner : ['', ''];
  imagens.forEach(criarCampoImagem);

  listaHorarios.innerHTML = '';
  diasSemana.forEach(dia => {
    const dados = configAtual.horariosSemana?.[dia.chave] || { aberto: false, horarios: [] };
    const bloco = document.createElement('div');
    bloco.className = 'bloco-dia';
    bloco.dataset.dia = dia.chave;
    bloco.innerHTML = `
      <label class="check-aberto"><input type="checkbox" class="input-aberto" ${dados.aberto ? 'checked' : ''}> ${dia.label}</label>
      <div class="container-horarios"></div>
      <button type="button" class="btn-add-horario">+ Adicionar horário</button>
    `;
    const container = bloco.querySelector('.container-horarios');
    (dados.horarios?.length ? dados.horarios : ['']).forEach(h => criarCampoHorario(container, h));
    bloco.querySelector('.btn-add-horario').addEventListener('click', () => criarCampoHorario(container));
    listaHorarios.appendChild(bloco);
  });
}

async function carregarConfig() {
  try {
    configAtual = await BookBarberAPI.getConfig();
    document.getElementById('statusApi').textContent = `Backend conectado: ${BookBarberAPI.baseUrl}`;
    document.getElementById('statusApi').className = 'api-ok';
  } catch (erro) {
    configAtual = config;
    document.getElementById('statusApi').textContent = `Backend indisponível: ${erro.message}`;
    document.getElementById('statusApi').className = 'api-erro';
  }
  renderizarConfig();
}

document.getElementById('btnAddImagem').addEventListener('click', () => {
  if (listaImagens.children.length >= 5) return alert('Máximo de 5 imagens.');
  criarCampoImagem();
});

document.getElementById('formConfig').addEventListener('submit', async e => {
  e.preventDefault();
  const imagensBanner = [...listaImagens.querySelectorAll('input')].map(i => i.value.trim()).filter(Boolean);
  if (imagensBanner.length < 2) return mensagem('Informe pelo menos 2 imagens.', true);

  const horariosSemana = {};
  document.querySelectorAll('.bloco-dia').forEach(bloco => {
    horariosSemana[bloco.dataset.dia] = {
      aberto: bloco.querySelector('.input-aberto').checked,
      horarios: [...bloco.querySelectorAll('.container-horarios input')].map(i => i.value).filter(Boolean).sort(),
    };
  });

  try {
    configAtual = await BookBarberAPI.updateConfig({
      nomeBanner: document.getElementById('inputNome').value.trim(),
      descBanner: document.getElementById('inputDesc').value.trim(),
      imagensBanner,
      horariosSemana,
      telefone: document.getElementById('inputTelefone').value.trim(),
      endereco: document.getElementById('inputEndereco').value.trim(),
      instagram: document.getElementById('inputInstagram').value.trim(),
      whatsapp: document.getElementById('inputWhatsapp').value.trim(),
    });
    mensagem('Configurações salvas no banco de dados.');
  } catch (erro) {
    mensagem(`Erro ao salvar: ${erro.message}`, true);
  }
});

function criarCardAdmin(titulo, detalhes, acoes = []) {
  const card = document.createElement('div');
  card.className = 'card-admin';
  const info = document.createElement('div');
  info.innerHTML = `<strong>${titulo}</strong><span>${detalhes}</span>`;
  const botoes = document.createElement('div');
  botoes.className = 'acoes-admin';
  acoes.forEach(({ texto, classe, executar }) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = texto;
    if (classe) btn.className = classe;
    btn.addEventListener('click', async () => {
      try {
        await executar(card);
      } catch (erro) {
        alert(erro?.message || 'Erro ao executar a ação.');
      }
    });
    botoes.appendChild(btn);
  });
  card.append(info, botoes);
  return card;
}


function criarCampoEditor(rotulo, valor = '', tipo = 'text', opcoes = {}) {
  const label = document.createElement('label');
  label.className = 'campo-editor-admin';
  const span = document.createElement('span');
  span.textContent = rotulo;
  const input = document.createElement('input');
  input.type = tipo;
  input.value = valor ?? '';
  if (opcoes.min !== undefined) input.min = String(opcoes.min);
  if (opcoes.step !== undefined) input.step = String(opcoes.step);
  if (opcoes.required) input.required = true;
  label.append(span, input);
  return { label, input };
}

function prepararEditor(card, titulo) {
  card.innerHTML = '';
  card.classList.add('card-admin-editando');
  const form = document.createElement('form');
  form.className = 'editor-admin';
  const h3 = document.createElement('h3');
  h3.textContent = titulo;
  form.appendChild(h3);
  card.appendChild(form);
  return form;
}

function botoesEditor(form, onCancelar) {
  const acoes = document.createElement('div');
  acoes.className = 'acoes-editor-admin';

  const salvar = document.createElement('button');
  salvar.type = 'submit';
  salvar.textContent = 'Salvar alterações';

  const cancelar = document.createElement('button');
  cancelar.type = 'button';
  cancelar.textContent = 'Cancelar';
  cancelar.addEventListener('click', onCancelar);

  acoes.append(salvar, cancelar);
  form.appendChild(acoes);
}

function abrirEditorBarbeiro(card, item) {
  const form = prepararEditor(card, 'Editar barbeiro');
  const nome = criarCampoEditor('Nome', item.nome, 'text', { required: true });
  const especialidade = criarCampoEditor('Especialidade', item.especialidade || '');
  form.append(nome.label, especialidade.label);
  botoesEditor(form, carregarBarbeiros);

  form.addEventListener('submit', async e => {
    e.preventDefault();
    try {
      await BookBarberAPI.atualizarBarbeiro(item.id, {
        nome: nome.input.value.trim(),
        especialidade: especialidade.input.value.trim(),
      });
      await carregarBarbeiros();
    } catch (erro) {
      alert(`Erro ao editar barbeiro: ${erro.message}`);
    }
  });
}

function abrirEditorServico(card, item) {
  const form = prepararEditor(card, 'Editar serviço');
  const nome = criarCampoEditor('Nome', item.nome, 'text', { required: true });
  const descricao = criarCampoEditor('Descrição', item.descricao || '');
  const preco = criarCampoEditor('Preço (R$)', centavosParaPreco(item.precoCentavos), 'number', { min: 0.01, step: 0.01, required: true });
  const duracao = criarCampoEditor('Duração (min)', item.duracaoMinutos, 'number', { min: 1, step: 1, required: true });
  form.append(nome.label, descricao.label, preco.label, duracao.label);
  botoesEditor(form, carregarServicos);

  form.addEventListener('submit', async e => {
    e.preventDefault();
    try {
      await BookBarberAPI.atualizarServico(item.id, {
        nome: nome.input.value.trim(),
        descricao: descricao.input.value.trim(),
        precoCentavos: precoParaCentavos(preco.input.value),
        duracaoMinutos: Number(duracao.input.value),
      });
      await carregarServicos();
    } catch (erro) {
      alert(`Erro ao editar serviço: ${erro.message}`);
    }
  });
}

function abrirEditorProduto(card, item) {
  const form = prepararEditor(card, 'Editar produto');
  const nome = criarCampoEditor('Nome', item.nome, 'text', { required: true });
  const preco = criarCampoEditor('Preço (R$)', centavosParaPreco(item.precoCentavos), 'number', { min: 0.01, step: 0.01, required: true });
  const imagem = criarCampoEditor('Imagem', item.imagem || '');
  const ordem = criarCampoEditor('Ordem', item.ordem ?? 0, 'number', { min: 0, step: 1 });
  form.append(nome.label, preco.label, imagem.label, ordem.label);
  botoesEditor(form, carregarProdutos);

  form.addEventListener('submit', async e => {
    e.preventDefault();
    try {
      await BookBarberAPI.atualizarProduto(item.id, {
        nome: nome.input.value.trim(),
        precoCentavos: precoParaCentavos(preco.input.value),
        imagem: imagem.input.value.trim(),
        ordem: Number(ordem.input.value || 0),
      });
      await carregarProdutos();
    } catch (erro) {
      alert(`Erro ao editar produto: ${erro.message}`);
    }
  });
}

async function carregarBarbeiros() {
  const lista = document.getElementById('listaBarbeirosAdmin');
  lista.innerHTML = 'Carregando...';
  try {
    const itens = await BookBarberAPI.getBarbeiros(true);
    lista.innerHTML = '';
    itens.forEach(item => lista.appendChild(criarCardAdmin(
      item.nome,
      `${item.especialidade || 'Sem especialidade'} • ${item.ativo ? 'Ativo' : 'Inativo'}`,
      [
        { texto: item.ativo ? 'Desativar' : 'Ativar', executar: async () => { await BookBarberAPI.atualizarBarbeiro(item.id, { ativo: !item.ativo }); carregarBarbeiros(); } },
        { texto: 'Editar', executar: async card => abrirEditorBarbeiro(card, item) },
      ]
    )));
  } catch (erro) { lista.textContent = erro.message; }
}

document.getElementById('formBarbeiro').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.currentTarget;
  try {
    await BookBarberAPI.criarBarbeiro({
      nome: document.getElementById('barbeiroNome').value.trim(),
      especialidade: document.getElementById('barbeiroEspecialidade').value.trim() || undefined,
    });
    form.reset();
    await carregarBarbeiros();
  } catch (erro) { alert(erro.message); }
});

async function carregarServicos() {
  const lista = document.getElementById('listaServicosAdmin');
  lista.innerHTML = 'Carregando...';
  try {
    const itens = await BookBarberAPI.getServicos(true);
    lista.innerHTML = '';
    itens.forEach(item => lista.appendChild(criarCardAdmin(
      item.nome,
      `${formatarPreco(item.precoCentavos)} • ${item.duracaoMinutos} min • ${item.ativo ? 'Ativo' : 'Inativo'}`,
      [
        { texto: item.ativo ? 'Desativar' : 'Ativar', executar: async () => { await BookBarberAPI.atualizarServico(item.id, { ativo: !item.ativo }); carregarServicos(); } },
        { texto: 'Editar', executar: async card => abrirEditorServico(card, item) },
      ]
    )));
  } catch (erro) { lista.textContent = erro.message; }
}

document.getElementById('formServico').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.currentTarget;
  try {
    await BookBarberAPI.criarServico({
      nome: document.getElementById('servicoNome').value.trim(),
      descricao: document.getElementById('servicoDescricao').value.trim() || undefined,
      precoCentavos: precoParaCentavos(document.getElementById('servicoPreco').value),
      duracaoMinutos: Number(document.getElementById('servicoDuracao').value),
    });
    form.reset();
    await carregarServicos();
  } catch (erro) { alert(erro.message); }
});

async function carregarProdutos() {
  const lista = document.getElementById('listaProdutosAdmin');
  lista.innerHTML = 'Carregando...';
  try {
    const itens = await BookBarberAPI.getProdutos(true);
    lista.innerHTML = '';
    itens.forEach(item => lista.appendChild(criarCardAdmin(
      item.nome,
      `${formatarPreco(item.precoCentavos)} • ordem ${item.ordem} • ${item.ativo ? 'Ativo' : 'Inativo'}`,
      [
        { texto: item.ativo ? 'Desativar' : 'Ativar', executar: async () => { await BookBarberAPI.atualizarProduto(item.id, { ativo: !item.ativo }); carregarProdutos(); } },
        { texto: 'Editar', executar: async card => abrirEditorProduto(card, item) },
      ]
    )));
  } catch (erro) { lista.textContent = erro.message; }
}

document.getElementById('formProduto').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.currentTarget;
  try {
    await BookBarberAPI.criarProduto({
      nome: document.getElementById('produtoNome').value.trim(),
      precoCentavos: precoParaCentavos(document.getElementById('produtoPreco').value),
      imagem: document.getElementById('produtoImagem').value.trim() || undefined,
      ordem: Number(document.getElementById('produtoOrdem').value || 0),
    });
    form.reset();
    document.getElementById('produtoOrdem').value = 0;
    await carregarProdutos();
  } catch (erro) { alert(erro.message); }
});

async function carregarAgendamentos() {
  const lista = document.getElementById('listaAgendamentosAdmin');
  lista.innerHTML = 'Carregando...';
  try {
    const itens = await BookBarberAPI.getAgendamentos();
    lista.innerHTML = '';
    if (!itens.length) return lista.textContent = 'Nenhum agendamento cadastrado.';
    itens.forEach(item => {
      const acoes = [];
      if (item.status === 'AGENDADO') {
        acoes.push({ texto: 'Concluir', executar: async () => { await BookBarberAPI.atualizarAgendamento(item.id, { status: 'CONCLUIDO' }); carregarAgendamentos(); } });
        acoes.push({ texto: 'Cancelar', classe: 'perigo', executar: async () => { await BookBarberAPI.atualizarAgendamento(item.id, { status: 'CANCELADO' }); carregarAgendamentos(); } });
      }
      lista.appendChild(criarCardAdmin(
        `${item.data.split('-').reverse().join('/')} às ${item.hora} — ${item.cliente.nome}`,
        `${item.servico.nome} • ${item.barbeiro.nome} • ${item.status} • ${item.cliente.telefone}`,
        acoes
      ));
    });
  } catch (erro) { lista.textContent = erro.message; }
}

document.getElementById('btnAtualizarAgendamentos').addEventListener('click', carregarAgendamentos);

async function iniciarAdmin() {
  await carregarConfig();
  await Promise.all([carregarBarbeiros(), carregarServicos(), carregarProdutos(), carregarAgendamentos()]);
}

document.addEventListener('DOMContentLoaded', iniciarAdmin);
