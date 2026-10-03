const mensagem = document.getElementById('mensagemReservas');

const TEXTO_STATUS = {
  AGENDADO: 'Agendado',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
};

function formatarReais(centavos) {
  return (Number(centavos || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function dataHoraDaReserva(reserva) {
  return new Date(`${reserva.data}T${reserva.hora}:00`);
}

function formatarDataReserva(reserva) {
  const data = new Date(`${reserva.data}T12:00:00`);
  const dia = data.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  return `${dia}, às ${reserva.hora}`;
}

function criarCartaoReserva(reserva) {
  const cartao = document.createElement('div');
  cartao.className = 'reserva';

  const info = document.createElement('div');

  const data = document.createElement('div');
  data.className = 'reserva-data';
  data.textContent = formatarDataReserva(reserva);

  const detalhe = document.createElement('div');
  detalhe.className = 'reserva-detalhe';
  const servico = reserva.servico?.nome || 'Serviço';
  const barbeiro = reserva.barbeiro?.nome ? ` com ${reserva.barbeiro.nome}` : '';
  const preco = reserva.servico?.precoCentavos != null ? ` · ${formatarReais(reserva.servico.precoCentavos)}` : '';
  detalhe.textContent = `${servico}${barbeiro}${preco}`;

  info.append(data, detalhe);

  const status = document.createElement('span');
  const chave = (reserva.status || 'AGENDADO').toUpperCase();
  status.className = `status ${chave.toLowerCase()}`;
  status.textContent = TEXTO_STATUS[chave] || chave;

  cartao.append(info, status);
  return cartao;
}

function renderizarLista(container, reservas, textoVazio) {
  container.replaceChildren();

  if (!reservas.length) {
    const p = document.createElement('p');
    p.className = 'vazio';
    p.textContent = textoVazio;
    container.appendChild(p);
    return;
  }

  reservas.forEach(r => container.appendChild(criarCartaoReserva(r)));
}

function separarReservas(reservas) {
  const agora = new Date();

  // Próximas: agendadas e que ainda não passaram (a mais cedo primeiro)
  const proximas = reservas
    .filter(r => (r.status || 'AGENDADO').toUpperCase() === 'AGENDADO' && dataHoraDaReserva(r) >= agora)
    .sort((a, b) => dataHoraDaReserva(a) - dataHoraDaReserva(b));

  // Histórico: todo o resto (a mais recente primeiro)
  const historico = reservas
    .filter(r => !proximas.includes(r))
    .sort((a, b) => dataHoraDaReserva(b) - dataHoraDaReserva(a));

  return { proximas, historico };
}

async function carregarReservas() {
  mensagem.textContent = 'Carregando suas reservas...';
  mensagem.className = 'mensagem-pagina';

  try {
    const reservas = await BookBarberAPI.getMinhasReservas();
    mensagem.textContent = '';

    const { proximas, historico } = separarReservas(reservas);
    renderizarLista(
      document.getElementById('listaProximas'),
      proximas,
      'Você não tem horários reservados. Escolha um dia na agenda para marcar.'
    );
    renderizarLista(
      document.getElementById('listaHistorico'),
      historico,
      'Seu histórico de reservas aparece aqui.'
    );
  } catch (erro) {
    mensagem.textContent = erro.message || 'Não foi possível carregar suas reservas.';
    mensagem.className = 'mensagem-pagina erro';
  }
}

async function iniciar() {
  try {
    const usuario = await BookBarberAPI.me();
    document.getElementById('saudacao').textContent = `Olá, ${usuario.nome}.`;
    document.getElementById('conteudo').hidden = false;
    carregarReservas();
  } catch {
    window.location.href = 'login.html';
  }
}

iniciar();
