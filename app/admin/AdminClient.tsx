"use client";
import {useEffect,useMemo,useState} from "react";

type Row={
 id:number;clinicName:string;region:string;district:string;currentVanDealer:string;currentPms:string;terminalUsePeriod:string;contractType:string;contractEndDate:string;monthlyCost:string;managementFee:string;linkFee:string;salesRep:string;contact:string;contactWhen:string;deliveryMethod:string;fieldMemo:string;devices:string;linkedServices:string;inconveniences:string;costItems:string;contractTerms:string;improvementItems:string;createdAt:string;
};

type ApiResponse={rows:Row[];user?:{displayName:string;email:string};error?:string};

const editable:(keyof Row)[]=["clinicName","region","district","currentVanDealer","currentPms","terminalUsePeriod","contractType","contractEndDate","monthlyCost","managementFee","linkFee","salesRep","contact","contactWhen","deliveryMethod","fieldMemo","devices","linkedServices","inconveniences","costItems","contractTerms","improvementItems"];
const labels:Partial<Record<keyof Row,string>>={clinicName:"치과명",region:"지역",district:"시군구",currentVanDealer:"현재 VAN/대리점",currentPms:"현재 PMS/연동",terminalUsePeriod:"사용기간",contractType:"계약형태",contractEndDate:"약정만료",monthlyCost:"사용료",managementFee:"관리비",linkFee:"연동비",salesRep:"영업사원",contact:"연락처",contactWhen:"연락시점",deliveryMethod:"전달방식",fieldMemo:"현장메모",devices:"사용기기(JSON)",linkedServices:"연동서비스(JSON)",inconveniences:"불편경험(JSON)",costItems:"비용항목(JSON)",contractTerms:"계약편익(JSON)",improvementItems:"개선항목(JSON)"};

