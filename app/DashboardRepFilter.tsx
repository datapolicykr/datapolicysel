"use client";

import {useEffect} from "react";

type Target={
  id:number;clinicName:string;region:string;district:string;currentVanDealer:string;currentPms:string;
  terminalUsePeriod:string;contractType:string;contractEndDate:string;monthlyCost:string;managementFee:string;linkFee:string;
  deliveryMethod:string;salesRep:string;createdAt:string;devices:string[];costItems:string[];contractTerms:string[];
  inconveniences:string[];improvementItems:string[];contactWhen:string;fieldMemo:string;
};
type Summary={targets?:Target[]};

const risky=new Set(["현금지원","무료기기","월비용면제","매출지원","리베이트","타서비스 지원"]);
const monthKey=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
const monthDiff=(ym:string,base=new Date())=>{
  const m=/^(\d{4})-(\d{2})/.exec(ym||""); if(!m)return 999;
  return (Number(m[1])-base.getFullYear())*12+(Number(m[2])-(base.getMonth()+1));
};

export default function DashboardRepFilter(){
 useEffect(()=>{
  let summary:Summary={}; let raf=0; let applying=false;
  const root=()=>document.querySelector<HTMLElement>(".dashboard");
  const select=()=>root()?.querySelector<HTMLSelectElement>(".dash-tools select")||null;
  const setStrong=(el:Element|undefined|null,value:number)=>{const s=el?.querySelector("strong");if(!s)return;const n=s.childNodes[0];if(n&&n.nodeType===Node.TEXT_NODE)n.nodeValue=String(value);else s.prepend(document.createTextNode(String(value)))};
  const apply=()=>{
   if(applying)return; const r=root(),sel=select(); if(!r||!sel)return;
   applying=true;
   const rep=sel.value; const all=summary.targets||[]; const rows=rep?all.filter(x=>x.salesRep===rep):all;
   const now=new Date(), thisMonth=monthKey(now);
   const thisMonthCount=rows.filter(x=>(x.createdAt||"").slice(0,7)===thisMonth).length;
   const expiry={m3:0,m6:0,m12:0};
   rows.forEach(x=>{const d=monthDiff(x.contractEndDate,now);if(d>=0&&d<=3)expiry.m3++;else if(d>3&&d<=6)expiry.m6++;else if(d>6&&d<=12)expiry.m12++});
   const immediate=rows.filter(x=>(x.contactWhen||"").includes("즉시")||(x.deliveryMethod||"").includes("즉시")).length;
   const compliance=rows.filter(x=>(x.contractTerms||[]).some(v=>risky.has(v))).length;
   const kpis=[...r.querySelectorAll(".kpis.five article")];
   [rows.length,thisMonthCount,expiry.m3,immediate,compliance].forEach((v,i)=>setStrong(kpis[i],v));

   const regionMap=new Map<string,number>(); rows.forEach(x=>regionMap.set(x.region,(regionMap.get(x.region)||0)+1));
   const regions=[...regionMap.entries()].sort((a,b)=>b[1]-a[1]); const max=Math.max(1,...regions.map(x=>x[1]));
   const cards=r.querySelectorAll<HTMLElement>(".chart-grid .chart-card"); const regionCard=cards[0];
   if(regionCard){regionCard.querySelectorAll(".bar-row,.empty,.dashboard-korea-map").forEach(x=>x.remove()); if(regions.length){regions.forEach(([name,count])=>{const row=document.createElement("div");row.className="bar-row";row.innerHTML=`<span>${name}</span><div><i style="width:${count/max*100}%"></i></div><b>${count}</b>`;regionCard.appendChild(row)})}else{const e=document.createElement("div");e.className="empty";e.textContent="해당 영업사원의 설문 데이터가 없습니다.";regionCard.appendChild(e)}}

   const monthCounts=new Map<string,number>(); for(let i=0;i<6;i++){const d=new Date(now.getFullYear(),now.getMonth()+i,1);monthCounts.set(monthKey(d),0)}
   rows.forEach(x=>{const k=(x.contractEndDate||"").slice(0,7);if(monthCounts.has(k))monthCounts.set(k,(monthCounts.get(k)||0)+1)});
   const monthChart=r.querySelector<HTMLElement>(".month-chart"); if(monthChart){monthChart.innerHTML="";const vals=[...monthCounts.entries()];const top=Math.max(1,...vals.map(v=>v[1]));vals.forEach(([m,c])=>{const d=document.createElement("div");d.innerHTML=`<b>${c}</b><i style="height:${Math.max(5,c/top*100)}%"></i><span>${Number(m.slice(5))}월</span>`;monthChart.appendChild(d)})}
   const minis=[...r.querySelectorAll(".pipeline.mini article")];[expiry.m3,expiry.m6,expiry.m12].forEach((v,i)=>setStrong(minis[i],v));

   const painMap=new Map<string,number>(); rows.forEach(x=>[...(x.inconveniences||[]),...(x.improvementItems||[])].forEach(p=>painMap.set(p,(painMap.get(p)||0)+1)));
   const pains=[...painMap.entries()].sort((a,b)=>b[1]-a[1]).slice(0,6); const lower=r.querySelectorAll<HTMLElement>(".chart-grid.lower .chart-card")[0];
   if(lower){lower.querySelectorAll(".rank-row,.empty").forEach(x=>x.remove()); if(pains.length){pains.forEach(([p,c],i)=>{const d=document.createElement("div");d.className="rank-row";d.innerHTML=`<span><b>${i+1}</b>${p}</span><strong>${c}<small>건</small></strong>`;lower.appendChild(d)})}else{const e=document.createElement("div");e.className="empty";e.textContent="해당 영업사원의 설문 데이터가 없습니다.";lower.appendChild(e)}}
   applying=false;
  };
  const schedule=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>setTimeout(apply,0))};
  fetch("/api/surveys",{cache:"no-store"}).then(r=>r.ok?r.json():{}).then(x=>{summary=x;schedule()}).catch(()=>{});
  const onChange=(e:Event)=>{if((e.target as Element)?.matches?.(".dashboard .dash-tools select"))schedule()};
  document.addEventListener("change",onChange);
  const obs=new MutationObserver(schedule);obs.observe(document.body,{childList:true,subtree:true});
  return()=>{document.removeEventListener("change",onChange);obs.disconnect();cancelAnimationFrame(raf)};
 },[]);
 return null;
}
