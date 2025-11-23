import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  // Initialize language from localStorage or default to 'en'
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedLanguage = window.localStorage.getItem('foodMenuLanguage');
        return savedLanguage || 'en';
      } catch (error) {
        console.error('Error loading language from localStorage:', error);
        return 'en';
      }
    }
    return 'en';
  });

  // Save language to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('foodMenuLanguage', language);
      } catch (error) {
        console.error('Error saving language to localStorage:', error);
      }
    }
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'zh' : 'en');
  };

  const t = (enText, zhText) => {
    return language === 'zh' ? zhText : enText;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Made with Bob
