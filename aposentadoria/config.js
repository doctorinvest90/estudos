// Premissas medidas por aposentadoria/premissas/medir.py (nov/2026). Nao editar os valores a mao.
(function (root) {
  var CONFIG = {
    rReal: { valor: 0.0446, fonte: "BCB/SGS: CDI (4391) e IPCA (433), 2006–2025", data: "2026-11" },
    taxas: {
      fundos: { valor: 0.005, fonte: "Dados abertos da CVM: mediana da taxa de administração das lâminas de fundos de renda fixa e multimercado de varejo dos cinco maiores bancos (previdência fora da medida: a CVM não publica a taxa)", data: "2026-11" },
      direto: { valor: 0.002, fonte: "Tesouro Direto: taxa de custódia da B3", data: "2026-11" },
      baixoCusto: { valor: 0.002, fonte: "Tesouro Direto: taxa de custódia da B3", data: "2026-11" }
    },
    multiplo: 300,
    faixaPessoal: 500000,
    pico: { inicio: "2027-01-11", fim: "2027-01-31" },
    raioXFechado: false,
    whats: { suporte: "551151923850", pessoal: "5511992086907" }
  };
  if (typeof module !== "undefined" && module.exports) module.exports = CONFIG;
  else root.CALC_CONFIG = CONFIG;
})(typeof window !== "undefined" ? window : this);
