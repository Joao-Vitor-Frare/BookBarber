const botaoMenu = document.querySelector('.botao-menu');
const nav = document.querySelector('nav');
let configFinal = config;
let servicosAtivos = [];
let dataSelecionada = null;
let horarioSelecionado = null;
let calendarioBarbearia = null;

function configurarMenu() {
  if (!botaoMenu || !nav) return;

  botaoMenu.addEventListener('click', () => {
    nav.classList.toggle('menu-aberto');
    botaoMenu.classList.toggle('menu-aberto');
    document.body.classList.toggle('menu-aberto');
  });

  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('menu-aberto');
      botaoMenu.classList.remove('menu-aberto');
      document.body.classList.remove('menu-aberto');
    });
  });

  document.querySelectorAll('nav a[href^="#"], .logo a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const alvo = this.getAttribute('href');
      if (alvo === '#inicio') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      document.querySelector(alvo)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  let timeoutRedimensionar;
  window.addEventListener('resize', () => {
    document.body.classList.add('redimensionando');
    clearTimeout(timeoutRedimensionar);
    timeoutRedimensionar = setTimeout(() => document.body.classList.remove('redimensionando'), 300);
  });
}

async function carregarConfiguracao() {
  try {
    configFinal = await BookBarberAPI.getConfig();
  } catch (erro) {
    console.warn('Backend indisponível; usando config.js como fallback.', erro);
    configFinal = config;
  }
}

function renderizarBanner() {
  const elNome = document.getElementById('nomeBanner');
  const elDesc = document.getElementById('descBanner');
  const banner = document.getElementById('inicio');
  if (!banner) return;

  if (elNome) elNome.textContent = configFinal.nomeBanner || 'BookBarber';
  if (elDesc) elDesc.textContent = configFinal.descBanner || '';

  banner.querySelectorAll('.bg-slide, .banner-dots').forEach(el => el.remove());
  const imagens = (configFinal.imagensBanner || []).slice(0, 5);
  if (!imagens.length) return;

  let indiceAtual = 0;
  let intervaloAuto;

  imagens.forEach((img, i) => {
    const slide = document.createElement('div');
    slide.className = `bg-slide${i === 0 ? ' ativo' : ''}`;
    slide.style.backgroundImage = `url("${img}")`;
    banner.appendChild(slide);
  });

  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'banner-dots';
  banner.appendChild(dotsContainer);

  imagens.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = `dot${i === 0 ? ' ativo' : ''}`;
    dot.addEventListener('click', () => irParaSlide(i));
    dotsContainer.appendChild(dot);
  });

  const slides = banner.querySelectorAll('.bg-slide');
  const dots = dotsContainer.querySelectorAll('.dot');

  function mostrarSlide(indice) {
    slides[indiceAtual]?.classList.remove('ativo');
    dots[indiceAtual]?.classList.remove('ativo');
    indiceAtual = indice;
    slides[indiceAtual]?.classList.add('ativo');
    dots[indiceAtual]?.classList.add('ativo');
  }

  function irParaSlide(indice) {
    mostrarSlide(indice);
    clearInterval(intervaloAuto);
    intervaloAuto = setInterval(() => mostrarSlide((indiceAtual + 1) % slides.length), 6000);
  }

  if (slides.length > 1) {
    intervaloAuto = setInterval(() => mostrarSlide((indiceAtual + 1) % slides.length), 6000);
  }
}

function renderizarContato() {
  const contato = configFinal.contato || {};
  const telefone = document.getElementById('telefoneContato');
  const endereco = document.getElementById('enderecoContato');
  const instagram = document.getElementById('linkInstagram');
  const whatsapp = document.getElementById('linkWhatsapp');

  if (telefone) telefone.textContent = contato.telefone || '';
  if (endereco) endereco.textContent = contato.endereco || '';
  if (instagram) instagram.href = contato.instagram || '#';
  if (whatsapp) whatsapp.href = contato.whatsapp || '#';
}

