import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseCSV} from '../src/core/csv.mjs';
import {newSession,inspectSession,editSession,reviewSession} from '../src/core/session.mjs';
import {makeReport,reportHTML,reportJSON} from '../src/core/report.mjs';
const session=()=>inspectSession(newSession(parseCSV(readFileSync(new URL('../public/examples/conflict.csv',import.meta.url),'utf8')),{name:'conflict.csv',synthetic:true}));
test('stale or unchecked result cannot export or accept review',async()=>{
 let s=session();s=editSession(s,'row-1','discount','20');await assert.rejects(()=>makeReport(s),/STALE/);assert.throws(()=>reviewSession(s,'A','B'),/STALE/);
});
test('unresolved problems export with no false approval; review follows revision',async()=>{
 let s=session();let r=await makeReport(s);assert.equal(r.review,null);assert.equal(r.draft_result.problems.length,2);
 s=reviewSession(s,'Operator','Synthetic example, do not launch');r=await makeReport(s);assert.equal(r.review.revision,0);
 s=editSession(s,'row-1','discount','20');assert.equal(s.review,null);s=inspectSession(s);assert.equal((await makeReport(s)).review,null);
 assert.throws(()=>reviewSession(s,' '.repeat(5),'Note'),/INVALID/);
});
test('HTML escapes adversarial source, fields and notes; JSON retains exact source',async()=>{
 const attack='</pre><script>alert(1)</script><img src=x onerror=alert(1)>';
 let s=session();s.source.name=attack;s=editSession(s,'row-1','name',attack);s=inspectSession(s);s=reviewSession(s,'<b>Test</b>',attack);
 const report=await makeReport(s),html=reportHTML(report),json=JSON.parse(reportJSON(report));
 assert.ok(!html.includes('<script>'));assert.ok(!html.includes('<img'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(html.includes("default-src 'none'"));assert.equal(json.draft[0].name,attack);assert.equal(json.review.note,attack);
});
test('snapshot formats share fingerprint, exact monetary evidence and UTC times',async()=>{
 const s=session(),r=await makeReport(s,'en','2026-10-02T00:00:00.000Z');const json=JSON.parse(reportJSON(r));
 assert.match(r.input_fingerprint.value,/^[a-f0-9]{64}$/);assert.ok(reportHTML(r).includes(r.input_fingerprint.value));assert.equal(json.original_result.contributions[0].contribution_cents,-350);assert.equal(json.normalized_times.original[0].start_ms,Date.parse('2026-10-01T02:00:00Z'));
 const changed=await makeReport(inspectSession(editSession(s,'row-1','discount','20')));assert.notEqual(changed.input_fingerprint.value,r.input_fingerprint.value);
 s.original[0].price='999';assert.equal(r.original[0].price,'100');
});
