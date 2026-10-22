export const MAX_STATE_BYTES = 800 * 1024;
export function validateState(s) {
  if (!s || !Array.isArray(s.transactions) || !Array.isArray(s.categories) || !s.categories.length || !Number.isSafeInteger(s.opening) || Math.abs(s.opening)>999999999999 || !validDate(s.start)) throw new Error('DATA_INVALID');
  if (s.categories.length>200 || s.categories.some(c=>typeof c!=='string'||!c.trim()||c.length>100) || s.transactions.length>5000) throw new Error('DATA_INVALID');
  const ids=new Set();
  for(const t of s.transactions){
    if(!t || typeof t.id!=='string'||!t.id||!/^[A-Za-z0-9_-]+$/.test(t.id)||ids.has(t.id)||!['income','expense'].includes(t.type)||!Number.isSafeInteger(t.amount)||t.amount<=0||t.amount>999999999999||!validDate(t.date)||t.date<s.start||typeof t.name!=='string'||!t.name.trim()||t.name.length>100||typeof t.category!=='string'||!t.category.trim()||t.category.length>100||typeof t.note!=='string'||t.note.length>300)throw new Error('DATA_INVALID');
    ids.add(t.id);
  }
  if(s.budgets && (typeof s.budgets!=='object'||Array.isArray(s.budgets)))throw new Error('DATA_INVALID');
  for(const [m,b] of Object.entries(s.budgets||{})){
    if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(m)||!b||typeof b!=='object'||Array.isArray(b)||Object.values(b).some(n=>!Number.isSafeInteger(n)||n<0||n>999999999999))throw new Error('DATA_INVALID');
  }
  if(new TextEncoder().encode(JSON.stringify(s)).length>MAX_STATE_BYTES)throw new Error('DATA_TOO_LARGE');
  return s;
}
function validDate(s){return typeof s==='string'&&/^\d{4}-(0[1-9]|1[0-2])-\d{2}$/.test(s)&&!isNaN(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;}
export function checkRevision(remote,expected){if(remote!==expected)throw new Error('CONFLICT');}
