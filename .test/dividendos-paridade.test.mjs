// Paridade do simulador de dividendos com o estudo (PDF + motor.py), e o defeito que
// quebrava essa paridade só no navegador: preset fora do step do slider. Com step 100
// e 0.1, o teto do INSS (8.475,55) virava 8.521 e o CDI de 13,65% virava 13,7.
// Rodar: node .test/dividendos-paridade.test.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const html = readFileSync(new URL("../dividendos/index.html", import.meta.url), "utf8");

// 1. Motor: os números de capa e das tabelas 1 e 3 do estudo.
const js = html.slice(html.indexOf("const LEI ="), html.indexOf("if (false) module.exports"));
const m = new Function(`${js}; return { simular, baseOndeMorde, erosao, pgblVsVgbl };`)();
const perfil = (receitaMes, patrimonio) => ({ receitaMes, patrimonio, custosPct: .08, prolMes: 8475.55,
  rfTrib: .6, isentos: .2, acoes: .12, fii: .08, pgbl: 0, nPjs: 1, outros: 0 });
const R = Math.round;

const p2 = perfil(70000, 1200000), s2 = m.simular(p2, {});
assert.equal(R(s2.base), 743087); assert.equal(R(s2.bruto), 17721); assert.equal(R(s2.irpf + s2.irRf), 28730);
assert.equal(R(s2.liquido), 0); assert.equal(R(m.baseOndeMorde(p2, {})), 812230);
assert.equal(m.erosao(p2, {}, 11).find(e => e.binding).ano, 2030);
assert.equal(R(m.erosao(p2, {}, 11)[10].irpfmReal), 32488);

const p3 = perfil(100000, 2000000), s3 = m.simular(p3, {});
assert.equal(R(s3.base), 1085099); assert.equal(R(s3.liquido), 49172); assert.equal((s3.mg * 100).toFixed(1), "26.2");
assert.equal(R(s3.lciBe * 100), 74); assert.equal(R(s3.ret), 80759); assert.equal(R(s3.restituicao), 31587);
assert.equal(R(s3.custoCaixa), 8589); assert.equal(R(m.simular(p3, {}, false).impostoTotal), 145118);
assert.equal(R(s3.impostoTotal), 194290); assert.equal(R(m.pgblVsVgbl(p3, {}).resultado), -439);
assert.equal(R(m.pgblVsVgbl(perfil(40000, 600000), {}).resultado), 2917);

// 2. Todo valor de preset (e de mercado) cabe no step do slider que o recebe.
const presets = new Function(`${html.match(/const PRESETS = \{[\s\S]*?\}\};/)[0]}
  ${html.match(/const MKT = \{[^}]*\};/)[0]} return { PRESETS, MKT };`)();
const valores = [...Object.values(presets.PRESETS), presets.MKT];
for (const [, id, min, step] of html.matchAll(/<input type="range" id="(\w+)" min="([\d.]+)" max="[\d.]+" step="([\w.]+)">/g)) {
  if (step === "any") continue;
  for (const v of valores) {
    if (!(id in v)) continue;
    const passos = (v[id] - Number(min)) / Number(step);
    assert.ok(Math.abs(passos - Math.round(passos)) < 1e-6, `${id}=${v[id]} fora do step ${step} (min ${min})`);
  }
}

console.log("ok — paridade do motor e presets dentro do step");
