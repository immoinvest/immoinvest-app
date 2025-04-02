import React, { useState } from 'react';
import { Tabs, Tab, Box, Container, Typography, Paper } from '@mui/material';
import SimulationPret from './modules/SimulationPret';
import Autofinancement from './modules/Autofinancement';
import Imposition from './modules/Imposition';
import Revente from './modules/Revente';
import Rendement from './modules/Rendement';
import Dashboard from './modules/Dashboard';
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

const Navigation: React.FC = () => {
  // État pour stocker les données partagées entre les modules
  const [donnees, setDonnees] = useState<ModeleDonnees>(initialData);
  
  // État pour l'onglet actif
  const [tabValue, setTabValue] = useState(0);

  // Gestionnaire de changement d'onglet
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Fonction pour mettre à jour les données du bien immobilier
  const updateBienImmobilier = (bienImmobilier: Partial<typeof donnees.bienImmobilier>) => {
    setDonnees(prev => ({
      ...prev,
      bienImmobilier: {
        ...prev.bienImmobilier,
        ...bienImmobilier
      }
    }));
  };

  // Fonction pour mettre à jour les données du prêt
  const updatePretImmobilier = (pretImmobilier: Partial<typeof donnees.pretImmobilier>) => {
    setDonnees(prev => ({
      ...prev,
      pretImmobilier: {
        ...prev.pretImmobilier,
        ...pretImmobilier
      }
    }));
  };

  // Fonction pour mettre à jour les données de location
  const updateDonneesLocation = (donneesLocation: Partial<typeof donnees.donneesLocation>) => {
    setDonnees(prev => ({
      ...prev,
      donneesLocation: {
        ...prev.donneesLocation,
        ...donneesLocation
      }
    }));
  };

  // Fonction pour mettre à jour les données fiscales
  const updateDonneesFiscales = (donneesFiscales: Partial<typeof donnees.donneesFiscales>) => {
    setDonnees(prev => ({
      ...prev,
      donneesFiscales: {
        ...prev.donneesFiscales,
        ...donneesFiscales
      }
    }));
  };

  // Fonction pour mettre à jour les résultats
  const updateResultats = (resultats: Partial<Omit<ModeleDonnees, 'bienImmobilier' | 'pretImmobilier' | 'donneesLocation' | 'donneesFiscales'>>) => {
    setDonnees(prev => ({
      ...prev,
      ...resultats
    }));
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ mt: 4, p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Simulateur d'Investissement Immobilier
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
            aria-label="navigation des modules"
          >
            <Tab label="Tableau de bord" />
            <Tab label="Simulation de prêt" />
            <Tab label="Autofinancement" />
            <Tab label="Imposition" />
            <Tab label="Revente" />
            <Tab label="Rendements" />
          </Tabs>
        </Box>

        {/* Contenu des onglets */}
        <TabPanel value={tabValue} index={0}>
          <Dashboard donnees={donnees} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <SimulationPret 
            bienImmobilier={donnees.bienImmobilier}
            pretImmobilier={donnees.pretImmobilier}
            updateBienImmobilier={updateBienImmobilier}
            updatePretImmobilier={updatePretImmobilier}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Autofinancement 
            bienImmobilier={donnees.bienImmobilier}
            pretImmobilier={donnees.pretImmobilier}
            donneesLocation={donnees.donneesLocation}
            updateDonneesLocation={updateDonneesLocation}
            updateResultats={updateResultats}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Imposition 
            bienImmobilier={donnees.bienImmobilier}
            pretImmobilier={donnees.pretImmobilier}
            donneesLocation={donnees.donneesLocation}
            donneesFiscales={donnees.donneesFiscales}
            updateDonneesFiscales={updateDonneesFiscales}
            updateResultats={updateResultats}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={4}>
          <Revente 
            bienImmobilier={donnees.bienImmobilier}
            pretImmobilier={donnees.pretImmobilier}
            updateResultats={updateResultats}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={5}>
          <Rendement 
            bienImmobilier={donnees.bienImmobilier}
            pretImmobilier={donnees.pretImmobilier}
            donneesLocation={donnees.donneesLocation}
            donneesFiscales={donnees.donneesFiscales}
            resultatAutofinancement={donnees.resultatAutofinancement}
            resultatImposition={donnees.resultatImposition}
            resultatRevente={donnees.resultatRevente}
            updateResultats={updateResultats}
          />
        </TabPanel>
      </Paper>
    </Container>
  );
};

// Composant TabPanel pour afficher le contenu de chaque onglet
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default Navigation;
