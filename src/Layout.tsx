import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import { SidebarProvider } from "./components/ui/sidebar";
import SideBar from "./components/Sidebar";

function Layout() {
  return (
    <SidebarProvider>
      <div className="flex flex-col w-full">
        <Header className="w-full" />
        <div className="flex bg-gray-100">
          <SideBar className="inset-y-24 my-2" hide={false} />
          <main className="w-full overflow-hidden md:py-6 md:px-4 min-h-[90vh]">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default Layout;
