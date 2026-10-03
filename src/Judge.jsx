import React,{useEffect,useState} from 'react';
import {examplePlan,evaluatePlan,restorePlan} from './core/planner.mjs';
import {suggestAllocations,assessRisk} from './core/advice.mjs';
import {englishMessage,planNames} from './core/plannerEnglish.mjs';
import './planner.css';
import './judge.css';
const money=n=>n===null?'Not executable':new Intl.NumberFormat('en',{style:'currency',currency:'CNY'}).format(n/100);
function Field({label,value,onChange,type='text'}){return <label className="plan-field"><span>{label}</span><input type={type} value={value} onChange={e=>onChange(e.target.value)}/></label>;}
function download(text,name,type){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
export default function Judge(){
 const [plan,setPlan]=useState(examplePlan),[selected,setSelected]=useState('all'),[revision,setRevision]=useState(0),[undo,setUndo]=useState(null),[report,setReport]=useState(''),[buffer,setBuffer]=useState(''),[notice,setNotice]=useState('');
 const result=evaluatePlan(plan),chosen=result.plans.find(s=>s.id===selected),risk=assessRisk(plan,selected),suggestions=suggestAllocations(plan);
 useEffect(()=>{document.title='PromoCheck — Campaign decision workbench';document.documentElement.lang='en';},[]);
 useEffect(()=>{if(!revision)return;const warn=e=>{e.preventDefault();e.returnValue='';};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[revision]);
 function update(next){setPlan(next);setRevision(n=>n+1);setReport('');setNotice('');setUndo(null);}
 function select(id){setSelected(id);setReport('');setNotice('');}
 function apply(qty){const before={custom:[...plan.custom],contribution:result.plans.find(s=>s.id==='custom').contribution};update({...plan,custom:qty.map(String)});setUndo(before);setSelected('custom');}
 const change=(key,value)=>update({...plan,[key]:value});
 const event=(i,key,value)=>update({...plan,events:plan.events.map((e,j)=>i===j?{...e,[key]:value}:e)});
 function createReport(){
  if(!chosen?.feasible||!risk)return;
  setReport([
   'PromoCheck decision record — SYNTHETIC / PENDING HUMAN REVIEW',`Created: ${new Date().toISOString()} | Revision: ${revision}`,
   `Plan: ${planNames[selected]} | A ${chosen.qty[0]} / B ${chosen.qty[1]} units`,
   `Fixed spend: ${money(chosen.investment)} | Assumed campaign contribution: ${money(chosen.contribution)}`,
   'Contribution = allocated units × unit contribution − participating activities’ fixed spend.',
   undo?`Allocation changed: ${undo.custom.join('/')} → ${plan.custom.join('/')} | Contribution: ${money(undo.contribution)} → ${money(chosen.contribution)}. Hypothetical difference, not realized revenue.`:'',
   'Unit contribution and demand are manual, unverified assumptions. Variable costs must already be deducted; fixed spend is deducted separately.',
   'DATES: Beijing calendar days, end inclusive; stock reserved once at each activity start. Confirmed inbound is available at start of arrival day.',
   'INPUTS (complete; derived values are not trusted on restore):',JSON.stringify(plan,null,2),
   'STOCK LEDGER:',...chosen.ledger.map(r=>`${englishMessage(r.date)} | ${englishMessage(r.label)} | change ${r.change} | balance ${r.balance}`),
   'BREAK-EVEN:',...risk.thresholds.map(t=>`${t.id}: ${!t.participating?'not participating':t.breakEven===null?'nonpositive unit contribution; no positive-sales break-even guarantee':`${t.breakEven} units; planned ${t.planned}`}`),
   'DOWNSIDE (original fixed spend retained):',...risk.scenarios.map(s=>`${s.percent}% sales | A/B ${s.qty.join('/')} | contribution ${money(s.contribution)}`),
   'Review pending: operations (demand substitution/rules), warehouse (stock/inbound), finance (costs, refunds, subsidies and taxes).',
   'Single SKU, two activities. Excludes company overhead, unconfirmed settlement costs, displaced ordinary-sales profit and extra storage losses. Not net profit, ad ROAS or realized ROI. No merchant validation or platform execution.',
   'Independent snapshot; regenerate after editing. Save plan JSON for replay.'
  ].filter(Boolean).join('\n'));setNotice('Record generated for current inputs. Copy or download below.');
 }
 function restore(){try{update(restorePlan(buffer));setSelected('custom');setNotice('Plan restored and all results recalculated.');}catch(e){setNotice(e.message.split('\n').map(englishMessage).join('\n'));}}
 return <div className="planner judge"><header className="plan-top"><a className="plan-brand" href="?view=judge">PromoCheck <span>Campaign decisions</span></a><a href="/">中文工作台</a><a href="?view=check">CSV preflight ↗</a></header><main className="plan-main">
  <div className="plan-heading"><div><p className="plan-eyebrow">BEFORE YOU COMMIT STOCK & BUDGET</p><h1>Which campaign can you actually run?</h1><p>Compare allocations, inspect the downside, and keep the decision evidence.</p></div><span className="plan-badge">SYNTHETIC · Revision {revision}</span></div>
  <p className="plan-notice"><strong>Working model, no connected store.</strong> One SKU, two activities, CNY. Demand is an assumption, not a forecast. No realized ROI claim. Changes stay in this tab until saved.</p>
  <section className="plan-card"><h2>1. Inspect the assumptions</h2><div className="plan-fields">{Object.entries({stock:'Physical stock',occupied:'Occupied by orders',safety:'Safety reserve',baseline:'Ordinary sales reserve',budget:'Campaign budget (CNY)'}).map(([key,label])=><Field key={key} label={label} value={plan[key]} onChange={v=>change(key,v)}/>)}</div>
   <p>Enter physical stock, not stock already reduced by reservations. Opening availability deducts occupied, safety and ordinary-sales reserves once.</p>
   <div className="plan-inbound"><Field label="Inbound units" value={plan.inbound.quantity} onChange={v=>change('inbound',{...plan.inbound,quantity:v})}/><Field label="Arrival date" type="date" value={plan.inbound.date} onChange={v=>change('inbound',{...plan.inbound,date:v})}/><label className="plan-check"><input type="checkbox" checked={plan.inbound.confirmed} onChange={e=>change('inbound',{...plan.inbound,confirmed:e.target.checked})}/>Confirmed available at start of arrival day</label></div>
   <div className="plan-events">{plan.events.map((e,i)=><div className="plan-event" key={e.id}><h3>Activity {e.id}</h3><div className="plan-fields">{Object.entries({start:'Start',end:'End',unit:'Unit contribution (CNY)',fixed:'Fixed spend (CNY)',demand:'Assumed demand cap'}).map(([key,label])=><Field key={key} label={`${e.id} ${label}`} value={e[key]} type={['start','end'].includes(key)?'date':'text'} onChange={v=>event(i,key,v)}/>)}</div></div>)}</div>
   <label className="plan-check"><input type="checkbox" checked={plan.exclusive} onChange={e=>change('exclusive',e.target.checked)}/>Explicitly mutually exclusive when dates overlap</label>
   <p className="plan-footnote">Unit contribution = net revenue − product cost − variable costs per unit. Fixed campaign spend is deducted separately. Unknown costs must not be entered as zero. Beijing calendar dates include the end day. All allocated stock is reserved at activity start; unconfirmed inbound is excluded. Platform rules are not inferred.</p>
  </section>
  <section className="plan-card"><h2>2. Compare feasible choices</h2><div className="plan-inbound">{plan.custom.map((q,i)=><Field key={i} label={`Custom ${['A','B'][i]} units`} value={q} onChange={v=>change('custom',plan.custom.map((x,j)=>i===j?v:x))}/>)}</div>
   {result.errors.length?<div role="alert" className="plan-errors"><strong>Complete valid inputs before comparing results.</strong><ul>{result.errors.map((e,i)=><li key={i}>{englishMessage(e)}</li>)}</ul></div>:<>
    <div className="plan-summary"><strong>Opening campaign stock: {result.initial} units</strong><span>{result.best?`Highest contribution among these candidates: ${result.plans.filter(s=>s.feasible&&s.contribution===result.plans.find(p=>p.id===result.best).contribution).map(s=>planNames[s.id]).join(' / ')}`:'No feasible candidates.'}</span><small>Finite candidate comparison; not a global optimum. “Do not participate” is a zero campaign-account baseline, excluding ordinary-sales profit.</small></div>
    <div className="judge-candidates">{result.plans.map(s=><article className={`advice-card ${selected===s.id?'judge-selected':''}`} key={s.id}><h3>{planNames[s.id]}</h3><p>A {s.qty[0]} / B {s.qty[1]} units</p><strong>{money(s.contribution)}</strong><small>Assumed campaign contribution</small><p>Fixed spend {money(s.investment)}<br/>Stock shortage: {s.shortage} units</p><span className={s.feasible?'plan-ok':'plan-bad'}>{s.feasible?'Feasible under assumptions':'Blocked'}</span><button className="plan-button" aria-pressed={selected===s.id} onClick={()=>select(s.id)}>Inspect {planNames[s.id]}</button></article>)}</div>
    <h3>Try a feasible adjustment</h3><p>Tests no participation, single activities and two allocation priorities. Suggestions never increase stock, budget or demand; there is no sales forecast.</p><div className="advice-grid">{suggestions.map((s,i)=><article className="advice-card" key={s.qty.join(',')}><small>{i===0?'Highest contribution among adjustments':`Alternative ${i+1}`}</small><h3>A {s.qty[0]} / B {s.qty[1]}</h3><strong>{money(s.outcome.contribution)}</strong><small>Fixed spend {money(s.outcome.investment)}</small><button className="plan-button" disabled={s.qty.every((q,j)=>q===Number(plan.custom[j]))} onClick={()=>apply(s.qty)}>Apply {s.qty.join(' / ')}</button></article>)}</div>
    {!suggestions.length&&<p>No feasible adjustment found. Check opening reservations first.</p>}
    {undo&&<div className="plan-summary"><strong>Custom A/B: {undo.custom.join(' / ')} → {plan.custom.join(' / ')}</strong><span>Assumed contribution: {money(undo.contribution)} → {money(result.plans.find(s=>s.id==='custom').contribution)}. This is a scenario difference, not realized income.</span><button className="plan-button" onClick={()=>update({...plan,custom:undo.custom})}>Undo allocation</button><small>The next input edit clears this one-step undo.</small></div>}
    <h3>Selected: {planNames[selected]}</h3>{chosen.reasons.length>0&&<div className="plan-errors"><ul>{chosen.reasons.map((r,i)=><li key={i}>{englishMessage(r)}</li>)}</ul></div>}
    <div className="plan-scroll"><table className="plan-table"><caption>Stock ledger in event-date order</caption><thead><tr><th>Date</th><th>Movement</th><th>Units</th><th>Remaining</th></tr></thead><tbody>{chosen.ledger.map((r,i)=><tr key={i}><td>{englishMessage(r.date)}</td><td>{englishMessage(r.label)}</td><td>{r.change}</td><td className={r.balance<0?'plan-bad':''}>{r.balance}</td></tr>)}</tbody></table></div>
    <h3>3. Test the downside before committing</h3>{!risk?<p className="plan-errors">Resolve constraints before generating a risk assessment or decision record.</p>:<>
     <div className="break-even-grid">{risk.thresholds.map(t=><article key={t.id}><h4>Activity {t.id} break-even</h4><strong>{!t.participating?'Not participating':t.breakEven===null?'No positive-sales guarantee':`${t.breakEven} units`}</strong><p>{t.participating?`Planned: ${t.planned}. Fixed spend divided by positive unit contribution, rounded up.`:'No fixed campaign spend incurred.'}</p></article>)}</div>
     <p>Retain original fixed spend of <b>{money(chosen.investment)}</b>, even at zero sales. Sales are rounded down. Extra storage and unsold-stock capital costs are excluded.</p><div className="risk-scenarios">{risk.scenarios.map(s=><article key={s.percent} className={s.contribution<0?'risk-loss':''}><span>{s.percent}% of planned sales</span><strong>{money(s.contribution)}</strong><small>A {s.qty[0]} / B {s.qty[1]} units</small></article>)}</div>
     <p className="plan-footnote">Contribution is not net profit or ad ROAS. It excludes company overhead, unconfirmed taxes/refunds/subsidies and displaced ordinary-sales profit. Costs and demand sources are unverified; operations, warehouse and finance must review.</p>
     <button className="plan-button primary" onClick={createReport}>Generate decision record</button>{report&&<div className="decision-report"><button className="plan-button" onClick={()=>{download('\uFEFF'+report,`promocheck-decision-en-r${revision}.txt`,'text/plain;charset=utf-8');setNotice('Download requested. If unavailable, copy the full record below.');}}>Download decision TXT</button><label className="plan-field"><span>Decision record (copy fallback)</span><textarea readOnly rows={8} value={report}/></label></div>}
    </>}
   </>}
  </section>
  <section className="plan-card"><h2>4. Save inputs for replay</h2><p>Export inputs only; restore validates and recalculates. Version 1 synthetic plans only, under 50 KB. Keep real order data out of this demo.</p><button className="plan-button" disabled={!!result.errors.length} onClick={()=>{const text=JSON.stringify(plan,null,2);setBuffer(text);download(text,'promocheck-plan.json','application/json');setNotice('Download requested; copy fallback is below.');}}>Save plan JSON</button><label className="plan-field"><span>Plan JSON (copy / paste to restore)</span><textarea value={buffer} onChange={e=>setBuffer(e.target.value)} maxLength={50000} rows={5}/></label><button className="plan-button" disabled={!buffer} onClick={restore}>Restore plan JSON</button><p role="status">{notice}</p></section>
  <footer>Local synthetic model · No merchant validation, automatic execution or award claim · English campaign workflow; CSV preflight has its own EN switch.</footer>
 </main></div>;
}
