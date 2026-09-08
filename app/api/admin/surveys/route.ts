import {createHash} from "crypto";

const SUPABASE_URL="https://euleyianbkyfnubckkjk.supabase.co";
const SUPABASE_KEY="sb_publishable_iZvZfi0XGXSbNftWOjKouA_yU6ICMKC";
const COOKIE="van_admin_session";

const hash=(v:string)=>createHash("sha256").update(v).digest("hex");
const getCookie=(request:Request,name:string)=>{const h=request.headers.get("cookie")||"";for(const part of h.split(";")){const [k,...rest]=part.trim().split("=");if(k===name)return rest.join("=")}return""};
const rpc=async(name:string,body:Record<string,unknown>)=>fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:"POST",headers:{apikey:SUPABASE_KEY,authorization:`Bearer ${SUPABASE_KEY}`,"content-type":"application/json"},body:JSON.stringify(body),cache:"no-store"});
const sessionHash=(request:Request)=>{const raw=getCookie(request,COOKIE);return raw?hash(raw):""};

const mapRow=(r:any)=>({id:String(r.id),clinicName:r.dentist_name||"",region:r.region||"",district:r.district||"",currentVanDealer:r.current_van_dealer||r.van_company||"",currentPms:r.current_pms||"",terminalUsePeriod:r.terminal_use_period||"",contractType:r.contract_type||"",contractEndDate:r.contract_end_date||"",monthlyCost:r.monthly_cost||"",managementFee:r.management_fee||"",linkFee:r.link_fee||"",salesRep:r.sales_rep||r.writer_name||"",contact:r.contact||"",contactWhen:r.contact_when||"",deliveryMethod:r.delivery_method||"",fieldMemo:r.field_memo||"",devices:JSON.stringify(r.devices||[]),linkedServices:JSON.stringify(r.linked_services||[]),inconveniences:JSON.stringify(r.inconveniences||[]),costItems:JSON.stringify(r.cost_items||[]),contractTerms:JSON.stringify(r.contract_terms||[]),improvementItems:JSON.stringify(r.improvement_items||[]),createdAt:r.created_at||""});
const parseJson=(v:unknown)=>{if(Array.isArray(v))return v;if(typeof v!=="string")return[];try{const x=JSON.parse(v);return Array.isArray(x)?x:[]}catch{return[]}};

export async function GET(request:Request){
  const t=sessionHash(request);if(!t)return Response.json({error:"관리자 로그인이 필요합니다."},{status:401});
  const r=await rpc("van_admin_list_surveys",{p_token_hash:t});
  const data=await r.json().catch(()=>({}));
  if(!r.ok)return Response.json({error:"관리자 세션이 만료되었거나 조회 권한이 없습니다."},{status:r.status===403?401:r.status});
  return Response.json({rows:Array.isArray(data)?data.map(mapRow):[]});
}

export async function PATCH(request:Request){
  const t=sessionHash(request);if(!t)return Response.json({error:"관리자 로그인이 필요합니다."},{status:401});
  const body=await request.json() as Record<string,unknown>;
  const payload={id:String(body.id||""),dentist_name:String(body.clinicName||""),region:String(body.region||""),district:String(body.district||""),current_van_dealer:String(body.currentVanDealer||""),current_pms:String(body.currentPms||""),terminal_use_period:String(body.terminalUsePeriod||""),contract_type:String(body.contractType||""),contract_end_date:String(body.contractEndDate||""),monthly_cost:String(body.monthlyCost||""),management_fee:String(body.managementFee||""),link_fee:String(body.linkFee||""),sales_rep:String(body.salesRep||""),contact:String(body.contact||""),contact_when:String(body.contactWhen||""),delivery_method:String(body.deliveryMethod||""),field_memo:String(body.fieldMemo||""),devices:parseJson(body.devices),linked_services:parseJson(body.linkedServices),inconveniences:parseJson(body.inconveniences),cost_items:parseJson(body.costItems),contract_terms:parseJson(body.contractTerms),improvement_items:parseJson(body.improvementItems)};
  const r=await rpc("van_admin_update_survey",{p_token_hash:t,p_payload:payload});
  const data=await r.json().catch(()=>({}));
  if(!r.ok)return Response.json({error:"수정 권한이 없거나 세션이 만료되었습니다."},{status:r.status===403?401:r.status});
  return Response.json({row:data});
}

export async function DELETE(request:Request){
  const t=sessionHash(request);if(!t)return Response.json({error:"관리자 로그인이 필요합니다."},{status:401});
  const body=await request.json() as Record<string,unknown>;
  const r=await rpc("van_admin_delete_survey",{p_token_hash:t,p_id:String(body.id||"")});
  const data=await r.json().catch(()=>false);
  if(!r.ok)return Response.json({error:"삭제 권한이 없거나 세션이 만료되었습니다."},{status:r.status===403?401:r.status});
  return Response.json({ok:data===true});
}
