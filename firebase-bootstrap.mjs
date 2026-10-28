import { installSharedSavings } from './shared-savings.mjs';
import { createPinLock } from './pin-lock.mjs';
import { firebaseConfig } from './firebase-config.js';
import { validateState, checkRevision } from './state-validation.mjs';
const ui=window.UangApp;
const pinLock=createPinLock({ui,user:()=>currentUser,recover:reauthenticate,onLock:()=>{window.SharedUI?.stop();session++;unsubscribe?.();unsubscribe=null;pending=null;ref=null;ui.clear();},onUnlock:()=>loadUser(currentUser)});
window.PinUI=pinLock;
async function reauthenticate(){if(!currentUser)throw Error('AUTH_CHANGED');if(currentUser.providerData.some(p=>p.providerId==='google.com'))return api.reauthenticateWithPopup(currentUser,new api.GoogleAuthProvider());const password=window.prompt('Verifikasi akun: masukkan kata sandi Firebase Anda.');if(!password)throw Error('AUTH_CHANGED');return api.reauthenticateWithCredential(currentUser,api.EmailAuthProvider.credential(currentUser.email,password));}
let auth,fs,api,currentUser=null,ref=null,revision=0,unsubscribe=null,session=0,pending=null,writing=false,registration=null;
const configured=['apiKey','authDomain','projectId','appId'].every(k=>firebaseConfig[k]&&!firebaseConfig[k].includes('ISI_'));
const friendly=e=>({
  'NAME_REQUIRED':'Isi nama tampilan terlebih dahulu.',
  'auth/popup-blocked':'Popup diblokir. Izinkan popup lalu coba lagi.',
  'auth/popup-closed-by-user':'Login dibatalkan. Silakan coba lagi.',
  'auth/unauthorized-domain':'Tambahkan domain website pada Authorized domains Firebase.',
  'auth/account-exists-with-different-credential':'Masuk dengan metode akun sebelumnya, lalu hubungkan Google melalui menu Akun.',
  'auth/invalid-credential':'Email atau kata sandi tidak sesuai.',
  'auth/invalid-email':'Format email tidak valid.',
  'auth/email-already-in-use':'Email sudah terdaftar. Silakan masuk.',
  'auth/weak-password':'Gunakan kata sandi minimal 8 karakter.',
  'auth/too-many-requests':'Terlalu banyak percobaan. Coba lagi nanti.',
  'auth/network-request-failed':'Tidak dapat terhubung. Periksa internet.',
  'auth/operation-not-allowed':'Aktifkan provider login yang digunakan di Firebase Authentication.',
  'permission-denied':'Akses ditolak. Periksa Firestore Rules untuk akun ini.',
  'unavailable':'Firestore tidak dapat dihubungi. Periksa internet.',
  'CONFLICT':'Ada perubahan dari perangkat lain. Data terbaru sudah dimuat; periksa lalu simpan ulang.',
  'DATA_TOO_LARGE':'Data mendekati kapasitas versi ini (800 KiB). Ekspor cadangan; gunakan skema koleksi terpisah untuk data lebih besar.',
  'DATA_INVALID':'Data tidak valid. Periksa tanggal, nominal, kategori, dan ID transaksi.',
  'AUTH_CHANGED':'Sesi berubah. Masuk kembali.',
}[e.code||e.message]||'Operasi gagal. Periksa konfigurasi Firebase, koneksi, dan izin akun.');
window.FirebaseUI={error:friendly,google:async()=>{const provider=new api.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});return api.signInWithPopup(auth,provider);},linkGoogle:async()=>{try{await api.linkWithPopup(currentUser,new api.GoogleAuthProvider());ui.toast('Google berhasil dihubungkan ke akun ini.');}catch(e){ui.toast(friendly(e));}},name:()=>currentUser?.displayName?.trim()||currentUser?.email?.split('@')[0]||'Teman',saveName:async e=>{e.preventDefault();if(!currentUser||pinLock.isLocked())return;const name=e.target.elements.displayName.value.trim();if(!name||name.length>60)return ui.toast('Isi nama maksimal 60 karakter.');const button=e.target.querySelector('button');button.disabled=true;try{await api.updateProfile(currentUser,{displayName:name});if(!pinLock.isLocked()){ui.render();ui.toast('Nama berhasil diperbarui.')}}catch(err){ui.toast(friendly(err));button.disabled=false;}},account:()=>currentUser?.email||'',logout:async()=>{if(writing||ui.busy())return ui.toast('Tunggu penyimpanan selesai.');pinLock.reset();await api.signOut(auth);},refresh:()=>loadUser(currentUser),status:()=>navigator.onLine?'Terhubung ke Firebase':'Offline · perlu internet untuk menyimpan'};
function authScreen(mode='login',message=''){
  ui.clear();document.querySelector('#nav').hidden=true;
  document.querySelector('#app').innerHTML=`<div class="auth-shell"><div class="brand">${window.copiaLogo()}</div><div class="auth-hero"><span class="auth-kicker">A LITTLE CLARITY, EVERY DAY</span><div class="auth-art" aria-hidden="true"><span>↗</span><i>✦</i><b>+</b></div><h1>${mode==='register'?'Langkah kecil.<br>Rencana besar.':'Uang tertata.<br>Hidup lebih lega.'}</h1><p>Catat pengeluaran, bangun kebiasaan baik, dan wujudkan targetmu bersama.</p></div><div class="auth-welcome"><h2>${mode==='register'?'Buat akun baru':'Selamat datang kembali'}</h2><p class="sub">${mode==='register'?'Mulai perjalanan keuanganmu hari ini.':'Masuk dan lanjutkan rencanamu.'}</p></div><button class="google-signin secondary full" id="google-login"><span aria-hidden="true">G</span> Lanjutkan dengan Google</button><p class="auth-divider">atau gunakan email</p><form id="auth-form" class="card">${mode==='register'?'<label>Nama tampilan<input name="displayName" autocomplete="name" maxlength="60" required placeholder="Nama panggilanmu"></label>':''}<label>Email<input type="email" name="email" autocomplete="email" required maxlength="254"></label><label>Kata sandi<input type="password" name="password" autocomplete="${mode==='register'?'new-password':'current-password'}" minlength="${mode==='register'?8:1}" required></label><p id="auth-error" class="error" role="alert">${ui.esc(message)}</p><button class="primary full">${mode==='register'?'Daftar akun':'Masuk'}</button><button type="button" class="link full" id="switch-auth" style="padding:18px 0 6px">${mode==='register'?'Sudah punya akun? Masuk':'Belum punya akun? Daftar'}</button>${mode==='login'?'<button type="button" class="link full" id="reset-password" style="padding:14px 0 0">Lupa kata sandi?</button>':''}</form><p class="note">Ruang keuangan pribadi, terhubung di semua perangkatmu.</p></div>`;
  document.querySelector('#google-login').onclick=async e=>{const b=e.currentTarget;b.disabled=true;try{await window.FirebaseUI.google();}catch(err){document.querySelector('#auth-error').textContent=friendly(err);b.disabled=false;}};
  document.querySelector('#switch-auth').onclick=()=>authScreen(mode==='register'?'login':'register');
  document.querySelector('#reset-password')?.addEventListener('click',async()=>{const email=document.querySelector('#auth-form').elements.email.value.trim();if(!email)return document.querySelector('#auth-error').textContent='Isi email terlebih dahulu.';try{await api.sendPasswordResetEmail(auth,email);document.querySelector('#auth-error').textContent='Jika email terdaftar, petunjuk pemulihan akan dikirim.';}catch(e){document.querySelector('#auth-error').textContent=friendly(e);}});
  document.querySelector('#auth-form').onsubmit=async e=>{e.preventDefault();const f=e.target,b=f.querySelector('[type="submit"]')||f.querySelector('.primary');b.disabled=true;try{if(mode==='register'){if(!f.elements.displayName.value.trim())throw Error('NAME_REQUIRED');registration=(async()=>{const result=await api.createUserWithEmailAndPassword(auth,f.elements.email.value.trim(),f.elements.password.value);await api.updateProfile(result.user,{displayName:f.elements.displayName.value.trim()});})();try{await registration}finally{registration=null}}else await api.signInWithEmailAndPassword(auth,f.elements.email.value.trim(),f.elements.password.value);}catch(err){document.querySelector('#auth-error').textContent=friendly(err);b.disabled=false;}};
}
function showError(message){ui.clear();document.querySelector('#nav').hidden=true;document.querySelector('#app').innerHTML=`<div class="auth-shell"><div class="brand">${window.copiaLogo()}</div><h1>Belum terhubung.</h1><div class="card"><p>${ui.esc(message)}</p><p class="note">Lihat README-FIREBASE.md untuk setup.</p><button class="primary full" onclick="location.reload()">Coba kembali</button>${currentUser?'<button class="secondary full" style="margin-top:12px" onclick="FirebaseUI.logout()">Keluar</button>':''}</div></div>`;}
async function loadUser(user){
  window.SharedUI?.stop();
  const token=++session;unsubscribe?.();unsubscribe=null;pending=null;currentUser=user;ui.clear();
  if(!user){pinLock.reset();return authScreen();}
  if(!await pinLock.gate(user.uid)||token!==session)return;
  document.querySelector('#nav').hidden=true;document.querySelector('#app').innerHTML='<div class="empty">Memuat data Firebase…</div>';
  ref=api.doc(fs,'users',user.uid,'finance','state');
  try{
    const snap=await api.getDocFromServer(ref);if(token!==session)return;
    const data=snap.exists()?snap.data():null;revision=data?.revision||0;
    if(data)validateState(data.state);
    ui.load(data?.state||ui.empty());document.querySelector('#nav').hidden=false;ui.render();window.SharedUI.start();
    unsubscribe=api.onSnapshot(ref,{includeMetadataChanges:true},s=>{
      if(token!==session||s.metadata.hasPendingWrites||s.metadata.fromCache||!s.exists())return;
      const d=s.data();if(d.revision===revision)return;
      if(writing){pending=d;return;}
      if(ui.modalOpen()){pending=d;ui.toast('Data berubah di perangkat lain. Tutup formulir untuk memuat pembaruan.');return;}
      try{validateState(d.state);revision=d.revision;ui.load(d.state);ui.render();}catch(e){showError(friendly(e));}
    },e=>{if(token===session)showError(friendly(e));});
  }catch(e){if(token===session)showError(friendly(e));}
}
window.cloudStorage={save:async next=>{
  if(pinLock.isLocked()||!currentUser||!ref)throw new Error('AUTH_CHANGED');validateState(next);
  const token=session,target=ref,expected=revision;
  writing=true;pending=null;
  try{
    await api.runTransaction(fs,async tr=>{const snap=await tr.get(target);checkRevision(snap.exists()?snap.data().revision:0,expected);tr.set(target,{schemaVersion:1,state:JSON.parse(JSON.stringify(next)),revision:expected+1,updatedAt:api.serverTimestamp()});});
    if(token!==session)throw new Error('AUTH_CHANGED');revision=expected+1;
  }catch(e){
    if(e.message==='CONFLICT'&&token===session){const fresh=await api.getDocFromServer(target);if(fresh.exists()){const d=fresh.data();validateState(d.state);revision=d.revision;ui.load(d.state);}}
    throw e;
  }finally{writing=false;}
}};
// Apply remote changes only when the user has closed the form.
setInterval(()=>{if(pending&&!writing&&!ui.busy()&&!ui.modalOpen()&&currentUser){const d=pending;pending=null;if(d.revision>revision){try{validateState(d.state);revision=d.revision;ui.load(d.state);ui.render();}catch(e){showError(friendly(e));}}}},500);
if(!configured){showError('Isi firebase-config.js terlebih dahulu, aktifkan Authentication Email/Password, buat Firestore, dan pasang rules. Tidak ada data lokal yang diunggah otomatis.');}
else{
  try{
    const [appMod,authMod,fireMod]=await Promise.all([
      import('https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js')
    ]);
    api={...authMod,...fireMod};const firebaseApp=appMod.initializeApp(firebaseConfig);auth=api.getAuth(firebaseApp);fs=api.getFirestore(firebaseApp);
    // Keep Firebase sign-in across browser restarts; the PIN gate runs before finance data is loaded.
    await api.setPersistence(auth,api.browserLocalPersistence);
    installSharedSavings({api,fs,user:()=>currentUser,allowed:()=>!pinLock.isLocked(),ui});
    api.onAuthStateChanged(auth,async user=>{if(registration)try{await registration}catch{}loadUser(user)});
  }catch(e){showError(friendly(e));}
}
