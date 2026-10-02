export const RULE_VERSION = 'configuration-v1';
export function strictInstant(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(Z|([+-])(\d{2}):(\d{2}))$/.exec(value.trim());
  if (!match) return null;
  const [y,m,d,h,min,sec] = match.slice(1,7).map(Number);
  const leap = y%4===0 && (y%100!==0 || y%400===0);
  const days = [31,leap?29:28,31,30,31,30,31,31,30,31,30,31];
  if (y<1 || m<1 || m>12 || d<1 || d>days[m-1] || h>23 || min>59 || sec>59) return null;
  const oh=Number(match[9] ?? 0), om=Number(match[10] ?? 0);
  if (oh>14 || om>59 || (oh===14 && om!==0)) return null;
  const local = new Date(0); local.setUTCFullYear(y,m-1,d); local.setUTCHours(h,min,sec,0);
  const offset = (oh*60+om)*60000*(match[8]==='-'?-1:1);
  return local.getTime()-offset;
}

export function checkRows(rows) {
  const problems=[], ids=new Map(), ranges=[];
  function add(rule,recordIds,fields,reason,values={}) {
    problems.push({id:`${rule}:${recordIds.join('|')}:${fields.join('|')}`,rule_id:rule,severity:'block',record_ids:recordIds,fields,reason,values});
  }
  for (const row of rows) {
    const key=row.record_id;
    const id=row.activity_id.trim(), product=row.product_id.trim();
    for (const field of ['activity_id','product_id','start_at','end_at','exclusive']) {
      if (!row[field].trim()) add('R001',[key],[field],'required',{value:row[field]});
    }
    for (const field of ['activity_id','product_id','name']) {
      if (row[field].length>120) add('R001',[key],[field],'tooLong',{value:row[field]});
    }
    if (id) { const group=ids.get(id) ?? []; group.push(key); ids.set(id,group); }
    const start=strictInstant(row.start_at), end=strictInstant(row.end_at);
    for (const [field,value] of [['start_at',start],['end_at',end]]) {
      if (row[field].trim() && value===null) add('R003',[key],[field],'date',{value:row[field]});
    }
    if (start!==null && end!==null && start>=end) add('R003',[key],['start_at','end_at'],'order',{start:row.start_at,end:row.end_at});
    const flag=row.exclusive.trim();
    if (flag && !['true','false'].includes(flag)) add('R004',[key],['exclusive'],'boolean',{value:row.exclusive});
    if (product && start!==null && end!==null && start<end && ['true','false'].includes(flag)) ranges.push({key,product,start,end,exclusive:flag==='true'});
  }
  for (const [id,recordIds] of ids) if (recordIds.length>1) add('R002',recordIds,['activity_id'],'duplicate',{value:id});
  for (let i=0;i<ranges.length;i++) for(let j=i+1;j<ranges.length;j++) {
    const a=ranges[i],b=ranges[j];
    if(a.product===b.product && (a.exclusive||b.exclusive) && a.start<b.end && b.start<a.end) {
      add('R004',[a.key,b.key],['product_id','start_at','end_at','exclusive'],'overlap',{product_id:a.product,overlap_start:new Date(Math.max(a.start,b.start)).toISOString(),overlap_end:new Date(Math.min(a.end,b.end)).toISOString(),minutes:(Math.min(a.end,b.end)-Math.max(a.start,b.start))/60000});
    }
  }
  return {rule_version:RULE_VERSION,problems,checked_records:rows.length};
}

export function diffRows(original,draft) {
  const fields=['activity_id','product_id','name','start_at','end_at','exclusive','price','discount','cost','fulfillment','fee_percent'];
  return draft.flatMap((row,index) => fields.filter(field=>row[field]!==original[index][field]).map(field=>({record_id:row.record_id,field,before:original[index][field],after:row[field]})));
}
export function compareProblems(original,current) {
  const oldIds=new Set(original.problems.map(p=>p.id)), newIds=new Set(current.problems.map(p=>p.id));
  return {resolved:original.problems.filter(p=>!newIds.has(p.id)),remaining:current.problems.filter(p=>oldIds.has(p.id)),introduced:current.problems.filter(p=>!oldIds.has(p.id))};
}
