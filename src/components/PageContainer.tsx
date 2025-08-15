import type { ReactNode } from "react";
import type { PageName } from "./Navbar";
import Navbar from "./Navbar";
import { ClockLoader } from "react-spinners";

interface PageContainerProps {
  activePage: PageName;
  children: ReactNode;
  isLoading?: boolean;
}

export default function PageContainer({
  activePage,
  children,
  isLoading,
}: PageContainerProps) {
  return (
    <>
      <Navbar activePage={activePage} />
      <div className="px-12 pt-24 pb-6">
        {isLoading ? (
          <div className="w-[100%] h-[100%] flex justify-center content-center">
            <ClockLoader size={150} />
          </div>
        ) : (
          children
        )}
      </div>
    </>
  );
}
