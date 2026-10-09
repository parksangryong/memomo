import { Outlet } from "react-router-dom";
import { AD_SLOTS } from "../config/ads";
import { AdSense } from "../Advertising/AdSense";

const BaseLayout = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="layout-container">
      <Outlet />
      <AdSense slot={AD_SLOTS.footer} />
      <span className="copyright">
        © {currentYear} Memomo. Mirr56 All rights reserved. 2025
      </span>
      <a href="/privacy" style={{display:"block",textAlign:"center",margin:"8px 0 24px",color:"#64748b",fontSize:12}}>개인정보처리방침</a>
    </div>
  );
};

export default BaseLayout;
