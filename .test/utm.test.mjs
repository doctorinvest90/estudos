// Check do helper u(k) das paginas de estudo: UTM tem que sobreviver a navegacao
// interna e a redirect de formulario, senao o evento de conversao nasce sem fonte
// e todo lead parece trafego direto (era o caso de obrigado.html).
// Rodar: node .test/utm.test.mjs
import { readFileSync, readdirSync } from "node:fs";
import assert from "node:assert/strict";

const PAGES = ["alocacao/index.html", "consorcio/index.html", "consorcio/cota.html",
               "consorcio/simulador.html", "antecipacao/index.html", "maquininha/index.html",
               "maquininha/obrigado.html", "do-zero/index.html", "do-zero/obrigado.html",
               "dividendos/index.html", "dividendos/obrigado.html"];

function loadHelper(html, search, store) {
  const src = readFileSync(new URL(`../${html}`, import.meta.url), "utf8");
  const m = src.match(/function u\(k\)\{[\s\S]*?\n\}/);
  assert.ok(m, `${html}: helper u(k) nao encontrado`);
  const qs = new URLSearchParams(search);
  const sessionStorage = store;
  return new Function("qs", "sessionStorage", `${m[0]}; return u;`)(qs, sessionStorage);
}

const mem = () => {
  const d = new Map();
  return { getItem: k => (d.has(k) ? d.get(k) : null), setItem: (k, v) => d.set(k, v) };
};

for (const page of PAGES) {
  // 1. veio na query: devolve e persiste
  const store = mem();
  let u = loadHelper(page, "?utm_source=dm&utm_content=ig123", store);
  assert.equal(u("utm_source"), "dm", `${page}: query`);
  assert.equal(u("utm_content"), "ig123", `${page}: utm_content na query`);
  assert.equal(store.getItem("u_utm_source"), "dm", `${page}: persistiu`);

  // 2. pagina seguinte sem query (redirect do formulario): le do storage
  u = loadHelper(page, "", store);
  assert.equal(u("utm_source"), "dm", `${page}: fallback do storage`);
  assert.equal(u("utm_content"), "ig123", `${page}: fallback utm_content`);

  // 3. sem query e sem storage: string vazia, nunca null/undefined
  assert.equal(loadHelper(page, "", mem())("utm_source"), "", `${page}: vazio`);

  // 4. storage bloqueado (aba anonima) nao pode derrubar o beacon
  const boom = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  assert.equal(loadHelper(page, "?utm_source=dm", boom)("utm_source"), "dm", `${page}: storage bloqueado`);
  assert.equal(loadHelper(page, "", boom)("utm_source"), "", `${page}: storage bloqueado sem query`);
}

// Toda pagina tem que mandar utm_content no payload — o furo que fazia
// toda visita de DM cair no mesmo balde.
for (const page of PAGES) {
  const src = readFileSync(new URL(`../${page}`, import.meta.url), "utf8");
  assert.match(src, /utm_content:u\("utm_content"\)/, `${page}: payload sem utm_content`);
}

console.log(`ok — ${PAGES.length} paginas, helper e payload conferidos`);
