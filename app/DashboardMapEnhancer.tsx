"use client";

import {useEffect,useState} from "react";
import {createPortal} from "react-dom";

type RegionRow={region:string;count:number};
type Summary={regions?:RegionRow[]};

const P:Record<string,[number,number]>={서울:[41,29],경기:[48,33],인천:[34,34],강원:[63,26],충북:[53,46],충남:[38,52],대전:[46,57],세종:[44,51],경북:[67,49],대구:[67,59],전북:[43,67],광주:[36,76],전남:[32,82],경남:[59,75],부산:[70,79],울산:[73,68],제주:[45,94]};

export default function DashboardMapEnhancer(){
  const [host,setHost]=useState<HTMLElement|null>(null);
  const [regions,setRegions]=useState<RegionRow[]>([]);
  useEffect(()=>{
    const find=()=>{
      const cards=document.querySelectorAll<HTMLElement>(".dashboard .chart-grid .chart-card");
      const el=cards[0]??null;
      if(el){el.classList.add("dashboard-map-host");setHost(el)} else setHost(null);
    };
    find(); const obs=new MutationObserver(find);obs.observe(document.body,{childList:true,subtree:true});return()=>obs.disconnect();
  },[]);
  useEffect(()=>{if(!host)return;fetch("/api/surveys",{cache:"no-store"}).then(r=>r.ok?r.json():{}).then((x:Summary)=>setRegions(x.regions??[])).catch(()=>setRegions([]))},[host]);
  if(!host)return null;
  return createPortal(<div className="dashboard-korea-map" aria-label="지역별 조사 현황 지도">
    <svg className="korea-svg" viewBox="0 0 320 430" role="img" aria-label="대한민국 지도">
      <path d="M181 20c20 7 38 20 48 38 9 16 15 36 11 54-3 15-14 27-13 41 2 19 21 31 18 49-3 19-22 28-26 45-5 18 8 35 2 53-7 22-31 33-45 51-12 15-14 40-32 50-18 10-39 0-47-18-7-15 1-32-7-45-9-15-30-20-34-37-5-20 12-37 12-56 0-16-13-31-8-47 6-20 30-27 39-43 9-15 5-37 18-50 13-14 36-11 50-23 15-12 16-38 37-45z" fill="#e4e6e8" stroke="#d3d6d9" strokeWidth="2"/>
      <path d="M55 395c13-6 28-6 41 0 8 4 12 12 5 17-12 8-36 9-49 2-9-5-6-14 3-19z" fill="#e4e6e8" stroke="#d3d6d9" strokeWidth="2"/>
    </svg>
    {regions.map(r=>{const p=P[r.region]??[50,50];return <div className="region-pin" key={r.region} style={{left:`${p[0]}%`,top:`${p[1]}%`}}><span>{r.region}</span><b>{r.count}</b></div>})}
  </div>,host);
}
