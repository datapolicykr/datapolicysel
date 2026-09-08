"use client";

import {useEffect,useMemo,useState} from "react";
import {createPortal} from "react-dom";
import {BarChart3,CheckCircle2,GitCompareArrows,Printer,ShieldAlert} from "lucide-react";

type Target={
  id:string|number;clinicName:string;region:string;currentVanDealer?:string;createdAt:string;
  devices?:string[];linkedServices?:string[];inconveniences?:string[];contractTerms?:string[];
  terminalUsePeriod?:string;contractEndDate?:string;monthlyCost?:string;managementFee?:string;linkFee?:string;
};
type Summary={targets?:Target[]};

const groups=[
  {name:"사용성",items:["단말기 이용","승인 정산","PMS연동"]},
  {name:"기본비용",items:["단말기","관리비","연동비","소모품"]},
  {name:"사용조건",items:["의무사용","대응채널","내방상담","출장수리","위약금"]},
  {name:"지원",items:["현금지원","타서비스"]},
];
const notes:Record<string,string>={
  "단말기":"단말기+멀티패드 기준","연동비":"원클릭 기준","소모품":"년 1롤 사용 기준",
  "현금지원":"기본비용 차이 확인","타서비스":"합법적 범위에서만"
};
const moneyValue=(v="")=>Number((v.match(/[\d,]+/)?.[0]??"0").replaceAll(",",""))||0;
const threeYear=(v:string,fallback:number)=>`${(moneyValue(v)*36||fallback).toLocaleString("ko-KR")}원/3년`;
const specialQ1=new Set(["단말기(유선)","서명패드","멀티패드"]); // 현재 설문 Q1의 1,3,4번
const q2Pms=(t?:Target)=>(t?.linkedServices??[]).includes("PMS/EMR");
const q3Settlement=(t?:Target)=>(t?.inconveniences??[]).includes("정산/입금");
const q7Consumable=(t?:Target)=>(t?.contractTerms??[]).includes("소모품");
const hasSpecialQ1=(t?:Target)=>(t?.devices??[]).some(x=>specialQ1.has(x));
const obligation=(t?:Target)=>{
  if(!t?.contractEndDate)return "3년";
  const end=new Date(`${t.contractEndDate}-01T00:00:00`);
  if(Number.isNaN(end.getTime()))return "3년";
  const months=(end.getTime()-Date.now())/(1000*60*60*24*30.44);
  return months>=36?"3년이상":"3년";
};

function currentValue(label:string,t?:Target){
  if(label==="단말기 이용")return (t?.devices??[]).join(", ")||"Q1 답변 리스트";
  if(label==="승인 정산")return q3Settlement(t)?"정산입금불편":"일상업무";
  if(label==="PMS연동")return q2Pms(t)?"연동중":"없음";
  if(label==="단말기")return hasSpecialQ1(t)?threeYear(t?.monthlyCost??"",360000):"360,000원/3년";
  if(label==="관리비")return hasSpecialQ1(t)?threeYear(t?.managementFee??"",360000):"360,000원/3년";
  if(label==="연동비")return q2Pms(t)?threeYear(t?.linkFee??"",540000):"해당없음";
  if(label==="소모품")return q7Consumable(t)?"0원/3년":"90,000원/3년";
  if(label==="의무사용")return obligation(t);
  if(label==="대응채널")return "전화상담";
  if(label==="내방상담")return "없음";
  if(label==="출장수리")return "유료(구매시)";
  if(label==="위약금")return "기기값 2~3배";
  if(label==="현금지원")return (t?.contractTerms??[]).includes("현금지원")?"Y":"-";
  if(label==="타서비스")return (t?.contractTerms??[]).filter(x=>["무료기기","월비용면제","매출지원","리베이트","타서비스 지원"].includes(x)).join(", ")||"-";
  return "";
}
function osstemValue(label:string,t?:Target){
  if(label==="단말기 이용")return "동일하게 제공";
  if(label==="승인 정산")return q3Settlement(t)?"불편없이제공":"동일하게 제공";
  if(label==="PMS연동")return "PMS 여부/종류 무관하게 서비스";
  if(label==="단말기")return "252,000원/3년";
  if(label==="관리비")return "108,000원/3년";
  if(label==="연동비")return "0원/3년";
  if(label==="소모품")return "0원/3년";
  if(label==="의무사용")return "3년 (동일)";
  if(label==="대응채널")return "전화, 영업사원, 웹 플랫폼";
  if(label==="내방상담")return "영업사원 수시방문";
  if(label==="출장수리")return "무료(임대시)";
  if(label==="위약금")return "할부 잔금";
  if(label==="현금지원"||label==="타서비스")return "-";
  return "";
}

