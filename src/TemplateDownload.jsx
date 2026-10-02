import React, {useState} from 'react';
import template from '../public/examples/clean.csv?raw';

export default function TemplateDownload({lang}) {
 const [shown,setShown]=useState(false);
 const zh=lang==='zh';
 function download(){
  const url=URL.createObjectURL(new Blob(['\uFEFF',template],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='promocheck-template.csv';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);
  setShown(true);
 }
 return <div className="template-download">
  <button type="button" className="text-button" onClick={download}>{zh?'下载 CSV 模板':'Download CSV template'} ↓</button>
  {shown&&<div className="template-help" role="status">
   <p>{zh?'已请求下载。如果没有保存提示，可复制下面的完整内容，保存为 UTF-8 编码的 promocheck-template.csv。':'Download requested. If no save prompt appears, copy the complete text below and save as UTF-8 promocheck-template.csv.'}</p>
   <textarea aria-label={zh?'CSV 模板内容':'CSV template contents'} readOnly value={template} onFocus={e=>e.target.select()} rows={5}/>
  </div>}
 </div>;
}
