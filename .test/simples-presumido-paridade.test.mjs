// Paridade com motor.py e regressão dos valores que o navegador ajusta ao step.
// Rodar: node .test/simples-presumido-paridade.test.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const html = readFileSync(new URL("../simples-presumido/index.html", import.meta.url), "utf8");
new Function(html.match(/<script id="motor">([\s\S]*?)<\/script>/)[1])();
const D = JSON.parse(html.match(/<script id="dados" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const M = globalThis.MOTOR(D);
const casos = JSON.parse(readFileSync(new URL("simples-presumido-casos.json", import.meta.url), "utf8"));
const TOL = 1e-9;
let conferidos = 0;
function confere(nome, js, py) {
  conferidos++;
  if (py === null || js === null || typeof py === "string") {
    assert.equal(js, py, nome);
  } else {
    assert.ok(Math.abs(js - py) <= TOL * Math.max(1, Math.abs(py)), `${nome}: py=${py} js=${js}`);
  }
}
for (const { caso, simples, presumido, vantagem, cbs_empate } of casos) {
  const nome = JSON.stringify(caso);
  for (const [regime, py] of [["Simples", simples], ["Presumido", presumido]]) {
    const js = M.melhor(caso, regime);
    for (const k of ["anexo", "pl_mes", "imposto", "liquido", "irpfm", "retido"]) {
      confere(`${nome}.${regime}.${k}`, js[k], py[k]);
    }
  }
  confere(`${nome}.vantagem`, M.vantagem(caso), vantagem);
  if (cbs_empate !== undefined) confere(`${nome}.cbs_empate`, M.cbsEmpate(caso), cbs_empate);
}
console.log(`ok — paridade: ${casos.length} casos, ${conferidos} conferências (tolerância 1e-9)`);

const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1], m[2]]));
const inputs = [...html.matchAll(/<input\b[^>]*>/g)].map(m => attrs(m[0]));
function naGrade(id, value, input) {
  const min = Number(input.min ?? 0), step = Number(input.step);
  assert.ok(Number.isFinite(value) && step > 0, `${id}: valor ou step inválido`);
  const passos = (value - min) / step;
  assert.ok(Math.abs(passos - Math.round(passos)) < 1e-6,
    `${id}=${value} fora do step ${step} (min ${min})`);
  if (input.min !== undefined) assert.ok(value >= min, `${id}: abaixo do mínimo`);
  if (input.max !== undefined) assert.ok(value <= Number(input.max), `${id}: acima do máximo`);
}
let defaults = 0, presets = 0;
for (const input of inputs) {
  if (!["range", "number"].includes(input.type) || !Number.isFinite(Number(input.step))) continue;
  if (input.value !== undefined) { naGrade(input.id, Number(input.value), input); defaults++; }
}
const buttons = [...html.matchAll(/<button\b[^>]*>/g)].map(m => attrs(m[0]));
const socios = buttons.filter(b => b["data-v"] && /^[1-4]$/.test(b["data-v"])).map(b => Number(b["data-v"]));
for (const button of buttons.filter(b => /\bpbtn\b/.test(b.class ?? ""))) {
  for (const [key, id] of [["data-f", "folha"], ["data-o", "outros"]]) {
    const input = inputs.find(i => i.id === id);
    assert.ok(input, `${id}: campo do preset não encontrado`);
    naGrade(id, Number(button[key]), input);
    presets++;
  }
  const s = Number(button["data-s"]);
  assert.ok(socios.includes(s), `sócios=${s}: preset sem botão correspondente`);
  naGrade("socios", s, { min: "1", max: "4", step: "1" });
  presets++;
}
assert.equal(defaults, 8);
assert.equal(presets, 12);
console.log(`ok — ${defaults} defaults e ${presets} valores de preset dentro do step`);

// Calculado na fonte com python3 -c:
// import motor as m; c=m.Caso(1.2e6); print(m.melhor(c,"Presumido")["imposto"], m.melhor(c,"Simples")["imposto"])
// Python: 207983.80423953 e 245966.34135. A UI converte CBS 11,3% em 0.113 - 0.001.
const headline = { P: 1200000, socios: 1, folha: 0, outros: .15, janela: "2027",
  equiparacao: false, credito: .5, iss: .02, cbs: .112, ibs: .001 };
assert.equal(Math.round(M.melhor(headline, "Presumido").imposto), 207984);
assert.equal(Math.round(M.melhor(headline, "Simples").imposto), 245966);
console.log("ok — referência: Presumido R$ 207984; Simples R$ 245966");
