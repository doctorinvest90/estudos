// Paridade do simulador do bolão com motor.py.
// Rodar: node .test/bolao-paridade.test.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const html = readFileSync(new URL("../bolao/index.html", import.meta.url), "utf8");
new Function(html.match(/<script id="motor">([\s\S]*?)<\/script>/)[1])();
const D = JSON.parse(html.match(/<script id="dados" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const M = globalThis.MOTOR(D);
const casos = JSON.parse(readFileSync(new URL("bolao-casos.json", import.meta.url), "utf8"));
const TOL = 1e-9;
let n = 0;
const confere = (nome, js, py) => {
  n++;
  if (typeof py === "boolean") return assert.equal(js, py, nome);
  assert.ok(Math.abs(js - py) <= TOL * Math.max(1, Math.abs(py)), `${nome}: py=${py} js=${js}`);
};
for (const c of casos) {
  const nome = JSON.stringify([c.pote, c.arrec, c.numero, c.gasto, c.tarifa]);
  const lam = M.lambda(c.arrec, D.PRECO);
  confere(nome + ".lam", lam, c.lam);
  confere(nome + ".vb", M.valorBilhete(c.pote, lam, D.PRECO, c.menor), c.vb);
  const b = M.bolao(c.numero, c.gasto, M.premio(c.pote, lam), c.tarifa, D.PRECO);
  for (const k of ["k", "apostas", "chance", "um_em", "cota", "alcanca"]) confere(`${nome}.${k}`, b[k], c[k]);
}
// A página não usa armazenamento próprio além do muro compartilhado, e o aviso de aceite fica colado ao form.
assert.ok(!/localStorage/.test(html.replace(/<script src="[^"]*muro\.js[^>]*>/, "")), "simulador sem localStorage");
assert.ok(html.includes("você autoriza receber neste e-mail"), "aviso de aceite do form");
assert.ok(html.includes("8ca27eaf-531e-4515-b543-c87be91ee692"), "muro único");
assert.ok(html.includes("menores de 18 anos"), "aviso de idade");
console.log(`bolão OK: ${casos.length} casos, ${n} números`);
