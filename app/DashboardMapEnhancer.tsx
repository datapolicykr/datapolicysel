"use client";

import {useEffect,useMemo,useState} from "react";
import {createPortal} from "react-dom";
import {KOREA_MAP_PATHS} from "./korea-map-trace";

type RegionRow={region:string;count:number};
type Summary={regions?:RegionRow[]};

const P:Record<string,[number,number]>={
 서울:[39,22],경기:[50,31],인천:[31,38],강원:[68,22],충북:[56,43],충남:[37,48],대전:[44,55],세종:[43,49],
 경북:[69,48],대구:[70,59],전북:[42,67],광주:[32,77],전남:[30,84],경남:[59,77],부산:[73,83],울산:[78,70],제주:[31,94]
};

const LABEL_OFFSET:Record<string,[number,number]>={
 서울:[-6,-8],경기:[11,-2],인천:[-15,3],강원:[11,-3],충북:[10,0],충남:[-13,2],대전:[-12,8],세종:[-12,-6],
 경북:[10,-1],대구:[11,4],전북:[-12,4],광주:[-13,4],전남:[-12,3],경남:[10,3],부산:[11,2],울산:[10,-5],제주:[11,0]
};

export default function DashboardMapEnhancer(){
 const [host,setHost]=useState<HTMLElement|null>(null),[regions,setRegions]=useState<RegionRow[]>([]);
 useEffect(()=>{const find=()=>{const cards=document.querySelectorAll<HTMLElement>(".dashboard .chart-grid .chart-card");const el=cards[0]??null;if(el){el.classList.add("dashboard-map-host");setHost(el)}else setHost(null)};find();const obs=new MutationObserver(find);obs.observe(document.body,{childList:true,subtree:true});return()=>obs.disconnect()},[]);
 useEffect(()=>{if(!host)return;fetch("/api/surveys",{cache:"no-store"}).then(r=>r.ok?r.json():{}).then((x:Summary)=>setRegions(x.regions??[])).catch(()=>setRegions([]))},[host]);
 const visible=useMemo(()=>regions.filter(r=>r.count>0).sort((a,b)=>b.count-a.count).slice(0,9),[regions]);
 const max=Math.max(1,...visible.map(r=>r.count));
 if(!host)return null;
 return createPortal(<div className="dashboard-korea-map" data-source="reference-dashboard-bubble-map" aria-label="지역별 조사 현황 지도">
   <svg className="korea-svg" viewBox="70 45 850 1440" preserveAspectRatio="xMidYMid meet" role="img" aria-label="대한민국 지도">
     {KOREA_MAP_PATHS.map((d,i)=><path key={i} d={d} className="korea-region"/>) }
   </svg>
   {visible.map(r=>{const p=P[r.region]??[50,50];const o=LABEL_OFFSET[r.region]??[10,0];const size=14+Math.round(24*Math.sqrt(r.count/max));return <div className="region-cluster" key={r.region}>
      <span className="region-bubble" style={{left:`${p[0]}%`,top:`${p[1]}%`,width:size,height:size}} aria-hidden="true" />
      <div className="region-label" style={{left:`${p[0]+o[0]}%`,top:`${p[1]+o[1]}%`}}><span>{r.region}</span><b>{r.count}</b></div>
   </div>})}
 </div>,host)
}