function formatarPrecoCentavos(valor) {
  return (Number(valor || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

async function renderizarProdutos() {
  const trilho = document.getElementById('trilhoProdutos');
  if (!trilho) return;
  trilho.innerHTML = '<p>Carregando produtos...</p>';

  let produtos;
  try {
    produtos = await BookBarberAPI.getProdutos();
  } catch (erro) {
    console.warn('Não foi possível carregar produtos da API.', erro);
    produtos = (configFinal.produtos || []).map((p, index) => ({
      id: `fallback-${index}`,
      nome: p.nome,
      imagem: p.imagem,
      precoFormatado: p.preco,
    }));
  }

  trilho.innerHTML = '';
  if (!produtos.length) {
    trilho.innerHTML = '<p>Nenhum produto cadastrado.</p>';
    return;
  }

  produtos.forEach(produto => {
    const card = document.createElement('div');
    card.className = 'card-produto';
    const preco = produto.precoFormatado || formatarPrecoCentavos(produto.precoCentavos);
    card.innerHTML = `
      <img src="${produto.imagem || 'media/logo-bookbarber.png'}" alt="${produto.nome}">
      <h3>${produto.nome}</h3>
      <p class="preco-produto">${preco}</p>
    `;
    trilho.appendChild(card);
  });

  document.querySelector('.seta-esq')?.addEventListener('click', () => rolarProdutos(-1));
  document.querySelector('.seta-dir')?.addEventListener('click', () => rolarProdutos(1));
}

function rolarProdutos(direcao) {
  const trilho = document.getElementById('trilhoProdutos');
  const card = trilho?.querySelector('.card-produto');
  if (!trilho || !card) return;
  trilho.scrollBy({ left: (card.offsetWidth + 20) * direcao, behavior: 'smooth' });
}

async function carregarServicos() {
  try {
    servicosAtivos = await BookBarberAPI.getServicos();
  } catch (erro) {
    console.error('Não foi possível carregar os serviços.', erro);
    servicosAtivos = [];
  }
}

function dataHojeISO() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function iniciarCalendario() {
  const calendarioEl = document.getElementById('calendario');
  if (!calendarioEl || typeof FullCalendar === 'undefined') return;

  calendarioBarbearia = new FullCalendar.Calendar(calendarioEl, {
    locale: 'pt-br',
    initialView: 'dayGridMonth',
    height: 600,
    validRange: { start: dataHojeISO() },
    headerToolbar: { left: 'prev,next today', center: 'title', right: '' },
    dateClick: (info) => mostrarHorariosDoDia(info.dateStr),
  });

  calendarioBarbearia.render();
  window.calendarioBarbearia = calendarioBarbearia;
}

async function mostrarHorariosDoDia(dataStr) {
  const container = document.getElementById('horariosDisponiveis');
  if (!container) return;

  const dataObj = new Date(`${dataStr}T12:00:00`);
  container.innerHTML = `<h3>Horários para ${dataObj.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</h3><p>Consultando disponibilidade...</p>`;

  try {
    const disponibilidade = await BookBarberAPI.getDisponibilidade(dataStr);
    container.innerHTML = `<h3>Horários para ${dataObj.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</h3>`;

    if (!disponibilidade.aberto || !disponibilidade.horarios.length) {
      container.insertAdjacentHTML('beforeend', '<p>Fechado nesse dia.</p>');
      return;
    }

    disponibilidade.horarios.forEach(slot => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = slot.hora;
      btn.className = `slot-horario${slot.disponivel ? '' : ' ocupado'}`;
      btn.disabled = !slot.disponivel;

      if (slot.disponivel) {
        btn.addEventListener('click', () => abrirModalAgendamento(dataStr, slot, dataObj));
      }

      container.appendChild(btn);
    });
  } catch (erro) {
    container.insertAdjacentHTML('beforeend', `<p class="erro-api">Não foi possível consultar a agenda: ${erro.message}</p>`);
  }
}

function abrirModalAgendamento(dataStr, slot, dataObj) {
  dataSelecionada = dataStr;
  horarioSelecionado = slot;

  const modal = document.getElementById('modalAgendamento');
  const resumo = document.getElementById('resumoAgendamento');
  const selectServico = document.getElementById('agendamentoServico');
  const selectBarbeiro = document.getElementById('agendamentoBarbeiro');
  const mensagem = document.getElementById('mensagemAgendamento');

  resumo.textContent = `${dataObj.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}, às ${slot.hora}`;
  mensagem.textContent = '';
  mensagem.className = 'mensagem-agendamento';

  selectServico.innerHTML = '<option value="">Selecione um serviço</option>';
  servicosAtivos.forEach(servico => {
    const option = document.createElement('option');
    option.value = servico.id;
    option.textContent = `${servico.nome} — ${formatarPrecoCentavos(servico.precoCentavos)}`;
    selectServico.appendChild(option);
  });

  selectBarbeiro.innerHTML = '<option value="">Qualquer barbeiro disponível</option>';
  (slot.barbeirosDisponiveis || []).forEach(barbeiro => {
    const option = document.createElement('option');
    option.value = barbeiro.id;
    option.textContent = barbeiro.nome;
    selectBarbeiro.appendChild(option);
  });

  modal.classList.add('aberto');
  modal.setAttribute('aria-hidden', 'false');
  document.getElementById('agendamentoNome')?.focus();
}

function fecharModalAgendamento() {
  const modal = document.getElementById('modalAgendamento');
  modal?.classList.remove('aberto');
  modal?.setAttribute('aria-hidden', 'true');
}

function configurarModal() {
  const modal = document.getElementById('modalAgendamento');
  document.getElementById('fecharModalAgendamento')?.addEventListener('click', fecharModalAgendamento);
  modal?.addEventListener('click', e => {
    if (e.target === modal) fecharModalAgendamento();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') fecharModalAgendamento();
  });

  document.getElementById('formAgendamento')?.addEventListener('submit', confirmarAgendamento);
}

async function confirmarAgendamento(event) {
  event.preventDefault();
  if (!dataSelecionada || !horarioSelecionado) return;

  // currentTarget pode virar null depois de um await. Guardamos a referência
  // ao formulário antes da chamada assíncrona para poder resetá-lo depois.
  const formulario = event.currentTarget;
  const mensagem = document.getElementById('mensagemAgendamento');
  const botao = formulario.querySelector('button[type="submit"]');
  const servicoId = Number(document.getElementById('agendamentoServico').value);
  const barbeiroValor = document.getElementById('agendamentoBarbeiro').value;

  if (!servicoId) {
    mensagem.textContent = 'Selecione um serviço.';
    mensagem.className = 'mensagem-agendamento erro';
    return;
  }

  const payload = {
    nomeCliente: document.getElementById('agendamentoNome').value.trim(),
    email: document.getElementById('agendamentoEmail').value.trim(),
    telefone: document.getElementById('agendamentoTelefone').value.trim(),
    data: dataSelecionada,
    hora: horarioSelecionado.hora,
    servicoId,
    observacoes: document.getElementById('agendamentoObservacoes').value.trim() || undefined,
  };
  if (barbeiroValor) payload.barbeiroId = Number(barbeiroValor);

  botao.disabled = true;
  botao.textContent = 'Reservando...';
  mensagem.textContent = '';

  try {
    const agendamento = await BookBarberAPI.reservar(payload);
    mensagem.textContent = `Horário reservado com sucesso com ${agendamento.barbeiro.nome}!`;
    mensagem.className = 'mensagem-agendamento sucesso';
    formulario.reset();
    setTimeout(() => fecharModalAgendamento(), 1100);
    await mostrarHorariosDoDia(dataSelecionada);
  } catch (erro) {
    mensagem.textContent = erro.message;
    mensagem.className = 'mensagem-agendamento erro';
  } finally {
    botao.disabled = false;
    botao.textContent = 'Reservar horário';
  }
}

async function iniciarSite() {
  configurarMenu();
  configurarModal();
  await carregarConfiguracao();
  renderizarBanner();
  renderizarContato();
  await Promise.all([carregarServicos(), renderizarProdutos()]);
  iniciarCalendario();
  document.body.classList.add('pronto');
}

document.addEventListener('DOMContentLoaded', iniciarSite);
