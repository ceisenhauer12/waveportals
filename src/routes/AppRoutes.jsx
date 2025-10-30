// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";

// Pages
import Home from "../pages/Home.jsx";
import CityDetail from "../pages/CityDetail.jsx";
import CityAffiliates from "../pages/CityAffiliates.jsx";
import LandDetail from "../pages/LandDetail.jsx";
import SubLandDetail from "../pages/SubLandDetail.jsx";
import NotFound from "../pages/NotFound.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/city/:id" element={<CityDetail />} />
      <Route path="/city/:id/affiliates" element={<CityAffiliates />} />
      <Route path="/city/:id/land/:landId" element={<LandDetail />} />
      <Route path="/city/:id/land/:landId/sub/:subId" element={<SubLandDetail />} />
      <Route path="/404" element={<NotFound />} />
      {/* Keep this LAST */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
