import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "치과 결제환경 설문",
  description: "치과 결제기기와 VAN 서비스 현황을 조사하고 지역별로 집계합니다.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}<Link href="/admin" aria-label="DB 관리" style={{position:"fixed",right:18,bottom:18,zIndex:50,textDecoration:"none",background:"#20242b",color:"#fff",padding:"9px 13px",borderRadius:10,fontSize:12,fontWeight:800,boxShadow:"0 5px 16px rgba(0,0,0,.16)"}}>DB 관리</Link></body></html>;
}