export default function AdminClient(){
 const [rows,setRows]=useState<Row[]>([]),[query,setQuery]=useState(""),[loading,setLoading]=useState(true),[message,setMessage]=useState(""),[editing,setEditing]=useState<Row|null>(null);
 const load=async()=>{setLoading(true);setMessage("");const r=await fetch("/api/admin/surveys",{cache:"no-store"});const data=await r.json() as ApiResponse;setLoading(false);if(!r.ok){setMessage(data.error||"조회 실패");return}setRows(data.rows||[])};
 useEffect(()=>{void load()},[]);
 const filtered=useMemo(()=>{const q=query.trim().toLowerCase();if(!q)return rows;return rows.filter(r=>[r.clinicName,r.region,r.district,r.currentVanDealer,r.currentPms,r.salesRep,r.contact,r.fieldMemo].some(v=>String(v||"").toLowerCase().includes(q)))},[rows,query]);
 const save=async()=>{if(!editing)return;setMessage("저장 중...");const r=await fetch("/api/admin/surveys",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify(editing)});const data=await r.json().catch(()=>({}));if(!r.ok){setMessage((data as any).error||"수정 실패");return}setMessage("수정되었습니다.");setEditing(null);await load()};
 const remove=async(row:Row)=>{if(!confirm(`${row.clinicName} 설문 데이터를 삭제할까요? 이 작업은 되돌릴 수 없습니다.`))return;const r=await fetch("/api/admin/surveys",{method:"DELETE",headers:{"content-type":"application/json"},body:JSON.stringify({id:row.id})});const data=await r.json().catch(()=>({}));if(!r.ok){setMessage((data as any).error||"삭제 실패");return}setMessage("삭제되었습니다.");await load()};
 const csv=()=>{const head=["ID","치과명","지역","시군구","현재 VAN","현재 PMS","약정만료","사용료","관리비","연동비","영업사원","연락처","현장메모","조사일"];const data=filtered.map(r=>[r.id,r.clinicName,r.region,r.district,r.currentVanDealer,r.currentPms,r.contractEndDate,r.monthlyCost,r.managementFee,r.linkFee,r.salesRep,r.contact,r.fieldMemo,r.createdAt]);const blob=new Blob(["\ufeff"+[head,...data].map(x=>x.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\n")],{type:"text/csv;charset=utf-8"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="VAN_DB.csv";a.click();URL.revokeObjectURL(a.href)};
 return <div style={{maxWidth:1500,margin:"0 auto",padding:"28px 18px 60px"}}>
  <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap",marginBottom:14}}>
   <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="치과명, 지역, VAN, PMS, 영업사원, 연락처 검색" style={inputStyle({minWidth:320,flex:"1 1 420px"})}/>
   <button onClick={()=>void load()} style={buttonStyle()}>새로고침</button><button onClick={csv} style={buttonStyle()}>CSV 다운로드</button>
  </div>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,color:"#69717d",fontSize:13}}><span>전체 {rows.length.toLocaleString()}건 · 검색결과 {filtered.length.toLocaleString()}건</span><span>{message}</span></div>
  <div style={{background:"#fff",border:"1px solid #e5dfdb",borderRadius:14,overflow:"auto",boxShadow:"0 6px 20px rgba(69,45,28,.04)"}}>
   <table style={{borderCollapse:"collapse",width:"100%",minWidth:1250,fontSize:12}}><thead><tr>{["ID","치과명","지역","현재 VAN","현재 PMS","약정만료","사용료","관리비","연동비","영업사원","연락처","조사일","관리"].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead><tbody>{loading?<tr><td colSpan={13} style={{padding:35,textAlign:"center"}}>불러오는 중...</td></tr>:filtered.map(r=><tr key={r.id}>
    <td style={td}>{r.id}</td><td style={td}><strong>{r.clinicName}</strong><div style={{color:"#888",marginTop:3}}>{r.district}</div></td><td style={td}>{r.region}</td><td style={td}>{r.currentVanDealer||"-"}</td><td style={td}>{r.currentPms||"-"}</td><td style={td}>{r.contractEndDate||"-"}</td><td style={td}>{r.monthlyCost||"-"}</td><td style={td}>{r.managementFee||"-"}</td><td style={td}>{r.linkFee||"-"}</td><td style={td}>{r.salesRep||"-"}</td><td style={td}>{r.contact||"-"}</td><td style={td}>{r.createdAt?.slice(0,10)}</td><td style={td}><div style={{display:"flex",gap:6}}><button onClick={()=>setEditing({...r})} style={smallButton}>편집</button><button onClick={()=>void remove(r)} style={{...smallButton,color:"#b42318",borderColor:"#f0c4c0"}}>삭제</button></div></td>
   </tr>)}</tbody></table>
  </div>
  {editing&&<div style={overlay}><div style={modal}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><div><strong style={{fontSize:20}}>DB 레코드 편집</strong><div style={{fontSize:12,color:"#777",marginTop:4}}>ID {editing.id} · {editing.createdAt}</div></div><button onClick={()=>setEditing(null)} style={buttonStyle()}>닫기</button></div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:12}}>{editable.map(key=><label key={String(key)} style={{display:"grid",gap:6,fontSize:12,fontWeight:700,color:"#555"}}><span>{labels[key]||String(key)}</span>{key==="fieldMemo"||String(key).endsWith("Services")||["devices","inconveniences","costItems","contractTerms","improvementItems"].includes(String(key))?<textarea value={String(editing[key]??"")} onChange={e=>setEditing(v=>v?({...v,[key]:e.target.value}):v)} rows={key==="fieldMemo"?4:3} style={{...baseInput,resize:"vertical"}}/>:<input value={String(editing[key]??"")} onChange={e=>setEditing(v=>v?({...v,[key]:e.target.value}):v)} style={baseInput}/>}</label>)}</div><div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:20}}><button onClick={()=>setEditing(null)} style={buttonStyle()}>취소</button><button onClick={()=>void save()} style={{...buttonStyle(),background:"#f05a00",color:"#fff",borderColor:"#f05a00"}}>저장</button></div></div></div>}
 </div>
}

const baseInput:React.CSSProperties={border:"1px solid #ddd5d0",borderRadius:8,padding:"9px 10px",font:"inherit",background:"#fff",color:"#20242b"};
const inputStyle=(extra:React.CSSProperties={}):React.CSSProperties=>({...baseInput,...extra});
const buttonStyle=():React.CSSProperties=>({border:"1px solid #ddd5d0",background:"#fff",borderRadius:8,padding:"9px 12px",fontWeight:700,color:"#333",cursor:"pointer"});
const th:React.CSSProperties={textAlign:"left",padding:"10px 11px",borderBottom:"1px solid #e8e4e1",background:"#faf8f7",whiteSpace:"nowrap",position:"sticky",top:0,zIndex:1};
const td:React.CSSProperties={padding:"10px 11px",borderBottom:"1px solid #eee9e6",verticalAlign:"top",whiteSpace:"nowrap",maxWidth:210,overflow:"hidden",textOverflow:"ellipsis"};
const smallButton:React.CSSProperties={border:"1px solid #ddd5d0",background:"#fff",borderRadius:7,padding:"5px 8px",fontSize:11,fontWeight:700,cursor:"pointer"};
const overlay:React.CSSProperties={position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:100,display:"grid",placeItems:"center",padding:16};
const modal:React.CSSProperties={width:"min(1100px,96vw)",maxHeight:"92vh",overflow:"auto",background:"#fff",borderRadius:16,padding:22,boxShadow:"0 24px 60px rgba(0,0,0,.25)"};
