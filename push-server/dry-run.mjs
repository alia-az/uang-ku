import admin from 'firebase-admin';
import {evaluateReminders} from './logic.mjs';
const projectId=process.env.FIREBASE_PROJECT_ID;
if(!projectId)throw Error('FIREBASE_PROJECT_ID is required');
admin.initializeApp({projectId,credential:admin.credential.applicationDefault()});
const db=admin.firestore();
// A collection-group query finds reminder configs even if /users/{uid} parent documents do not exist.
const configs=await db.collectionGroup('reminderSettings').get();
let enabled=0,subscribed=0,due=0;
for(const cfg of configs.docs){
 if(cfg.id!=='config')continue;
 const user=cfg.ref.parent.parent;
 if(!user||user.parent.id!=='users')continue;
 const [finance,subscriptions]=await Promise.all([
   user.collection('finance').doc('state').get(),
   user.collection('pushSubscriptions').get()
 ]);
 if(!finance.exists||subscriptions.empty)continue;
 enabled++;subscribed+=subscriptions.size;
 due+=evaluateReminders(cfg.data(),finance.data().state,new Date()).length;
}
console.log(JSON.stringify({projectId,configuredAccounts:enabled,subscriptions:subscribed,dueReminders:due,mode:'READ_ONLY_NO_PUSH'}));
