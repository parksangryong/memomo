import { Outlet } from "react-router-dom";
import { AdSense } from "../Advertising/AdSense";

const BaseLayout = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="layout-container">
      <Outlet />
      <AdSense slot={import.meta.env.VITE_ADSENSE_SLOT} />
      <span className="copyright">
        © {currentYear} Memomo. Mirr56 All rights reserved. 2025
      </span>
    </div>
  );
};

export default BaseLayout;
