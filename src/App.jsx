import React, {useEffect,useRef,useState} from 'react';
import {parseCSV,MAX_BYTES,InputError} from './core/csv.mjs';
import {newSession,editSession,inspectSession,resetDraft,isCurrent,EDITABLE} from './core/session.mjs';
import {diffRows,compareProblems} from './core/rules.mjs';
import {messages} from './i18n.js';
import TemplateDownload from './TemplateDownload.jsx';

function Icon({kind='check'}) {
 const paths={check:'m5 12 4 4 10-10',upload:'M12 16V4m-5 5 5-5 5 5M4 16v4h16v-4',arrow:'M5 12h14m-6-6 6 6-6 6',file:'M7 3h7l4 4v14H6V3m8 0v5h4',shield:'M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3'};
 return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={paths[kind]}/></svg>;
}
function Time({value}) { return <span className="time">{value || '—'}</span>; }
function ProblemList({result,rows,t,onSelect}) {
 if(!result) return <p className="muted">{t.pending}</p>;
 if(!result.problems.length) return <div className="clear-note"><Icon/><div><strong>{t.clear}</strong><p>{t.clearNote}</p></div></div>;
 return <div className="problem-list">{result.problems.map(p=><article className="problem" key={p.id}>
   <div className="problem-top"><span className="rule">{p.rule_id}</span><strong>{t.reasons[p.reason]}</strong></div>
   <p>{p.record_ids.map(id=>{const row=rows.find(r=>r.record_id===id);return `${t.record} ${row.source_record}: ${row.activity_id||'—'}`;}).join(' ↔ ')}</p>
   {p.reason==='overlap' ? <div className="evidence"><b>{p.values.minutes} {t.minutes}</b><span>{p.values.overlap_start} → {p.values.overlap_end} (UTC)</span></div> : <div className="evidence">{p.fields.map(f=><span key={f}>{t.fields[f]}: {p.record_ids.map(id=>rows.find(r=>r.record_id===id)[f]||'∅').join(' / ')}</span>)}</div>}
   <button className="text-button" onClick={()=>onSelect(p.record_ids[0])}>{t.jump} <span aria-hidden="true">↗</span></button>
 </article>)}</div>;
}

