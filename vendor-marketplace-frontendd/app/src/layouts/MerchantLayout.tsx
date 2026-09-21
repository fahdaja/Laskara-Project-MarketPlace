import Header from "../components/merchant/Header";
import Sidebar from "../components/merchant/Sidebar";
import { Outlet } from 'react-router';

export default function MerchantLayout() {
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