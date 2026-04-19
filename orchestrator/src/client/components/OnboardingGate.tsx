import { useOnboardingRequirement } from "@client/hooks/useOnboardingRequirement";
import type React from "react";
import { Navigate, useLocation } from "react-router-dom";

export const OnboardingGate: React.FC = () => {
  const location = useLocation();
  const isPublicRoute =
    location.pathname === "/" ||
    location.pathname === "/overview" ||
    location.pathname === "/onboarding" ||
    location.pathname === "/sign-in";
  const { checking, complete } = useOnboardingRequirement(!isPublicRoute);

  if (isPublicRoute) {
    return null;
  }

  if (checking || complete) {
    return null;
  }

  return <Navigate to="/onboarding" replace />;
};
