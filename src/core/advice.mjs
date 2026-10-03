import {evaluatePlan} from './planner.mjs';
const cents=s=>Math.round(Number(s)*100);

// Deliberately bounded candidate search, not a general demand optimizer.
export function suggestAllocations(plan){
 const result=evaluatePlan(plan);if(result.errors.length||result.initial<0)return [];
 const dates=[...new Set(plan.events.map(e=>e.start))].sort();
 const capacity=date=>result.initial+(plan.inbound.confirmed&&plan.inbound.date<=date?Number(plan.inbound.quantity):0);
 const candidates=[{qty:[0,0],method:'不参加，保留库存和专项预算'}];
 for(const order of [[0],[1],[0,1],[1,0]]){
  const qty=[0,0];
  for(const i of order){
   const e=plan.events[i];if(cents(e.unit)<=0)continue;
   const limits=dates.filter(d=>d>=e.start).map(d=>capacity(d)-qty.reduce((sum,q,j)=>sum+(plan.events[j].start<=d?q:0),0));
   qty[i]=Math.max(0,Math.min(Number(e.demand),...limits));
  }
  candidates.push({qty,method:order.length===1?`只给活动 ${plan.events[order[0]].id} 分配库存`:`优先满足 ${plan.events[order[0]].id}，再分配剩余库存`});
 }
 const seen=new Set();
 return candidates.map(c=>({...c,outcome:evaluatePlan({...plan,custom:c.qty.map(String)}).plans.find(s=>s.id==='custom')}))
  .filter(c=>{const key=c.qty.join(',');if(seen.has(key)||!c.outcome.feasible)return false;seen.add(key);return true;})
  .sort((a,b)=>b.outcome.contribution-a.outcome.contribution||a.outcome.investment-b.outcome.investment).slice(0,3);
}

export function assessRisk(plan,selected){
 const result=evaluatePlan(plan);if(result.errors.length)return null;
 const s=result.plans.find(x=>x.id===selected);if(!s?.feasible)return null;
 const thresholds=plan.events.map((e,i)=>({id:e.id,participating:s.qty[i]>0,planned:s.qty[i],unitCents:cents(e.unit),fixedCents:cents(e.fixed),breakEven:cents(e.unit)>0?Math.ceil(cents(e.fixed)/cents(e.unit)):null}));
 const scenarios=[100,80,50,0].map(percent=>{
  const qty=s.qty.map(q=>Math.floor(q*percent/100));
  const contribution=qty.reduce((sum,q,i)=>sum+q*cents(plan.events[i].unit),0)-s.investment;
  return {percent,qty,contribution};
 });
 return {thresholds,scenarios};
}

export function decisionText(plan,selected,revision,createdAt=new Date().toISOString()){
 const result=evaluatePlan(plan);const s=result.plans.find(x=>x.id===selected);
 if(result.errors.length||!s?.feasible)throw new Error('先选择输入完整且可执行的方案，再生成决策单。');
 const risk=assessRisk(plan,selected),money=n=>(n/100).toFixed(2);
 return [
  'PromoCheck 活动决策单（合成演示 / 待人工复核）',`生成：${createdAt}；输入修订：${revision}`,
  `选定：${s.name}；分配 A ${s.qty[0]} / B ${s.qty[1]} 件`,
  `专项投入：${money(s.investment)} 元；预计活动贡献：${money(s.contribution)} 元；贡献/投入：${s.returnRate===null?'无定义':(s.returnRate*100).toFixed(1)+'%'}`,
  '', '计算依据',
  `期初实物 ${plan.stock} − 已占用 ${plan.occupied} − 安全预留 ${plan.safety} − 普通销售预留 ${plan.baseline} = ${result.initial} 件；专项预算 ${plan.budget} 元`,
  `补货 ${plan.inbound.quantity} 件 / ${plan.inbound.date} / ${plan.inbound.confirmed?'确认当日零点可用':'未确认，不计入可用库存'}`,
  `活动互斥：${plan.exclusive?'是':'否'}；日期包含结束日；活动开始日一次性预留销量。`,
  ...plan.events.map(e=>`${e.id}：${e.start} 至 ${e.end}；每件贡献 ${e.unit} 元；固定投入 ${e.fixed} 元；需求上限 ${e.demand} 件`),
  '每件贡献为手工假设，须自行核对净收入、商品成本及每件可变费用；未验证来源。固定投入另扣一次。',
  '', '回本边界（单场，固定单位贡献与固定投入）',
  ...risk.thresholds.map(t=>!t.participating?`${t.id}：未参加`:`${t.id}：${t.breakEven===null?'单位贡献不为正，无正销量回本保证':`至少 ${t.breakEven} 件达到非负活动贡献；当前计划 ${t.planned} 件`}`),
  '', '销量压力测试（已参加活动固定投入不退还）',
  ...risk.scenarios.map(r=>`${r.percent}%销量：A ${r.qty[0]} / B ${r.qty[1]} 件 → 贡献 ${money(r.contribution)} 元`),
  '', '时间库存账',...s.ledger.map(r=>`${r.date} | ${r.label} | 变化 ${r.change} | 余量 ${r.balance}`),
  '', '待确认：运营核对需求替代与活动规则；仓储核对占用/到货；财务核对贡献及费用。未自动报名、改价、补货或投放。',
  '局限：单SKU两活动；需求为假设；未计企业固定开销、未确认税费/退款补贴及自然销售利润变化。不是净利润、平台ROAS或已实现ROI；无真实商家验证。',
  '此文件是独立快照，后续修改请重新生成；完整输入另用计划JSON保存恢复。'
 ].join('\n');
}
