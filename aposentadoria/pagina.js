// Logica da pagina da calculadora: pura, sem DOM. Premissas e numeros vem de config.js.
(function (root) {
  // "1.200.000,50" -> 1200000.5. Vazio ou lixo -> NaN (Number("") seria 0).
  function lerReais(s) {
    var t = String(s == null ? "" : s).replace(/\s/g, "").replace(/R\$/g, "");
    if (!/^\d[\d.]*(,\d*)?$/.test(t)) return NaN;
    return Number(t.replace(/\./g, "").replace(",", "."));
  }

  // pico: de pico.inicio a pico.fim, inclusive, em horario de Brasilia (UTC-3, sem horario de verao)
  function modoAgora(cfg, agora) {
    if (cfg.raioXFechado !== false) return "fora";
    var dia = new Date(agora.getTime() - 3 * 3600 * 1000).toISOString().slice(0, 10);
    return dia >= cfg.pico.inicio && dia <= cfg.pico.fim ? "pico" : "fora";
  }

  function premissasDe(cfg) {
    return {
      rReal: cfg.rReal.valor,
      taxas: { fundos: cfg.taxas.fundos.valor, direto: cfg.taxas.direto.valor, baixoCusto: cfg.taxas.baixoCusto.valor },
      multiplo: cfg.multiplo
    };
  }

  // Mascara do campo em reais, aplicada a cada tecla: inteiro com pontos de milhar; se ha virgula,
  // ela fica, com no maximo 2 digitos depois. Ponto digitado e separador de milhar, nunca decimal.
  function mascaraReais(s) {
    var partes = String(s == null ? "" : s).split(",");
    var d = partes[0].replace(/\D/g, "");
    if (!d) return "";
    var out = Number(d).toLocaleString("pt-BR");
    if (partes.length > 1) out += "," + partes.slice(1).join("").replace(/\D/g, "").slice(0, 2);
    return out;
  }
  function faixaLabel(cfg, investido) {
    var k = Math.round(cfg.faixaPessoal / 1000) + "k";
    return investido >= cfg.faixaPessoal ? "≥" + k : "<" + k;
  }

  function virgula(n) { return String(n).replace(".", ","); }
  // R$ 800 mil, R$ 1,2 mi, R$ 500
  function brl(n) {
    if (n >= 1e6) return "R$ " + virgula(+(n / 1e6).toFixed(1)) + " mi";
    if (n >= 1e3) {
      var mil = Math.round(n / 100) / 10;
      if (mil >= 1000) return "R$ " + virgula(+(n / 1e6).toFixed(1)) + " mi"; // 999.950 -> 1 mi, nunca "1000 mil"
      return "R$ " + virgula(mil) + " mil";
    }
    return "R$ " + Math.round(n);
  }
  function brlExato(n) { return "R$ " + Math.round(n).toLocaleString("pt-BR"); }
  // 13 -> "1 ano e 1 mês", 8 -> "8 meses", 36 -> "3 anos"
  function anosMeses(meses) {
    var a = Math.floor(meses / 12), m = meses % 12, p = [];
    if (a) p.push(a + (a === 1 ? " ano" : " anos"));
    if (m || !a) p.push(m + (m === 1 ? " mês" : " meses"));
    return p.join(" e ");
  }
  // idade exata (em anos, vinda da conta mensal) -> meses inteiros
  function meses(x) { return x === null ? null : Math.round(x * 12); }
  // 66,17 -> "66 anos e 2 meses"; sem idade -> null
  function idade(x) { return x === null ? null : anosMeses(meses(x)); }
  // diferenca em meses entre as duas linhas, a partir das idades exatas
  function mesesDiferenca(r) {
    return r.comTarifa.idadeAtinge === null || r.baixoCusto.idadeAtinge === null ? null : meses(r.comTarifa.idadeAtinge) - meses(r.baixoCusto.idadeAtinge);
  }

  var ONDE_TXT = {
    fundos: "fundos ou previdência (banco ou corretora)",
    direto: "Tesouro, CDB ou ações direto",
    naosei: "fundos ou previdência (não sei ao certo)"
  };

  // resumo do que a pessoa digitou: vai na mensagem do WhatsApp e no PDF
  function resumoEntrada(e) {
    return "tenho " + e.idade + " anos, quero parar aos " + e.idadeAlvo + ", " + brl(e.investido) + " investidos, quero " +
      brl(e.rendaMensal) + "/mês, invisto " + brl(e.aporteMensal) + "/mês, a maior parte em " + ONDE_TXT[e.onde] + ".";
  }

  function mensagemWhats(e, r, modo, cfg) {
    var pessoal = e.investido >= cfg.faixaPessoal;
    var ini = pessoal ? "Olá, Hélio! " : "Olá! ";
    var resumo = resumoEntrada(e);
    var res = "";
    if (r.caso === "ja_atingiu") res = "O que tenho já paga essa renda.";
    else if (r.caso === "nunca") res = "Pela conta, não chego lá antes dos 100 anos.";
    else if (r.caso === "tarifa_baixa") res = "Pela conta, paro aos " + idade(r.comTarifa.idadeAtinge) + ".";
    else res = "Com a tarifa paro aos " + idade(r.comTarifa.idadeAtinge) + "; com custo baixo, aos " + idade(r.baixoCusto.idadeAtinge) + ".";
    var fim = modo === "pico" ? "Quero o Raio-X da minha carteira." : "Quero conversar sobre isso.";
    var codigo = modo === "pico" ? "(calc rx)" : "(calc)";
    return {
      numero: pessoal ? cfg.whats.pessoal : cfg.whats.suporte,
      texto: ini + "Fiz a conta da aposentadoria no site: " + resumo + " " + res + " " + fim + "\n" + codigo
    };
  }

  var API = { lerReais: lerReais, modoAgora: modoAgora, premissasDe: premissasDe, mensagemWhats: mensagemWhats, mascaraReais: mascaraReais, faixaLabel: faixaLabel,
    brl: brl, brlExato: brlExato, idade: idade, anosMeses: anosMeses, mesesDiferenca: mesesDiferenca, resumoEntrada: resumoEntrada, ONDE_TXT: ONDE_TXT };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else root.Pagina = API;
})(typeof window !== "undefined" ? window : this);
