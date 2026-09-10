import type { Metadata } from "next";
import "./globals.css";
import "./admin-position.css";
import "./reference-dashboard.css";
import "./direct-ui-fixes.css";
import "./table-center.css";
import DashboardAdmin from "./DashboardAdmin";

export const metadata: Metadata = {
  title: "치과 결제환경 설문",
  description: "치과 결제기기와 VAN 서비스 현황을 조사하고 지역별로 집계합니다.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}<DashboardAdmin/></body></html>;
}
