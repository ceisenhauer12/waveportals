// src/routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home.jsx";
import NotFound from "../pages/NotFound.jsx";
import CityDetail from "../pages/CityDetail.jsx";
import LandDetail from "../pages/LandDetail.jsx";
import SubLandDetail from "../pages/SubLandDetail.jsx";
import CityAffiliates from "../pages/CityAffiliates.jsx";
import Affiliates from "../pages/Affiliates.jsx"; // ← add this line

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/affiliates" element={<Affiliates />} /> {/* ← add this line */}
      <Route path="/city/:id" element={<CityDetail />} />
      <Route path="/city/:id/land/:landId" element={<LandDetail />} />
      <Route path="/city/:id/land/:landId/sub/:subId" element={<SubLandDetail />} />
      <Route path="/city/:id/affiliates" element={<CityAffiliates />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
