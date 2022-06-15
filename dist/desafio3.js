"use strict";
const botaoAtualizar = document.getElementById('atualizar-saldo');
const botaoLimpar = document.getElementById('limpar-saldo');
const soma = document.getElementById('soma');
const campoSaldo = document.getElementById('campo-saldo');
campoSaldo.innerText = '0';
function somarAoSaldo(soma) {
    campoSaldo.innerText = `${Number(campoSaldo.innerHTML) + soma}`;
}
function limparSaldo() {
    campoSaldo.innerText = '';
}
botaoAtualizar.addEventListener('click', function () {
    somarAoSaldo(Number(soma.value));
});
botaoLimpar.addEventListener('click', function () {
    limparSaldo();
});
