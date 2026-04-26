"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "./translations";

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    currency: "INR (₹)",
    language: "English",
    alerts: "Push + Email",
    theme: "Dark (Cyber)",
    user: {
      name: "Deepak Rathod",
      email: "deepak@fintrack.app",
      avatar: "https://api.dicebear.com/8.x/initials/png?seed=Deepak&backgroundColor=1a2233,3b82f6&textColor=ffffff"
    }
  });

  // Base currency is INR
  const exchangeRates = {
    "INR (₹)": 1,
    "USD ($)": 0.012,
    "EUR (€)": 0.011,
    "GBP (£)": 0.0095,
    "JPY (¥)": 1.85,
    "AUD ($)": 0.018,
    "CAD ($)": 0.016
  };

  const currencySymbols = {
    "INR (₹)": "₹",
    "USD ($)": "$",
    "EUR (€)": "€",
    "GBP (£)": "£",
    "JPY (¥)": "¥",
    "AUD ($)": "$",
    "CAD ($)": "$"
  };

  const getCurrencySymbol = () => {
    return currencySymbols[settings.currency] || "₹";
  };

  const convertValue = (val) => {
    const num = typeof val === "string" ? parseFloat(val.replace(/[^\d.-]/g, "")) : val;
    if (isNaN(num)) return val;
    const rate = exchangeRates[settings.currency] || 1;
    return num * rate;
  };

  const formatCurrency = (val) => {
    const converted = convertValue(val);
    const symbol = getCurrencySymbol();
    
    // Different locales for formatting
    const locale = settings.currency.includes("INR") ? "en-IN" : "en-US";
    
    return `${symbol}${converted.toLocaleString(locale, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const t = (key) => {
    const langDict = translations[settings.language] || translations["English"];
    return langDict[key] || translations["English"][key] || key;
  };

  const [hydrated, setHydrated] = useState(false);

  // Persist settings to localStorage
  useEffect(() => {
    const saved = localStorage.getItem("fintrack_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(prev => ({
          ...prev,
          ...parsed,
          // Ensure nested user object is also merged/preserved
          user: parsed.user ? { ...prev.user, ...parsed.user } : prev.user
        }));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem("fintrack_settings", JSON.stringify(settings));
    }
    
    // Apply theme globally - run after hydration or when settings change
    const themeClass = settings.theme
      .toLowerCase()
      .replace(/[()]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    
    document.documentElement.setAttribute("data-theme", themeClass);
  }, [settings, hydrated]);

  const updateSetting = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      updateSetting, 
      getCurrencySymbol, 
      convertValue, 
      formatCurrency,
      t 
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
