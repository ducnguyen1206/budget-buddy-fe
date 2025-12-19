import React, { useState, useEffect } from "react";
import DashboardLayout from "./DashboardLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import tokenRefreshManager from "../../utils/tokenRefreshManager";
import { getToken, getRefreshToken } from "../../utils/tokenManager";
import { refreshToken } from "../../services/authService";

export default function DashboardPage() {
  const { t } = useLanguage();
  
  return (
    <DashboardLayout activePage="overview">
      
    </DashboardLayout>
  );
}
