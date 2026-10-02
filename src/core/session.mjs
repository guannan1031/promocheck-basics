import { checkRows } from './rules.mjs';
export const EDITABLE=['activity_id','product_id','name','start_at','end_at','exclusive'];
export function newSession(rows,source) {
  return {source,original:rows.map(r=>({...r})),draft:rows.map(r=>({...r})),revision:0,originalResult:null,draftResult:null,checkedRevision:null,review:null};
}
export function editSession(session,recordId,field,value) {
  if (!EDITABLE.includes(field) || typeof value!=='string' || !session.draft.some(r=>r.record_id===recordId)) throw new Error('INVALID_EDIT');
  if(session.draft.find(r=>r.record_id===recordId)[field]===value) return session;
  return {...session,draft:session.draft.map(r=>r.record_id===recordId?{...r,[field]:value}:r),revision:session.revision+1,draftResult:null,checkedRevision:null,review:null};
}
export function inspectSession(session) {
  return {...session,originalResult:session.originalResult ?? checkRows(session.original),draftResult:checkRows(session.draft),checkedRevision:session.revision,review:null};
}
export function resetDraft(session) {
  return {...session,draft:session.original.map(r=>({...r})),revision:session.revision+1,draftResult:null,checkedRevision:null,review:null};
}
export function isCurrent(session) {return !!session?.draftResult && session.revision===session.checkedRevision;}
