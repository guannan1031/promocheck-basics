import Papa from 'papaparse';

export const COLUMNS = ['activity_id','product_id','name','start_at','end_at','exclusive','price','discount','cost','fulfillment','fee_percent'];
export const MAX_BYTES = 1024 * 1024;
export class InputError extends Error {
  constructor(code, detail = '') { super(code); this.code = code; this.detail = detail; }
}
export function parseCSV(text) {
  if (typeof text !== 'string') throw new InputError('INVALID_TEXT');
  if (new TextEncoder().encode(text).length > MAX_BYTES) throw new InputError('FILE_TOO_LARGE');
  const parsed = Papa.parse(text.replace(/^\uFEFF/, ''), {delimiter:',', header:false, dynamicTyping:false, skipEmptyLines:false});
  if (parsed.errors.length) throw new InputError('MALFORMED_CSV', parsed.errors.map(e => `${e.code}:${(e.row ?? 0)+1}`).join(', '));
  // Skip blank physical records; comma-separated empty cells remain real records.
  const records = parsed.data.map((cells,index) => ({cells,record:index+1})).filter(r => !(r.cells.length === 1 && !r.cells[0].trim()));
  if (!records.length) throw new InputError('EMPTY_FILE');
  const header = records.shift().cells.map(s => s.trim());
  if (new Set(header).size !== header.length) throw new InputError('DUPLICATE_COLUMNS');
  const missing = COLUMNS.filter(c => !header.includes(c));
  const extra = header.filter(c => !COLUMNS.includes(c));
  if (missing.length || extra.length) throw new InputError('INVALID_COLUMNS', `missing=[${missing.join(', ')}]; extra=[${extra.join(', ')}]`);
  if (!records.length) throw new InputError('NO_RECORDS');
  if (records.length > 500) throw new InputError('TOO_MANY_RECORDS');
  return records.map(({cells,record},index) => {
    if (cells.length !== header.length) throw new InputError('ROW_WIDTH', String(record));
    const row = {record_id:`row-${index+1}`, source_record:record};
    for (let i=0;i<header.length;i++) row[header[i]]=cells[i];
    return row;
  });
}
