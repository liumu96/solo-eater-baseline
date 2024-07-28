"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

// 定义上下文类型
interface PreferencesContextType {
  selectedFeatures: string[];
  toggleFeature: (feature: string) => void;
  clearPreferences: () => void;
}

// 创建上下文，初始值为 undefined
const PreferencesContext = createContext<PreferencesContextType | undefined>(
  undefined
);

// 自定义钩子，使用上下文
export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
};

// 定义 Provider 组件的 props 类型
interface PreferencesProviderProps {
  children: ReactNode;
}

// 创建 Provider 组件
export const PreferencesProvider = ({ children }: PreferencesProviderProps) => {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  // todo 获取preferences

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prevSelectedFeatures) =>
      prevSelectedFeatures.includes(feature)
        ? prevSelectedFeatures.filter((f) => f !== feature)
        : [...prevSelectedFeatures, feature]
    );
  };

  const clearPreferences = () => {
    setSelectedFeatures([]);
  };

  return (
    <PreferencesContext.Provider
      value={{ selectedFeatures, toggleFeature, clearPreferences }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};
