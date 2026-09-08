import {createHash,randomBytes} from "crypto";

const SUPABASE_URL="https://euleyianbkyfnubckkjk.supabase.co";
const SUPABASE_KEY="sb_publishable_iZvZfi0XGXSbNftWOjKouA_yU6ICMKC";
const COOKIE="van_admin_session";

const hash=(v:string)=>createHash("sha256").update(v).digest("hex");
const getCookie=(request:Request,name:string)=>{const h=request.headers.get("cookie")||"";for(const part of h.split(";")){const [k,...rest]=part.trim().split("=");if(k===name)return rest.join("=")}return""};
const rpc=async(name:string,body:Record<string,unknown>)=>fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:"POST",headers:{apikey:SUPABASE_KEY,authorization:`Bearer ${SUPABASE_KEY}`,"content-type":"application/json"},body:JSON.stringify(body),cache:"no-store"});

export async function POST(request:Request){
  const body=await request.json().catch(()=>({})) as {id?:string;password?:string};
  const raw=randomBytes(32).toString("hex");
  const r=await rpc("van_admin_login",{p_id:String(body.id||""),p_pw:String(body.password||""),p_token_hash:hash(raw)});
  const data=await r.json().catch(()=>false);
  if(!r.ok||data!==true)return Response.json({error:"ID 또는 비밀번호가 올바르지 않습니다."},{status:401});
  const res=Response.json({ok:true});
  res.headers.append("Set-Cookie",`${COOKIE}=${raw}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`);
  return res;
}

export async function DELETE(request:Request){
  const raw=getCookie(request,COOKIE);
  if(raw)await rpc("van_admin_logout",{p_token_hash:hash(raw)}).catch(()=>null);
  const res=Response.json({ok:true});
  res.headers.append("Set-Cookie",`${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
  return res;
}
