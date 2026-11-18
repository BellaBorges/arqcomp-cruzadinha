"use strict";

const LINHAS = 14;
const COLUNAS = 16;

const PALAVRAS = [
  { resposta: "MICROCONTROLADOR", linha: 7, coluna: 0, dir: "H", pista: "Chip único que reúne CPU, memória e entrada e saída; o ATmega328P é um exemplo." },
  { resposta: "MEMORIADEMASSA", linha: 0, coluna: 13, dir: "V", pista: "Guarda seus arquivos por muito tempo, como num HD ou SSD, mesmo sem energia." },
  { resposta: "REGISTRADORES", linha: 1, coluna: 9, dir: "V", pista: "Espaços minúsculos e super rápidos dentro da CPU, que guardam os valores em uso." },
  { resposta: "ADDRESSBUS", linha: 4, coluna: 3, dir: "V", pista: "Fios que avisam à memória qual posição deve ser lida ou escrita." },
  { resposta: "DATABUS", linha: 5, coluna: 3, dir: "H", pista: "Fios compartilhados por onde o conteúdo viaja entre CPU, memória e entrada e saída." },
  { resposta: "EEPROM", linha: 4, coluna: 15, dir: "V", pista: "Pequeno espaço do Arduino onde dá para salvar informações que sobrevivem ao desligamento." },
  { resposta: "CACHE", linha: 2, coluna: 5, dir: "H", pista: "Pequeno espaço veloz perto da CPU que guarda cópias do que ela acabou de usar." },
  { resposta: "FLASH", linha: 6, coluna: 11, dir: "V", pista: "Mesma tecnologia do pendrive; guarda o programa do Arduino mesmo desligado." },
  { resposta: "DMA", linha: 0, coluna: 12, dir: "H", pista: "Permite que um dispositivo troque informações com a RAM sem a CPU copiar tudo." },
  { resposta: "CPU", linha: 7, coluna: 5, dir: "V", pista: "Chip principal que busca e executa, uma a uma, as instruções de um programa." },
  { resposta: "ROM", linha: 1, coluna: 9, dir: "H", pista: "Guarda o programa básico do equipamento e mantém o conteúdo mesmo sem energia." },
  { resposta: "ULA", linha: 12, coluna: 3, dir: "H", pista: "Faz as somas, subtrações e comparações dentro do processador." },
  { resposta: "RAM", linha: 11, coluna: 5, dir: "V", pista: "Espaço de trabalho que guarda os programas rodando e some quando a energia acaba." },
  { resposta: "UC", linha: 9, coluna: 5, dir: "H", pista: "Lê cada instrução e manda as outras partes do computador agirem." },
];


const celulas = new Map();
const entradas = [];

function chave(l, c) {
  "use strict";
  return l + "," + c;
}

function montarModelo() {
  "use strict";
  PALAVRAS.forEach((p) => {
    const entrada = { ...p, celulas: [], status: "", num: 0 };
    for (let i = 0; i < p.resposta.length; i++) {
      const l = p.dir === "H" ? p.linha : p.linha + i;
      const c = p.dir === "H" ? p.coluna + i : p.coluna;
      let cel = celulas.get(chave(l, c));
      if (!cel) {
        cel = { linha: l, coluna: c, letra: p.resposta[i], entradas: [], num: 0 };
        celulas.set(chave(l, c), cel);
      }
      cel.entradas.push(entrada);
      entrada.celulas.push(cel);
    }
    entradas.push(entrada);
  });

  let n = 0;
  for (let l = 0; l < LINHAS; l++) {
    for (let c = 0; c < COLUNAS; c++) {
      const cel = celulas.get(chave(l, c));
      if (!cel) continue;
      const inicios = cel.entradas.filter((e) => e.celulas[0] === cel);
      if (inicios.length) {
        cel.num = ++n;
        inicios.forEach((e) => (e.num = n));
      }
    }
  }
}

const elTabuleiro = document.getElementById("tabuleiro");
const elContador = document.getElementById("contador");
const elProgresso = document.getElementById("progresso");
const elMensagem = document.getElementById("mensagem");
const elPistaAtual = document.getElementById("pista-atual");
const elListaH = document.getElementById("lista-h");
const elListaV = document.getElementById("lista-v");

