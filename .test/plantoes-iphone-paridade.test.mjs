// Paridade com motor.py (casos de paridade_casos.json do estudo) e os números de abertura.
// Rodar: node .test/plantoes-iphone-paridade.test.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const html = readFileSync(new URL("../plantoes-iphone/index.html", import.meta.url), "utf8");
new Function(html.match(/<script id="motor">([\s\S]*?)<\/script>/)[1])();
const D = JSON.parse(html.match(/<script id="dados" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const M = globalThis.MOTOR(D);
const casos = JSON.parse(readFileSync(new URL("plantoes-iphone-casos.json", import.meta.url), "utf8"));
const TOL = 1e-12;
function confere(nome, js, py) {
  assert.ok(Math.abs(js - py) <= TOL * Math.max(1, Math.abs(py)), `${nome}: py=${py} js=${js}`);
}
let n = 0, eq = 0;
for (const c of casos) {
  if ("n" in c) { confere(`n ${c.preco}/${c.plantao}/${c.aliq}`, M.plantoes(c.preco, c.plantao, c.aliq), c.n); n++; }
  else { confere(`eq ${c.p26}/${c.p16}/${c.pl16}`, M.equilibrio(c.p26, c.p16, c.pl16), c.eq); eq++; }
}
assert.equal(n + eq, casos.length);
console.log(`ok — paridade: ${casos.length} casos (${n} plantões, ${eq} equilíbrio; tolerância 1e-12)`);

// Abertura da página, como no PDF: "Líquido", clínico, 18 Pro Max 2 TB × 7 Plus 256 GB.
const perfil = D.PERFIS[0], imp = D.IMPOSTOS[0];
const hoje = D.MODELOS_2026[D.PADRAO_26], antes = D.MODELOS_2016[D.PADRAO_16];
assert.equal(perfil.nome, "Clínico");
assert.equal(imp.nome, "Líquido");
const um = v => v.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
assert.equal(um(M.plantoes(hoje.preco, perfil.p26, imp.aliq)), "17,6");
assert.equal(um(M.plantoes(antes.preco, perfil.p16, imp.aliq)), "6,1");
assert.equal(Math.round(M.equilibrio(hoje.preco, antes.preco, perfil.p16)), 3592);
console.log("ok — abertura: 17,6 e 6,1 plantões, R$ 3.592");
