const botaoMenu = document.querySelector('.botao-menu');
const nav = document.querySelector('nav');
const configFinal = localStorage.getItem("configBarbearia")
  ? JSON.parse(localStorage.getItem("configBarbearia"))
  : config;

botaoMenu.addEventListener('click', function() {
    nav.classList.toggle('menu-aberto');
    botaoMenu.classList.toggle('menu-aberto');
    document.body.classList.toggle('menu-aberto');
});

const linksMenu = document.querySelectorAll('nav a');

linksMenu.forEach(function(link) {
    link.addEventListener('click', function() {
        nav.classList.remove('menu-aberto');
        botaoMenu.classList.remove('menu-aberto');
        document.body.classList.remove('menu-aberto');
    });
});

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

document.querySelectorAll('nav a[href^="#"], .logo a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();

        const destino = document.querySelector(this.getAttribute('href'));

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


const elNome = document.getElementById("nomeBanner");
const elDesc = document.getElementById("descBanner");

if (elNome && elDesc) {
  elNome.textContent = configFinal.nomeBanner;
  elDesc.textContent = configFinal.descBanner;
}

const banner = document.getElementById("inicio");

if (banner) {
  const imagensBanner = configFinal.imagensBanner.slice(0, 5);
  // ... resto continua igual

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


document.addEventListener('DOMContentLoaded', function() {
  const calendarioEl = document.getElementById('calendario');
  if (!calendarioEl) return; // página sem calendário, não faz nada

  const containerHorarios = document.getElementById('horariosDisponiveis');

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
  console.log('Agendando:', { dataStr, hora });

  alert('Horário reservado!');

}

const trilhoProdutos = document.getElementById("trilhoProdutos");

if (trilhoProdutos && configFinal.produtos) {
  configFinal.produtos.forEach(produto => {
    const card = document.createElement("div");
    card.classList.add("card-produto");

    card.innerHTML = `
      <img src="${produto.imagem}" alt="${produto.nome}">
      <h3>${produto.nome}</h3>
      <p class="preco-produto">${produto.preco}</p>
    `;

    trilhoProdutos.appendChild(card);
  });

  const setaEsq = document.querySelector(".seta-esq");
  const setaDir = document.querySelector(".seta-dir");

  function rolar(direcao) {
    const card = trilhoProdutos.querySelector(".card-produto");
    if (!card) return;

    const passo = card.offsetWidth + 20;
    trilhoProdutos.scrollBy({ left: passo * direcao, behavior: "smooth" });
  }

  setaEsq.addEventListener("click", () => rolar(-1));
  setaDir.addEventListener("click", () => rolar(1));
}

const telefoneEl = document.getElementById("telefoneContato");

if (telefoneEl && configFinal.contato) {
  telefoneEl.textContent =  configFinal.contato.telefone;
  document.getElementById("enderecoContato").textContent = configFinal.contato.endereco;
  document.getElementById("linkInstagram").href = configFinal.contato.instagram;
  document.getElementById("linkWhatsapp").href = configFinal.contato.whatsapp;
}