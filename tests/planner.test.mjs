import test from 'node:test';
import assert from 'node:assert/strict';
import {examplePlan,evaluatePlan,restorePlan} from '../src/core/planner.mjs';
const get=(r,id)=>r.plans.find(p=>p.id===id);
test('hand-calculated reference: infeasible high return never ranks above feasible B',()=>{
 const r=evaluatePlan(examplePlan());assert.equal(r.initial,200);assert.equal(get(r,'all').shortage,140);assert.equal(get(r,'all').conditional,112000);assert.equal(get(r,'all').contribution,null);
 assert.equal(get(r,'a').contribution,48000);assert.equal(get(r,'b').contribution,64000);assert.equal(get(r,'custom').contribution,10000);assert.equal(r.best,'b');
});
test('confirmed inbound is time-dependent; late supply does not erase earlier shortage',()=>{
 const p=examplePlan();p.inbound={quantity:'140',date:'2026-11-10',confirmed:true};assert.equal(get(evaluatePlan(p),'all').feasible,true);
 p.inbound.date='2026-11-11';let all=get(evaluatePlan(p),'all');assert.equal(all.shortage,140);assert.equal(all.ledger.at(-1).balance,0);assert.equal(all.feasible,false);
 p.inbound.date='2026-11-01';p.inbound.confirmed=false;assert.equal(get(evaluatePlan(p),'all').shortage,140);
});
test('negative unit contribution is allowed and no-event baseline beats losses',()=>{
 const p=examplePlan();p.events[1].demand='80';assert.equal(get(evaluatePlan(p),'b').contribution,-8000);
 p.events.forEach(e=>e.unit='-1');assert.equal(evaluatePlan(p).best,'none');
});
test('budget blocks overspend and no participation incurs no fixed fee',()=>{
 const p=examplePlan();p.budget='700';const r=evaluatePlan(p);assert.equal(get(r,'b').feasible,false);assert.equal(r.best,'a');assert.equal(get(r,'none').investment,0);
 p.budget='0';p.events[0].fixed='0';const a=get(evaluatePlan(p),'a');assert.equal(a.feasible,true);assert.equal(a.returnRate,null);
});
test('inclusive-day conflicts require explicit mutual exclusion and participation',()=>{
 const p=examplePlan();p.stock='1000';p.events[1].start=p.events[0].end;
 assert.equal(get(evaluatePlan(p),'all').feasible,true);p.exclusive=true;assert.equal(get(evaluatePlan(p),'all').feasible,false);assert.equal(get(evaluatePlan(p),'a').feasible,true);
 p.events[1].start='2026-11-04';assert.equal(get(evaluatePlan(p),'all').feasible,true);
});
test('empty costs, malformed dates, inverted ranges, fractional stock and excessive horizon block all output',()=>{
 for(const mutate of [p=>p.events[0].unit='',p=>p.events[0].start='2026-02-30',p=>p.events[0].end='2026-10-01',p=>p.stock='1.2',p=>p.stock='-1',p=>p.budget='1e3',p=>p.events[1].end='2027-11-11']){
 const p=examplePlan();mutate(p);const r=evaluatePlan(p);assert.ok(r.errors.length);assert.deepEqual(r.plans,[]);assert.equal(r.best,null);
 }
});
test('allocations cannot exceed demand and opening stock defects block all plans',()=>{
 const p=examplePlan();p.custom[0]='181';assert.equal(get(evaluatePlan(p),'custom').feasible,false);
 p.stock='20';assert.equal(evaluatePlan(p).best,null);
});
test('cent arithmetic and stock conservation across all candidate ledgers',()=>{
 const p=examplePlan();p.events[0].unit='0.29';p.events[0].fixed='0.01';assert.equal(get(evaluatePlan(p),'a').contribution,5219);
 p.inbound={quantity:'140',date:'2026-11-01',confirmed:true};
 for(const s of evaluatePlan(p).plans){assert.equal(s.ledger.at(-1).balance,200+140-s.qty.reduce((a,b)=>a+b,0));assert.equal(s.conditional,s.qty[0]*29+s.qty[1]*900-s.investment);}
});
test('JSON roundtrip reproduces calculation and strips untrusted result fields',()=>{
 const p=examplePlan(),original=evaluatePlan(p);p.results={contribution:99999999};const restored=restorePlan(JSON.stringify(p));assert.equal(restored.results,undefined);assert.deepEqual(evaluatePlan(restored),original);
 for(const x of ['null','{}','oops',JSON.stringify({...p,schemaVersion:2}),JSON.stringify({...p,dataMode:'real'}),JSON.stringify({...p,events:[null,null]}),' '.repeat(50001)])assert.throws(()=>restorePlan(x));
});
