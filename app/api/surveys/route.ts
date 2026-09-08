const SUPABASE_URL="https://euleyianbkyfnubckkjk.supabase.co";
const SUPABASE_KEY="sb_publishable_iZvZfi0XGXSbNftWOjKouA_yU6ICMKC";
const FN=`${SUPABASE_URL}/functions/v1/van-surveys`;

type Target={id:string;clinicName:string;region:string;district:string;currentVanDealer:string;currentPms:string;terminalUsePeriod:string;contractType:string;contractEndDate:string;monthlyCost:string;managementFee:string;linkFee:string;deliveryMethod:string;salesRep:string;createdAt:string;devices:string[];costItems:string[];contractTerms:string[];inconveniences:string[];improvementItems:string[];contactWhen:string;fieldMemo:string};

async function callFunction(path="",init:RequestInit={}){
  const headers=new Headers(init.headers);
  headers.set("apikey",SUPABASE_KEY);
  headers.set("content-type","application/json");
  return fetch(`${FN}${path}`,{...init,headers,cache:"no-store"});
}

export async function GET(){
  try{
    const response=await callFunction();
    const payload=await response.json() as {rows?:Target[];error?:string};
    if(!response.ok) return Response.json({error:payload.error||"집계 조회 실패"},{status:response.status});
    const rows=payload.rows||[];
    const regionMap=new Map<string,number>(),deviceMap=new Map<string,number>(),painMap=new Map<string,number>();
    let painCount=0,improvementCount=0,complianceCount=0,expiry3=0,expiry6=0,expiry12=0;
    const now=new Date();
    for(const row of rows){
      regionMap.set(row.region,(regionMap.get(row.region)??0)+1);
      for(const item of row.devices||[])deviceMap.set(item,(deviceMap.get(item)??0)+1);
      const pains=(row.inconveniences||[]).filter(v=>v!=="기타"); if(pains.length) painCount++;
      for(const item of pains)painMap.set(item,(painMap.get(item)??0)+1);
      if((row.improvementItems||[]).length)improvementCount++;
      if((row.contractTerms||[]).some(v=>["현금지원","리베이트"].includes(v)))complianceCount++;
      if(row.contractEndDate){const end=new Date(`${row.contractEndDate}-01T00:00:00`);const months=(end.getTime()-now.getTime())/(1000*60*60*24*30.44);if(months>=0&&months<=3)expiry3++;if(months>3&&months<=6)expiry6++;if(months>6&&months<=12)expiry12++;}
    }
    const ranked=(map:Map<string,number>,key:string)=>[...map].map(([name,count])=>({[key]:name,count})).sort((a,b)=>b.count-a.count);
    const monthKey=(date:Date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}`;
    const shiftMonth=(amount:number)=>{const date=new Date(now.getFullYear(),now.getMonth()+amount,1);return monthKey(date)};
    const months=Array.from({length:6},(_,i)=>shiftMonth(i));
    const expiryMonths=months.map(month=>({month,count:rows.filter(row=>(row.contractEndDate||"").slice(0,7)===month).length}));
    const thisMonth=monthKey(now),previousMonth=shiftMonth(-1);
    const reps=[...new Set(rows.map(row=>row.salesRep).filter(Boolean))].sort();
    return Response.json({total:rows.length,regions:ranked(regionMap,"region"),devices:ranked(deviceMap,"device"),pains:ranked(painMap,"pain").slice(0,8),painCount,improvementCount,complianceCount,expiry:{m3:expiry3,m6:expiry6,m12:expiry12},expiryMonths,reps,targets:rows,thisMonthCount:rows.filter(row=>(row.createdAt||"").slice(0,7)===thisMonth).length,previousMonthCount:rows.filter(row=>(row.createdAt||"").slice(0,7)===previousMonth).length,immediateCount:rows.filter(row=>row.deliveryMethod==="즉시 비교안").length});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"집계 조회 실패"},{status:500});}
}

export async function POST(request:Request){
  try{
    const body=await request.text();
    const response=await callFunction("",{method:"POST",body});
    const payload=await response.json();
    return Response.json(payload,{status:response.status});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"설문 저장 실패"},{status:500});}
}
