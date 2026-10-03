const BookBarberAPI = (() => {
  const baseUrl = 'https://book-barber-cyan.vercel.app/api';

  const TOKEN_KEY = 'bookbarberToken';
  const USUARIO_KEY = 'bookbarberUsuario';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getUsuario() {
    try {
      const valor = localStorage.getItem(USUARIO_KEY);
      return valor ? JSON.parse(valor) : null;
    } catch {
      return null;
    }
  }

  function salvarSessao(resultado) {
    if (resultado?.accessToken) {
      localStorage.setItem(TOKEN_KEY, resultado.accessToken);
    }

    if (resultado?.usuario) {
      localStorage.setItem(
        USUARIO_KEY,
        JSON.stringify(resultado.usuario)
      );
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
  }

  async function request(path, options = {}) {
    const token = getToken();

    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
        ...(options.headers || {}),
      },
    });

    let data = null;

    const text = await response.text();

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      if (response.status === 401 && path !== '/login') {
        logout();
      }

      const message = Array.isArray(data?.message)
        ? data.message.join(', ')
        : data?.message || `Erro HTTP ${response.status}`;

      const erro = new Error(message);
      erro.status = response.status;

      throw erro;
    }

    return data;
  }

  async function login(dados) {
    const resultado = await request('/login', {
      method: 'POST',
      body: JSON.stringify(dados),
    });

    salvarSessao(resultado);

    return resultado;
  }

  return {
    baseUrl,

    request,

    login,

    cadastrar: (dados) =>
      request('/cadastro', {
        method: 'POST',
        body: JSON.stringify(dados),
      }),

    me: () =>
      request('/me'),

    logout,

    getToken,

    getUsuario,

    estaLogado: () =>
      Boolean(getToken()),

    getConfig: () =>
      request('/configuracao'),

    updateConfig: (dados) =>
      request('/configuracao', {
        method: 'PATCH',
        body: JSON.stringify(dados),
      }),

    getProdutos: (incluirInativos = false) =>
      request(
        `/produtos${incluirInativos ? '?incluirInativos=true' : ''}`
      ),

    criarProduto: (dados) =>
      request('/produtos', {
        method: 'POST',
        body: JSON.stringify(dados),
      }),

    atualizarProduto: (id, dados) =>
      request(`/produtos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(dados),
      }),

    excluirProduto: (id) =>
      request(`/produtos/${id}`, {
        method: 'DELETE',
      }),

    getServicos: (incluirInativos = false) =>
      request(
        `/servicos${incluirInativos ? '?incluirInativos=true' : ''}`
      ),

    criarServico: (dados) =>
      request('/servicos', {
        method: 'POST',
        body: JSON.stringify(dados),
      }),

    atualizarServico: (id, dados) =>
      request(`/servicos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(dados),
      }),

    excluirServico: (id) =>
      request(`/servicos/${id}`, {
        method: 'DELETE',
      }),

    getBarbeiros: (incluirInativos = false) =>
      request(
        `/barbeiros${incluirInativos ? '?incluirInativos=true' : ''}`
      ),

    criarBarbeiro: (dados) =>
      request('/barbeiros', {
        method: 'POST',
        body: JSON.stringify(dados),
      }),

    atualizarBarbeiro: (id, dados) =>
      request(`/barbeiros/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(dados),
      }),

    excluirBarbeiro: (id) =>
      request(`/barbeiros/${id}`, {
        method: 'DELETE',
      }),

    getDisponibilidade: (data, barbeiroId) => {
      const params = new URLSearchParams({ data });

      if (barbeiroId) {
        params.set('barbeiroId', barbeiroId);
      }

      return request(
        `/agendamentos/disponibilidade?${params}`
      );
    },

    reservar: (dados) =>
      request('/agendamentos/reservar', {
        method: 'POST',
        body: JSON.stringify(dados),
      }),

    getAgendamentos: () =>
      request('/agendamentos'),

    atualizarAgendamento: (id, dados) =>
      request(`/agendamentos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(dados),
      }),

    excluirAgendamento: (id) =>
      request(`/agendamentos/${id}`, {
        method: 'DELETE',
      }),
  };
})();

window.BookBarberAPI = BookBarberAPI;