import React,{useState} from 'react';

const money=n=>new Intl.NumberFormat('zh-CN',{style:'currency',currency:'CNY'}).format(n/100);
const day=s=>Date.parse(`${s}T00:00:00Z`)/86400000;

export default function PlanComparison({plan,result,onInspect}){
 const [left,setLeft]=useState('a'),[right,setRight]=useState('b');
 const pair=[left,right].map(id=>result.plans.find(s=>s.id===id));
 const scale=Math.max(1,...pair.filter(s=>s.feasible).map(s=>Math.abs(s.contribution)));
 const dates=plan.events.flatMap(e=>[day(e.start),day(e.end)]);
 if(Number(plan.inbound.quantity)>0)dates.push(day(plan.inbound.date));
 const first=Math.min(...dates),last=Math.max(...dates),span=last-first+1;
 const dateLabel=n=>new Date(n*86400000).toISOString().slice(5,10);
 const diff=pair.every(s=>s.feasible)?pair[1].contribution-pair[0].contribution:null;
 return <section className="compare-visual" aria-label="两个方案图文对比">
  <div className="compare-heading"><div><h3>把两个方案放在一起看</h3><p>选择方案，直接比较投入、贡献和活动安排。</p></div><span className="plan-badge">同一组假设 · 合成演示</span></div>
  <div className="compare-pair">{pair.map((s,i)=><article className={`compare-card ${i?'compare-right':'compare-left'}`} key={i}>
   <label className="compare-select"><span>方案{i?'二':'一'}</span><select aria-label={`对比方案${i?'二':'一'}`} value={s.id} onChange={e=>(i?setRight:setLeft)(e.target.value)}>{result.plans.filter(x=>x.id!==pair[1-i].id).map(x=><option value={x.id} key={x.id}>{x.name}</option>)}</select></label>
   <div className="compare-card-title"><h3>{s.name}</h3><span className={s.feasible?'compare-status good':'compare-status blocked'}>{s.feasible?'当前假设下可行':'不可行'}</span></div>
   <div className="compare-value"><span>预计活动贡献</span><strong className={s.contribution<0?'plan-bad':''}>{s.feasible?money(s.contribution):'暂不计收益'}</strong><small>{s.feasible?'扣除活动专项投入后；不是净利润':'先解决库存、预算或排期约束'}</small></div>
   <dl className="compare-metrics"><div><dt>专项投入</dt><dd>{money(s.investment)}</dd></div><div><dt>活动分配</dt><dd>{s.qty[0]+s.qty[1]} 件</dd></div><div><dt>最大库存缺口</dt><dd className={s.shortage?'plan-bad':''}>{s.shortage} 件</dd></div><div><dt>贡献 ÷ 投入</dt><dd>{s.returnRate===null?'—':`${(s.returnRate*100).toFixed(1)}%`}</dd></div></dl>
   <p className="compare-allocation">活动 A：{s.qty[0]} 件 <span>·</span> 活动 B：{s.qty[1]} 件</p>
   {s.reasons.length>0&&<ul className="compare-reasons">{s.reasons.map((r,n)=><li key={n}>{r}</li>)}</ul>}
   <button className="plan-button" onClick={()=>onInspect(s.id)}>查看{s.name}的库存账 ↓</button>
  </article>)}</div>
  <div className="compare-verdict" aria-live="polite"><strong>{diff===null?'先解决不可行方案的约束，再比较收益。':diff===0?'两个方案的预计活动贡献相同。':`“${diff>0?pair[1].name:pair[0].name}”的预计活动贡献多 ${money(Math.abs(diff))}。`}</strong><p>{diff===null?'没有把不可执行方案的条件算术值画成收益柱。':`相同假设下的方案差额，未验证实际增收；${pair[1].name}的专项投入${pair[1].investment===pair[0].investment?'与另一方案相同':`${pair[1].investment>pair[0].investment?'多':'少'} ${money(Math.abs(pair[1].investment-pair[0].investment))}`}。`}</p></div>
  <div className="compare-charts"><section className="compare-chart"><h3>贡献对比 <small>共用刻度 · 元</small></h3><p>零线右侧为正贡献，左侧为亏损。</p><div className="profit-axis"><span>亏损 ←</span><span>0</span><span>→ 正贡献</span></div>
   {pair.map((s,i)=><div className="profit-row" key={s.id}><div className="profit-label"><span>{s.name}</span><strong>{s.feasible?money(s.contribution):'不可行 · 不画收益'}</strong></div><div className="profit-track" role="img" aria-label={`${s.name}：${s.feasible?`预计活动贡献${money(s.contribution)}`:'不可行，不显示收益柱'}`}><span className="profit-zero"/>{s.feasible&&s.contribution!==0&&<span className={`profit-bar ${s.contribution<0?'loss':i?'second':'first'}`} style={{left:`${s.contribution<0?50-Math.abs(s.contribution)/scale*48:50}%`,width:`${Math.abs(s.contribution)/scale*48}%`}}/>}{!s.feasible&&<span className="profit-unavailable">约束未满足</span>}</div></div>)}
   <p className="plan-footnote">仅展示这两个候选；图形和上方金额来自同一次计算。</p>
  </section><section className="compare-chart"><h3>活动时间轴 <small>北京时间 · 自然日</small></h3><p>两方案共用日期刻度；每段标出活动和分配量。</p><div className="calendar-axis"><span>{dateLabel(first)}</span><span>{dateLabel(last)}</span></div>
   {pair.map((s,i)=><div className="calendar-plan" key={s.id}><strong>{s.name}</strong>{plan.events.map((e,j)=><div className="calendar-row" key={e.id}><div className="calendar-label">{e.id} · {s.qty[j]>0?`${s.qty[j]}件 · ${e.start.slice(5)} 至 ${e.end.slice(5)}`:'未参加'}</div><div className="calendar-track" role="img" aria-label={`${s.name}活动${e.id}：${s.qty[j]>0?`${e.start}至${e.end}，${s.qty[j]}件`:'未参加'}`}>{s.qty[j]>0&&<span className={`calendar-bar ${i?'second':'first'}`} style={{left:`${(day(e.start)-first)/span*100}%`,width:`${(day(e.end)-day(e.start)+1)/span*100}%`}}/>}{Number(plan.inbound.quantity)>0&&plan.inbound.confirmed&&<span className="calendar-arrival" style={{left:`${(day(plan.inbound.date)-first)/span*100}%`}}/>}</div></div>)}</div>)}
   <p className="plan-footnote">{Number(plan.inbound.quantity)>0?`${plan.inbound.confirmed?'橙色竖线：确认到货':'未计入库存：未确认到货'} ${plan.inbound.date}，${plan.inbound.quantity} 件。`:'当前未安排补货。'}{plan.exclusive?'已声明活动互斥，重叠参加会被阻断。':'日期重叠不自动等于冲突，按已声明约束检查。'}</p>
  </section></div>
 </section>;
}
