import admin from 'firebase-admin';
import webpush from 'web-push';
import {evaluateReminders} from './logic.mjs';
const required=['FIREBASE_SERVICE_ACCOUNT_JSON','VAPID_PUBLIC_KEY','VAPID_PRIVATE_KEY','VAPID_SUBJECT'];
for(const name of required)if(!process.env[name])throw Error(`Missing secret: ${name}`);
admin.initializeApp({credential:admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))});
const db=admin.firestore();webpush.setVapidDetails(process.env.VAPID_SUBJECT,process.env.VAPID_PUBLIC_KEY,process.env.VAPID_PRIVATE_KEY);
const now=new Date();const users=await db.collection('users').get();let sent=0;
for(const user of users.docs){
 try{
  const [cfgDoc,financeDoc,subscriptions]=await Promise.all([user.ref.collection('reminderSettings').doc('config').get(),user.ref.collection('finance').doc('state').get(),user.ref.collection('pushSubscriptions').get()]);
  if(!cfgDoc.exists||!financeDoc.exists||subscriptions.empty)continue;
  const messages=evaluateReminders(cfgDoc.data(),financeDoc.data().state,now);
  for(const msg of messages){
   // Firestore create is atomic: prevents duplicate sends on overlapping scheduled jobs.
   const receipt=user.ref.collection('pushSent').doc(msg.id.replace(/[^a-zA-Z0-9:_-]/g,'_').slice(0,240));
   try{await receipt.create({at:admin.firestore.FieldValue.serverTimestamp()})}catch(e){if(e.code===6||e.code==='already-exists')continue;throw e}
   for(const device of subscriptions.docs){const d=device.data();try{await webpush.sendNotification({endpoint:d.endpoint,keys:d.keys},JSON.stringify({title:msg.title,body:msg.body,tag:msg.id}),{TTL:3600});sent++}catch(e){if(e.statusCode===404||e.statusCode===410)await device.ref.delete();else console.error('Push delivery failed:',e.statusCode||e.message)}}
  }
 }catch(e){console.error('User reminder processing failed:',e.message)}
}
console.log(`Push requests accepted: ${sent}`);
