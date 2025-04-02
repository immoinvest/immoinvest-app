import { createContext, useContext, useState, ReactNode } from 'react';
import { ModeleDonnees } from '../types';

// État initial des données
const initialData: ModeleDonnees = {
  bienImmobilier: {
    prixBienFAI: 0,
    fraisAgence: 0,
    montantTravaux: 0,
    fraisNotaire: 0,
    valeurTerrain: 0.1, // 10% par défaut
  },
  pretImmobilier: {
    montantEmprunte: 0,
    tauxInteret: 0,
    dureePret: 0,
    mensualite: 0,
    fraisDossier: 0,
    assuranceEmprunteur: 0,
  },
  donneesLocation: {
    loyerMensuel: 0,
    chargesLocatives: 0,
    tauxOccupation: 0.95, // 95% par défaut
    fraisGestion: 0.08, // 8% par défaut
  },
  donneesFiscales: {
    regimeFiscal: 'LMNP',
    tauxImposition: 0.3, // 30% par défaut
    tauxPrelevementsSociaux: 0.17, // 17% par défaut
  }
};

// Type pour les fonctions de mise à jour
type UpdateFunctions = {
  updateBienImmobilier: (bienImmobilier: Partial<ModeleDonnees['bienImmobilier']>) => void;
  updatePretImmobilier: (pretImmobilier: Partial<ModeleDonnees['pretImmobilier']>) => void;
  updateDonneesLocation: (donneesLocation: Partial<ModeleDonnees['donneesLocation']>) => void;
  updateDonneesFiscales: (donneesFiscales: Partial<ModeleDonnees['donneesFiscales']>) => void;
  updateResultats: (resultats: Partial<Omit<ModeleDonnees, 'bienImmobilier' | 'pretImmobilier' | 'donneesLocation' | 'donneesFiscales'>>) => void;
  resetData: () => void;
  loadData: (data: ModeleDonnees) => void;
};

// Création du contexte
const DataContext = createContext<{ data: ModeleDonnees } & UpdateFunctions>({
  data: initialData,
  updateBienImmobilier: () => {},
  updatePretImmobilier: () => {},
  updateDonneesLocation: () => {},
  updateDonneesFiscales: () => {},
  updateResultats: () => {},
  resetData: () => {},
  loadData: () => {},
});

// Hook personnalisé pour utiliser le contexte
export const useData = () => useContext(DataContext);

// Provider du contexte
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<ModeleDonnees>(initialData);

  // Fonction pour mettre à jour les données du bien immobilier
  const updateBienImmobilier = (bienImmobilier: Partial<ModeleDonnees['bienImmobilier']>) => {
    setData(prev => ({
      ...prev,
      bienImmobilier: {
        ...prev.bienImmobilier,
        ...bienImmobilier
      }
    }));
  };

  // Fonction pour mettre à jour les données du prêt
  const updatePretImmobilier = (pretImmobilier: Partial<ModeleDonnees['pretImmobilier']>) => {
    setData(prev => ({
      ...prev,
      pretImmobilier: {
        ...prev.pretImmobilier,
        ...pretImmobilier
      }
    }));
  };

  // Fonction pour mettre à jour les données de location
  const updateDonneesLocation = (donneesLocation: Partial<ModeleDonnees['donneesLocation']>) => {
    setData(prev => ({
      ...prev,
      donneesLocation: {
        ...prev.donneesLocation,
        ...donneesLocation
      }
    }));
  };

  // Fonction pour mettre à jour les données fiscales
  const updateDonneesFiscales = (donneesFiscales: Partial<ModeleDonnees['donneesFiscales']>) => {
    setData(prev => ({
      ...prev,
      donneesFiscales: {
        ...prev.donneesFiscales,
        ...donneesFiscales
      }
    }));
  };

  // Fonction pour mettre à jour les résultats
  const updateResultats = (resultats: Partial<Omit<ModeleDonnees, 'bienImmobilier' | 'pretImmobilier' | 'donneesLocation' | 'donneesFiscales'>>) => {
    setData(prev => ({
      ...prev,
      ...resultats
    }));
  };

  // Fonction pour réinitialiser les données
  const resetData = () => {
    setData(initialData);
  };

  // Fonction pour charger des données complètes
  const loadData = (newData: ModeleDonnees) => {
    setData(newData);
  };

  return (
    <DataContext.Provider value={{ 
      data, 
      updateBienImmobilier, 
      updatePretImmobilier, 
      updateDonneesLocation, 
      updateDonneesFiscales, 
      updateResultats,
      resetData,
      loadData
    }}>
      {children}
    </DataContext.Provider>
  );
};
