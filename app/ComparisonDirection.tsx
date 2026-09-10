"use client";

import {useEffect,useMemo,useState} from "react";
import {createPortal} from "react-dom";
import {BarChart3,Monitor,Printer,ShieldCheck,Users} from "lucide-react";

type Target={id:string|number;clinicName:string;region:string;currentVanDealer?:string;createdAt:string;devices?:string[];linkedServices?:string[];inconveniences?:string[];contractTerms?:string[];terminalUsePeriod?:string;contractEndDate?:string;monthlyCost?:string;managementFee?:string;linkFee?:string};
type Summary={targets?:Target[]};

const sections=[
 {name:"사용성",items:["단말기 이용","승인 정산","PMS연동"]},
 {name:"기본비용",items:["단말기","관리비","연동비","소모품"]},
 {name:"사용조건",items:["의무사용","대응채널","내방상담","출장수리","위약금"]},
 {name:"특별지원",items:["현금지원","타서비스"]}
];
const notes:Record<string,string>={"단말기":"단말기+멀티패드 기준","연동비":"원클릭 기준","소모품":"년 1회 사용 기준","현금지원":"기본비용 차이 확인","타서비스":"합법적 범위에서만"};
const money=(v="")=>Number((v.match(/[\d,]+/)?.[0]??"0").replaceAll(",",""))||0;
const three=(v:string,fallback:number)=>`${(money(v)*36||fallback).toLocaleString("ko-KR")}원/3년`;
const has=(a:string[]|undefined,v:string)=>(a??[]).includes(v);
function currentValue(label:string,t?:Target){
 if(label==="단말기 이용")return (t?.devices??[]).join(", ")||"단말기(유선), 멀티패드";
 if(label==="승인 정산")return has(t?.inconveniences,"정산/입금")?"정산입금 불편":"일상업무";
 if(label==="PMS연동")return has(t?.linkedServices,"PMS/EMR")?"연동중":"없음";
 if(label==="단말기")return three(t?.monthlyCost??"",360000);
 if(label==="관리비")return three(t?.managementFee??"",360000);
 if(label==="연동비")return has(t?.linkedServices,"PMS/EMR")?three(t?.linkFee??"",540000):"해당없음";
 if(label==="소모품")return has(t?.contractTerms,"소모품")?"0원/3년":"90,000원/3년";
 if(label==="의무사용")return t?.terminalUsePeriod||"3년";
 if(label==="대응채널")return "전화상담";
 if(label==="내방상담")return "없음";
 if(label==="출장수리")return "유료(구매시)";
 if(label==="위약금")return "기기값 2~3배";
 if(label==="현금지원")return has(t?.contractTerms,"현금지원")?"Y":"-";
 if(label==="타서비스")return (t?.contractTerms??[]).filter(x=>["무료기기","월비용면제","매출지원","리베이트","타서비스 지원"].includes(x)).join(", ")||"-";
 return "";
}
function osstemValue(label:string){return ({
 "단말기 이용":"동일하게 제공","승인 정산":"동일하게 제공","PMS연동":"PMS 여부/종류 무관하게 서비스",
 "단말기":"252,000원/3년","관리비":"108,000원/3년","연동비":"0원/3년","소모품":"0원/3년",
 "의무사용":"3년 (동일)","대응채널":"전화, 영업사원, 웹 플랫폼","내방상담":"영업사원 수시방문",
 "출장수리":"무료(임대시)","위약금":"할부 잔금","현금지원":"-","타서비스":"-"
} as Record<string,string>)[label]||""}

