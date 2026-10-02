import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateContribution,decimalUnits} from '../src/core/money.mjs';
import {inspectRows} from '../src/core/checks.mjs';
import {newSession,editSession,inspectSession,isCurrent} from '../src/core/session.mjs';
const row={record_id:'row-1',activity_id:'A',product_id:'P',name:'Test',start_at:'2026-10-01T10:00:00Z',end_at:'2026-10-01T11:00:00Z',exclusive:'false',price:'100',discount:'30',cost:'60',fulfillment:'10',fee_percent:'5'};
test('explicit example -3.50 to 6.00; fee base is net revenue',()=>{
 const a=calculateContribution(row),b=calculateContribution({...row,discount:'20'});
 assert.equal(a.fee_cents,350);assert.equal(a.contribution_cents,-350);assert.equal(b.contribution_cents,600);assert.equal(b.contribution_cents-a.contribution_cents,950);
});
test('missing each operand blocks calculation; explicit zero is valid',()=>{
 for(const field of ['price','discount','cost','fulfillment','fee_percent']){const c=calculateContribution({...row,[field]:' '});assert.equal(c.contribution_cents,null);assert.ok(c.errors.some(e=>e.field===field&&e.reason==='missingMoney'));}
 assert.equal(calculateContribution({...row,price:'0',discount:'0',cost:'0',fulfillment:'0',fee_percent:'0'}).contribution_cents,0);
});
test('reject exponent, sign, negative, >2 decimals, overflow and discount over price',()=>{
 for(const value of ['1e2','-1','+1','NaN','Infinity','1.001','1,000','1000000.01'])assert.ok(decimalUnits(value,100000000).error,value);
 assert.equal(decimalUnits('1000000.00',100000000).value,100000000);
 assert.equal(calculateContribution({...row,fee_percent:'100.01'}).contribution_cents,null);
 assert.equal(calculateContribution({...row,discount:'100.01'}).contribution_cents,null);
});
test('half cent rounds up; below half down; max amount exact',()=>{
 const base={...row,price:'0.01',discount:'0',cost:'0',fulfillment:'0'};
 assert.equal(calculateContribution({...base,fee_percent:'50'}).fee_cents,1);
 assert.equal(calculateContribution({...base,fee_percent:'49.99'}).fee_cents,0);
 assert.equal(calculateContribution({...base,price:'1000000',fee_percent:'100'}).fee_cents,100000000);
});
test('money edits invalidate check and retain original negative evidence',()=>{
 let s=inspectSession(newSession([row],{}));assert.equal(s.originalResult.problems[0].rule_id,'R006');
 s=editSession(s,'row-1','discount','20');assert.equal(isCurrent(s),false);
 s=inspectSession(s);assert.equal(s.draftResult.problems.length,0);assert.equal(s.originalResult.contributions[0].contribution_cents,-350);
 const missing=inspectRows([{...row,cost:''}]);assert.equal(missing.problems[0].severity,'review');assert.equal(missing.contributions[0].contribution_cents,null);
});
