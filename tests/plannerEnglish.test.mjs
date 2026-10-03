import test from 'node:test';
import assert from 'node:assert/strict';
import {examplePlan,evaluatePlan,validatePlan} from '../src/core/planner.mjs';
import {englishMessage} from '../src/core/plannerEnglish.mjs';
test('English constraint reasons retain quantitative evidence and inbound timing',()=>{
 const p=examplePlan();p.budget='500';p.exclusive=true;p.events[1].start=p.events[0].start;p.custom=['181','161'];
 const result=evaluatePlan(p);
 const translated=result.plans.flatMap(s=>s.reasons.map(englishMessage));
 assert.ok(translated.some(s=>s.includes('140 units')));
 assert.ok(translated.some(s=>s.includes('CNY 900.00')));
 assert.ok(translated.some(s=>s.includes('181 exceeds assumed demand cap 180')));
 assert.ok(translated.some(s=>s.includes('mutual exclusion')));
 assert.ok(translated.some(s=>s.includes('Later inbound cannot repair an earlier shortage')));
 assert.ok(translated.every(s=>!/[\u3400-\u9fff]/.test(s)));
 p.stock='0';assert.match(englishMessage(evaluatePlan(p).plans[0].reasons[0]),/100 units/);
});
test('English missing/invalid input errors distinguish signed money from stock and dates',()=>{
 const p=examplePlan();p.stock='';p.events[1].unit='';p.events[0].end='bad';
 const translated=validatePlan(p).map(englishMessage);
 assert.match(translated[0],/Physical stock: required.*Integer/);
 assert.ok(translated.some(s=>s.includes('B unit contribution')&&s.includes('negative allowed')));
 assert.ok(translated.some(s=>s.includes('A: invalid dates')));
 assert.ok(translated.every(s=>!/[\u3400-\u9fff]/.test(s)));
});
test('English ledger translation preserves dates and quantities',()=>{
 const p=examplePlan();p.inbound={quantity:'140',date:'2026-11-01',confirmed:true};
 const ledger=evaluatePlan(p).plans.find(s=>s.id==='all').ledger;
 const text=ledger.map(r=>`${englishMessage(r.date)} ${englishMessage(r.label)}`).join('\n');
 assert.match(text,/Confirmed inbound \(start of day\)/);
 assert.match(text,/A starts: reserve 180 units; sales through 2026-11-03/);
 assert.ok(!/[\u3400-\u9fff]/.test(text));
});
