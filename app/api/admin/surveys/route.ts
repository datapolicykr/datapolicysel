import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { surveys } from "../../../../db/schema";
import { getChatGPTUser } from "../../../chatgpt-auth";

const clean=(value:unknown)=>typeof value==="string"?value.trim():"";

async function requireAdmin(){
  const user=await getChatGPTUser();
  if(!user) return null;
  return user;
}

export async function GET(){
  const user=await requireAdmin();
  if(!user)return Response.json({error:"관리자 로그인이 필요합니다."},{status:401});
  try{
    const rows=await getDb().select().from(surveys).orderBy(desc(surveys.createdAt)).limit(5000);
    return Response.json({rows,user:{displayName:user.displayName,email:user.email}});
  }catch(error){
    return Response.json({error:error instanceof Error?error.message:"DB 조회 실패"},{status:500});
  }
}

export async function PATCH(request:Request){
  const user=await requireAdmin();
  if(!user)return Response.json({error:"관리자 로그인이 필요합니다."},{status:401});
  try{
    const body=await request.json() as Record<string,unknown>;
    const id=Number(body.id);
    if(!Number.isInteger(id)||id<=0)return Response.json({error:"올바른 ID가 필요합니다."},{status:400});
    const [saved]=await getDb().update(surveys).set({
      clinicName:clean(body.clinicName),
      region:clean(body.region),
      district:clean(body.district),
      currentVanDealer:clean(body.currentVanDealer),
      currentPms:clean(body.currentPms),
      terminalUsePeriod:clean(body.terminalUsePeriod),
      contractType:clean(body.contractType),
      contractEndDate:clean(body.contractEndDate),
      monthlyCost:clean(body.monthlyCost),
      managementFee:clean(body.managementFee),
      linkFee:clean(body.linkFee),
      salesRep:clean(body.salesRep),
      contact:clean(body.contact),
      contactWhen:clean(body.contactWhen),
      deliveryMethod:clean(body.deliveryMethod),
      fieldMemo:clean(body.fieldMemo),
      devices:clean(body.devices)||"[]",
      linkedServices:clean(body.linkedServices)||"[]",
      inconveniences:clean(body.inconveniences)||"[]",
      costItems:clean(body.costItems)||"[]",
      contractTerms:clean(body.contractTerms)||"[]",
      improvementItems:clean(body.improvementItems)||"[]",
    }).where(eq(surveys.id,id)).returning();
    if(!saved)return Response.json({error:"대상을 찾지 못했습니다."},{status:404});
    return Response.json(saved);
  }catch(error){
    return Response.json({error:error instanceof Error?error.message:"DB 수정 실패"},{status:500});
  }
}

export async function DELETE(request:Request){
  const user=await requireAdmin();
  if(!user)return Response.json({error:"관리자 로그인이 필요합니다."},{status:401});
  try{
    const body=await request.json() as Record<string,unknown>;
    const id=Number(body.id);
    if(!Number.isInteger(id)||id<=0)return Response.json({error:"올바른 ID가 필요합니다."},{status:400});
    const [deleted]=await getDb().delete(surveys).where(eq(surveys.id,id)).returning({id:surveys.id});
    if(!deleted)return Response.json({error:"대상을 찾지 못했습니다."},{status:404});
    return Response.json(deleted);
  }catch(error){
    return Response.json({error:error instanceof Error?error.message:"DB 삭제 실패"},{status:500});
  }
}
