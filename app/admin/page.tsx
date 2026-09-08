import Link from "next/link";
import { requireChatGPTUser } from "../chatgpt-auth";
import AdminClient from "./AdminClient";

export default async function AdminPage(){
  const user=await requireChatGPTUser("/admin");
  return <main style={{minHeight:"100vh",background:"#f7f5f3"}}>
    <header style={{height:70,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",background:"#fff",borderBottom:"1px solid #e8e4e1",position:"sticky",top:0,zIndex:20}}>
      <div><strong style={{fontSize:18}}>VAN 설문 DB 관리</strong><div style={{fontSize:12,color:"#69717d",marginTop:3}}>{user.displayName}</div></div>
      <Link href="/" style={{textDecoration:"none",color:"#f05a00",fontWeight:800}}>설문 화면으로</Link>
    </header>
    <AdminClient/>
  </main>;
}
