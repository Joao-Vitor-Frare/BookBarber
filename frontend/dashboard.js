const filtroMes = document.getElementById('filtroMes');
const mensagem = document.getElementById('mensagemDashboard');

function formatarReais(centavos) {
  return (Number(centavos || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function mesAtual() {
  const agora = new Date();
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;
}

// Só quem é ADMIN vê a página. A proteção de verdade precisa estar no back-end também.
async function garantirAdmin() {
  try {
    const usuario = await BookBarberAPI.me();
    if (usuario.perfil !== 'ADMIN') {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  } catch {
    window.location.href = 'login.html?redirect=dashboard.html';
    return false;
  }
}

// Monta uma lista de barras (nome, detalhe e barra proporcional ao maior valor)
function renderizarBarras(container, itens, textoDetalhe) {
  container.replaceChildren();

  if (!itens.length) {
    const p = document.createElement('p');
    p.className = 'vazio';
    p.textContent = 'Nenhuma venda neste mês.';
    container.appendChild(p);
    return;
  }

  const maior = Math.max(...itens.map(i => i.valor), 1);

  itens.forEach(item => {
    const linha = document.createElement('div');
    linha.className = 'linha-barra';

    const topo = document.createElement('div');
    topo.className = 'linha-barra-topo';

    const nome = document.createElement('span');
    nome.textContent = item.nome;

    const detalhe = document.createElement('span');
    detalhe.className = 'linha-barra-detalhe';
    detalhe.textContent = textoDetalhe(item);

    topo.append(nome, detalhe);

    const fundo = document.createElement('div');
    fundo.className = 'barra-fundo';
    const barra = document.createElement('div');
    barra.className = 'barra-valor';
    barra.style.width = `${(item.valor / maior) * 100}%`;
    fundo.appendChild(barra);

    linha.append(topo, fundo);
    container.appendChild(linha);
  });
}

// Venda = agendamento CONCLUIDO. AGENDADO ainda não foi realizado e CANCELADO não conta.
// O preço vem do próprio agendamento, se existir, ou da lista de serviços (pelo nome).
function calcularResumo(agendamentos, servicos, mes) {
  const precos = new Map(servicos.map(s => [s.nome, s.precoCentavos]));
  const barbeiros = new Map();
  const porServico = new Map();
  const resumo = { totalCentavos: 0, totalAtendimentos: 0, totalCancelados: 0, totalAgendados: 0 };

  agendamentos
    .filter(a => a.data && a.data.startsWith(mes))
    .forEach(a => {
      if (a.status === 'CANCELADO') { resumo.totalCancelados++; return; }
      if (a.status === 'AGENDADO') { resumo.totalAgendados++; return; }
      if (a.status !== 'CONCLUIDO') return;

      const nomeServico = a.servico?.nome || 'Sem serviço';
      const nomeBarbeiro = a.barbeiro?.nome || 'Sem barbeiro';
      const preco = a.servico?.precoCentavos ?? precos.get(nomeServico) ?? 0;

      resumo.totalCentavos += preco;
      resumo.totalAtendimentos++;

      const b = barbeiros.get(nomeBarbeiro) || { nome: nomeBarbeiro, quantidade: 0, totalCentavos: 0 };
      b.quantidade++;
      b.totalCentavos += preco;
      barbeiros.set(nomeBarbeiro, b);

      const s = porServico.get(nomeServico) || { nome: nomeServico, quantidade: 0 };
      s.quantidade++;
      porServico.set(nomeServico, s);
    });

  resumo.porBarbeiro = [...barbeiros.values()];
  resumo.porServico = [...porServico.values()];
  return resumo;
}

function renderizarDashboard(dados) {
  const total = dados.totalCentavos || 0;
  const quantidade = dados.totalAtendimentos || 0;

  document.getElementById('totalVendido').textContent = formatarReais(total);
  document.getElementById('totalAtendimentos').textContent = quantidade;
  document.getElementById('ticketMedio').textContent = quantidade ? formatarReais(total / quantidade) : formatarReais(0);
  document.getElementById('totalAgendados').textContent = dados.totalAgendados || 0;
  document.getElementById('totalCancelados').textContent = dados.totalCancelados || 0;

  const barbeiros = (dados.porBarbeiro || [])
    .map(b => ({ nome: b.nome, quantidade: b.quantidade, valor: b.totalCentavos }))
    .sort((a, b) => b.valor - a.valor);

  renderizarBarras(
    document.getElementById('listaBarbeiros'),
    barbeiros,
    b => `${b.quantidade} ${b.quantidade === 1 ? 'venda' : 'vendas'} · ${formatarReais(b.valor)}`
  );

  const servicos = (dados.porServico || [])
    .map(s => ({ nome: s.nome, quantidade: s.quantidade, valor: s.quantidade }))
    .sort((a, b) => b.valor - a.valor);

  renderizarBarras(
    document.getElementById('listaServicos'),
    servicos,
    s => `${s.quantidade}x`
  );
}

async function carregarDashboard() {
  mensagem.textContent = 'Carregando...';
  mensagem.className = 'mensagem-pagina';

  try {
    const [agendamentos, servicos] = await Promise.all([
      BookBarberAPI.getAgendamentos(),
      BookBarberAPI.getServicos(true),
    ]);
    const dados = calcularResumo(agendamentos, servicos, filtroMes.value);
    mensagem.textContent = '';
    renderizarDashboard(dados);
  } catch (erro) {
    mensagem.textContent = erro.message || 'Não foi possível carregar o dashboard.';
    mensagem.className = 'mensagem-pagina erro';
  }
}

async function iniciar() {
  if (!(await garantirAdmin())) return;

  document.getElementById('conteudo').hidden = false;
  filtroMes.value = mesAtual();
  filtroMes.addEventListener('change', carregarDashboard);
  carregarDashboard();
}

iniciar();
