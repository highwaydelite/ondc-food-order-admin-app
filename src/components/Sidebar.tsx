import dashboardIcon from "../assets/icons/sidebar/dashboard.svg";
import ticketIcon from "../assets/icons/sidebar/tickets.svg";
import logoutIcon from "../assets/icons/sidebar/logOut.svg";
// import settingsIcon from "../assets/icons/sidebar/settings.svg";
import issuesIcon from "../assets/icons/sidebar/issues.svg";
import sellerIssuesIcon from "../assets/icons/sidebar/sellerIssues.svg";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { handleLogout } from "@/utils/auth-utils";

interface SideBarProps {
  hide: boolean;
  className?: string;
}

const SideBar: React.FC<SideBarProps> = ({ hide, className }) => {
  if (hide) return null;
  const { userDetails } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      label: "Orders",
      icon: dashboardIcon,
      to: "/admin/dashboard",
      isActive: () => location.pathname === "/admin/dashboard",
    },
    {
      label: "Settlements",
      icon: ticketIcon,
      to: "/admin/settlements",
      isActive: () => location.pathname === "/admin/settlements",
    },

    {
      label: "Issues",
      icon: issuesIcon,
      to: "/admin/issues",
      isActive: () => location.pathname === "/admin/issues",
    },
    {
      label: "Seller Issues",
      icon: sellerIssuesIcon,
      to: "/admin/seller-issues",
      isActive: () => location.pathname === "/admin/seller-issues",
    },
    // {
    //   label: "Activities",
    //   icon: dashboardIcon,
    //   to: "/admin/activities",
    //   isActive: () => location.pathname === "/admin/activities",
    // },
    // {
    //   label: "ActivitiesV2",
    //   icon: dashboardIcon,
    //   to: "/admin/activities/v2",
    //   isActive: () => location.pathname === "/admin/activities/v2",
    // },
    // {
    //   label: "Settings",
    //   icon: settingsIcon,
    //   to: "/admin/settings",
    //   isActive: () => location.pathname === "/admin/settings",
    // },
  ];

  return (
    <Sidebar
      variant="sidebar"
      side="left"
      collapsible="icon"
      className={`border-none py-2 bg-white rounded-r-xl ${className}`}
    >
      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel className="h-auto py-8 px-4 pt-0">
            <div className="flex flex-col items-start justify-center z-10 gap-1">
              <h3 className="text-black text-xl font-semibold mt-4">
                {userDetails.name || ""}
              </h3>
              <p className="text-xs text-gray-500">
                {userDetails.role?.join(" & ") || ""}
              </p>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems?.map((item) => (
                <div key={item.label}>
                  <SidebarMenuItem className="mx-0">
                    <SidebarMenuButton asChild className="my-1">
                      <NavLink
                        to={item.to}
                        className={`flex items-center space-x-2 p-4 py-5 rounded-md font-medium ${
                          item.isActive()
                            ? "bg-yellow-300 hover:bg-yellow-400 text-black"
                            : "text-black"
                        }`}
                      >
                        <img className="h-6" src={item.icon} alt="icon" />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <hr />
                </div>
              ))}
              <SidebarMenuItem className="mx-0">
                <SidebarMenuButton asChild className="my-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 p-4 py-5  text-black hover:bg-red-100 rounded-md "
                  >
                    <img className="h-6" src={logoutIcon} alt="icon" />
                    Logout
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default SideBar;
