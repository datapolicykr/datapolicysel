"use client";

import {useEffect,useState} from "react";
import {createPortal} from "react-dom";
import {KOREA_MAP_PATHS} from "./korea-map-trace";

type RegionRow={region:string;count:number};
type Summary={regions?:RegionRow[]};
const P:Record<string,[number,number]>={서울:[35,25],경기:[46,31],인천:[25,31],강원:[67,20],충북:[53,43],충남:[35,49],대전:[44,56],세종:[42,50],경북:[70,47],대구:[68,58],전북:[42,67],광주:[32,76],전남:[29,83],경남:[58,76],부산:[73,82],울산:[77,69],제주:[29,95]};

export default function DashboardMapEnhancer(){
 const [host,setHost]=useState<HTMLElement|null>(null),[regions,setRegions]=useState<RegionRow[]>([]);
 useEffect(()=>{const find=()=>{const cards=document.querySelectorAll<HTMLElement>(".dashboard .chart-grid .chart-card");const el=cards[0]??null;if(el){el.classList.add("dashboard-map-host");setHost(el)}else setHost(null)};find();const obs=new MutationObserver(find);obs.observe(document.body,{childList:true,subtree:true});return()=>obs.disconnect()},[]);
 useEffect(()=>{if(!host)return;fetch("/api/surveys",{cache:"no-store"}).then(r=>r.ok?r.json():{}).then((x:Summary)=>setRegions(x.regions??[])).catch(()=>setRegions([]))},[host]);
 if(!host)return null;
 return createPortal(<div className="dashboard-korea-map" data-source="user-attached-korea-map-1000043591" aria-label="지역별 조사 현황 지도">
   <svg className="korea-svg" viewBox="70 45 850 1440" preserveAspectRatio="xMidYMid meet" role="img" aria-label="대한민국 지도">
     {KOREA_MAP_PATHS.map((d,i)=><path key={i} d={d} fill="#8d8d8d" stroke="#fff" strokeWidth="4" strokeLinejoin="round"/>) }
   </svg>
   {regions.map(r=>{const p=P[r.region]??[50,50];return <div className="region-pin" key={r.region} style={{left:`${p[0]}%`,top:`${p[1]}%`}}><span>{r.region}</span><b>{r.count}</b></div>})}
 </div>,host)
}