export default function ComparisonDirection(){
  const [host,setHost]=useState<HTMLElement|null>(null);
  const [targets,setTargets]=useState<Target[]>([]);
  const [selected,setSelected]=useState("");
  const [current,setCurrent]=useState<Record<string,string>>({});
  const [osstem,setOsstem]=useState<Record<string,string>>({});

  useEffect(()=>{
    const find=()=>{const el=document.querySelector<HTMLElement>(".compare-page");if(el){el.classList.add("comparison-direction-host");setHost(el);}else setHost(null)};
    find();const obs=new MutationObserver(find);obs.observe(document.body,{childList:true,subtree:true});return()=>obs.disconnect();
  },[]);
  useEffect(()=>{if(!host)return;fetch("/api/surveys",{cache:"no-store"}).then(r=>r.ok?r.json():{}).then((x:Summary)=>setTargets(x.targets??[])).catch(()=>setTargets([]));},[host]);

  const target=useMemo(()=>targets.find(x=>String(x.id)===selected),[targets,selected]);
  useEffect(()=>{
    const c:Record<string,string>={},o:Record<string,string>={};
    groups.forEach(g=>g.items.forEach(i=>{c[i]=currentValue(i,target);o[i]=osstemValue(i,target)}));
    setCurrent(c);setOsstem(o);
  },[target]);

  const currentTotal=["단말기","관리비","연동비","소모품"].reduce((s,k)=>s+moneyValue(current[k]??""),0);
  const totalLabel=`${Math.round(currentTotal/10000)}만원/3년`;
  if(!host)return null;

  return createPortal(<div className="comparison-direction-portal">
    <style>{`
      .comparison-direction-host>.compare-tools,.comparison-direction-host>.compare-sheet{display:none!important}
      .comparison-direction-portal{font-family:"Malgun Gothic","Apple SD Gothic Neo",sans-serif;color:#252525}
      .cd-tools{display:flex;gap:10px;align-items:center;margin-bottom:15px}.cd-tools select,.cd-tools button{border:1px solid #ddd5d0;background:#fff;border-radius:10px;padding:10px 12px}.cd-tools select{min-width:340px}.cd-tools button{margin-left:auto;display:flex;align-items:center;gap:7px}
      .cd-sheet{background:#fff;min-height:1120px;padding:20px 24px 48px;box-shadow:0 7px 24px rgba(69,45,28,.06)}
      .cd-head{display:flex;justify-content:space-between;align-items:flex-start}.cd-label{background:#f05a00;color:#fff;border-radius:8px;padding:11px 22px;font-size:17px;font-weight:900;box-shadow:0 3px 7px rgba(77,49,30,.25)}.cd-head img{width:145px;height:42px;object-fit:contain}
      .cd-sheet h1{font-size:24px;margin:16px 0 5px;letter-spacing:-.04em}.cd-sub{font-size:12px;color:#6b7077;margin:0 0 14px}.cd-frame{border:1px solid #ead8cc;border-radius:18px;padding:30px 26px 38px;background:linear-gradient(180deg,#fff,#fffdfb)}
      .cd-table{border-top:2px solid #555}.cd-cols,.cd-row{display:grid;grid-template-columns:82px 120px minmax(180px,1fr) minmax(180px,1fr) minmax(135px,.75fr)}.cd-cols{background:#dedede}.cd-cols b{padding:10px;text-align:center;font-size:12px;border-right:1px solid white}.cd-cols b:first-child{grid-column:1/3}.cd-group{border-bottom:1px solid #555}.cd-row{min-height:48px;border-bottom:1px solid #bbb}.cd-row:last-child{border-bottom:0}.cd-row>strong{display:flex;align-items:center;justify-content:center;padding:7px 8px;font-size:12px;text-align:center;border-right:1px solid #bbb}.cd-cat{color:#d64e00;background:#fafafa;font-weight:900}.cd-row textarea{width:100%;min-height:47px;border:0;border-right:1px solid #bbb;padding:8px 9px;resize:none;text-align:center;font:inherit;font-size:11px;line-height:1.35;background:#fff}.cd-row textarea:focus{outline:2px solid rgba(240,90,0,.25);outline-offset:-2px}.cd-row textarea:last-child{border-right:0}.cd-row .cd-osstem{background:#fff7f1;font-weight:800}
      .cd-summary{margin-top:28px;border:1px solid #f0d6c6;border-radius:16px;overflow:hidden}.cd-summary-row{display:grid;grid-template-columns:180px 1fr 1fr 1.2fr;align-items:center;min-height:68px;border-bottom:1px solid #f0e2d9}.cd-summary-row:last-child{border-bottom:0}.cd-title{display:flex;align-items:center;gap:9px;padding-left:18px;font-size:13px;font-weight:900}.cd-title svg{color:#f05a00}.cd-summary-row span{text-align:center;font-size:13px;font-weight:800}.cd-summary-row .cd-os{color:#d64e00;background:#fff8f3;height:100%;display:flex;align-items:center;justify-content:center}.cd-benefit{font-size:12px;line-height:1.6;color:#d64e00;padding:0 14px;text-align:center}.cd-cost{font-size:22px!important;color:#343434}.cd-os.cd-cost{font-size:22px!important}.cd-note{margin-top:10px;color:#888;font-size:10px;text-align:right}
      @media(max-width:850px){.cd-frame{padding:14px 8px}.cd-cols,.cd-row{grid-template-columns:52px 88px minmax(130px,1fr) minmax(130px,1fr) 100px}.cd-summary-row{grid-template-columns:120px 1fr 1fr}.cd-benefit{grid-column:1/-1;padding:9px}.cd-tools select{min-width:0;flex:1}}
      @media print{.topbar,.cd-tools,footer{display:none!important}.comparison-direction-host{padding:0!important}.cd-sheet{box-shadow:none}.cd-frame{border-color:#ddd}}
    `}</style>
    <div className="cd-tools"><select value={selected} onChange={e=>setSelected(e.target.value)}><option value="">설문을 선택해 비교안을 작성하세요</option>{targets.map(x=><option key={String(x.id)} value={String(x.id)}>{x.clinicName} · {x.region} · {(x.createdAt||"").slice(5,10)}</option>)}</select><button onClick={()=>window.print()}><Printer size={16}/>비교표 인쇄</button></div>
    <section className="cd-sheet"><div className="cd-head"><span className="cd-label">계약 조건</span><img src="/osstem-wordmark-transparent.png" alt="OSSTEM"/></div><h1>“오스템 VAN서비스와 비교해 드립니다”</h1><p className="cd-sub">{target?<><strong>{target.clinicName}</strong> · {target.region}{target.currentVanDealer?` · 현재 ${target.currentVanDealer}`:""}</>:"앞 설문 답변을 선택하면 작성 디렉션에 따라 자동으로 채워지며, 필요한 항목은 직접 수정할 수 있습니다."}</p>
      <div className="cd-frame"><div className="cd-table"><div className="cd-cols"><b>항목</b><b>현재 사용</b><b>오스템</b><b>비고</b></div>{groups.map(g=><div className="cd-group" key={g.name}>{g.items.map((item,i)=><div className="cd-row" key={item}><strong className="cd-cat">{i===0?g.name:""}</strong><strong>{item}</strong><textarea aria-label={`${item} 현재 사용`} value={current[item]??""} onChange={e=>setCurrent(v=>({...v,[item]:e.target.value}))}/><textarea className="cd-osstem" aria-label={`${item} 오스템`} value={osstem[item]??""} onChange={e=>setOsstem(v=>({...v,[item]:e.target.value}))}/><textarea aria-label={`${item} 비고`} defaultValue={notes[item]??""}/></div>)}</div>)}</div>
        <div className="cd-summary"><div className="cd-summary-row"><strong className="cd-title"><CheckCircle2 size={18}/>사용성</strong><span>기존 업무</span><span className="cd-os">기존과 동일함.</span><b className="cd-benefit"/></div><div className="cd-summary-row"><strong className="cd-title"><BarChart3 size={18}/>운영비용</strong><span className="cd-cost">{totalLabel}</span><span className="cd-os cd-cost">36만원/3년</span><b className="cd-benefit"/></div><div className="cd-summary-row"><strong className="cd-title"><ShieldAlert size={18}/>사용조건</strong><span>불편, 위험(위약금)</span><span className="cd-os">편리, 안전</span><b className="cd-benefit"/></div><div className="cd-summary-row"><strong className="cd-title"><GitCompareArrows size={18}/>지원</strong><span>현금등 불법지원</span><span className="cd-os">-</span><b className="cd-benefit">운영비용만으로도 저렴<br/>+ 오스템 풀서비스 경험</b></div></div><div className="cd-note">* 현재 사용 금액은 앞 설문의 월 비용을 36개월 기준으로 환산합니다.</div>
      </div></section>
  </div>,host);
}
