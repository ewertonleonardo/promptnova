import { useState, useContext, createContext, ReactNode, useCallback } from 'react';

interface A11yContextType {
  announcements: {
    polite: string;
    assertive: string;
  };
  announce: (message: string, assertive?: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: number;
  setFontSize: (size: number) => void;
}

const defaultContext: A11yContextType = {
  announcements: {
    polite: '',
    assertive: ''
  },
  announce: () => {},
  setHighContrast: () => {},
  setReducedMotion: () => {},
  highContrast: false,
  reducedMotion: false,
  fontSize: 16,
  setFontSize: () => {}
};

const A11yContext = createContext<A11yContextType>(defaultContext);

export const A11yProvider = ({ children }: { children: ReactNode }) => {
  const [announcements, setAnnouncements] = useState({
    polite: '',
    assertive: ''
  });
  
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  
  // Check user preferences from system
  useState(() => {
    if (typeof window !== 'undefined') {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(prefersReducedMotion.matches);
      
      // Check for high contrast preference
      const prefersHighContrast = window.matchMedia('(prefers-contrast: more)');
      setHighContrast(prefersHighContrast.matches);
      
      // Load saved preferences from localStorage if available
      const savedHighContrast = localStorage.getItem('highContrast');
      const savedReducedMotion = localStorage.getItem('reducedMotion');
      const savedFontSize = localStorage.getItem('fontSize');
      
      if (savedHighContrast) setHighContrast(savedHighContrast === 'true');
      if (savedReducedMotion) setReducedMotion(savedReducedMotion === 'true');
      if (savedFontSize) setFontSize(parseInt(savedFontSize, 10));
    }
  }, []);
  
  const announce = useCallback((message: string, assertive = false) => {
    setAnnouncements(prev => ({
      ...prev,
      [assertive ? 'assertive' : 'polite']: message
    }));
    
    // Clear announcement after a delay
    setTimeout(() => {
      setAnnouncements(prev => ({
        ...prev,
        [assertive ? 'assertive' : 'polite']: ''
      }));
    }, 3000);
  }, []);
  
  const handleSetHighContrast = useCallback((enabled: boolean) => {
    setHighContrast(enabled);
    localStorage.setItem('highContrast', String(enabled));
    document.documentElement.classList.toggle('high-contrast', enabled);
  }, []);
  
  const handleSetReducedMotion = useCallback((enabled: boolean) => {
    setReducedMotion(enabled);
    localStorage.setItem('reducedMotion', String(enabled));
    document.documentElement.classList.toggle('reduced-motion', enabled);
  }, []);
  
  const handleSetFontSize = useCallback((size: number) => {
    setFontSize(size);
    localStorage.setItem('fontSize', String(size));
    document.documentElement.style.fontSize = `${size}px`;
  }, []);
  
  const value = {
    announcements,
    announce,
    highContrast,
    setHighContrast: handleSetHighContrast,
    reducedMotion,
    setReducedMotion: handleSetReducedMotion,
    fontSize,
    setFontSize: handleSetFontSize
  };
  
  return (
    <A11yContext.Provider value={value}>
      {children}
    </A11yContext.Provider>
  );
};

export const useA11y = () => useContext(A11yContext);