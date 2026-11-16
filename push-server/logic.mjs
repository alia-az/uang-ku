const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23',weekday:'short'});
const weekdays={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};
export function evaluateReminders(cfg,state,now){
 const fields=Object.fromEntries(fmt.formatToParts(now).map(x=>[x.type,x.value]));
 const date=`${fields.year}-${fields.month}-${fields.day}`,time=`${fields.hour}:${fields.minute}`,month=date.slice(0,7),out=[];
 if(cfg.timezone!=='Asia/Jakarta')return out;
 const transactions=Array.isArray(state?.transactions)?state.transactions:[];
 // 15-minute cron: do not send before the configured time; allow late delivery.
 if(cfg.daily&&time>=cfg.dailyTime&&!transactions.some(t=>t.date===date))out.push({id:`daily:${date}`,title:'Catat transaksi hari ini',body:'Jangan lupa cek dan catat pengeluaranmu.'});
 if(cfg.savings&&weekdays[fields.weekday]===cfg.savingsDay&&time>=cfg.savingsTime&&Array.isArray(state?.goals)&&state.goals.some(g=>Number(g.target)>((g.entries||[]).reduce((s,e)=>s+Number(e.amount||0),0))))out.push({id:`savings:${date}`,title:'Waktunya menabung',body:'Yuk cek target tabungan yang masih berjalan.'});
 if(cfg.budget){for(const [category,limit] of Object.entries(state?.budgets?.[month]||{})){if(!Number.isFinite(limit)||limit<=0)continue;const spent=transactions.filter(t=>t.type==='expense'&&t.date?.startsWith(month)&&t.category===category).reduce((s,t)=>s+Number(t.amount||0),0);for(const threshold of [80,90,100])if(spent>=limit*threshold/100)out.push({id:`budget:${month}:${category}:${threshold}`,title:`Budget ${category} mencapai ${threshold}%`,body:'Periksa anggaran di copia.'})}}
 return out;
}
