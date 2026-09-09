"use client";

import {useEffect,useState} from "react";
import {createPortal} from "react-dom";

type RegionRow={region:string;count:number};
type Summary={regions?:RegionRow[]};
const P:Record<string,[number,number]>={서울:[37,27],경기:[47,31],인천:[29,34],강원:[64,24],충북:[54,45],충남:[38,49],대전:[45,57],세종:[44,51],경북:[68,48],대구:[67,58],전북:[43,67],광주:[35,75],전남:[31,82],경남:[58,75],부산:[71,79],울산:[74,67],제주:[44,94]};

export default function DashboardMapEnhancer(){
 const [host,setHost]=useState<HTMLElement|null>(null),[regions,setRegions]=useState<RegionRow[]>([]);
 useEffect(()=>{const find=()=>{const cards=document.querySelectorAll<HTMLElement>(".dashboard .chart-grid .chart-card");const el=cards[0]??null;if(el){el.classList.add("dashboard-map-host");setHost(el)}else setHost(null)};find();const obs=new MutationObserver(find);obs.observe(document.body,{childList:true,subtree:true});return()=>obs.disconnect()},[]);
 useEffect(()=>{if(!host)return;fetch("/api/surveys",{cache:"no-store"}).then(r=>r.ok?r.json():{}).then((x:Summary)=>setRegions(x.regions??[])).catch(()=>setRegions([]))},[host]);
 if(!host)return null;
 return createPortal(<div className="dashboard-korea-map" aria-label="지역별 조사 현황 지도"><svg className="korea-svg" viewBox="0 0 330 430" role="img" aria-label="대한민국 지도"><path d="M183 18c22 7 41 19 51 38 9 16 14 34 11 51-3 15-14 28-13 42 1 19 20 31 17 49-3 19-21 28-26 45-5 17 8 35 2 53-7 22-30 33-44 50-12 15-14 39-31 49-18 10-39 1-48-17-7-15 1-32-7-44-9-16-29-20-34-38-5-19 12-36 12-55 0-17-13-31-8-47 6-19 29-27 38-43 9-15 5-36 18-50 13-14 36-11 50-23 15-12 17-37 37-45z" fill="#e6e8ea" stroke="#d3d6d9" strokeWidth="2"/><path d="M57 394c13-6 28-6 41 0 8 4 12 12 5 17-12 8-36 9-49 2-9-5-6-14 3-19z" fill="#e6e8ea" stroke="#d3d6d9" strokeWidth="2"/><g fill="none" stroke="#fff" strokeWidth="2" opacity=".95"><path d="M126 86l44 24 34-5"/><path d="M110 130l58 16 42-12"/><path d="M103 170l55 15 59-8"/><path d="M95 211l55 7 63-13"/><path d="M96 252l50 11 61-17"/><path d="M103 294l47 10 48-21"/><path d="M116 335l36 7 31-24"/><path d="M145 109l-8 227"/><path d="M177 111l-15 232"/><path d="M203 124l-25 189"/></g></svg>{regions.map(r=>{const p=P[r.region]??[50,50];return <div className="region-pin" key={r.region} style={{left:`${p[0]}%`,top:`${p[1]}%`}}><span>{r.region}</span><b>{r.count}</b></div>})}</div>,host)
}
