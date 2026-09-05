import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MerchantInfo, CreateMerchantPayload } from '../types';
import { api } from '../services/api';

interface BusinessContextType {
  merchants: MerchantInfo[];
  currentMerchant: MerchantInfo | null;
  setCurrentMerchant: (m: MerchantInfo) => void;
  isLoadingMerchants: boolean;
  refreshMerchants: () => Promise<void>;
  isPortfolioModalOpen: boolean;
  setIsPortfolioModalOpen: (open: boolean) => void;
  isAddBusinessModalOpen: boolean;
  setIsAddBusinessModalOpen: (open: boolean) => void;
  createBusiness: (payload: CreateMerchantPayload) => Promise<MerchantInfo>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'mitraos_active_merchant_id';

export const BusinessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [merchants, setMerchants] = useState<MerchantInfo[]>([]);
  const [currentMerchant, setCurrentMerchantState] = useState<MerchantInfo | null>(null);
  const [isLoadingMerchants, setIsLoadingMerchants] = useState(true);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [isAddBusinessModalOpen, setIsAddBusinessModalOpen] = useState(false);

  const refreshMerchants = async () => {
    try {
      const data = await api.getMerchants();
      setMerchants(data);
      if (data.length > 0) {
        const savedId = localStorage.getItem(LOCAL_STORAGE_KEY);
        const match = data.find(m => m.id === savedId);
        if (match) {
          setCurrentMerchantState(match);
        } else if (!currentMerchant) {
          setCurrentMerchantState(data[0]);
          localStorage.setItem(LOCAL_STORAGE_KEY, data[0].id);
        } else {
          // Keep current merchant updated with fresh stats
          const updatedCurrent = data.find(m => m.id === currentMerchant.id) || data[0];
          setCurrentMerchantState(updatedCurrent);
        }
      }
    } catch (err) {
      console.error('Failed to load businesses:', err);
    } finally {
      setIsLoadingMerchants(false);
    }
  };

  useEffect(() => {
    refreshMerchants();
  }, []);

  const setCurrentMerchant = (m: MerchantInfo) => {
    setCurrentMerchantState(m);
    localStorage.setItem(LOCAL_STORAGE_KEY, m.id);
  };

  const createBusiness = async (payload: CreateMerchantPayload): Promise<MerchantInfo> => {
    const newMerchant = await api.createMerchant(payload);
    await refreshMerchants();
    setCurrentMerchant(newMerchant);
    return newMerchant;
  };

  return (
    <BusinessContext.Provider
      value={{
        merchants,
        currentMerchant,
        setCurrentMerchant,
        isLoadingMerchants,
        refreshMerchants,
        isPortfolioModalOpen,
        setIsPortfolioModalOpen,
        isAddBusinessModalOpen,
        setIsAddBusinessModalOpen,
        createBusiness
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = (): BusinessContextType => {
  const ctx = useContext(BusinessContext);
  if (!ctx) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return ctx;
};
