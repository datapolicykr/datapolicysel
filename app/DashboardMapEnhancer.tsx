"use client";

import {useEffect,useState} from "react";
import {createPortal} from "react-dom";

type RegionRow={region:string;count:number};
type Summary={regions?:RegionRow[]};

const P:Record<string,[number,number]>={서울:[40,29],경기:[48,34],인천:[33,35],강원:[63,25],충북:[53,46],충남:[38,53],대전:[45,58],세종:[44,51],경북:[67,49],대구:[68,60],전북:[43,68],광주:[35,77],전남:[31,83],경남:[59,76],부산:[71,80],울산:[74,69],제주:[45,94]};

export default function DashboardMapEnhancer(){
  const [host,setHost]=useState<HTMLElement|null>(null);
  const [regions,setRegions]=useState<RegionRow[]>([]);
  useEffect(()=>{
    const find=()=>{
      const cards=document.querySelectorAll<HTMLElement>(".dashboard .chart-grid .chart-card");
      const el=cards[0]??null;
      if(el){el.classList.add("dashboard-map-host");setHost(el)} else setHost(null);
    };
    find();
    const obs=new MutationObserver(find);obs.observe(document.body,{childList:true,subtree:true});
    return()=>obs.disconnect();
  },[]);
  useEffect(()=>{if(!host)return;fetch("/api/surveys",{cache:"no-store"}).then(r=>r.ok?r.json():{}).then((x:Summary)=>setRegions(x.regions??[])).catch(()=>setRegions([]))},[host]);
  if(!host)return null;
  return createPortal(<div className="dashboard-korea-map" aria-label="지역별 조사 현황 지도">
    <svg className="korea-svg" viewBox="0 0 320 430" role="img" aria-label="대한민국 지도">
      <g fill="#e3e5e7" stroke="#cfd3d6" strokeWidth="1.7" strokeLinejoin="round">
        <path d="M178 18c16 5 34 15 44 29 10 14 13 31 10 48-2 13-10 26-5 39 6 14 20 22 19 39-1 16-16 27-19 42-4 16 6 30 2 46-4 17-19 28-32 39-12 10-20 23-26 37-7 17-6 39-23 49-14 9-35 6-44-8-8-13-4-31-12-43-8-13-27-17-32-33-6-18 9-34 8-51-1-14-12-27-9-42 4-18 25-27 33-43 8-14 5-32 14-44 11-15 31-17 43-30 12-13 12-34 29-44z"/>
        <path d="M43 394c13-8 34-10 49-5 12 4 21 13 15 21-8 10-35 13-53 8-18-5-23-16-11-24z"/>
        <path d="M241 154c5-8 12-10 17-5 4 5 1 13-5 18-7 5-14 0-12-13z"/>
        <path d="M256 181c4-6 9-6 12-2 2 5-2 10-6 12-5 1-9-4-6-10z"/>
      </g>
      <g fill="none" stroke="#f7f7f7" strokeWidth="2" opacity=".95">
        <path d="M132 55c17 14 29 25 43 42 15 18 26 27 50 35"/>
        <path d="M112 104c18 10 35 13 54 14 18 1 39-5 60-13"/>
        <path d="M96 151c23 5 43 4 62-4 18-7 35-5 54 3"/>
        <path d="M91 202c20-5 40-2 58 6 20 9 42 8 63 1"/>
        <path d="M89 256c22-1 43 5 61 14 17 9 32 7 51 2"/>
        <path d="M98 309c17 3 31 10 43 22 10 10 19 21 28 35"/>
        <path d="M149 71c-6 19-8 38-5 57 3 18 12 34 10 53-2 21-13 40-9 62 4 21 17 40 14 65"/>
        <path d="M186 102c-3 18-1 36 6 53 7 16 13 31 9 49-4 19-14 36-10 56"/>
      </g>
    </svg>
    {regions.map(r=>{const p=P[r.region]??[50,50];return <div className="region-pin" key={r.region} style={{left:`${p[0]}%`,top:`${p[1]}%`}}><span>{r.region}</span><b>{r.count}</b></div>})}
  </div>,host);
}
