import type { Metadata } from "next";
import "./globals.css";
import "./admin-position.css";
import DashboardAdmin from "./DashboardAdmin";
import ComparisonDirection from "./ComparisonDirection";

export const metadata: Metadata = {
  title: "치과 결제환경 설문",
  description: "치과 결제기기와 VAN 서비스 현황을 조사하고 지역별로 집계합니다.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}<ComparisonDirection/><DashboardAdmin/></body></html>;
}