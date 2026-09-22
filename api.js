const BookBarberAPI = (() => {
  const baseUrl = window.BOOKBARBER_API_URL
    || localStorage.getItem('bookbarberApiUrl')
    || 'http://localhost:3000/api';

  async function request(path, options = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    let data = null;
    const text = await response.text();
    if (text) {
      try { data = JSON.parse(text); } catch { data = text; }
    }

    if (!response.ok) {
      const message = Array.isArray(data?.message)
        ? data.message.join(', ')
        : data?.message || `Erro HTTP ${response.status}`;
      throw new Error(message);
    }

    return data;
  }

  return {
    baseUrl,
    request,
    getConfig: () => request('/configuracao'),
    updateConfig: (dados) => request('/configuracao', { method: 'PATCH', body: JSON.stringify(dados) }),
    getProdutos: (incluirInativos = false) => request(`/produtos${incluirInativos ? '?incluirInativos=true' : ''}`),
    criarProduto: (dados) => request('/produtos', { method: 'POST', body: JSON.stringify(dados) }),
    atualizarProduto: (id, dados) => request(`/produtos/${id}`, { method: 'PATCH', body: JSON.stringify(dados) }),
    excluirProduto: (id) => request(`/produtos/${id}`, { method: 'DELETE' }),
    getServicos: (incluirInativos = false) => request(`/servicos${incluirInativos ? '?incluirInativos=true' : ''}`),
    criarServico: (dados) => request('/servicos', { method: 'POST', body: JSON.stringify(dados) }),
    atualizarServico: (id, dados) => request(`/servicos/${id}`, { method: 'PATCH', body: JSON.stringify(dados) }),
    excluirServico: (id) => request(`/servicos/${id}`, { method: 'DELETE' }),
    getBarbeiros: (incluirInativos = false) => request(`/barbeiros${incluirInativos ? '?incluirInativos=true' : ''}`),
    criarBarbeiro: (dados) => request('/barbeiros', { method: 'POST', body: JSON.stringify(dados) }),
    atualizarBarbeiro: (id, dados) => request(`/barbeiros/${id}`, { method: 'PATCH', body: JSON.stringify(dados) }),
    excluirBarbeiro: (id) => request(`/barbeiros/${id}`, { method: 'DELETE' }),
    getDisponibilidade: (data, barbeiroId) => {
      const params = new URLSearchParams({ data });
      if (barbeiroId) params.set('barbeiroId', barbeiroId);
      return request(`/agendamentos/disponibilidade?${params}`);
    },
    reservar: (dados) => request('/agendamentos/reservar', { method: 'POST', body: JSON.stringify(dados) }),
    getAgendamentos: () => request('/agendamentos'),
    atualizarAgendamento: (id, dados) => request(`/agendamentos/${id}`, { method: 'PATCH', body: JSON.stringify(dados) }),
    excluirAgendamento: (id) => request(`/agendamentos/${id}`, { method: 'DELETE' }),
  };
})();

window.BookBarberAPI = BookBarberAPI;
