// Muro único dos estudos: o mesmo e-mail da newsletter libera o PDF do estudo e a
// impressão da simulação. O simulador em si é livre — é ele que convence.
//
// Uso: <script src="../muro.js" data-estudo="alocacao"></script>, depois dos scripts
// da página (precisa de ev() e do #btn-print já ligado). O bloco do formulário leva
// [data-muro]; o link de quem já assina leva [data-ja-assina].
//
// O redirect do beehiiv troca de página, então os números da simulação somem. Antes de
// mandar a pessoa ao formulário, o estado (todos os input/select por posição + botões
// marcados como ativos) vai para o sessionStorage e é restaurado na volta.
(function(){
  var me=document.currentScript, estudo=me&&me.getAttribute("data-estudo");
  var K="estudo_sim:"+location.pathname;
  var ATIVO=/(^|\s)(on|ativo|active|sel)(\s|$)/;
  function ss(){try{return sessionStorage;}catch(e){return null;}}
  function ls(){try{return localStorage;}catch(e){return null;}}
  var s=ss();
  if(s&&estudo) s.setItem("estudo_origem",estudo);

  function liberado(){var l=ls();return !!(l&&l.getItem("estudo_liberado"));}
  function campos(){return [].slice.call(document.querySelectorAll("input,select"))
    .filter(function(x){return x.type!=="hidden";});}
  function botoes(){return [].slice.call(document.querySelectorAll("button"));}

  function salvar(){
    if(!s) return;
    s.setItem(K,JSON.stringify({
      v:campos().map(function(x){return /checkbox|radio/.test(x.type)?x.checked:x.value;}),
      b:botoes().map(function(b,i){return ATIVO.test(b.className)?i:-1;}).filter(function(i){return i>=0;})
    }));
    s.setItem("estudo_volta",location.pathname);
  }
  function restaurar(){
    var raw=s&&s.getItem(K); if(!raw) return;
    s.removeItem(K);
    var st=JSON.parse(raw), bs=botoes(), cs=campos();
    // Botões primeiro (preset, convenção, rebalanceamento), valores depois: o preset
    // reescreve sliders, e o valor que a pessoa ajustou à mão tem que ganhar.
    st.b.forEach(function(i){ if(bs[i]&&!ATIVO.test(bs[i].className)) bs[i].click(); });
    st.v.forEach(function(v,i){
      var x=cs[i]; if(!x) return;
      // Campo igual ao da página não é tocado: um padrão fora do passo do slider
      // (736 num slider de 10 em 10) apareceria como 740 e viraria 740 no cálculo.
      if(typeof v==="boolean"){ if(x.checked===v) return; x.checked=v; }
      else { if(x.value===v) return; x.value=v; }
      x.dispatchEvent(new Event("input",{bubbles:true}));
      x.dispatchEvent(new Event("change",{bubbles:true}));
    });
  }

  var btn=document.getElementById("btn-print"), muro=document.querySelector("[data-muro]");
  if(btn&&!liberado()){
    btn.textContent=btn.textContent.replace(/^\s*Gerar/,"Receber");
    // Captura no document roda antes do onclick do botão: trava sem tocar no código da página.
    document.addEventListener("click",function(e){
      if(liberado()||!e.target.closest("#btn-print")) return;
      e.preventDefault(); e.stopImmediatePropagation();
      salvar();
      if(window.ev) ev("form_scroll");
      if(muro){
        muro.scrollIntoView({behavior:"smooth",block:"center"});
        muro.classList.add("muro-destaque");
      }
    },true);
  }
  // Impressão liberada conta como uso do simulador, separada do download do estudo.
  if(btn) btn.addEventListener("click",function(){ if(liberado()&&window.ev) ev("simulador_cta"); });

  document.querySelectorAll("[data-ja-assina]").forEach(function(a){
    a.addEventListener("click",function(){ salvar(); if(window.ev) ev("ja_assinante"); });
  });
  // Clique dentro do iframe do beehiiv não chega aqui: salva a cada mexida no
  // simulador, para quem vai direto ao formulário sem passar pelo botão.
  ["input","change","click"].forEach(function(t){
    document.addEventListener(t,function(e){ if(!e.target.closest("#btn-print")) salvar(); },{passive:true});
  });

  var css=document.createElement("style");
  css.textContent=".muro-destaque{outline:2px solid #C9A84C;outline-offset:6px;border-radius:4px;transition:outline-color .6s}";
  document.head.appendChild(css);

  if(document.readyState==="complete") restaurar(); else addEventListener("load",restaurar);
})();
