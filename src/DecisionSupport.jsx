import React,{useState} from 'react';
import {suggestAllocations,assessRisk,decisionText} from './core/advice.mjs';
const money=n=>new Intl.NumberFormat('zh-CN',{style:'currency',currency:'CNY'}).format(n/100);
export default function DecisionSupport({plan,result,selected,onSelect,onApply,revision,adjustment}){
 const suggestions=suggestAllocations(plan),risk=assessRisk(plan,selected),chosen=result.plans.find(s=>s.id===selected);
 const [report,setReport]=useState(null),[status,setStatus]=useState('');
 const binding=`${revision}:${selected}`,currentReport=report?.binding===binding?report.text:null;
 function createReport(){
  let text=decisionText(plan,selected,revision);
  if(adjustment)text+=`\n\n本轮分配调整：A/B ${adjustment.before.join('/')} → ${adjustment.after.join('/')} 件；只修改自定义分配。贡献 ${adjustment.beforeContribution===null?'原方案不可行':money(adjustment.beforeContribution)} → ${money(adjustment.afterContribution)}；假设下的方案差异，不是已实现增收。`;
  setReport({binding,text});setStatus('决策单已按当前输入生成；可下载或复制下方全文。');
 }
 function download(){const url=URL.createObjectURL(new Blob(['\uFEFF',currentReport],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`promocheck-decision-r${revision}.txt`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);setStatus('已请求下载；如未保存，可复制下方全文。');}
 return <section className="decision-support" aria-label="调整建议与决策风险">
  <h3>下一步可以怎么调整？</h3><p>在当前库存、日期、预算和需求上限下，尝试单场参加及两种分配顺序；仅列可执行候选，不改价格、不自动增加预算或补货。不是全局最优，也不是销量预测。</p>
  <div className="advice-grid">{suggestions.map((s,i)=><article className="advice-card" key={s.qty.join(',')}><span className="advice-label">{i===0?'这些调整候选中贡献最高':`备选 ${i+1}`}</span><h4>{s.method}</h4><p>A <b>{s.qty[0]}</b> 件 · B <b>{s.qty[1]}</b> 件</p><strong>{money(s.outcome.contribution)}</strong><small>预计活动贡献 · 投入 {money(s.outcome.investment)}</small><button className="plan-button" disabled={s.qty.every((q,j)=>q===Number(plan.custom[j]))} onClick={()=>onApply(s.qty)}>应用到自定义方案：{s.qty.join(' / ')}</button></article>)}</div>
  {suggestions.length===0&&<p className="plan-errors">没有找到可行调整。请先核对期初库存及已有占用，不能靠改销量掩盖库存账错误。</p>}
  <div className="risk-heading"><h3>这个方案能承受销量下降吗？</h3><label>查看风险与决策单的方案<select aria-label="风险分析方案" value={selected} onChange={e=>onSelect(e.target.value)}>{result.plans.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label></div>
  {!risk?<p className="plan-errors">{chosen?.name}目前不可执行。先解决库存、预算或排期约束，暂不生成收益压力测试和决策单。</p>:<>
   <div className="break-even-grid">{risk.thresholds.map(t=><article key={t.id}><h4>活动 {t.id} · 单场回本边界</h4>{!t.participating?<p>未参加，不发生该活动固定投入。</p>:t.breakEven===null?<p className="plan-bad">单位贡献不为正，不能依靠增加销量保证回本。{t.unitCents===0&&t.fixedCents===0?'本假设下贡献恒为0。':''}</p>:<><strong>{t.breakEven} 件</strong><p>固定投入 ÷ 每件贡献，向上取整。计划 {t.planned} 件，{t.planned>=t.breakEven?`比回本线多 ${t.planned-t.breakEven} 件`:`还差 ${t.breakEven-t.planned} 件回本`}。</p></>}</article>)}</div>
   <p>销量按当前分配的比例下降，并向下取整；已参加活动的固定投入保持 <b>{money(chosen.investment)}</b>，不会因为卖不出而消失。不计滞销占款/额外仓储等损失，需另行评估。</p>
   <div className="risk-scenarios">{risk.scenarios.map(r=><article key={r.percent} className={r.contribution<0?'risk-loss':''}><span>实现 {r.percent}% 计划销量</span><strong>{money(r.contribution)}</strong><small>A {r.qty[0]} / B {r.qty[1]} 件 · {r.contribution<0?'预计亏损':'预计活动贡献'}</small></article>)}</div>
   <details className="basis-note"><summary>结论依据与待确认事项</summary><ul><li>每件贡献 {plan.events.map(e=>`${e.id}：${e.unit}元`).join(' / ')} 是手工输入，尚无真实来源核验；应已扣净收入中的优惠、商品及每件可变成本，固定活动费用另扣。</li><li>需求上限是运营假设；两场可能相互分流，不能把独立的乐观销量直接相加。</li><li>仓储应确认已有占用和到货，财务应确认退款、补贴及税费口径；本版未包含这些不确定项的完整结算。</li><li>这是合成决策演示，不是经营成果证明；真实店铺试点仍待资料。</li></ul></details>
   <button className="plan-button primary" onClick={createReport}>生成{chosen.name}决策单</button>
   {currentReport&&<div className="decision-report"><p role="status">{status}</p><button className="plan-button" onClick={download}>下载决策单 TXT</button><label className="plan-field"><span>决策单全文（可复制）</span><textarea readOnly rows={9} value={currentReport}/></label></div>}
  </>}
 </section>;
}
