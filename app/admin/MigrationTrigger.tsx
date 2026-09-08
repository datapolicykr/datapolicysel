"use client";
import {useEffect} from "react";

export default function MigrationTrigger(){
  useEffect(()=>{
    if(sessionStorage.getItem("van_d1_migration_checked"))return;
    sessionStorage.setItem("van_d1_migration_checked","1");
    void fetch("/api/admin/migrate-d1",{method:"POST"}).catch(()=>undefined);
  },[]);
  return null;
}
