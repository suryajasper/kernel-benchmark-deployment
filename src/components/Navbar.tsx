// Navbar.tsx
import React, { useState } from "react";
import { FaHome, FaHistory, FaPlus, FaGuitar, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { useAuth } from "../contexts/AuthContext";
import PasswordModal from "./PasswordModal";

export type PageName = "dashboard" | "history" | "new" | "tune";

interface NavbarProps {
  activePage: PageName;
}

interface NavItemProps {
  name: PageName;
  label: string;
  requireAuth: boolean;
  icon: React.ReactElement;
}

const navItems: NavItemProps[] = [
  {
    name: "dashboard",
    label: "Dashboard",
    requireAuth: false,
    icon: <FaHome />,
  },
  { name: "tune", label: "Tuning", requireAuth: true, icon: <FaGuitar /> },
  {
    name: "history",
    label: "History",
    requireAuth: true,
    icon: <FaHistory />,
  },
  { name: "new", label: "Add Kernels", requireAuth: true, icon: <FaPlus /> },
];

const Navbar: React.FC<NavbarProps> = ({ activePage }) => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<PageName | null>(
    null
  );

  const handleNavClick = (e: React.MouseEvent, item: NavItemProps) => {
    if (item.requireAuth && !isAuthenticated) {
      e.preventDefault();
      setPendingNavigation(item.name);
      setShowPasswordModal(true);
    }
  };

  const handlePasswordSubmit = async (password: string) => {
    const success = await login(password);
    if (success && pendingNavigation) {
      navigate(`/${pendingNavigation}`);
      setPendingNavigation(null);
    } else if (!success) {
      throw new Error("Invalid password");
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <div className="text-xl font-bold text-gray-700">
          Benchmarking Dashboard
        </div>
        <ul className="flex space-x-6">
          {navItems.map((item) => {
            const isLocked = item.requireAuth && !isAuthenticated;

            return (
              <li key={item.name}>
                <Link
                  to={`/${item.name}`}
                  onClick={(e) => handleNavClick(e, item)}
                  className={twMerge(
                    "flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors",
                    activePage === item.name
                      ? "font-semibold text-blue-600"
                      : "",
                    isLocked ? "hover:text-gray-700" : ""
                  )}
                >
                  {isLocked ? <FaLock /> : item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPendingNavigation(null);
        }}
        onSubmit={handlePasswordSubmit}
      />
    </>
  );
};

export default Navbar;
