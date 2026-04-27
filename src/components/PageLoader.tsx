import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * Top-of-screen indigo loader bar that animates briefly on every route change.
 */
const PageLoader = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 650);
    return () => window.clearTimeout(t);
  }, [location.pathname]);

  if (!visible) return null;
  return <div className="page-loader" aria-hidden />;
};

export default PageLoader;
