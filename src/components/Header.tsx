// import notificationIcon from '../assets/icons/header/notification.svg'
import logo from "../assets/images/logo.png";
// import { Drawer } from 'vaul'
// import Notification from './Notification'
import { SidebarTrigger } from "./ui/sidebar";
// import { BellIcon } from 'lucide-react'

interface HeaderProps {
  className?: string;
  hide?: boolean;
}

const Header: React.FC<HeaderProps> = ({ className, hide }) => {
  if (hide) return null;

  return (
    <header
      className={`z-20 sticky top-0 left-0 flex flex-row items-center justify-between p-4 px-8 bg-white space-y-4 md:space-y-0 ${className}`}
    >
      <div className="flex justify-center items-center flex-row-reverse md:lg:flex-row gap-2">
        <div className="flex items-center justify-start">
          <img
            src={logo}
            alt="Logo"
            className="py-1 h-10 md:h-12 ml-4 md:ml-0"
          />
        </div>

        <div>
          <SidebarTrigger className="ml-0 md:ml-36" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-lg font-semibold text-heading flex-1 ml-4 hidden md:block">
        Food Order Dashboard
      </h1>

      <div className="flex flex-col md:flex-row items-end w-full md:w-auto space-y-4 md:space-y-0 md:space-x-4">
        {/* Buttons */}
        <div className="flex items-center w-auto space-x-4">
          {/* <Drawer.Root direction="right">
            <Drawer.Trigger>
              <div className="btn-normal flex items-center justify-center h-10 relative">
                <BellIcon className="h-6 w- text-primary-foreground" />
                <div className="text-black z-30 absolute top-1 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-400 p-1 foreground text-xs font-medium">
                  1
                </div>
                <img
                  className="h-6 w-6 absolute"
                  src={notificationIcon}
                  alt="AssignPen"
                />
              </div>
            </Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/40 z-200 z-40" />
              <Drawer.Content className="right-0 top-0 bottom-0 fixed z-50 outline-none w-[310px] flex">
                <div className="h-full w-full grow p-0 flex flex-col">
                  <div className="h-full max-w-md">
                    <Notification />
                  </div>
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
