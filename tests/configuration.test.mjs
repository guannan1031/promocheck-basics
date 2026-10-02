import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseCSV,COLUMNS,MAX_BYTES} from '../src/core/csv.mjs';
import {strictInstant,checkRows,compareProblems,diffRows} from '../src/core/rules.mjs';
import {newSession,inspectSession,editSession,resetDraft,isCurrent} from '../src/core/session.mjs';
const sample=name=>parseCSV(readFileSync(new URL(`../public/examples/${name}.csv`,import.meta.url),'utf8'));
const header=COLUMNS.join(',');
test('quoted commas, newlines, BOM and whitespace preserve source values',()=>{
 const rows=parseCSV('\uFEFF'+header+'\nA,P,"hello,\nworld",2026-10-01T10:00:00+08:00,2026-10-01T11:00:00+08:00,true,100,20,60,10,5\n');
 assert.equal(rows[0].name,'hello,\nworld'); assert.equal(rows[0].source_record,2);
});
test('reject ambiguous, malformed and oversized CSV inputs',()=>{
 for(const [text,code] of [['','EMPTY_FILE'],[header,'NO_RECORDS'],[header+'\nA,P','ROW_WIDTH'],[header+'\n"unterminated','MALFORMED_CSV'],['x\na','INVALID_COLUMNS'],[header+',name\na','DUPLICATE_COLUMNS'],['a'.repeat(MAX_BYTES+1),'FILE_TOO_LARGE']]) assert.throws(()=>parseCSV(text),e=>e.code===code,code);
 assert.throws(()=>parseCSV(header+'\n'+Array(501).fill(Array(11).fill('').join(',')).join('\n')),e=>e.code==='TOO_MANY_RECORDS');
});
test('strict timestamps reject normalization and require explicit timezone',()=>{
 for(const date of ['2026-02-29T10:00:00Z','2026-04-31T10:00:00Z','2026-10-01T24:00:00Z','2026-10-01T10:00:00','2026-10-01T10:00:60Z','2026-10-01T10:00:00+14:01']) assert.equal(strictInstant(date),null,date);
 assert.equal(strictInstant('2024-02-29T10:00:00Z'),Date.parse('2024-02-29T10:00:00Z'));
 assert.equal(strictInstant('2026-10-01T10:00:00+08:00'),strictInstant('2026-10-01T02:00:00Z'));
});
test('sample produces evidenced 30 minute overlap; adjacency is valid',()=>{
 const result=checkRows(sample('conflict')); assert.equal(result.problems.length,1); assert.equal(result.problems[0].values.minutes,30); assert.deepEqual(result.problems[0].record_ids,['row-1','row-2']);
 assert.equal(checkRows(sample('clean')).problems.length,0);
});
test('exclusive policy needs same product and at least one exclusive flag',()=>{
 for(const a of ['true','false']) for(const b of ['true','false']){
  const rows=sample('conflict'); rows[0].exclusive=a; rows[1].exclusive=b;
  assert.equal(checkRows(rows).problems.length,a==='true'||b==='true'?1:0);
 }
 const rows=sample('conflict'); rows[1].product_id='different'; assert.equal(checkRows(rows).problems.length,0);
});
test('invalid date and missing product are diagnosed without fabricated overlap',()=>{
 const result=checkRows(sample('invalid')); assert.equal(result.problems.length,2); assert.deepEqual(new Set(result.problems.map(p=>p.reason)),new Set(['order','required']));
 const rows=sample('conflict'); rows[0].start_at='2026-02-30T10:00:00Z'; assert.deepEqual(checkRows(rows).problems.map(p=>p.reason),['date']);
});
test('duplicate activity IDs use trimmed identity without merging records',()=>{
 const rows=sample('clean'); rows[1].activity_id=' '+rows[0].activity_id+' ';
 const result=checkRows(rows); assert.equal(result.problems.length,1); assert.equal(result.problems[0].reason,'duplicate'); assert.equal(result.problems[0].record_ids.length,2);
});
test('correction invalidates results, preserves original evidence and compares fresh results',()=>{
 let state=inspectSession(newSession(sample('conflict'),'sample'));
 state={...state,review:{approved:true}};
 state=editSession(state,'row-1','end_at','2026-10-01T11:30:00+08:00');
 assert.equal(isCurrent(state),false); assert.equal(state.review,null); assert.equal(state.original[0].end_at,'2026-10-01T12:00:00+08:00');
 state=inspectSession(state); assert.equal(isCurrent(state),true); assert.equal(state.originalResult.problems.length,2); assert.equal(state.draftResult.problems.length,1);
 assert.equal(compareProblems(state.originalResult,state.draftResult).resolved.length,1); assert.equal(diffRows(state.original,state.draft).length,1);
 state=resetDraft(state); assert.equal(isCurrent(state),false); assert.equal(diffRows(state.original,state.draft).length,0); assert.equal(inspectSession(state).draftResult.problems.length,2);
});
test('later edits cannot reuse a successful check; imported text is not evaluated',()=>{
 let state=inspectSession(newSession(sample('clean'),'sample'));
 state=editSession(state,'row-1','name','<img src=x onerror=alert(1)>'); assert.equal(state.draft[0].name,'<img src=x onerror=alert(1)>'); assert.equal(isCurrent(state),false);
 assert.throws(()=>editSession(state,'row-1','record_id','evil'));
 state=editSession(state,'row-1','end_at','bad'); state=inspectSession(state); assert.equal(compareProblems(state.originalResult,state.draftResult).introduced.length,1);
});