export default function App(){
 const [lang,setLang]=useState(()=>{try{return localStorage.getItem('promocheck.language')==='en'?'en':'zh';}catch{return 'zh';}});
 const [session,setSession]=useState(null),[selected,setSelected]=useState(null),[error,setError]=useState(null),[loading,setLoading]=useState(false);
 const request=useRef(0),fileRef=useRef(null),editorRef=useRef(null);
 const t=messages[lang],current=isCurrent(session),changes=session?diffRows(session.original,session.draft):[];
 const row=session?.draft.find(r=>r.record_id===selected),original=session?.original.find(r=>r.record_id===selected);
 const comparison=current&&session.originalResult?compareProblems(session.originalResult,session.draftResult):null;
 useEffect(()=>{document.documentElement.lang=lang==='zh'?'zh-CN':'en';document.title=lang==='zh'?'PromoCheck — 促销上线前检查':'PromoCheck — Promotion preflight';try{localStorage.setItem('promocheck.language',lang);}catch{}},[lang]);
 useEffect(()=>{if(!session)return;const warn=e=>{e.preventDefault();e.returnValue='';};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[!!session]);
 async function load(read,source){
   if(changes.length && !window.confirm(t.replaceConfirm))return;
   const ticket=++request.current; setLoading(true);setError(null);
   try{const text=await read();const rows=parseCSV(text);if(ticket!==request.current)return;setSession(newSession(rows,source));setSelected(rows[0].record_id);}
   catch(e){if(ticket===request.current)setError({code:e.code??'READ_ERROR',detail:e.detail??''});}
   finally{if(ticket===request.current)setLoading(false);}
 }
 function sample(name){load(async()=>{const res=await fetch(`/examples/${name}.csv`);if(!res.ok)throw new Error('READ_ERROR');return res.text();},{name:`${name}.csv`,synthetic:true});}
 function upload(e){const file=e.target.files?.[0];e.target.value='';if(!file)return;load(async()=>{if(file.size>MAX_BYTES)throw new InputError('FILE_TOO_LARGE');const bytes=await file.arrayBuffer();try{return new TextDecoder('utf-8',{fatal:true}).decode(bytes);}catch{throw new InputError('INVALID_UTF8');}},{name:file.name,synthetic:false});}
 function selectRow(id,scroll=false){setSelected(id);if(scroll)editorRef.current?.scrollIntoView({behavior:'smooth',block:'start'});}
 function check(){setSession(s=>inspectSession(s));}
 const toolbar=<><input ref={fileRef} type="file" accept=".csv,text/csv" onChange={upload} aria-label={t.import} className="sr-only"/><button className="button secondary" disabled={loading} onClick={()=>fileRef.current.click()}><Icon kind="upload"/>{t.import}</button></>;
 return <div className="app-shell">
  <header className="topbar"><a className="brand" href="#"><span className="brand-mark"><Icon/></span>PromoCheck<span className="version">0.1</span></a><div className="top-actions"><span className="privacy"><Icon kind="shield"/>{t.local}</span><button className="language" onClick={()=>setLang(l=>l==='zh'?'en':'zh')} aria-label={lang==='zh'?'Switch to English':'切换为中文'}>{lang==='zh'?'EN':'中文'}</button></div></header>
  <main>
   <div className="page-heading"><div><h1>{t.title}</h1><p>{t.intro}</p></div><div className="steps"><span className={!session?'active':''}><b>1</b>{t.step1}</span><i>—</i><span className={session&&!current?'active':''}><b>2</b>{t.step2}</span><i>—</i><span className={current?'active':''}><b>3</b>{t.step3}</span></div></div>
   {error&&<div role="alert" className="import-error"><strong>{t.errorTitle}</strong><p>{t.errors[error.code]??t.readError} {error.detail}</p></div>}
   {loading&&<p role="status">{t.loading}</p>}
   {!session?<>
    <section className="welcome"><div className="import-panel"><span className="file-mark"><Icon kind="file"/></span><h2>{t.emptyTitle}</h2><p>{t.emptyBody}</p><div className="welcome-buttons"><button className="button primary" disabled={loading} onClick={()=>sample('conflict')}>{t.sample}<Icon kind="arrow"/></button>{toolbar}</div><small>{t.emptyHint}</small><TemplateDownload lang={lang}/></div><div className="welcome-guide"><h2>{t.emptySide}</h2>{[['01',t.why1,t.why1b],['02',t.why2,t.why2b],['03',t.why3,t.why3b]].map(([n,h,p])=><div className="guide-step" key={n}><span>{n}</span><div><h3>{h}</h3><p>{p}</p></div></div>)}</div></section>
    <div className="sample-links"><span>{t.examples}</span><button onClick={()=>sample('clean')} disabled={loading}>{t.clean} ↗</button><button onClick={()=>sample('invalid')} disabled={loading}>{t.invalid} ↗</button></div>
   </>:<>
    <section className="source-bar"><div className="source-name"><Icon kind="file"/><div><strong>{session.source.name}</strong><small>{session.draft.length} {t.records} · {session.source.synthetic?t.synthetic:t.uploaded}</small></div></div><div className="source-actions"><button className="text-button" disabled={loading} onClick={()=>sample('conflict')}>{t.sample}</button>{toolbar}<button className="button primary" onClick={check} disabled={loading}><Icon/>{session.originalResult?t.recheck:t.check}</button></div></section>
    <div className={`state-bar ${current?'is-current':''}`} role="status"><span className="status-dot"/>{current?t.checked:session.originalResult?t.stale:t.pending}<span className="revision">{t.revision} {session.revision}</span></div>
    <div className="workspace"><section className="table-panel"><div className="section-heading"><div><h2>{t.tableTitle}</h2><p>{t.tableHint}</p></div><span className="count">{session.draft.length}</span></div><div className="table-scroll"><table><thead><tr><th>{t.activity}</th><th>{t.start}</th><th>{t.end}</th><th>{t.exclusive}</th><th>{t.status}</th><th><span className="sr-only">{t.review}</span></th></tr></thead><tbody>{session.draft.map(r=>{const issues=current?session.draftResult.problems.filter(p=>p.record_ids.includes(r.record_id)):[];return <tr className={r.record_id===selected?'selected':''} key={r.record_id}><td><strong>{r.activity_id||'—'}</strong><span className="product-id">{r.product_id||'—'}</span><small>{r.name||'—'}</small></td><td><Time value={r.start_at}/></td><td><Time value={r.end_at}/></td><td>{r.exclusive==='true'?t.yes:r.exclusive==='false'?t.no:r.exclusive||'—'}</td><td><span className={`status-tag ${current?(issues.length?'danger':'ok'):'pending'}`}>{current?(issues.length?`${t.issue} ${issues.length}`:t.normal):t.pending}</span></td><td><button className="row-button" aria-label={`${t.select} ${r.activity_id||r.record_id}`} onClick={()=>selectRow(r.record_id)}>{t.review} →</button></td></tr>})}</tbody></table></div></section>
    {row&&<section className="editor-panel" ref={editorRef}><div className="section-heading"><div><h2>{t.editor}</h2><p>{t.record} {row.source_record} · {original.activity_id||'—'}</p></div><span className="edit-indicator"/></div><form onSubmit={e=>{e.preventDefault();check();}}><div className="edit-fields">{EDITABLE.map(field=><label key={`${selected}-${field}`}><span>{t.fields[field]}{row[field]!==original[field]&&<b className="changed-label">{t.modified}</b>}</span>{field==='exclusive'?<select aria-label={t.fields[field]} value={row[field]} onChange={e=>setSession(s=>editSession(s,selected,field,e.target.value))}>{!['true','false'].includes(row[field])&&<option value={row[field]}>{row[field]||'—'}</option>}<option value="true">{t.yes} (true)</option><option value="false">{t.no} (false)</option></select>:<input spellCheck="false" type="text" aria-label={t.fields[field]} value={row[field]} onChange={e=>setSession(s=>editSession(s,selected,field,e.target.value))}/>}{row[field]!==original[field]&&<small className="original-value">{t.originalValue}: {original[field]||'∅'}</small>}</label>)}</div><p className="field-hint">{t.fieldHint}</p><p className="field-hint">{t.mutualHint}</p><button className="button primary editor-check" type="submit" disabled={loading}>{t.recheck}<Icon kind="arrow"/></button></form></section>}</div>
    <section className="comparison"><div className="section-heading"><div><h2>{t.comparison}</h2><p>{changes.length?`${changes.length} ${t.changes}`:t.noChanges}</p></div><button className="text-button" disabled={!changes.length} onClick={()=>{if(window.confirm(t.resetConfirm))setSession(s=>resetDraft(s));}}>{t.reset}</button></div>
    {!!changes.length&&<div className="change-list">{changes.map(c=><div key={`${c.record_id}-${c.field}`}><span>{c.record_id} · {t.fields[c.field]}</span><del>{c.before||'∅'}</del><b aria-hidden="true">→</b><ins>{c.after||'∅'}</ins></div>)}</div>}
    {comparison&&<div className="comparison-summary"><span><strong>{comparison.resolved.length}</strong>{t.resolved}</span><span><strong>{comparison.remaining.length}</strong>{t.remaining}</span><span><strong>{comparison.introduced.length}</strong>{t.introduced}</span></div>}
    <div className="comparison-grid"><div><h3>{t.originalIssues}<span>{session.originalResult?.problems.length??'—'}</span></h3><ProblemList result={session.originalResult} rows={session.original} t={t} onSelect={id=>selectRow(id,true)}/></div><div><h3>{t.currentIssues}<span>{current?session.draftResult.problems.length:'—'}</span></h3>{session.originalResult&&!current?<div className="stale-note"><strong>{t.stale}</strong><p>{t.staleHelp}</p></div>:<ProblemList result={session.draftResult} rows={session.draft} t={t} onSelect={id=>selectRow(id,true)}/>}</div></div></section>
    <div className="sample-links"><span>{t.examples}</span><button onClick={()=>sample('clean')}>{t.clean} ↗</button><button onClick={()=>sample('invalid')}>{t.invalid} ↗</button><TemplateDownload lang={lang}/></div>
   </>}
   <footer><p><Icon kind="shield"/>{t.scope}</p><p>{t.session}</p><p>{t.phase}</p></footer>
  </main>
 </div>;
}

