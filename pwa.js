/* Install guidance, connectivity status and opt-in app updates. */
(()=>{
 const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 let installPrompt=null,registration=null,acceptedUpdate=false;
 const ui=()=>window.UangApp;
 const notify=text=>ui()?.toast(text);
 const help=async()=>{
  if(installPrompt){await installPrompt.prompt();const result=await installPrompt.userChoice;if(result.outcome==='accepted')installPrompt=null;return;}
  const dialog=document.querySelector('#modal');if(!dialog||dialog.open)return;
  const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  dialog.innerHTML=`<div class="dialoghead"><h2>copia. di layar utama</h2><button class="close" aria-label="Tutup" onclick="document.querySelector('#modal').close()">×</button></div><div class="pwa-help-icon"><img src="icons/icon-180.png" alt="" width="60" height="60"></div><p class="sub">Ruang keuanganmu, cukup satu ketukan.</p><ol class="pwa-steps">${ios?'<li>Buka website copia. ini melalui <b>Safari</b>.</li><li>Tekan <b>Bagikan</b> (kotak dengan panah ke atas).</li><li>Pilih <b>Tambahkan ke Layar Utama</b>.</li><li>Aktifkan <b>Buka sebagai App Web</b> jika tersedia, lalu tekan <b>Tambah</b>.</li>':'<li>Buka menu browser.</li><li>Pilih <b>Instal aplikasi</b> atau <b>Tambahkan ke layar utama</b>, jika tersedia.</li>'}</ol><p class="note">Buka ikon copia. dari layar utama, lalu login di sana. Sesi Safari dan aplikasi terpasang bisa terpisah. Setelah login, gunakan PIN seperti biasa. Data memerlukan internet.</p>`;dialog.showModal();
 };
 window.PwaUI={standalone,help,checkUpdate:()=>registration?.update()};
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e});
 const status=document.createElement('div');status.id='pwa-connectivity';status.setAttribute('role','status');status.hidden=true;document.body.append(status);
 const connectivity=()=>{status.hidden=navigator.onLine!==false;status.textContent='Offline · Sambungkan internet untuk menyimpan';document.documentElement.classList.toggle('pwa-is-offline',navigator.onLine===false)};
 window.addEventListener('offline',connectivity);window.addEventListener('online',()=>{connectivity();notify('Koneksi kembali. Coba ulang tindakan yang belum tersimpan.');registration?.update().catch(()=>{})});connectivity();
 if(document.querySelector('meta[name="copia-preview"]'))return;
 if(!('serviceWorker' in navigator)||!window.isSecureContext||location.protocol==='file:')return;
 const showUpdate=reg=>{if(!reg.waiting||!navigator.serviceWorker.controller||document.querySelector('#pwa-update'))return;const bar=document.createElement('aside');bar.id='pwa-update';bar.setAttribute('aria-label','Pembaruan aplikasi');const copy=document.createElement('span');copy.textContent='Versi baru copia. tersedia';const button=document.createElement('button');button.textContent='Perbarui';button.onclick=()=>{if(ui()?.busy()||ui()?.modalOpen())return notify('Selesaikan atau tutup formulir sebelum memperbarui.');if(navigator.onLine===false)return notify('Sambungkan internet sebelum memperbarui.');if(!reg.waiting)return location.reload();acceptedUpdate=true;button.disabled=true;reg.waiting.postMessage({type:'ACTIVATE_UPDATE'})};bar.append(copy,button);document.body.append(bar)};
 let reloadForUpdate=!!navigator.serviceWorker.controller;
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloadForUpdate){reloadForUpdate=false;if(acceptedUpdate)location.reload();else notify('Versi baru siap. Muat ulang setelah selesai mencatat.');}});
 window.addEventListener('load',()=>{navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).then(reg=>{registration=reg;showUpdate(reg);reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed')showUpdate(reg)})});document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&navigator.onLine)reg.update().catch(()=>{})})}).catch(()=>{/* Installation guidance remains usable if a browser restricts service workers. */})});
})();
