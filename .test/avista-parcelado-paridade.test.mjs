// Gate de paridade entre o motor Python e o motor do simulador.
// Compara TODOS os casos canônicos e as constantes de partida (CDI de hoje e
// poupança). Falha em qualquer divergência acima de 1e-9.
//
// Uso: node .test/avista-parcelado-paridade.test.mjs (casos gerados por paridade_casos.py no repo twenty-followup-sync)

import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../avista-parcelado/index.html", import.meta.url), "utf8");
const m = html.match(/<script id="motor">([\s\S]*?)<\/script>/);
if (!m) { console.error('FALHA: o simulador não tem <script id="motor">.'); process.exit(1); }
new Function(m[1])();
const M = globalThis.MOTOR;

const { cdi_hoje, poupanca_mes, data_cdi, mes_poupanca, casos } = JSON.parse(readFileSync(new URL("./avista-parcelado-casos.json", import.meta.url), "utf8"));
const TOL = 1e-9;
let falhas = 0;
const confere = (nome, obtido, esperado) => {
  const dif = Math.abs(obtido - esperado);
  if (!(dif <= TOL * Math.max(1, Math.abs(esperado)))) {
    falhas++;
    console.error(`DIVERGE  ${nome}  python=${esperado}  js=${obtido}  dif=${dif}`);
  }
};

confere("constante.CDI_HOJE", M.CDI_HOJE, cdi_hoje);
confere("constante.POUPANCA_MES", M.POUPANCA_MES, poupanca_mes);
for (const [nome, js, py] of [["DATA_CDI", M.DATA_CDI, data_cdi], ["MES_POUPANCA", M.MES_POUPANCA, mes_poupanca]]) {
  if (js !== py) { falhas++; console.error(`DIVERGE  constante.${nome}  python=${py}  js=${js}`); }
}
for (const c of casos) {
  const e = c.entrada, cal = M.calendario(e.n, e.dias);
  const obtido = {
    empate: M.descontoEmpate(cal, e.ap, e.pontos),
    custo: M.custoParcelado(cal, e.ap),
    ganho: M.ganhoParcelar(e.desconto, cal, e.ap, e.valor, e.pontos),
    cdi_virada: M.cdiDeEmpate(cal, e.desconto, e.pontos),
  };
  for (const [k, v] of Object.entries(c.esperado)) confere(`${c.nome}.${k}`, obtido[k], v);
}
if (falhas) { console.error(`\n${falhas} divergência(s). O simulador NÃO pode ser publicado.`); process.exit(1); }
console.log(`paridade OK — ${casos.length} casos × ${Object.keys(casos[0].esperado).length} números + 4 constantes`);
