import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
function app(){const nodes=new Map();const document={querySelector:s=>{if(!nodes.has(s))nodes.set(s,{style:{},addEventListener(){},close(){},open:false});return nodes.get(s)},addEventListener(){}};const context=vm.createContext({document,window:{},setTimeout(){},console});vm.runInContext(fs.readFileSync(new URL('../app.js',import.meta.url),'utf8'),context);return context;}
test('successful cloud commit updates state only after acknowledgement',async()=>{const c=app();c.window.cloudStorage={save:async()=>{assert.equal(vm.runInContext('state.opening',c),0)}};assert.equal(await vm.runInContext('commit({...state,opening:9000})',c),true);assert.equal(vm.runInContext('state.opening',c),9000)});
test('failed cloud commit leaves previous state intact',async()=>{const c=app();c.window.cloudStorage={save:async()=>{throw Error('unavailable')}};assert.equal(await vm.runInContext('commit({...state,opening:9000})',c),false);assert.equal(vm.runInContext('state.opening',c),0)});
test('formatter removes commas before saving and preserves integer value',()=>{const c=app();assert.equal(vm.runInContext("moneyText('1250000')",c),'1,250,000');assert.equal(vm.runInContext("moneyValue('1,250,000')",c),1250000)});
