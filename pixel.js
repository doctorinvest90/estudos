// Pixel da Meta dos estudos (dataset 1893562330686295): PageView em toda página que
// inclui este script. O obrigado de cada estudo dispara CompleteRegistration junto com
// o beacon "lead". É o evento que as campanhas de cadastro otimizam, e por isso não é
// "Lead", que pertence ao quiz do Essencial.
// Só no domínio real: preview local não polui o dataset.
// Uso: <script src="/pixel.js"></script> no <head>, antes de qualquer fbq(...).
(function(){
  if(!/drheliobarros\.com\.br$/.test(location.hostname)){ window.fbq=function(){}; return; }
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init','1893562330686295');
  fbq('track','PageView');
})();
