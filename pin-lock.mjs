const iterations=210000;
const key=uid=>'uang-pin-v1:'+uid;
export async function pinHash(pin,salt){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveBits']);return Array.from(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new Uint8Array(salt),iterations,hash:'SHA-256'},k,256)),b=>b.toString(16).padStart(2,'0')).join('');}
export function validPin(pin){return /^\d{6}$/.test(pin);}
export function createPinLock({ui,user,recover,onLock,onUnlock}){
 let uid='',locked=true,timer,serial=0;
 const record=()=>JSON.parse(localStorage.getItem(key(uid))||'null');
 const save=r=>localStorage.setItem(key(uid),JSON.stringify(r));
 const check=async pin=>{const r=record();return r&&await pinHash(pin,r.salt)===r.hash;};
 const arm=()=>{clearTimeout(timer);if(uid&&!locked&&record())timer=setTimeout(()=>lock(),300000);};
 function screen(){document.querySelector('#nav').hidden=true;document.querySelector('#app').innerHTML=`<div class="auth-shell pin-shell"><div class="brand">${window.copiaLogo()}</div><div class="pin-symbol">${ui.esc('🔒')}</div><h1>Halo, ${ui.esc(user()?.displayName?.trim()||user()?.email?.split('@')[0]||'Teman')} 👋</h1><p class="sub">Masukkan PIN untuk membuka keuanganmu.</p><form id="unlock-form"><label>PIN 6 digit<input name="pin" type="password" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="off" required autofocus></label><p id="pin-error" class="error" role="alert"></p><button class="primary full">Buka aplikasi</button></form><button class="link full" id="forgot-pin">Lupa PIN? Verifikasi akun</button><button class="link full" id="pin-logout">Keluar akun</button></div>`;
 document.querySelector('#pin-logout').onclick=()=>window.FirebaseUI.logout();
 document.querySelector('#forgot-pin').onclick=async()=>{try{await recover();localStorage.removeItem(key(uid));locked=false;onUnlock();}catch(e){document.querySelector('#pin-error').textContent=window.FirebaseUI.error(e);}};
 document.querySelector('#unlock-form').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('button'),r=record(),epoch=serial;b.disabled=true;try{if(Date.now()<(r.blockedUntil||0))throw Error('Tunggu '+Math.ceil((r.blockedUntil-Date.now())/1000)+' detik sebelum mencoba lagi.');if(await check(e.target.elements.pin.value)){if(epoch!==serial)return;save({...r,failures:0,blockedUntil:0});locked=false;arm();onUnlock();}else{const failures=(r.failures||0)+1;save({...r,failures,blockedUntil:failures>=5?Date.now()+60000:0});throw Error(failures>=5?'PIN salah 5 kali. Tunggu 60 detik.':'PIN tidak sesuai.');}}catch(err){document.querySelector('#pin-error').textContent=err.message;b.disabled=false;}};
 }
 function lock(){if(locked||!uid||!record())return;if(ui.busy()){timer=setTimeout(lock,1000);return;}locked=true;serial++;onLock();screen();}
 async function gate(nextUid){if(uid!==nextUid){uid=nextUid;locked=true;serial++;}if(record()&&locked){screen();return false;}locked=false;arm();return true;}
 function reset(){clearTimeout(timer);uid='';locked=true;serial++;}
 function settings(){if(locked||!uid)return;const enabled=!!record(),modal=document.querySelector('#modal');modal.innerHTML=`<div class="dialoghead"><h2>${enabled?'Kelola PIN':'Aktifkan PIN'}</h2><button class="close" onclick="modal.close()">×</button></div><p class="note">PIN hanya berlaku di browser ini. Gunakan 6 digit. Aplikasi terkunci setelah 5 menit tidak aktif atau saat dibuka ulang.</p><form id="pin-settings">${enabled?'<label>PIN saat ini<input name="old" type="password" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required></label>':''}<label>PIN baru<input name="pin" type="password" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required></label><label>Ulangi PIN baru<input name="confirm" type="password" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required></label><p class="error" id="pin-settings-error" role="alert"></p><button class="primary full">Simpan PIN</button>${enabled?'<button type="button" class="secondary full" id="disable-pin" style="margin-top:10px">Nonaktifkan PIN</button>':''}</form>`;
 const error=m=>document.querySelector('#pin-settings-error').textContent=m;
 const oldValid=async()=>!enabled||await check(document.querySelector('#pin-settings').elements.old.value);
 document.querySelector('#pin-settings').onsubmit=async e=>{e.preventDefault();const f=e.target.elements;try{if(!await oldValid())return error('PIN saat ini tidak sesuai.');if(!validPin(f.pin.value)||f.pin.value!==f.confirm.value)return error('PIN harus 6 digit dan kedua isian harus sama.');const salt=Array.from(crypto.getRandomValues(new Uint8Array(16)));save({salt,hash:await pinHash(f.pin.value,salt),failures:0,blockedUntil:0});modal.close();arm();ui.render();ui.toast('PIN berhasil disimpan.');}catch{error('PIN tidak dapat disimpan. Pastikan penyimpanan browser diizinkan.');}};
 document.querySelector('#disable-pin')?.addEventListener('click',async()=>{if(!await oldValid())return error('Isi PIN saat ini dengan benar.');localStorage.removeItem(key(uid));clearTimeout(timer);modal.close();ui.render();ui.toast('PIN dinonaktifkan.');});modal.showModal();
 }
 ['pointerdown','keydown','touchstart'].forEach(event=>document.addEventListener(event,arm,{passive:true}));
 return {gate,reset,lock,settings,enabled:()=>!!uid&&!!record(),isLocked:()=>locked};
}
