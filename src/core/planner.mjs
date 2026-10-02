export const examplePlan = () => ({schemaVersion:1, dataMode:'synthetic', stock:'300', occupied:'50', safety:'30', baseline:'20', budget:'1400', exclusive:false,
  inbound:{quantity:'0', date:'2026-11-01', confirmed:false},
  events:[{id:'A',start:'2026-11-01',end:'2026-11-03',unit:'6',fixed:'600',demand:'180'}, {id:'B',start:'2026-11-10',end:'2026-11-11',unit:'9',fixed:'800',demand:'160'}], custom:['100','100']});

const DAY=86400000;
function dateValue(value) {
  if(typeof value!=='string'||!/^20\d{2}-\d{2}-\d{2}$/.test(value)) return NaN;
  const n=Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(n)&&new Date(n).toISOString().slice(0,10)===value?n:NaN;
}
export function validatePlan(p) {
  const errors=[];
  const number=(v,label,money=false,signed=false)=>{
    const pattern=money?(signed?/^-?\d+(\.\d{1,2})?$/:/^\d+(\.\d{1,2})?$/):/^\d+$/;
    if(typeof v!=='string'||!pattern.test(v)||Math.abs(Number(v))>(money?1000000:100000)) errors.push(`${label}：请填写${signed?'可正可负的':''}${money?'最多两位小数金额（绝对值不超过100万元）':'0–100000的整数'}，不能留空。`);
  };
  if(!p||p.schemaVersion!==1||p.dataMode!=='synthetic') return ['仅接受版本1的合成演示计划；真实数据适配尚未开放。'];
  for(const [key,label] of Object.entries({stock:'实物库存',occupied:'已有订单占用',safety:'安全预留',baseline:'普通销售预留'}))number(p[key],label);
  number(p.budget,'专项预算',true);
  if(typeof p.exclusive!=='boolean')errors.push('活动互斥标记无效。');
  if(!p.inbound||typeof p.inbound.confirmed!=='boolean')errors.push('到货信息无效。');
  else {number(p.inbound.quantity,'到货数量');if(!Number.isFinite(dateValue(p.inbound.date)))errors.push('到货日期无效。');}
  if(!Array.isArray(p.events)||p.events.length!==2)errors.push('此切片需要且仅支持两场活动。');
  else p.events.forEach((e,i)=>{
    if(!e||e.id!==['A','B'][i]) {errors.push('活动编号或顺序无效。');return;}
    number(e.unit,`${e.id}每件贡献`,true,true);number(e.fixed,`${e.id}固定投入`,true);number(e.demand,`${e.id}需求上限`);
    const a=dateValue(e.start),b=dateValue(e.end);
    if(!Number.isFinite(a)||!Number.isFinite(b)||b<a)errors.push(`${e.id}日期无效，结束日不能早于开始日。`);
  });
  if(!Array.isArray(p.custom)||p.custom.length!==2)errors.push('自定义方案数量无效。');
  else p.custom.forEach((q,i)=>number(q,`自定义${['A','B'][i]}分配`));
  if(!errors.length){
    const dates=p.events.flatMap(e=>[dateValue(e.start),dateValue(e.end)]);
    if(Number(p.inbound.quantity)>0)dates.push(dateValue(p.inbound.date));
    if(Math.max(...dates)-Math.min(...dates)>89*DAY)errors.push('计划窗口不能超过90个自然日。');
  }
  return errors;
}
function cents(s){const negative=s.startsWith('-');const [a,b='']=s.replace(/^-/,'').split('.');return (Number(a)*100+Number(b.padEnd(2,'0')))*(negative?-1:1);}
export function restorePlan(text) {
  if(typeof text!=='string'||text.length>50000)throw new Error('计划文件须小于50KB。');
  let p;try{p=JSON.parse(text);}catch{throw new Error('不是有效的JSON计划。');}
  const errors=validatePlan(p);if(errors.length)throw new Error(errors.join('\n'));
  // Copy only the input contract. Imported result fields are never trusted.
  return {schemaVersion:1,dataMode:'synthetic',...Object.fromEntries(['stock','occupied','safety','baseline','budget','exclusive'].map(k=>[k,p[k]])),inbound:{quantity:p.inbound.quantity,date:p.inbound.date,confirmed:p.inbound.confirmed},events:p.events.map(e=>Object.fromEntries(['id','start','end','unit','fixed','demand'].map(k=>[k,e[k]]))),custom:[...p.custom]};
}
export function evaluatePlan(p) {
  const errors=validatePlan(p);if(errors.length)return {errors,plans:[],best:null};
  const initial=Number(p.stock)-Number(p.occupied)-Number(p.safety)-Number(p.baseline);
  const definitions=[['none','不参加',[0,0]],['all','全部参加',p.events.map(e=>Number(e.demand))],['a','只参加 A',[Number(p.events[0].demand),0]],['b','只参加 B',[0,Number(p.events[1].demand)]],['custom','自定义分配',p.custom.map(Number)]];
  const plans=definitions.map(([id,name,qty])=>{
    const reasons=[],ledger=[{date:'期初',label:'实物 − 已占用 − 安全预留 − 普通销售预留',change:initial,balance:initial}];
    let balance=initial,minBalance=initial,investment=0,gross=0;
    if(initial<0)reasons.push(`期初预留已超过实物库存 ${-initial} 件。`);
    const movements=[];
    if(p.inbound.confirmed&&Number(p.inbound.quantity)>0)movements.push({date:p.inbound.date,label:'确认到货（当日零点）',change:Number(p.inbound.quantity),order:0});
    p.events.forEach((e,i)=>{
      if(qty[i]>Number(e.demand))reasons.push(`${e.id}分配 ${qty[i]} 件超过假设需求上限 ${e.demand} 件。`);
      if(qty[i]>0){investment+=cents(e.fixed);gross+=qty[i]*cents(e.unit);movements.push({date:e.start,label:`${e.id}开始：预留 ${qty[i]} 件，销售至 ${e.end}`,change:-qty[i],order:i+1});}
    });
    movements.sort((a,b)=>a.date.localeCompare(b.date)||a.order-b.order);
    for(const m of movements){balance+=m.change;minBalance=Math.min(minBalance,balance);ledger.push({...m,balance});}
    if(minBalance<0)reasons.push(`时间库存不足：最大缺口 ${-minBalance} 件；后续到货不能补救先前缺口。`);
    if(investment>cents(p.budget))reasons.push(`专项投入超预算 ${((investment-cents(p.budget))/100).toFixed(2)} 元。`);
    const [a,b]=p.events;
    if(p.exclusive&&qty.every(q=>q>0)&&a.start<=b.end&&b.start<=a.end)reasons.push('A、B销售日期重叠，且已声明互斥。');
    const conditional=gross-investment;
    return {id,name,qty,investment,conditional,contribution:reasons.length?null:conditional,returnRate:reasons.length||investment===0?null:conditional/investment,feasible:!reasons.length,reasons,ledger,shortage:Math.max(0,-minBalance)};
  });
  const feasible=plans.filter(s=>s.feasible),max=feasible.length?Math.max(...feasible.map(s=>s.contribution)):null;
  return {errors:[],initial,plans,best:feasible.find(s=>s.contribution===max)?.id??null,ties:feasible.filter(s=>s.contribution===max).map(s=>s.name)};
}
