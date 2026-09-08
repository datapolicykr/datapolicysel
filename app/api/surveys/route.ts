import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { surveys } from "../../../db/schema";

const clean=(value:unknown)=>typeof value==="string"?value.trim():"";
const list=(value:unknown)=>Array.isArray(value)?value.filter((v):v is string=>typeof v==="string"):[];
const parse=(value:string)=>{try{return JSON.parse(value) as string[]}catch{return []}};

export async function GET(){
  try{
    const rows=await getDb().select().from(surveys).orderBy(desc(surveys.createdAt)).limit(5000);
    const regionMap=new Map<string,number>(),deviceMap=new Map<string,number>(),painMap=new Map<string,number>();
    let painCount=0,improvementCount=0,complianceCount=0,expiry3=0,expiry6=0,expiry12=0;
    const now=new Date();
    for(const row of rows){
      regionMap.set(row.region,(regionMap.get(row.region)??0)+1);
      for(const item of parse(row.devices))deviceMap.set(item,(deviceMap.get(item)??0)+1);
      const pains=parse(row.inconveniences).filter(v=>v!=="기타"); if(pains.length) painCount++;
      for(const item of pains)painMap.set(item,(painMap.get(item)??0)+1);
      if(parse(row.improvementItems).length)improvementCount++;
      if(parse(row.contractTerms).some(v=>["현금지원","리베이트"].includes(v)))complianceCount++;
      if(row.contractEndDate){const end=new Date(`${row.contractEndDate}T00:00:00`);const months=(end.getTime()-now.getTime())/(1000*60*60*24*30.44);if(months>=0&&months<=3)expiry3++;if(months>3&&months<=6)expiry6++;if(months>6&&months<=12)expiry12++;}
    }
    const ranked=(map:Map<string,number>,key:string)=>[...map].map(([name,count])=>({[key]:name,count})).sort((a,b)=>b.count-a.count);
    const monthKey=(date:Date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}`;
    const shiftMonth=(amount:number)=>{const date=new Date(now.getFullYear(),now.getMonth()+amount,1);return monthKey(date)};
    const months=Array.from({length:6},(_,i)=>shiftMonth(i));
    const expiryMonths=months.map(month=>({month,count:rows.filter(row=>row.contractEndDate.slice(0,7)===month).length}));
    const thisMonth=monthKey(now),previousMonth=shiftMonth(-1);
    const reps=[...new Set(rows.map(row=>row.salesRep).filter(Boolean))].sort();
    const targets=rows.map(row=>({id:row.id,clinicName:row.clinicName,region:row.region,district:row.district,currentVanDealer:row.currentVanDealer,currentPms:row.currentPms,terminalUsePeriod:row.terminalUsePeriod,contractType:row.contractType,contractEndDate:row.contractEndDate,monthlyCost:row.monthlyCost,linkFee:row.linkFee,deliveryMethod:row.deliveryMethod,salesRep:row.salesRep,createdAt:row.createdAt,devices:parse(row.devices),costItems:parse(row.costItems),contractTerms:parse(row.contractTerms),inconveniences:parse(row.inconveniences),improvementItems:parse(row.improvementItems),contactWhen:row.contactWhen,fieldMemo:row.fieldMemo}));
    return Response.json({total:rows.length,regions:ranked(regionMap,"region"),devices:ranked(deviceMap,"device"),pains:ranked(painMap,"pain").slice(0,8),painCount,improvementCount,complianceCount,expiry:{m3:expiry3,m6:expiry6,m12:expiry12},expiryMonths,reps,targets,thisMonthCount:rows.filter(row=>row.createdAt.slice(0,7)===thisMonth).length,previousMonthCount:rows.filter(row=>row.createdAt.slice(0,7)===previousMonth).length,immediateCount:rows.filter(row=>row.deliveryMethod==="즉시 비교안").length});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"집계 조회 실패"},{status:500});}
}

export async function POST(request:Request){
  try{
    const body=await request.json() as Record<string,unknown>;
    const devices=list(body.devices),linkedServices=list(body.linkedServices),inconveniences=list(body.inconveniences),costItems=list(body.costItems),contractTerms=list(body.contractTerms),improvementItems=list(body.improvementItems);
    if(!clean(body.clinicName)||!clean(body.region)||!clean(body.district)||!clean(body.contractType)||devices.length===0)return Response.json({error:"필수 항목을 모두 입력해 주세요."},{status:400});
    const [saved]=await getDb().insert(surveys).values({
      clinicName:clean(body.clinicName),region:clean(body.region),district:clean(body.district),respondentRole:"",devices:JSON.stringify(devices),terminalCount:0,vanCompany:clean(body.currentVanDealer),pmsIntegrated:linkedServices.includes("PMS/EMR")?"예":"아니오",monthlyFee:costItems.length?"예":"아니오",freeSupplies:contractTerms.includes("소모품")?"예":"아니오",satisfaction:3,replacementIntent:improvementItems.length?"예":"모름",longContract:"모름",notes:"",
      linkedServices:JSON.stringify(linkedServices),inconveniences:JSON.stringify(inconveniences),contractType:clean(body.contractType),costItems:JSON.stringify(costItems),contractTerms:JSON.stringify(contractTerms),improvementItems:JSON.stringify(improvementItems),salesRep:clean(body.salesRep),terminalUsePeriod:clean(body.terminalUsePeriod),contractEndDate:clean(body.contractEndDate),monthlyCost:clean(body.monthlyCost),currentPms:clean(body.currentPms),currentVanDealer:clean(body.currentVanDealer),contact:clean(body.contact),contactWhen:clean(body.contactWhen),linkFee:clean(body.linkFee),deliveryMethod:clean(body.deliveryMethod),fieldMemo:clean(body.fieldMemo),
    }).returning({id:surveys.id});
    return Response.json(saved,{status:201});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"설문 저장 실패"},{status:500});}
}
