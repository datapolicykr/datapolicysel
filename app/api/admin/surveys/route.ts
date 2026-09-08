import {createHash} from "crypto";

const SUPABASE_URL="https://euleyianbkyfnubckkjk.supabase.co";
const SUPABASE_KEY="sb_publishable_iZvZfi0XGXSbNftWOjKouA_yU6ICMKC";
const COOKIE="van_admin_session";

const hash=(v:string)=>createHash("sha256").update(v).digest("hex");
const getCookie=(request:Request,name:string)=>{const h=request.headers.get("cookie")||"";for(const part of h.split(";")){const [k,...rest]=part.trim().split("=");if(k===name)return rest.join("=")}return""};
const rpc=async(name:string,body:Record<string,unknown>)=>fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:"POST",headers:{apikey:SUPABASE_KEY,authorization:`Bearer ${SUPABASE_KEY}`,"content-type":"application/json"},body:JSON.stringify(body),cache:"no-store"});
const sessionHash=(request:Request)=>{const raw=getCookie(request,COOKIE);return raw?hash(raw):""};
const arr=(v:any)=>Array.isArray(v)?v:[];
const obj=(v:any)=>v&&typeof v==="object"&&!Array.isArray(v)?v:{};
const mapRow=(r:any)=>({
  id:String(r.id||""),clinicName:r.dentist_name||"",region:r.region||"",district:r.district||"",respondentRole:r.respondent_role||"",
  vanCompany:r.van_company||"",currentVanDealer:r.current_van_dealer||"",currentPms:r.current_pms||"",terminalCount:r.terminal_count??0,
  terminalUsePeriod:r.terminal_use_period||"",contractType:r.contract_type||"",contractEndDate:r.contract_end_date||"",monthlyCost:r.monthly_cost||"",
  managementFee:r.management_fee||"",linkFee:r.link_fee||"",salesRep:r.sales_rep||"",writerName:r.writer_name||"",contact:r.contact||"",
  contactWhen:r.contact_when||"",deliveryMethod:r.delivery_method||"",fieldMemo:r.field_memo||"",resultType:r.result_type||"",clientId:r.client_id||"",
  devices:arr(r.devices),linkedServices:arr(r.linked_services),inconveniences:arr(r.inconveniences),costItems:arr(r.cost_items),contractTerms:arr(r.contract_terms),improvementItems:arr(r.improvement_items),
  answers:obj(r.answers),createdAt:r.created_at||"",contactName:r.contact_name||"",contactPhone:r.contact_phone||"",visitSchedule:r.visit_schedule||"",consultationNote:r.consultation_note||""
});

export async function GET(request:Request){
  const t=sessionHash(request);if(!t)return Response.json({error:"관리자 로그인이 필요합니다."},{status:401});
  const r=await rpc("van_admin_list_surveys_full",{p_token_hash:t});
  const data=await r.json().catch(()=>({}));
  if(!r.ok)return Response.json({error:"관리자 세션이 만료되었거나 조회 권한이 없습니다."},{status:r.status===403?401:r.status});
  return Response.json({rows:Array.isArray(data)?data.map(mapRow):[]});
}

export async function PATCH(request:Request){
  const t=sessionHash(request);if(!t)return Response.json({error:"관리자 로그인이 필요합니다."},{status:401});
  const b=await request.json() as Record<string,any>;
  const payload={
    id:String(b.id||""),dentist_name:String(b.clinicName??""),region:String(b.region??""),district:String(b.district??""),respondent_role:String(b.respondentRole??""),
    van_company:String(b.vanCompany??""),current_van_dealer:String(b.currentVanDealer??""),current_pms:String(b.currentPms??""),terminal_count:Number(b.terminalCount||0),
    terminal_use_period:String(b.terminalUsePeriod??""),contract_type:String(b.contractType??""),contract_end_date:String(b.contractEndDate??""),monthly_cost:String(b.monthlyCost??""),management_fee:String(b.managementFee??""),link_fee:String(b.linkFee??""),
    sales_rep:String(b.salesRep??""),writer_name:String(b.writerName??""),contact:String(b.contact??""),contact_when:String(b.contactWhen??""),delivery_method:String(b.deliveryMethod??""),field_memo:String(b.fieldMemo??""),result_type:String(b.resultType??""),client_id:String(b.clientId??""),
    devices:arr(b.devices),linked_services:arr(b.linkedServices),inconveniences:arr(b.inconveniences),cost_items:arr(b.costItems),contract_terms:arr(b.contractTerms),improvement_items:arr(b.improvementItems),answers:obj(b.answers),
    contact_name:String(b.contactName??""),contact_phone:String(b.contactPhone??""),visit_schedule:String(b.visitSchedule??""),consultation_note:String(b.consultationNote??"")
  };
  const r=await rpc("van_admin_update_survey_full",{p_token_hash:t,p_payload:payload});
  const data=await r.json().catch(()=>({}));
  if(!r.ok)return Response.json({error:"수정 권한이 없거나 세션이 만료되었습니다."},{status:r.status===403?401:r.status});
  return Response.json({row:mapRow(data)});
}

export async function DELETE(request:Request){
  const t=sessionHash(request);if(!t)return Response.json({error:"관리자 로그인이 필요합니다."},{status:401});
  const body=await request.json() as Record<string,unknown>;
  const r=await rpc("van_admin_delete_survey",{p_token_hash:t,p_id:String(body.id||"")});
  const data=await r.json().catch(()=>false);
  if(!r.ok)return Response.json({error:"삭제 권한이 없거나 세션이 만료되었습니다."},{status:r.status===403?401:r.status});
  return Response.json({ok:data===true});
}