function desenharTabuleiro() {
  "use strict";
  elTabuleiro.style.setProperty("--colunas", COLUNAS);
  document.documentElement.style.setProperty("--colunas", COLUNAS);

  for (let l = 0; l < LINHAS; l++) {
    for (let c = 0; c < COLUNAS; c++) {
      const cel = celulas.get(chave(l, c));
      const div = document.createElement("div");
      if (!cel) {
        div.className = "vazia";
        elTabuleiro.appendChild(div);
        continue;
      }
      div.className = "celula";
      if (cel.num) {
        const num = document.createElement("span");
        num.className = "num";
        num.textContent = cel.num;
        div.appendChild(num);
      }
      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = 2;
      input.autocomplete = "off";
      input.autocapitalize = "characters";
      input.spellcheck = false;
      input.setAttribute("aria-label", "Linha " + (l + 1) + ", coluna " + (c + 1));
      div.appendChild(input);

      cel.el = div;
      cel.input = input;
      ligarEventos(cel);
      elTabuleiro.appendChild(div);
    }
  }
}

function desenharPistas() {
  "use strict";
  const ordenadas = [...entradas].sort((a, b) => a.num - b.num);
  ordenadas.forEach((e) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pista";
    btn.innerHTML =
      '<span class="n">' + e.num + '</span>' +
      '<span class="texto"></span>' +
      '<span class="selo"></span>';
    const texto = btn.querySelector(".texto");
    texto.textContent = e.pista + " ";
    const tam = document.createElement("span");
    tam.className = "tam";
    tam.textContent = "(" + e.resposta.length + " letras)";
    texto.appendChild(tam);
    btn.addEventListener("click", () => {
      "use strict";
      direcao = e.dir;
      focar(primeiraVazia(e));
    });
    li.appendChild(btn);
    e.li = li;
    (e.dir === "H" ? elListaH : elListaV).appendChild(li);
  });
}

let direcao = "H";
let ativa = { entrada: null, cel: null };

function primeiraVazia(entrada) {
  "use strict";
  return entrada.celulas.find((c) => !c.input.value) || entrada.celulas[0];
}

function focar(cel) {
  "use strict";
  cel.input.focus();
  cel.input.select();
}

function ativar(cel, alternar) {
  "use strict";
  const opcoes = cel.entradas;
  let entrada = opcoes.find((e) => e.dir === direcao) || opcoes[0];
  if (alternar && opcoes.length > 1) {
    entrada = opcoes.find((e) => e.dir !== direcao);
  }
  direcao = entrada.dir;
  ativa = { entrada, cel };
  pintarSelecao();
}

function pintarSelecao() {
  "use strict";
  celulas.forEach((c) => c.el.classList.remove("destaque", "atual"));
  entradas.forEach((e) => e.li.classList.remove("ativa"));
  const { entrada, cel } = ativa;
  if (!entrada) return;
  entrada.celulas.forEach((c) => c.el.classList.add("destaque"));
  cel.el.classList.add("atual");
  entrada.li.classList.add("ativa");
  elPistaAtual.innerHTML = "";
  const rotulo = document.createElement("b");
  rotulo.textContent = entrada.num + (entrada.dir === "H" ? " Horizontal" : " Vertical");
  elPistaAtual.append(rotulo, entrada.pista);
}

function mover(cel, passo) {
  "use strict";
  const { entrada } = ativa;
  const prox = entrada.celulas[entrada.celulas.indexOf(cel) + passo];
  if (prox) focar(prox);
}

function irParaPalavra(passo) {
  "use strict";
  const ordem = [...entradas].sort((a, b) => a.num - b.num || (a.dir === "H" ? -1 : 1));
  const i = ordem.indexOf(ativa.entrada);
  const alvo = ordem[(i + passo + ordem.length) % ordem.length];
  direcao = alvo.dir;
  focar(primeiraVazia(alvo));
}

function normalizar(valor) {
  "use strict";
  const ultimo = [...valor].pop() || "";
  const letra = ultimo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  return /^[A-Z]$/.test(letra) ? letra : "";
}

// CORRIGIDO: Verifica com precisão se todas as células daquela palavra específica foram preenchidas
function verificarPreenchimentoParcial() {
  "use strict";
  entradas.forEach((e) => {
    const todasPreenchidas = e.celulas.every((c) => c.input.value && c.input.value.trim() !== "");
    if (todasPreenchidas) {
      e.li.classList.add("preenchida");
    } else {
      e.li.classList.remove("preenchida");
    }
  });
}

