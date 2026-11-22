// O índice lê estudos.json: toda pasta de estudo tem entrada, toda entrada tem pasta,
// e toda página de estudo tem o link de volta. Rodar: node --test .test/indice.test.mjs
import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync, readdirSync, existsSync} from "node:fs";

const raiz=new URL("..",import.meta.url).pathname;
const estudos=JSON.parse(readFileSync(raiz+"estudos.json","utf8"));
const pastas=readdirSync(raiz,{withFileTypes:true})
  .filter(d=>d.isDirectory()&&!d.name.startsWith(".")&&existsSync(raiz+d.name+"/index.html")).map(d=>d.name);

test("manifesto e pastas batem",()=>{
  assert.deepEqual(estudos.map(e=>e.slug).sort(),pastas.sort());
});
test("toda entrada tem os campos e data AAAA-MM-DD",()=>{
  for(const e of estudos){
    assert.ok(e.titulo&&e.descricao,e.slug);
    assert.match(e.lancamento,/^\d{4}-\d{2}-\d{2}$/,e.slug);
  }
});
test("toda página de estudo tem o link de volta ao índice",()=>{
  for(const p of pastas) assert.match(readFileSync(raiz+p+"/index.html","utf8"),/class="voltar-indice"/,p);
});
