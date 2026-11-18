// Conta da aposentadoria: pura, sem dependencias. Premissas entram por parametro (vem de config.js).
(function (root) {
  var MESES_MAX_IDADE = 100;

  function taxaDe(e, p) {
    return e.onde === "direto" ? p.taxas.direto : p.taxas.fundos;
  }

  // taxa mensal real liquida
  function mensal(t, rReal) {
    return Math.pow(1 + rReal - t, 1 / 12) - 1;
  }

  // (1+i)^n - 1 sobre i, com i ~ 0 tratado como n
  function fatorAnuidade(i, n) {
    return Math.abs(i) < 1e-12 ? n : (Math.pow(1 + i, n) - 1) / i;
  }

  function fv(P, A, i, n) {
    return P * Math.pow(1 + i, n) + A * fatorAnuidade(i, n);
  }

  function linha(e, p, t, alvo) {
    var i = mensal(t, p.rReal);
    var maxN = (MESES_MAX_IDADE - e.idade) * 12;
    var idadeAtinge = null;
    for (var n = 0; n <= maxN; n++) {
      if (fv(e.investido, e.aporteMensal, i, n) >= alvo) {
        idadeAtinge = e.idade + n / 12;
        break;
      }
    }
    return { idadeAtinge: idadeAtinge, aporteNecessario: aporteNecessario(e, p, t, alvo) };
  }

  // aporte mensal que leva o patrimonio ao alvo exatamente na idade alvo
  function aporteNecessario(e, p, t, alvo) {
    var i = mensal(t, p.rReal);
    var N = (e.idadeAlvo - e.idade) * 12;
    if (Math.abs(i) < 1e-12) return Math.max(0, (alvo - e.investido) / N);
    var cresc = Math.pow(1 + i, N);
    return Math.max(0, (alvo - e.investido * cresc) * i / (cresc - 1));
  }

  function valida(e) {
    if (!(e.idadeAlvo > e.idade)) return "A idade para parar precisa ser maior que a idade atual.";
    if (e.investido < 0) return "O valor investido não pode ser negativo.";
    if (!(e.rendaMensal > 0)) return "Informe a renda mensal que você quer manter na aposentadoria.";
    if (e.aporteMensal < 0) return "O aporte mensal não pode ser negativo.";
    return null;
  }

  function simular(e, p) {
    var alvo = e.rendaMensal * p.multiplo;
    var taxa = taxaDe(e, p);
    var comTarifa = linha(e, p, taxa, alvo);
    var baixoCusto = linha(e, p, p.taxas.baixoCusto, alvo);
    var anosDiferenca = comTarifa.idadeAtinge === null || baixoCusto.idadeAtinge === null
      ? null
      : comTarifa.idadeAtinge - baixoCusto.idadeAtinge;

    var caso = "normal";
    if (e.investido >= alvo) caso = "ja_atingiu";
    else if (comTarifa.idadeAtinge === null) caso = "nunca";
    else if (anosDiferenca !== null && anosDiferenca < 1) caso = "tarifa_baixa";

    return {
      alvo: alvo,
      comTarifa: comTarifa,
      baixoCusto: baixoCusto,
      anosDiferenca: anosDiferenca,
      caso: caso,
      custoAnualTarifa: e.investido * taxa,
      taxaUsada: taxa,
      contouComoFundos: e.onde === "naosei"
    };
  }

  var API = { valida: valida, simular: simular };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else root.Conta = API;
})(typeof window !== "undefined" ? window : this);
