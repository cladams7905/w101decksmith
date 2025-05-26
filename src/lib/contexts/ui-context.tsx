import React, { createContext, useContext, useState, useCallback } from "react";

interface UIContextType {
  rightSidebarOpen: boolean;
  leftPanelWidth: number;
  rightPanelWidth: number;
  isMobile: boolean;
  showNewDeckModal: boolean;
  showDeckSettingsModal: boolean;
  isEditingDeckName: boolean;
  toggleRightSidebar: () => void;
  setLeftPanelWidth: (width: number) => void;
  setRightPanelWidth: (width: number) => void;
  setShowNewDeckModal: (show: boolean) => void;
  setShowDeckSettingsModal: (show: boolean) => void;
  setIsEditingDeckName: (editing: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [leftPanelWidth, setLeftPanelWidth] = useState(320);
  const [rightPanelWidth, setRightPanelWidth] = useState(280);
  const [isMobile, setIsMobile] = useState(false);
  const [showNewDeckModal, setShowNewDeckModal] = useState(false);
  const [showDeckSettingsModal, setShowDeckSettingsModal] = useState(false);
  const [isEditingDeckName, setIsEditingDeckName] = useState(false);

  // Check if we're on mobile
  React.useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      if (isMobileView) {
        setRightSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleRightSidebar = useCallback(() => {
    if (!rightSidebarOpen && rightPanelWidth === 0) {
      setRightPanelWidth(280);
    }
    setRightSidebarOpen(!rightSidebarOpen);
  }, [rightSidebarOpen, rightPanelWidth]);

  const value = {
    rightSidebarOpen,
    leftPanelWidth,
    rightPanelWidth,
    isMobile,
    showNewDeckModal,
    showDeckSettingsModal,
    isEditingDeckName,
    toggleRightSidebar,
    setLeftPanelWidth,
    setRightPanelWidth,
    setShowNewDeckModal,
    setShowDeckSettingsModal,
    setIsEditingDeckName
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
