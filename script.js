// ===== MENU MOBILE =====

const botaoMenu = document.querySelector('.botao-menu');
const nav = document.querySelector('nav');

if (botaoMenu && nav) {
  botaoMenu.addEventListener('click', function() {
    nav.classList.toggle('menu-aberto');
    botaoMenu.classList.toggle('menu-aberto');
    document.body.classList.toggle('menu-aberto');
  });
}

window.addEventListener('load', function() {
  document.body.classList.add('pronto');
});

let timeoutRedimensionar;

window.addEventListener('resize', function() {
  document.body.classList.add('redimensionando');

  clearTimeout(timeoutRedimensionar);
  timeoutRedimensionar = setTimeout(function() {
    document.body.classList.remove('redimensionando');
  }, 300);
});

let ultimaPosicao = 0;


// ===== LINKS DE NAVEGAÇÃO SUAVE =====

document.querySelectorAll('nav a[href^="#"]').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();

    const destino = document.querySelector(this.getAttribute('href'));
    if (!destino && this.getAttribute('href') !== '#inicio') return;

    if (this.getAttribute('href') === '#inicio') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      destino.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  });
});

// ===== BANNER: TÍTULO, DESCRIÇÃO E CARROSSEL =====

const elNome = document.getElementById("nomeBanner");
const elDesc = document.getElementById("descBanner");

if (elNome && elDesc) {
  elNome.textContent = config.nomeBanner;
  elDesc.textContent = config.descBanner;
}

const banner = document.getElementById("inicio");

if (banner) {
  const imagensBanner = config.imagensBanner.slice(0, 5); // limita a no máximo 5

  if (imagensBanner.length < 2) {
    console.warn("Adicione pelo menos 2 imagens no banner.");
  }

  let indiceAtual = 0;
  let intervaloAuto;

  imagensBanner.forEach((img, i) => {
    const slide = document.createElement("div");
    slide.classList.add("bg-slide");
    slide.style.backgroundImage = `url(${img})`;
    if (i === 0) slide.classList.add("ativo");
    banner.appendChild(slide);
  });

  const dotsContainer = document.createElement("div");
  dotsContainer.classList.add("banner-dots");
  banner.appendChild(dotsContainer);

  imagensBanner.forEach((img, i) => {
    const dot = document.createElement("span");
    dot.classList.add("dot");
    if (i === 0) dot.classList.add("ativo");
    dot.addEventListener("click", () => irParaSlide(i));
    dotsContainer.appendChild(dot);
  });

  const slides = document.querySelectorAll(".bg-slide");
  const dots = document.querySelectorAll(".dot");

  function mostrarSlide(indice) {
    slides[indiceAtual].classList.remove("ativo");
    dots[indiceAtual].classList.remove("ativo");

    indiceAtual = indice;

    slides[indiceAtual].classList.add("ativo");
    dots[indiceAtual].classList.add("ativo");
  }

  function trocarSlideAuto() {
    const proximo = (indiceAtual + 1) % slides.length;
    mostrarSlide(proximo);
  }

  function irParaSlide(indice) {
    mostrarSlide(indice);
    reiniciarAutoPlay();
  }

  function reiniciarAutoPlay() {
    clearInterval(intervaloAuto);
    intervaloAuto = setInterval(trocarSlideAuto, 6000);
  }

  reiniciarAutoPlay();
}

// ===== CALENDÁRIO DE AGENDAMENTO =====

document.addEventListener('DOMContentLoaded', function() {
  const calendarioEl = document.getElementById('calendario');
  if (!calendarioEl) return; // página sem calendário, não faz nada

  const containerHorarios = document.getElementById('horariosDisponiveis');

  // pega config salva pelo admin (localStorage), senão usa o config.js padrão
  const configFinal = localStorage.getItem("configBarbearia")
    ? JSON.parse(localStorage.getItem("configBarbearia"))
    : config;

  // MOCK - horários já ocupados. Depois vem do back-end.
  const horariosOcupados = [
    { data: '2026-09-10', hora: '09:00' },
    { data: '2026-09-10', hora: '10:00' },
    { data: '2026-09-11', hora: '14:00' },
  ];

  const diasSemanaMap = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

  const calendar = new FullCalendar.Calendar(calendarioEl, {
    locale: 'pt-br',
    initialView: 'dayGridMonth',
    height: 600,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    dateClick: function(info) {
      mostrarHorariosDoDia(info.dateStr);
    }
  });

  calendar.render();

  function mostrarHorariosDoDia(dataStr) {
    const dataObj = new Date(dataStr + 'T00:00:00');
    const chaveDia = diasSemanaMap[dataObj.getDay()];
    const dadosDia = configFinal.horariosSemana && configFinal.horariosSemana[chaveDia];

    containerHorarios.innerHTML = '';

    const titulo = document.createElement('h3');
    titulo.textContent = 'Horários para ' + dataObj.toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long'
    });
    containerHorarios.appendChild(titulo);

    if (!dadosDia || !dadosDia.aberto || dadosDia.horarios.length === 0) {
      const aviso = document.createElement('p');
      aviso.textContent = 'Fechado nesse dia.';
      containerHorarios.appendChild(aviso);
      return;
    }

    dadosDia.horarios.forEach(hora => {
      const ocupado = horariosOcupados.some(h => h.data === dataStr && h.hora === hora);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = hora;
      btn.classList.add('slot-horario');

      if (ocupado) {
        btn.classList.add('ocupado');
        btn.disabled = true;
      } else {
        btn.addEventListener('click', () => abrirModalAgendamento(dataStr, hora, dataObj));
      }

      containerHorarios.appendChild(btn);
    });
  }

  window.calendarioBarbearia = calendar;
});

function abrirModalAgendamento(dataStr, hora, dataObj) {
  const dataFormatada = dataObj.toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long'
  });

  const confirmar = confirm(`Confirmar agendamento?\n\n${dataFormatada}\nÀs ${hora}`);

  if (confirmar) {
    confirmarAgendamento(dataStr, hora);
  }
}

function confirmarAgendamento(dataStr, hora) {
  // MOCK - depois vira um POST de verdade pro back-end
  console.log('Agendando:', { dataStr, hora });

  alert('Horário reservado! (ainda não salva de verdade, falta o back-end)');

  // depois: recarregar os horários do dia pra já mostrar esse como ocupado
}