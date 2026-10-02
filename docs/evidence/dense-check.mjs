import fs from 'node:fs';
import {parseCSV} from '../../src/core/csv.mjs';
import {inspectRows} from '../../src/core/checks.mjs';
const seed=parseCSV(fs.readFileSync('public/examples/clean.csv','utf8'))[0];
const rows=Array.from({length:500},(_,i)=>({...seed,record_id:`row-${i+1}`,activity_id:`DENSE-${i}`,source_record:i+2}));
const start=performance.now();const result=inspectRows(rows);const ms=performance.now()-start;
if(result.problems.length!==124750)throw Error('Missing overlap pairs');
console.log(JSON.stringify({records:500,overlap_pairs:result.problems.length,elapsed_ms:ms,scope:'Developer synthetic dense rule check; no browser rendering claim'}));
