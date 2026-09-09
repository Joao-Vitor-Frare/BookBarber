const botaoMenu = document.querySelector('.botao-menu');
const nav = document.querySelector('nav');

botaoMenu.addEventListener('click', function() {
    nav.classList.toggle('menu-aberto');
    botaoMenu.classList.toggle('menu-aberto');
    document.body.classList.toggle('menu-aberto');
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

// script.js

// título e descrição
document.getElementById("nomeBanner").textContent = config.nomeBanner;
document.getElementById("descBanner").textContent = config.descBanner;

// carrossel de fundo
const imagensBanner = config.imagensBanner.slice(0, 5); // limita a no máximo 5

if (imagensBanner.length < 2) {
  console.warn("Adicione pelo menos 2 imagens no banner.");
}

const banner = document.getElementById("inicio");
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
  intervaloAuto = setInterval(trocarSlideAuto, 4000);
}

reiniciarAutoPlay();