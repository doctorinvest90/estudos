// Contas do teste de estresse (estresse/index.html). Rodar: node .test/estresse.test.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const html = readFileSync(new URL("../estresse/index.html", import.meta.url), "utf8");
const ini = html.indexOf("/* calc:inicio */"), fim = html.indexOf("/* calc:fim */");
assert.ok(ini > 0 && fim > ini, "bloco calc não encontrado");
const m = new Function(`${html.slice(ini, fim)}; return { lerDivisao, pesosEfetivos, simularCarteira,
  pior12m, indicesSemanais, analisar };`)();
const perto = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `${a} != ${b}`);
const W = (ext, rf, acoes, fii) => ({ ext, rf, acoes, fii });

// Dados sintéticos: uma linha por data; classe não informada fica parada em 100.
function dados(datas, series) {
  const d = { datas, usd: datas.map(() => 5) };
  for (const k of ["ext", "rf", "acoes", "fii"]) d[k] = series[k] || datas.map(() => 100);
  return d;
}

// 1. Link: formato errado ou soma diferente de 100 -> null (a página usa o padrão).
assert.deepEqual(m.lerDivisao("50,20,15,15"), W(50, 20, 15, 15));
assert.deepEqual(m.lerDivisao(" 0, 100 ,0,0"), W(0, 100, 0, 0));
for (const ruim of [null, undefined, "", "50,20,15", "50,20,15,16", "a,b,c,d", "-5,55,25,25",
  "150,0,0,-50", "50.5,19.5,15,15", "50,20,15,15,0"])
  assert.equal(m.lerDivisao(ruim), null, String(ruim));
console.log("ok  lerDivisao");

// 2. 100% CDI: nenhuma queda; retorno = CDI do período.
{
  const datas = ["2020-12-30", "2020-12-31", "2021-01-04", "2021-02-01", "2021-03-15"];
  const d = dados(datas, { rf: [100, 100.1, 100.2, 101, 102] });
  const r = m.analisar(d, W(0, 100, 0, 0));
  r.v.forEach((x, i) => perto(x, d.rf[i]));
  assert.equal(r.maiorQueda.queda, 0);
  assert.equal(r.maiorQueda.pico, null);
  const tot = r.periodos.find((p) => p.id === "total").est;
  perto(tot.retornoAA, tot.cdiAA);
  console.log("ok  100% CDI");
}

// 3. Queda conhecida: 100 -> 150 -> 75 -> 150 é -50%, com pico, fundo e recuperação certos.
{
  const datas = ["2020-01-02", "2020-02-03", "2020-03-02", "2020-04-01", "2020-05-04"];
  const d = dados(datas, { acoes: [100, 150, 75, 150, 160] });
  const r = m.analisar(d, W(0, 0, 100, 0));
  perto(r.maiorQueda.queda, -0.5);
  assert.equal(r.maiorQueda.pico, "2020-02-03");
  assert.equal(r.maiorQueda.fundo, "2020-03-02");
  assert.equal(r.maiorQueda.rec.data, "2020-04-01");
  assert.equal(r.maiorQueda.rec.meses, 1);
  assert.deepEqual(r.dd.map((x) => Math.round(x * 100) / 100), [0, 0, -0.5, 0, 0]);
  console.log("ok  maior queda e recuperação");
}

// 4. Rebalanceamento mensal contra a conta feita à mão.
{
  const datas = ["2020-01-30", "2020-01-31", "2020-02-03", "2020-02-04"];
  const d = dados(datas, { ext: [100, 110, 121, 133.1], rf: [100, 100, 100, 100] });
  const v = m.simularCarteira(d, W(50, 50, 0, 0));
  // Jan: 50/50 em 100. 31/01: 0,5×110 + 0,5×100 = 105. 03/02: 110,5, rebalanceado para 55,25/55,25.
  // 04/02: 55,25 × 133,1/121 + 55,25 = 116,025 (sem rebalancear daria 116,55).
  [100, 105, 110.5, 116.025].forEach((x, i) => perto(v[i], x));
  console.log("ok  rebalanceamento mensal");
}

