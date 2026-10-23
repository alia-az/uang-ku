import test from 'node:test';
import assert from 'node:assert/strict';
import {pinHash,validPin} from '../pin-lock.mjs';
test('PIN requires exactly six digits',()=>{assert.ok(validPin('012345'));for(const p of ['12345','1234567','abcdef','12 345'])assert.equal(validPin(p),false);});
test('PIN derivation is salted and verifies leading-zero PIN',async()=>{const salt=Array(16).fill(7);const hash=await pinHash('012345',salt);assert.equal(hash.length,64);assert.equal(await pinHash('012345',salt),hash);assert.notEqual(await pinHash('123456',salt),hash);assert.notEqual(await pinHash('012345',Array(16).fill(8)),hash);});
