import { getChatGPTUser } from "../../../chatgpt-auth";
import { getDb } from "../../../../db";
import { surveys } from "../../../../db/schema";

const SUPABASE_URL="https://euleyianbkyfnubckkjk.supabase.co";
const SUPABASE_KEY="sb_publishable_iZvZfi0XGXSbNftWOjKouA_yU6ICMKC";
const FN=`${SUPABASE_URL}/functions/v1/van-surveys`;
const parse=(value:string)=>{try{const x=JSON.parse(value);return Array.isArray(x)?x:[]}catch{return[]}};

export async function POST(){
  const user=await getChatGPTUser();
  if(!user)return Response.json({error:"관리자 로그인이 필요합니다."},{status:401});
  try{
    const rows=await getDb().select().from(surveys).limit(10000);
    let migrated=0,skipped=0,failed=0;
    for(const row of rows){
      const payload={clientId:`d1:${row.id}`,clinicName:row.clinicName,region:row.region,district:row.district,currentVanDealer:row.currentVanDealer||row.vanCompany,currentPms:row.currentPms,terminalUsePeriod:row.terminalUsePeriod,contractType:row.contractType,contractEndDate:row.contractEndDate,monthlyCost:row.monthlyCost,managementFee:row.managementFee,linkFee:row.linkFee,deliveryMethod:row.deliveryMethod,salesRep:row.salesRep||"미입력(기존자료)",contact:row.contact,contactWhen:row.contactWhen,fieldMemo:row.fieldMemo,devices:parse(row.devices),linkedServices:parse(row.linkedServices),inconveniences:parse(row.inconveniences),costItems:parse(row.costItems),contractTerms:parse(row.contractTerms),improvementItems:parse(row.improvementItems)};
      const r=await fetch(FN,{method:"POST",headers:{apikey:SUPABASE_KEY,"content-type":"application/json"},body:JSON.stringify(payload)});
      const data=await r.json().catch(()=>({}));
      if(!r.ok){failed++;continue}
      if((data as any).duplicate)skipped++;else migrated++;
    }
    return Response.json({total:rows.length,migrated,skipped,failed});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"기존 DB 이관 실패"},{status:500});}
}
