// aposentadoria/conta.check.mjs — node aposentadoria/conta.check.mjs
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const { simular, valida } = createRequire(import.meta.url)("./conta.js");
const P = { rReal: 0.043, taxas: { fundos: 0.015, direto: 0.002, baixoCusto: 0.002 }, multiplo: 300 };
const perto = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} != ${b}`);

// base: 42 anos, parar aos 60, R$ 800 mil, renda R$ 30 mil, aporte R$ 15 mil, fundos
let r = simular({ idade: 42, idadeAlvo: 60, investido: 800000, rendaMensal: 30000, aporteMensal: 15000, onde: "fundos" }, P);
assert.equal(r.alvo, 9000000);
perto(r.comTarifa.idadeAtinge, 69.25, 0.01); perto(r.baixoCusto.idadeAtinge, 65.42, 0.01);
perto(r.comTarifa.aporteNecessario, 27496.86, 1); perto(r.baixoCusto.aporteNecessario, 23234.97, 1);
perto(r.anosDiferenca, 3.83, 0.02); assert.equal(r.caso, "normal");

// já atingiu: R$ 12 mi para R$ 30 mil/mês
r = simular({ idade: 55, idadeAlvo: 60, investido: 12000000, rendaMensal: 30000, aporteMensal: 0, onde: "fundos" }, P);
assert.equal(r.caso, "ja_atingiu"); perto(r.custoAnualTarifa, 180000, 1);

// nunca: R$ 0, renda R$ 50 mil, aporte R$ 1 mil
r = simular({ idade: 50, idadeAlvo: 60, investido: 0, rendaMensal: 50000, aporteMensal: 1000, onde: "fundos" }, P);
assert.equal(r.comTarifa.idadeAtinge, null); assert.equal(r.caso, "nunca");

// aporte zero, R$ 1 mi, renda R$ 10 mil
r = simular({ idade: 40, idadeAlvo: 60, investido: 1000000, rendaMensal: 10000, aporteMensal: 0, onde: "fundos" }, P);
perto(r.comTarifa.idadeAtinge, 79.83, 0.01); perto(r.baixoCusto.idadeAtinge, 67.42, 0.01);

// tarifa baixa: direto usa 0,2% nas duas linhas
r = simular({ idade: 42, idadeAlvo: 60, investido: 800000, rendaMensal: 30000, aporteMensal: 15000, onde: "direto" }, P);
assert.equal(r.caso, "tarifa_baixa");

// não sei = fundos, e avisa
r = simular({ idade: 42, idadeAlvo: 60, investido: 800000, rendaMensal: 30000, aporteMensal: 15000, onde: "naosei" }, P);
assert.equal(r.taxaUsada, 0.015); assert.equal(r.contouComoFundos, true);

// rendimento líquido zero não divide por zero
r = simular({ idade: 42, idadeAlvo: 60, investido: 800000, rendaMensal: 30000, aporteMensal: 15000, onde: "fundos" },
  { ...P, taxas: { ...P.taxas, fundos: 0.043 } });
assert.ok(Number.isFinite(r.comTarifa.aporteNecessario));

// validação
assert.match(valida({ idade: 60, idadeAlvo: 55, investido: 0, rendaMensal: 10000, aporteMensal: 0, onde: "fundos" }), /parar/i);
assert.match(valida({ idade: 40, idadeAlvo: 60, investido: -1, rendaMensal: 10000, aporteMensal: 0, onde: "fundos" }), /investido/i);
assert.match(valida({ idade: 40, idadeAlvo: 60, investido: 0, rendaMensal: 0, aporteMensal: 0, onde: "fundos" }), /renda/i);
assert.equal(valida({ idade: 40, idadeAlvo: 60, investido: 0, rendaMensal: 10000, aporteMensal: 0, onde: "fundos" }), null);
console.log("conta ok");
