export const MONEY_FIELDS=['price','discount','cost','fulfillment','fee_percent'];
// Decimal strings become integer cents/basis points without binary-float parsing.
export function decimalUnits(raw,max){
 const value=raw.trim();
 if(!value)return {value:null,error:'missingMoney'};
 if(!/^\d+(\.\d{1,2})?$/.test(value))return {value:null,error:'invalidMoney'};
 const [whole,fraction='']=value.split('.');
 const units=BigInt(whole)*100n+BigInt(fraction.padEnd(2,'0'));
 if(units>BigInt(max))return {value:null,error:'moneyRange'};
 return {value:Number(units),error:null};
}
export function calculateContribution(row){
 const errors=[],inputs={};
 for(const field of MONEY_FIELDS){
  const parsed=decimalUnits(row[field],field==='fee_percent'?10000:100000000);
  inputs[field]=parsed.value;
  if(parsed.error)errors.push({field,reason:parsed.error});
 }
 if(inputs.price!==null&&inputs.discount!==null&&inputs.discount>inputs.price)errors.push({field:'discount',reason:'discountOverPrice'});
 if(errors.length)return {record_id:row.record_id,inputs,errors,net_cents:null,fee_cents:null,contribution_cents:null};
 const net=inputs.price-inputs.discount;
 const fee=Number((BigInt(net)*BigInt(inputs.fee_percent)+5000n)/10000n);
 return {record_id:row.record_id,inputs,errors,net_cents:net,fee_cents:fee,contribution_cents:net-inputs.cost-inputs.fulfillment-fee};
}
export function formatMoney(cents){return cents===null?'—':`${cents<0?'-':''}${Math.floor(Math.abs(cents)/100)}.${String(Math.abs(cents)%100).padStart(2,'0')}`;}