export default function ComparisonDirection(){
 const [host,setHost]=useState<HTMLElement|null>(null),[targets,setTargets]=useState<Target[]>([]),[selected,setSelected]=useState(""),[current,setCurrent]=useState<Record<string,string>>({}),[osstem,setOsstem]=useState<Record<string,string>>({});
 useEffect(()=>{const find=()=>{const el=document.querySelector<HTMLElement>(".compare-page");if(el){el.classList.add("comparison-direction-host");setHost(el)}else setHost(null)};find();const obs=new MutationObserver(find);obs.observe(document.body,{childList:true,subtree:true});return()=>obs.disconnect()},[]);
 useEffect(()=>{if(!host)return;fetch("/api/surveys",{cache:"no-store"}).then(r=>r.ok?r.json():{}).then((x:Summary)=>setTargets(x.targets??[])).catch(()=>setTargets([]))},[host]);
 const target=useMemo(()=>targets.find(x=>String(x.id)===selected),[targets,selected]);
 useEffect(()=>{const c:Record<string,string>={},o:Record<string,string>={};sections.forEach(s=>s.items.forEach(i=>{c[i]=currentValue(i,target);o[i]=osstemValue(i)}));setCurrent(c);setOsstem(o)},[target]);
 const total=["단말기","관리비","연동비","소모품"].reduce((s,k)=>s+money(current[k]??""),0),base=selected&&total>0?total:1350000,saving=Math.max(0,base-360000),savingLabel=`약 ${Math.round(saving/10000)}만원 절감`,currentLabel=`${Math.round(base/10000)}만원/3년`;
 if(!host)return null;
 const Table=({name,items}:{name:string;items:string[]})=><section className="cd-block"><h3>{name}</h3><div className="cd-scroll"><table className="cd-table"><colgroup><col className="c1"/><col className="c2"/><col className="c3"/><col className="c4"/></colgroup><thead><tr><th>항목</th><th>현재 사용</th><th>오스템</th><th>비고</th></tr></thead><tbody>{items.map(item=><tr key={item}><th scope="row">{item}</th><td contentEditable suppressContentEditableWarning onBlur={e=>setCurrent(v=>({...v,[item]:e.currentTarget.textContent||""}))}>{current[item]??""}</td><td className="osstem" contentEditable suppressContentEditableWarning onBlur={e=>setOsstem(v=>({...v,[item]:e.currentTarget.textContent||""}))}>{osstem[item]??""}</td><td>{notes[item]??""}</td></tr>)}</tbody></table></div></section>;
 return createPortal(<div className="comparison-direction-portal"><style>{`
 .comparison-direction-host>.compare-tools,.comparison-direction-host>.compare-sheet{display:none!important}
 .comparison-direction-portal{font-family:"Malgun Gothic","Apple SD Gothic Neo",sans-serif;color:#222;width:100%}
 .cd-tools{display:flex;gap:10px;align-items:center;margin:0 auto 12px;max-width:1100px}.cd-tools select,.cd-tools button{border:1px solid #ddd;background:#fff;border-radius:8px;padding:9px 12px}.cd-tools select{min-width:330px}.cd-tools button{margin-left:auto;display:flex;gap:6px;align-items:center;font-weight:800}
 .cd-sheet{position:relative;width:min(100%,1100px);margin:auto;background:#fff;border:1px solid #eadbcf;box-shadow:0 10px 28px rgba(83,56,38,.08);padding:22px 28px 30px;box-sizing:border-box}.cd-ribbon{position:absolute;left:0;top:0;background:#ef5b20;color:#fff;font-size:19px;font-weight:900;padding:10px 38px;border-radius:0 0 8px 0}.cd-logo{position:absolute;right:24px;top:13px;width:118px}.cd-hero{text-align:center;padding:38px 120px 18px}.cd-hero h1{font-size:clamp(24px,3.6vw,38px);line-height:1.08;margin:0;font-weight:900;letter-spacing:-.055em}.cd-hero h1 b{color:#ef5b20}.cd-hero p{margin:9px 0 0;color:#777;font-size:12px}
 .cd-frame{border:1px solid #ead8cc;border-radius:14px;padding:18px;background:#fffdfb;box-sizing:border-box;width:100%}.cd-block{display:grid;grid-template-columns:92px minmax(0,1fr);gap:10px;align-items:start;margin:0 0 14px}.cd-block h3{margin:12px 0 0;color:#e05819;font-size:22px;line-height:1.1;font-weight:900;letter-spacing:-.04em}.cd-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;width:100%}
 .cd-table{width:100%;min-width:720px;border-collapse:collapse;table-layout:fixed;background:#fff;border-top:2px solid #666;border-bottom:1px solid #666}.cd-table col.c1{width:19%}.cd-table col.c2{width:29%}.cd-table col.c3{width:31%}.cd-table col.c4{width:21%}.cd-table th,.cd-table td{border:1px solid #cfcfcf;padding:10px 7px;text-align:center;vertical-align:middle;font-size:12px;line-height:1.35;word-break:keep-all;overflow-wrap:break-word;box-sizing:border-box}.cd-table thead th{background:#dedede;font-weight:900}.cd-table tbody th{background:#faf7f3;font-weight:800}.cd-table td.osstem{background:#fff1e8;color:#df5218;font-weight:900}.cd-table td[contenteditable=true]{outline:0}.cd-table td[contenteditable=true]:focus{box-shadow:inset 0 0 0 2px rgba(239,91,32,.22)}
 .bts{position:relative;margin-top:16px;border-top:4px solid #ef5b20;padding-top:16px}.bts-title{display:flex;align-items:flex-end;gap:10px}.bts-title strong{font-size:50px;color:#ef5b20;line-height:.9}.bts-title h2{font-size:31px;margin:0;letter-spacing:-.04em}.bts-sub{font-size:13px;color:#777;margin:7px 0 16px}.bts-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.bts-card{border:1px solid #eadcd1;border-radius:14px;padding:14px 12px;background:#fff;min-height:170px}.bts-head{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:900}.bts-icon{width:40px;height:40px;border-radius:50%;background:#fff0e7;display:grid;place-items:center;color:#ef5b20}.bts-desc{font-size:10.5px;color:#666;line-height:1.45;margin:5px 0 10px}.bts-flow{display:grid;grid-template-columns:1fr 20px 1fr;gap:4px;align-items:center}.bts-before,.bts-after{padding:10px 5px;text-align:center;border-radius:7px;font-size:10.5px;line-height:1.4;font-weight:800;min-height:70px;display:flex;align-items:center;justify-content:center}.bts-before{background:#eef1f4}.bts-after{background:#fff0e6;color:#df5318}.bts-arrow{text-align:center;color:#ef5b20;font-size:20px;font-weight:900}.bts-benefit{text-align:center;margin-top:7px;color:#ef5b20;font-size:12px;font-weight:900}.saving-band{margin-top:12px;background:linear-gradient(90deg,#ef5b20,#ff751f);color:#fff;border-radius:9px;padding:15px 20px;display:grid;grid-template-columns:1fr auto;align-items:center;gap:20px}.saving-band strong{font-size:20px}.saving-band span{font-size:34px;font-weight:900;white-space:nowrap}.mentor-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:10px}.mentor{border:1px solid #f0c9b1;border-radius:14px;padding:13px;background:#fffaf6}.mentor h3{font-size:15px;margin:0 0 6px}.mentor p{font-size:10.5px;color:#555;line-height:1.5;margin:0}.mentor-note{margin-top:10px;padding:9px;border:1px solid #f2c6ad;border-radius:9px;background:#fff;font-size:10px;line-height:1.5}.mentor-note b{color:#ef5b20}.cd-footer{display:flex;align-items:center;justify-content:space-between;margin-top:16px;color:#777;font-size:10px;gap:10px}.cd-footer img{width:92px}
 @media(max-width:900px){.cd-sheet{padding:18px 10px 24px}.cd-hero{padding:40px 80px 14px}.cd-frame{padding:12px 7px 16px}.bts-grid{grid-template-columns:1fr 1fr}.mentor-grid{grid-template-columns:1fr}.cd-tools select{min-width:0;flex:1}}
 @media(max-width:600px){.cd-tools{flex-wrap:wrap}.cd-tools select{width:100%}.cd-tools button{margin-left:0}.cd-ribbon{font-size:15px;padding:8px 18px}.cd-logo{width:88px}.cd-hero{padding:38px 0 12px}.cd-hero h1{font-size:21px}.cd-hero p{font-size:10px}.cd-sheet{padding:16px 5px 22px}.cd-frame{padding:8px 4px}.cd-block{grid-template-columns:1fr;gap:5px;margin-bottom:12px}.cd-block h3{font-size:16px;margin:0 0 2px 2px}.cd-table{min-width:680px}.cd-table th,.cd-table td{font-size:11px;padding:9px 6px}.bts-title strong{font-size:37px}.bts-title h2{font-size:21px}.bts-grid{grid-template-columns:1fr}.saving-band{grid-template-columns:1fr;gap:4px}.saving-band strong{font-size:15px}.saving-band span{font-size:25px}.cd-footer{font-size:9px}}
 @media print{.topbar,.cd-tools,footer{display:none!important}.comparison-direction-host{padding:0!important}.cd-sheet{box-shadow:none;border:0}.cd-scroll{overflow:visible}.cd-table{min-width:0}.cd-block{grid-template-columns:82px 1fr}}
 `}</style>
 <div className="cd-tools"><select value={selected} onChange={e=>setSelected(e.target.value)}><option value="">설문을 선택해 비교안을 작성하세요</option>{targets.map(x=><option key={String(x.id)} value={String(x.id)}>{x.clinicName} · {x.region} · {(x.createdAt||"").slice(5,10)}</option>)}</select><button onClick={()=>window.print()}><Printer size={16}/>비교표 인쇄</button></div>
 <section className="cd-sheet"><div className="cd-ribbon">비교 제안</div><img className="cd-logo" src="/osstem-wordmark-transparent.png" alt="OSSTEM"/><div className="cd-hero"><h1>“오스템 <b>VAN서비스</b>와 비교해 드립니다”</h1><p>{target?<><strong>{target.clinicName}</strong> · {target.region}{target.currentVanDealer?` · 현재 ${target.currentVanDealer}`:""}</>:"앞 설문 답변을 선택하면 작성 디렉션에 따라 자동으로 채워지며, 현재 사용 항목은 직접 수정할 수 있습니다."}</p></div>
 <div className="cd-frame"><Table name="사용성" items={["단말기 이용","승인 정산","PMS연동"]}/><Table name="기본비용" items={["단말기","관리비","연동비","소모품"]}/><Table name="사용조건" items={["의무사용","대응채널","내방상담","출장수리","위약금"]}/><Table name="특별지원" items={["현금지원","타서비스"]}/>
 <section className="bts"><div className="bts-title"><strong>BTS</strong><h2>핵심 전환 제안</h2></div><div className="bts-sub">익숙한 사용 방식을 그대로, 비용과 계약 위험은 더 가볍게</div><div className="bts-grid">
 <article className="bts-card"><div className="bts-head"><span className="bts-icon"><Monitor size={24}/></span><span>사용성</span></div><div className="bts-desc">동일한 사용 환경, 더 편리한 서비스</div><div className="bts-flow"><div className="bts-before">기존 업무<br/>단말기·멀티패드</div><div className="bts-arrow">→</div><div className="bts-after">기존과 동일<br/>PMS 무관</div></div></article>
 <article className="bts-card"><div className="bts-head"><span className="bts-icon"><BarChart3 size={24}/></span><span>운영비용</span></div><div className="bts-desc">같은 서비스, 더 합리적인 비용</div><div className="bts-flow"><div className="bts-before">{currentLabel}<br/>(현재 사용)</div><div className="bts-arrow">→</div><div className="bts-after">36만원/3년<br/>(오스템)</div></div><div className="bts-benefit">{savingLabel}</div></article>
 <article className="bts-card"><div className="bts-head"><span className="bts-icon"><ShieldCheck size={24}/></span><span>사용조건</span></div><div className="bts-desc">불필요한 부담은 줄이고, 안정적으로</div><div className="bts-flow"><div className="bts-before">기기값 2~3배<br/>위약금 부담</div><div className="bts-arrow">→</div><div className="bts-after">3년 동일<br/>할부 잔금</div></div></article>
 <article className="bts-card"><div className="bts-head"><span className="bts-icon"><Users size={24}/></span><span>지원</span></div><div className="bts-desc">언제든 더 가까이 지원</div><div className="bts-flow"><div className="bts-before">현금 등<br/>불법지원</div><div className="bts-arrow">→</div><div className="bts-after">운영비 절감<br/>오스템 서비스</div></div></article>
 </div><div className="saving-band"><strong>운영비용만으로도 저렴</strong><span>{savingLabel}</span></div><div className="mentor-grid"><article className="mentor"><h3>1 변경 부담 최소</h3><p>기존 결제 경험은 그대로, 추가 학습 없이 쉽게 전환합니다.</p><div className="mentor-note"><b>권장 멘트</b><br/>“기존 흐름을 유지하면서 오스템 편의를 더하는 제안입니다.”</div></article><article className="mentor"><h3>2 PMS 연동 편의</h3><p>수납·정산 수작업을 줄여 업무 효율을 높입니다.</p><div className="mentor-note"><b>권장 멘트</b><br/>“재입력과 사후 정산의 번거로움을 줄이는 것이 핵심입니다.”</div></article><article className="mentor"><h3>3 현장 밀착 지원</h3><p>오스템 전국 영업망과 전담 인력이 직접 함께합니다.</p><div className="mentor-note"><b>권장 멘트</b><br/>“담당자가 방문해 함께 챙기는 운영관리 서비스입니다.”</div></article></div></section></div>
 <div className="cd-footer"><img src="/osstem-wordmark-transparent.png" alt="OSSTEM"/><span>좋은 진료, 더 큰 가치. 오스템이 함께합니다.</span><span>OSSTEM VAN SERVICE | 02</span></div></section></div>,host)
}
