import React,{useEffect,useState} from 'react';
import {examplePlan,evaluatePlan,restorePlan} from './core/planner.mjs';
import './planner.css';

const money=v=>v===null?'不可计算':new Intl.NumberFormat('zh-CN',{style:'currency',currency:'CNY'}).format(v/100);
function Field({label,value,onChange,type='text'}){return <label className="plan-field"><span>{label}</span><input type={type} inputMode={type==='text'?'decimal':undefined} value={value} onChange={e=>onChange(e.target.value)}/></label>;}
export default function Planner(){
 const [plan,setPlan]=useState(examplePlan),[selected,setSelected]=useState('all'),[revision,setRevision]=useState(0),[buffer,setBuffer]=useState(''),[notice,setNotice]=useState('');
 const result=evaluatePlan(plan),detail=result.plans.find(p=>p.id===selected),best=result.plans.find(p=>p.id===result.best);
 const update=next=>{setPlan(next);setRevision(r=>r+1);setNotice('');};
 const field=(key,value)=>update({...plan,[key]:value});
 const event=(i,key,value)=>update({...plan,events:plan.events.map((e,j)=>j===i?{...e,[key]:value}:e)});
 useEffect(()=>{document.title='PromoCheck — 大促方案比较';document.documentElement.lang='zh-CN';},[]);
 useEffect(()=>{if(!revision)return;const warn=e=>{e.preventDefault();e.returnValue='';};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[revision]);
 function save(){
  const text=JSON.stringify(plan,null,2);setBuffer(text);
  const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`promocheck-plan-r${revision}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
  setNotice('已请求下载；也可复制下方完整JSON。刷新后不会自动保留，请保存文件再离开。');
 }
 function restore(text){try{update(restorePlan(text));setBuffer(text);setSelected('custom');setNotice('计划已恢复，所有结果已按输入重新计算。');}catch(e){setNotice(`恢复失败，当前计划保留：${e.message}`);}}
 return <div className="planner">
  <header className="plan-top"><a className="plan-brand" href="/">PromoCheck <span>大促经营规划</span></a><a href="?view=check">原促销检查工具 ↗</a></header>
  <main className="plan-main">
   <div className="plan-heading"><div><p className="plan-eyebrow">活动前 · 方案会审</p><h1>有限的库存和预算，怎么安排活动？</h1><p>改动假设，比较活动组合；先确认能执行，再讨论赚多少。</p></div><span className="plan-badge">合成演示 · 修订 {revision}</span></div>
   <div className="plan-notice"><strong>这是模型演示，未接入真实店铺。</strong> 单SKU、两场活动、人民币。销量由你假设，不是预测；结果不代表实际收益。修改即时重算，页面关闭后不自动保存。</div>
   <section className="plan-card"><h2>1. 先确定可用资源</h2><p>这里填实物库存；已有订单、安全库存和整个窗口的普通销售各预留一次。不能把已经扣过占用的“可售库存”再填入实物栏。</p>
    <div className="plan-fields">{Object.entries({stock:'实物库存（件）',occupied:'已有订单占用（件）',safety:'安全预留（件）',baseline:'普通销售预留（件）',budget:'活动专项预算（元）'}).map(([key,label])=><Field key={key} label={label} value={plan[key]} onChange={v=>field(key,v)}/>)}</div>
    <div className="plan-inbound"><Field label="补货数量（件）" value={plan.inbound.quantity} onChange={v=>field('inbound',{...plan.inbound,quantity:v})}/><Field label="到货日期" type="date" value={plan.inbound.date} onChange={v=>field('inbound',{...plan.inbound,date:v})}/><label className="plan-check"><input type="checkbox" checked={plan.inbound.confirmed} onChange={e=>field('inbound',{...plan.inbound,confirmed:e.target.checked})}/>确认可在到货日零点使用</label></div>
    <p className="plan-footnote">未确认的补货不计入可用量。普通销售预留在期初扣除，活动销量在开始日一次性预留；这是保守规划，不模拟每日卖出节奏。</p>
   </section>
   <section className="plan-card"><h2>2. 两场活动分别怎么做</h2><p>每件贡献＝净收入 − 商品成本 − 每件可变费用。活动广告、报名等固定投入在下方另扣一次。未知费用不能按0填。</p>
    <div className="plan-events">{plan.events.map((e,i)=><div className="plan-event" key={e.id}><h3>活动 {e.id}</h3><div className="plan-fields"><Field label={`${e.id}开始日期`} type="date" value={e.start} onChange={v=>event(i,'start',v)}/><Field label={`${e.id}结束日期`} type="date" value={e.end} onChange={v=>event(i,'end',v)}/><Field label={`${e.id}每件贡献（元）`} value={e.unit} onChange={v=>event(i,'unit',v)}/><Field label={`${e.id}固定投入（元）`} value={e.fixed} onChange={v=>event(i,'fixed',v)}/><Field label={`${e.id}假设需求上限（件）`} value={e.demand} onChange={v=>event(i,'demand',v)}/></div></div>)}</div>
    <label className="plan-check"><input type="checkbox" checked={plan.exclusive} onChange={e=>field('exclusive',e.target.checked)}/>这两场活动明确互斥：销售日期重叠时不能同时参加</label><p className="plan-footnote">北京时间自然日，结束日包含在活动中。不自动推断平台规则。自定义销量还需自行评估两场活动之间的需求替代。</p>
   </section>
   <section className="plan-card"><h2>3. 比较安排，查看取舍</h2><div className="plan-inbound">{plan.custom.map((q,i)=><Field key={i} label={`自定义 ${['A','B'][i]} 分配（件）`} value={q} onChange={v=>field('custom',plan.custom.map((x,j)=>i===j?v:x))}/>)}</div>
    {result.errors.length>0?<div role="alert" className="plan-errors"><strong>先补齐输入，暂不显示方案结论</strong><ul>{result.errors.map((e,i)=><li key={i}>{e}</li>)}</ul></div>:<>
     <div className="plan-summary" aria-live="polite"><strong>期初活动可用 {result.initial} 件</strong><span>{best?`当前候选中贡献最高：${result.ties.join(' / ')}，${money(best.contribution)}`:'没有可行方案，请先处理资源缺口。'}</span><small>含“不参加”基准；仅比较下表候选，不是全局最优，也未衡量自然销售被挤占的利润。</small></div>
     <div className="plan-scroll"><table className="plan-table"><thead><tr><th>方案 / 库存分配</th><th>专项投入</th><th>可执行性</th><th>预计活动贡献</th><th>贡献 ÷ 投入</th><th>查看</th></tr></thead><tbody>{result.plans.map(s=><tr key={s.id} className={selected===s.id?'plan-selected':''}><th scope="row">{s.name}<small>A {s.qty[0]} / B {s.qty[1]} 件</small></th><td>{money(s.investment)}</td><td className={s.feasible?'plan-ok':'plan-bad'}>{s.feasible?'可行':'不可行'}</td><td>{s.contribution===null?'—（约束未满足）':money(s.contribution)}</td><td>{s.returnRate===null?'—':`${(s.returnRate*100).toFixed(1)}%`}</td><td><button className="plan-button" onClick={()=>setSelected(s.id)} aria-pressed={selected===s.id}>查看{s.name}</button></td></tr>)}</tbody></table></div>
     <p className="plan-footnote">贡献＝A销量×A每件贡献＋B销量×B每件贡献−已参加活动的固定投入。不是净利润，不是广告ROAS；专项投入为0时回报率无定义。不参加记0，仅作为活动账基准。</p>
     {detail&&<div className="plan-detail"><h3>{detail.name} · 决策依据</h3>{detail.reasons.length>0?<div className="plan-errors"><ul>{detail.reasons.map((r,i)=><li key={i}>{r}</li>)}</ul><p>忽略约束的条件算术值：{money(detail.conditional)}。此数值不能视为可实现收益。</p></div>:<p>在当前假设下可执行，预计活动贡献 <strong>{money(detail.contribution)}</strong>。{detail.contribution<0?'该方案预计亏损。':'仍须由运营和财务确认假设。'}</p>}
      <div className="plan-scroll"><table className="plan-table"><caption>时间库存账（按事件日期排序）</caption><thead><tr><th>日期</th><th>发生什么</th><th>变化（件）</th><th>余量（件）</th></tr></thead><tbody>{detail.ledger.map((r,i)=><tr key={i}><td>{r.date}</td><td>{r.label}</td><td>{r.change}</td><td className={r.balance<0?'plan-bad':''}>{r.balance}</td></tr>)}</tbody></table></div>
     </div>}
    </>}
   </section>
   <section className="plan-card"><h2>4. 保存这次方案，之后继续比较</h2><p>只保存输入假设。恢复时重新计算，文件中的额外结果不会被采信。当前格式只支持合成演示，不接受真实订单资料。</p><div className="plan-actions"><button className="plan-button primary" disabled={result.errors.length>0} onClick={save}>下载计划 JSON</button><label className="plan-file">导入计划文件<input aria-label="导入计划文件" type="file" accept=".json,application/json" onChange={async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;if(file.size>50000){setNotice('恢复失败：计划文件须小于50KB。');return;}try{restore(await file.text());}catch{setNotice('文件读取失败，当前计划保留。');}}}/></label></div><label className="plan-field"><span>计划JSON（下载备用复制 / 粘贴恢复）</span><textarea value={buffer} onChange={e=>setBuffer(e.target.value)} rows={5} maxLength={50000}/></label><button className="plan-button" disabled={!buffer} onClick={()=>restore(buffer)}>从文本恢复计划</button><p role="status" className="plan-status">{notice}</p></section>
   <footer>演示模型 v0.2 · 未计企业固定开销、税务及未经确认的退款补贴 · 暂无真实平台接入或商业效果验证</footer>
  </main>
 </div>;
}
