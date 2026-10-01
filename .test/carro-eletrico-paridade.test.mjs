// Paridade do simulador do estudo do carro elétrico com o PDF (motor.py) e os textos
// da página. Rodar: node .test/carro-eletrico-paridade.test.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const html = readFileSync(new URL("../carro-eletrico/index.html", import.meta.url), "utf8");
new Function(html.match(/<script id="motor">([\s\S]*?)<\/script>/)[1])();
const M = globalThis.MOTOR;
const P = JSON.parse(html.match(/<script id="dados" type="application\/json">([\s\S]*?)<\/script>/)[1]);

// Valores de motor.py (Tabela 5 e 6 do PDF): São Paulo, 5 anos, 15 mil km/ano, IPCA + 6%.
const ESPERADO = {
  yuan_plus_compass: { S1: -24664, S2: -12911, agio: 26946 },
  dolphin_tcross: { S1: 71389, S2: 66486, agio: 26488 },
  dolphin_mini_polo: { S1: 40887, S2: 36138, agio: 27396 },
  seal_bmw_320i: { S1: 93580, S2: 120588, agio: 16298 },
};
for (const [par, e] of Object.entries(ESPERADO)) {
  const p = P[par], q = p.praca.SP;
  const ice = { P0: p.ice.P0, d: p.ice.d, ckm: q.gas / p.ice.kml, aliq: q.ipva_ice, seg: p.ice.seg, rev: p.ice.rev };
  for (const cen of ["S1", "S2"]) {
    const ev = { P0: p.ev.P0, d: p.ev["d_" + cen], ckm: p.ev.kwh_km * q.tarifa, aliq: q.ipva_ev, seg: p.ev.seg, rev: p.ev.rev };
    assert.equal(Math.round(M.par(ev, ice, 60, 15000, 0.06).delta), e[cen], `${par} ${cen}`);
    if (cen === "S2") assert.equal(Math.round(M.agioMax(ev, ice, 60, 15000, 0.06)), e.agio, `${par} ágio`);
  }
}
// O PDF e os textos dizem "uns R$ 27 mil" para o SUV médio e "R$ 58 mil" em Brasília.
const y = P.yuan_plus_compass, df = y.praca.DF;
const evDF = { P0: y.ev.P0, d: y.ice.d, ckm: y.ev.kwh_km * df.tarifa, aliq: df.ipva_ev, seg: y.ev.seg, rev: y.ev.rev };
const iceDF = { P0: y.ice.P0, d: y.ice.d, ckm: df.gas / y.ice.kml, aliq: df.ipva_ice, seg: y.ice.seg, rev: y.ice.rev };
assert.equal(Math.round(M.agioMax(evDF, iceDF, 60, 15000, 0.06) / 1000), 58);
// Nenhum input da página é slider: o arredondamento ao step (REFERENCE §6) não se aplica.
assert.ok(!/type="range"/.test(html), "slider na página");
console.log("ok — paridade com o PDF nos 4 pares, S1 e S2, e ágio em SP e Brasília");
