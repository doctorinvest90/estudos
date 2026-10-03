// O redirect de sucesso do beehiiv parou de navegar a página (desde ~set/2026): o iframe
// não troca mais a janela de cima, nem no navegador do Instagram, por onde chega o anúncio.
// Medido em 03/10: inscrição entra, e-mail sai, mas obrigado.html nunca abre — sem ele não
// há CompleteRegistration nem beacon "lead". O iframe ainda avisa a página com
// postMessage {type:"beehiiv:submitted"}; aqui a própria página faz o redirect.
//
// Uso: <script src="../beehiiv-sucesso.js" data-destino="obrigado.html"></script>
// (data-destino é opcional; o padrão é obrigado.html da pasta da página).
//
// ponytail: o aviso também chega para quem já assina, que passa a ir ao obrigado e conta
// como "lead". Separar exigiria checar a inscrição no servidor; o link "já assino" segue.
(function(){
  var me=document.currentScript;
  var destino=(me&&me.getAttribute("data-destino"))||"obrigado.html";
  var foi=false;
  window.addEventListener("message",function(e){
    if(foi||e.origin!=="https://subscribe-forms.beehiiv.com") return;
    if(!e.data||e.data.type!=="beehiiv:submitted") return;
    foi=true;
    location.href=destino;
  });
})();
