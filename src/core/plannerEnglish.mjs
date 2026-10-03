// Presentation translation only. The shared planner remains the calculation authority.
export const planNames={none:'Do not participate',all:'Both at full demand',a:'Activity A only',b:'Activity B only',custom:'Custom allocation'};
const exact={
 '期初':'Opening','实物 − 已占用 − 安全预留 − 普通销售预留':'Physical stock − occupied − safety − ordinary sales reserve',
 '确认到货（当日零点）':'Confirmed inbound (start of day)',
 'A、B销售日期重叠，且已声明互斥。':'Activity dates overlap and mutual exclusion is explicitly enabled.',
 '活动互斥标记无效。':'Invalid mutual-exclusion flag.', '到货信息无效。':'Invalid inbound information.',
 '到货日期无效。':'Invalid inbound date.', '活动编号或顺序无效。':'Invalid activity ID or order.',
 '自定义方案数量无效。':'Invalid custom allocation.', '此切片需要且仅支持两场活动。':'Exactly two activities are required.',
 '计划窗口不能超过90个自然日。':'The planning window must not exceed 90 calendar days.',
 '仅接受版本1的合成演示计划；真实数据适配尚未开放。':'Only schema version 1 synthetic plans are supported.',
 '计划文件须小于50KB。':'Plan files must be under 50 KB.', '不是有效的JSON计划。':'Invalid JSON plan.'
};
const labels={'实物库存':'Physical stock','已有订单占用':'Occupied stock','安全预留':'Safety reserve','普通销售预留':'Ordinary sales reserve','专项预算':'Campaign budget','到货数量':'Inbound quantity'};
export function englishMessage(text){
 if(exact[text])return exact[text];
 const patterns=[
 [/^期初预留已超过实物库存 (\d+) 件。$/,m=>`Opening reservations exceed physical stock by ${m[1]} units.`],
 [/^时间库存不足：最大缺口 (\d+) 件；后续到货不能补救先前缺口。$/,m=>`Stock shortage: ${m[1]} units. Later inbound cannot repair an earlier shortage.`],
 [/^专项投入超预算 ([\d.]+) 元。$/,m=>`Fixed spend exceeds budget by CNY ${m[1]}.`],
 [/^([AB])分配 (\d+) 件超过假设需求上限 (\d+) 件。$/,m=>`${m[1]} allocation ${m[2]} exceeds assumed demand cap ${m[3]}.`],
 [/^([AB])开始：预留 (\d+) 件，销售至 (.+)$/,m=>`${m[1]} starts: reserve ${m[2]} units; sales through ${m[3]}`],
 [/^([AB])日期无效，结束日不能早于开始日。$/,m=>`${m[1]}: invalid dates; end cannot precede start.`],
 ];
 for(const [pattern,format] of patterns){const m=text.match(pattern);if(m)return format(m);}
 const invalid=text.match(/^(.+)：请填写(.*)，不能留空。$/);
 if(invalid){const label=labels[invalid[1]]||invalid[1].replace(/^自定义([AB])分配$/,'Custom $1 allocation').replace(/^([AB])每件贡献$/,'$1 unit contribution').replace(/^([AB])固定投入$/,'$1 fixed spend').replace(/^([AB])需求上限$/,'$1 demand cap');return `${label}: required. ${invalid[2].includes('金额')?`Amount with up to 2 decimal places, absolute maximum CNY 1,000,000${invalid[2].includes('可正可负')?'; negative allowed':'; nonnegative'}.`:'Integer from 0 to 100,000.'}`;}
 return text;
}
