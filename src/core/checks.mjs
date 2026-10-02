import {checkRows} from './rules.mjs';
import {calculateContribution} from './money.mjs';
export function inspectRows(rows){
 const result=checkRows(rows);
 const contributions=rows.map(calculateContribution);
 for(const c of contributions){
  for(const e of c.errors)result.problems.push({id:`R005:${c.record_id}:${e.field}:${e.reason}`,rule_id:'R005',severity:e.reason==='missingMoney'?'review':'block',record_ids:[c.record_id],fields:[e.field],reason:e.reason});
  if(c.contribution_cents!==null&&c.contribution_cents<0)result.problems.push({id:`R006:${c.record_id}`,rule_id:'R006',severity:'review',record_ids:[c.record_id],fields:['price','discount','cost','fulfillment','fee_percent'],reason:'negativeContribution'});
 }
 return {...result,rule_version:'promocheck-v2',contributions};
}