function ligarEventos(cel) {
  "use strict";
  const input = cel.input;
  let jaEstavaAtiva = false;

  input.addEventListener("pointerdown", () => {
    "use strict";
    jaEstavaAtiva = ativa.cel === cel;
  });
  input.addEventListener("focus", () => {
    "use strict";
    ativar(cel, false);
    input.select();
  });
  input.addEventListener("click", () => {
    "use strict";
    if (jaEstavaAtiva) ativar(cel, true);
    jaEstavaAtiva = false;
  });

  input.addEventListener("input", () => {
    "use strict";
    input.value = normalizar(input.value);
    limparConferencia(cel);
    verificarPreenchimentoParcial();
    if (input.value) mover(cel, 1);
  });

  input.addEventListener("keydown", (ev) => {
    "use strict";
    const setas = { ArrowRight: [0, 1, "H"], ArrowLeft: [0, -1, "H"], ArrowDown: [1, 0, "V"], ArrowUp: [-1, 0, "V"] };
    if (setas[ev.key]) {
      ev.preventDefault();
      const [dl, dc, d] = setas[ev.key];
      const viz = celulas.get(chave(cel.linha + dl, cel.coluna + dc));
      if (viz) { direcao = d; focar(viz); }
    } else if (ev.key === "Backspace" && !input.value) {
      ev.preventDefault();
      const { entrada } = ativa;
      const ant = entrada.celulas[entrada.celulas.indexOf(cel) - 1];
      if (ant) {
        ant.input.value = "";
        limparConferencia(ant);
        verificarPreenchimentoParcial();
        focar(ant);
      }
    } else if (ev.key === "Tab") {
      ev.preventDefault();
      irParaPalavra(ev.shiftKey ? -1 : 1);
    }
  });
}

function contarCertas() {
  "use strict";
  return entradas.filter((e) => e.status === "certa").length;
}

function atualizarPlacar() {
  "use strict";
  const certas = contarCertas();
  elContador.textContent = certas + " de " + entradas.length + " palavras";
  elProgresso.style.width = (certas / entradas.length) * 100 + "%";
}

function atualizarSelos() {
  "use strict";
  const rotulos = { certa: "✔ certa", errada: "✘ errada", incompleta: "incompleta", "": "" };
  entradas.forEach((e) => {
    e.li.classList.remove("certa", "errada", "incompleta");
    if (e.status) e.li.classList.add(e.status);
    e.li.querySelector(".selo").textContent = rotulos[e.status];
  });
}

function limparConferencia(cel) {
  "use strict";
  cel.el.classList.remove("certa", "errada");
  cel.entradas.forEach((e) => (e.status = ""));
  atualizarSelos();
  atualizarPlacar();
  elMensagem.textContent = "";
  elMensagem.className = "mensagem";
}

function conferir() {
  "use strict";
  entradas.forEach((e) => {
    const digitado = e.celulas.map((c) => c.input.value);
    if (digitado.some((v) => !v)) e.status = "incompleta";
    else e.status = digitado.join("") === e.resposta ? "certa" : "errada";
  });

  celulas.forEach((c) => {
    const v = c.input.value;
    c.el.classList.toggle("certa", !!v && v === c.letra);
    c.el.classList.toggle("errada", !!v && v !== c.letra);
  });

  atualizarSelos();
  atualizarPlacar();

  const erradas = entradas.filter((e) => e.status === "errada").length;
  const incompletas = entradas.filter((e) => e.status === "incompleta").length;
  if (contarCertas() === entradas.length) {
    elMensagem.textContent = "Parabéns! Você acertou todas as " + entradas.length + " palavras.";
    elMensagem.className = "mensagem ok";
  } else {
    const partes = [];
    if (erradas) partes.push(erradas + (erradas === 1 ? " palavra errada" : " palavras erradas"));
    if (incompletas) partes.push(incompletas + (incompletas === 1 ? " incompleta" : " incompletas"));
    elMensagem.textContent = "Faltam acertos: " + partes.join(" e ") + ".";
    elMensagem.className = "mensagem aviso";
  }
}

function reiniciar() {
  "use strict";
  celulas.forEach((c) => {
    c.input.value = "";
    c.el.classList.remove("certa", "errada");
  });
  entradas.forEach((e) => (e.status = ""));
  verificarPreenchimentoParcial();
  atualizarSelos();
  atualizarPlacar();
  elMensagem.textContent = "";
  elMensagem.className = "mensagem";
  direcao = "H";
  const primeira = [...entradas].filter((e) => e.dir === "H").sort((a, b) => a.num - b.num)[0];
  focar(primeira.celulas[0]);
}

montarModelo();
desenharTabuleiro();
desenharPistas();
atualizarPlacar();

// Garante que verifique o preenchimento caso recarregue com dados salvos ou focados
verificarPreenchimentoParcial();

document.getElementById("btn-conferir").addEventListener("click", conferir);
document.getElementById("btn-reiniciar").addEventListener("click", reiniciar);

(function () {
  "use strict";
  const primeira = [...entradas].filter((e) => e.dir === "H").sort((a, b) => a.num - b.num)[0];
  ativa = { entrada: primeira, cel: primeira.celulas[0] };
  pintarSelecao();
})();