// 5. FII sem dado: o peso vai para as outras classes na mesma proporção; peso 0 com dado nulo não gera NaN.
{
  const datas = ["2010-12-01", "2010-12-30", "2011-01-03", "2011-01-04"];
  const d = dados(datas, { ext: [100, 110, 110, 121], fii: [null, 1000, 1000, 1100] });
  const v = m.simularCarteira(d, W(50, 0, 0, 50));
  [100, 110, 110, 121].forEach((x, i) => perto(v[i], x));
  const soFii = m.simularCarteira(d, W(0, 0, 0, 100)).map((x) => (x === null ? null : Math.round(x * 1e6) / 1e6));
  assert.deepEqual(soFii, [null, null, 100, 110]);
  assert.ok(m.simularCarteira(d, W(60, 40, 0, 0)).every(Number.isFinite));
  const longo = dados(["2002-12-30", "2003-01-02", "2010-12-01", "2010-12-30", "2011-01-03", "2011-01-04"],
    { fii: [null, null, null, 1000, 1000, 1100] });
  const r = m.analisar(longo, W(0, 0, 0, 100));
  assert.equal(r.periodos.find((p) => p.id === "p2").est, null);
  const tot = r.periodos.find((p) => p.id === "total").est;
  assert.equal(tot.parcial, true);
  assert.equal(tot.inicio, "2011-01-03");
  console.log("ok  FII antes de 2011");
}

// 6. Pior 12 meses, com a última data no meio do mês; o período termina nela.
{
  const datas = ["2020-01-15", "2020-07-15", "2021-01-15", "2021-07-15", "2022-01-12"];
  const d = dados(datas, { acoes: [100, 120, 90, 96, 99] });
  const p = m.pior12m(m.simularCarteira(d, W(0, 0, 100, 0)), datas);
  perto(p.r, -0.2);
  assert.equal(p.ini, "2020-07-15");
  assert.equal(p.fim, "2021-07-15");
  const est = m.analisar(d, W(0, 0, 100, 0)).periodos.find((x) => x.id === "p3").est;
  perto(est.retornoAA, Math.pow(0.99, 365.25 / 728) - 1);
  console.log("ok  pior 12 meses e mês incompleto");
}

// 7. Janela de crise e amostragem semanal (último dia útil de cada semana, segunda a domingo).
{
  const datas = ["2019-12-31", "2020-01-02", "2020-02-20", "2020-03-23", "2020-12-30", "2021-01-04"];
  const d = dados(datas, { acoes: [100, 110, 115, 69, 120, 60] });
  const r = m.analisar(d, W(0, 0, 100, 0));
  perto(r.crises.find((c) => c.rotulo === "Covid").queda, 69 / 115 - 1);
  assert.equal(r.crises.find((c) => c.rotulo === "Eleição de 2002").queda, null);
  assert.deepEqual(m.indicesSemanais(["2020-01-02", "2020-01-03", "2020-01-06", "2020-01-07"]), [1, 3]);
  console.log("ok  crises e amostragem semanal");
}

// 8. Dados reais: 100% CDI acompanha o CDI; a divisão 50/20/15/15 cai em 2011–hoje pelo menos
// o que o teste mensal mostrou (-12,8%); o Ibovespa cai mais de 55% em 2008.
{
  const d = JSON.parse(readFileSync(new URL("../estresse/dados.json", import.meta.url), "utf8"));
  const n = d.datas.length;
  for (const k of ["usd", "ext", "rf", "acoes", "fii"]) assert.equal(d[k].length, n, k);
  const cdi = m.analisar(d, W(0, 100, 0, 0)).periodos.find((p) => p.id === "p3").est;
  perto(cdi.retornoAA, cdi.cdiAA, 0.001);
  const p3 = m.analisar(d, W(50, 20, 15, 15)).periodos.find((p) => p.id === "p3").est;
  assert.ok(p3.queda <= -0.128, `queda 2011–hoje ${p3.queda}`);
  const ibov = m.analisar(d, W(0, 0, 100, 0)).crises.find((c) => c.rotulo === "Crise global de 2008");
  assert.ok(ibov.queda < -0.55, `Ibovespa 2008 ${ibov.queda}`);
  console.log(`ok  dados reais (${n} datas até ${d.ultima_data}; 50/20/15/15 caiu ${(p3.queda * 100).toFixed(1)}% em 2011–hoje)`);
}
