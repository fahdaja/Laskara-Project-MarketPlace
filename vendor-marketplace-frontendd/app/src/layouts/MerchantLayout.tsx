import Header from "../components/merchant/Header";
import Sidebar from "../components/merchant/Sidebar";
import { Outlet } from 'react-router';
import MerchantOnboarding from "../pages/merchant/MerchantOnBoarding";
import { useState, useEffect } from "react";
import MerchantPending from "../pages/merchant/MerchantPending";
import MerchantActivated from "../pages/merchant/MerchantActivated";
import MerchantRejected from "../pages/merchant/MerchantRejected";

export default function MerchantLayout() {

  const [merchantStatus, setMerchantStatus] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("merchant_status") || "ONBOARDING";
    }
    return "ONBOARDING";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const status = localStorage.getItem("merchant_status") || "ONBOARDING";
      setMerchantStatus(status);
    }
  }, []);

  const handleStatusChange = (newStatus: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("merchant_status", newStatus);
      setMerchantStatus(newStatus);
      window.location.href = "/merchant/dashboard";
    }
  };


  if (merchantStatus === "ONBOARDING"){
    return (<MerchantOnboarding />
    )
  }

  if (merchantStatus === "PENDING_VERIFICATION"){
    return <MerchantPending /> 
  }
  
  if (merchantStatus === "APPROVE"){
    return ( <MerchantActivated onEnterDashboard={() => {
      handleStatusChange("ACTIVE")
    }} />)
  }
  
  if (merchantStatus === "REJECTED"){
    return <MerchantRejected/>
  }






  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      {/* Sidebar dengan border kanan tegas */}
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header Atas */}
        <Header />

        {/* Area Konten Utama dengan background sedikit kontras */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}