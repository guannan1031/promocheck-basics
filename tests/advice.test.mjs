import test from 'node:test';
import assert from 'node:assert/strict';
import {examplePlan,evaluatePlan} from '../src/core/planner.mjs';
import {suggestAllocations,assessRisk,decisionText} from '../src/core/advice.mjs';
test('suggestions are feasible, do not mutate inputs, and expose lower-cost single-event choice',()=>{
 const p=examplePlan(),snapshot=structuredClone(p),s=suggestAllocations(p);
 assert.deepEqual(p,snapshot);assert.deepEqual(s[0].qty,[0,160]);assert.equal(s[0].outcome.contribution,64000);
 assert.ok(s.some(x=>x.qty.join(',')==='40,160'));
 for(const c of s){assert.equal(c.outcome.feasible,true);assert.ok(c.outcome.investment<=140000);assert.ok(c.qty.reduce((a,b)=>a+b,0)<=200);}
});
test('future replenishment cannot finance early stock reservation',()=>{
 const p=examplePlan();p.stock='150';p.inbound={quantity:'200',date:'2026-11-10',confirmed:true};
 for(const c of suggestAllocations(p)){assert.ok(c.qty[0]<=50);assert.ok(c.outcome.ledger.every(r=>r.balance>=0));}
 p.inbound.confirmed=false;for(const c of suggestAllocations(p))assert.ok(c.qty[0]+c.qty[1]<=50);
});
test('suggestion search respects explicit exclusion and fixed budget',()=>{
 const p=examplePlan();p.events[1].start='2026-11-01';p.exclusive=true;p.budget='700';
 const s=suggestAllocations(p);assert.ok(s.length);for(const c of s){assert.ok(c.qty.some(q=>q===0));assert.ok(c.outcome.investment<=70000);}
});
test('no-participation wins when positive-volume choices lose; defective input has no advice',()=>{
 const p=examplePlan();p.events.forEach(e=>e.unit='-1');assert.deepEqual(suggestAllocations(p)[0].qty,[0,0]);
 p.stock='1';assert.deepEqual(suggestAllocations(p),[]);p.stock='';assert.deepEqual(suggestAllocations(p),[]);
});
test('break-even and stress maintain sunk campaign costs even at zero sales',()=>{
 const risk=assessRisk(examplePlan(),'b');assert.equal(risk.thresholds[1].breakEven,89);
 assert.deepEqual(risk.scenarios.map(s=>s.contribution),[64000,35200,-8000,-80000]);assert.deepEqual(risk.scenarios.map(s=>s.qty[1]),[160,128,80,0]);
 assert.equal(assessRisk(examplePlan(),'all'),null);
});
test('cost already committed differs from not participating; negative and zero unit economics remain explicit',()=>{
 const p=examplePlan();assert.equal(assessRisk(p,'none').scenarios.at(-1).contribution,0);
 p.events[1].unit='0';assert.equal(assessRisk(p,'b').thresholds[1].breakEven,null);
 p.events[1].unit='-1';assert.equal(assessRisk(p,'b').scenarios[0].contribution,-96000);
});
test('fractional-unit sales stress floors quantities and monetary threshold rounds up',()=>{
 const p=examplePlan();p.events[0].demand='3';p.events[0].unit='0.29';p.events[0].fixed='0.30';
 const r=assessRisk(p,'a');assert.equal(r.thresholds[0].breakEven,2);assert.deepEqual(r.scenarios[1].qty,[2,0]);assert.equal(r.scenarios[1].contribution,28);
});
test('decision record contains reproducible assumptions, risk, allocation and date ledger; rejects infeasible output',()=>{
 const p=examplePlan();const text=decisionText(p,'b',7,'2026-10-03T00:00:00Z');
 for(const expected of ['修订：7','B 160 件','640.00','89 件','-800.00','2026-11-10','未验证来源','合成演示'])assert.ok(text.includes(expected),expected);
 assert.throws(()=>decisionText(p,'all',7));p.budget='';assert.throws(()=>decisionText(p,'b',8));
});
test('bounded search suggestions survive a varied deterministic constraint grid',()=>{
 for(const stock of ['100','200','500'])for(const budget of ['0','600','1400'])for(const inbound of [false,true]){
 const p=examplePlan();p.stock=stock;p.budget=budget;p.inbound={quantity:'80',date:'2026-11-10',confirmed:inbound};
 for(const c of suggestAllocations(p)){const out=evaluatePlan({...p,custom:c.qty.map(String)}).plans.find(s=>s.id==='custom');assert.equal(out.feasible,true);assert.equal(out.contribution,c.outcome.contribution);}
 }
});
