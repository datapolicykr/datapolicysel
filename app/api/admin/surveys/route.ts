import { getChatGPTUser } from "../../../chatgpt-auth";

const SUPABASE_URL="https://euleyianbkyfnubckkjk.supabase.co";
const SUPABASE_KEY="sb_publishable_iZvZfi0XGXSbNftWOjKouA_yU6ICMKC";
const FN=`${SUPABASE_URL}/functions/v1/van-surveys`;

async function proxy(request:Request,method:string,path:string,body?:string){
  const user=await getChatGPTUser();
  if(!user)return Response.json({error:"ChatGPT 관리자 로그인이 필요합니다."},{status:401});
  const token=request.headers.get("x-supabase-access-token")||"";
  if(!token)return Response.json({error:"Supabase 관리자 로그인이 필요합니다."},{status:401});
  const r=await fetch(`${FN}${path}`,{method,headers:{apikey:SUPABASE_KEY,authorization:`Bearer ${token}`,"content-type":"application/json"},body,cache:"no-store"});
  const data=await r.json().catch(()=>({error:"Supabase 응답을 읽지 못했습니다."}));
  return {r,data,user};
}

const mapRow=(r:any)=>({id:String(r.id),clinicName:r.dentist_name||"",region:r.region||"",district:r.district||"",currentVanDealer:r.current_van_dealer||r.van_company||"",currentPms:r.current_pms||"",terminalUsePeriod:r.terminal_use_period||"",contractType:r.contract_type||"",contractEndDate:r.contract_end_date||"",monthlyCost:r.monthly_cost||"",managementFee:r.management_fee||"",linkFee:r.link_fee||"",salesRep:r.sales_rep||r.writer_name||"",contact:r.contact||"",contactWhen:r.contact_when||"",deliveryMethod:r.delivery_method||"",fieldMemo:r.field_memo||"",devices:JSON.stringify(r.devices||[]),linkedServices:JSON.stringify(r.linked_services||[]),inconveniences:JSON.stringify(r.inconveniences||[]),costItems:JSON.stringify(r.cost_items||[]),contractTerms:JSON.stringify(r.contract_terms||[]),improvementItems:JSON.stringify(r.improvement_items||[]),createdAt:r.created_at||""});
const parseJson=(v:unknown)=>{if(Array.isArray(v))return v;if(typeof v!=="string")return[];try{const x=JSON.parse(v);return Array.isArray(x)?x:[]}catch{return[]}};

export async function GET(request:Request){
  const out=await proxy(request,"GET","?admin=1");
  if(out instanceof Response)return out;
  if(!out.r.ok)return Response.json(out.data,{status:out.r.status});
  const rows=Array.isArray(out.data)?out.data.map(mapRow):[];
  return Response.json({rows,user:{displayName:out.user.displayName,email:out.user.email}});
}

export async function PATCH(request:Request){
  const body=await request.json() as Record<string,unknown>;
  const payload={id:String(body.id||""),dentist_name:String(body.clinicName||""),region:String(body.region||""),district:String(body.district||""),current_van_dealer:String(body.currentVanDealer||""),current_pms:String(body.currentPms||""),terminal_use_period:String(body.terminalUsePeriod||""),contract_type:String(body.contractType||""),contract_end_date:String(body.contractEndDate||""),monthly_cost:String(body.monthlyCost||""),management_fee:String(body.managementFee||""),link_fee:String(body.linkFee||""),sales_rep:String(body.salesRep||""),contact:String(body.contact||""),contact_when:String(body.contactWhen||""),delivery_method:String(body.deliveryMethod||""),field_memo:String(body.fieldMemo||""),devices:parseJson(body.devices),linked_services:parseJson(body.linkedServices),inconveniences:parseJson(body.inconveniences),cost_items:parseJson(body.costItems),contract_terms:parseJson(body.contractTerms),improvement_items:parseJson(body.improvementItems)};
  const out=await proxy(request,"PATCH","",JSON.stringify(payload));
  if(out instanceof Response)return out;
  return Response.json(out.data,{status:out.r.status});
}

export async function DELETE(request:Request){
  const body=await request.json() as Record<string,unknown>;
  const id=encodeURIComponent(String(body.id||""));
  const out=await proxy(request,"DELETE",`?id=${id}`);
  if(out instanceof Response)return out;
  return Response.json(out.data,{status:out.r.status});
}
