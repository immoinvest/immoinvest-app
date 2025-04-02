import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  TextField, 
  Paper, 
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
  Alert
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { BienImmobilier, PretImmobilier, DonneesLocation, DonneesFiscales, ResultatRendement } from '../../types';
import { calculerRendements } from '../../modules/rendement';

interface RendementProps {
  bienImmobilier: BienImmobilier;
  pretImmobilier: PretImmobilier;
  donneesLocation: DonneesLocation;
  donneesFiscales: DonneesFiscales;
  updateResultats: (resultats: { resultatRendement: ResultatRendement }) => void;
}

const Rendement: React.FC<RendementProps> = ({
  bienImmobilier,
  pretImmobilier,
  donneesLocation,
  donneesFiscales,
  updateResultats
}) => {
  // État local pour les résultats
  const [resultat, setResultat] = useState<ResultatRendement | null>(null);
  
  // Calcul des rendements lorsque les données changent
  useEffect(() => {
    if (bienImmobilier.prixBienFAI > 0 && pretImmobilier.montantEmprunte > 0 && donneesLocation.loyerMensuel > 0) {
      const resultatCalcul = calculerRendements(
        bienImmobilier, 
        pretImmobilier, 
        donneesLocation, 
        donneesFiscales
      );
      setResultat(resultatCalcul);
      updateResultats({ resultatRendement: resultatCalcul });
    }
  }, [bienImmobilier, pretImmobilier, donneesLocation, donneesFiscales, updateResultats]);

  // Formatage des nombres
  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
  };

  const formatPourcentage = (pourcentage: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(pourcentage);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Calcul des rendements
      </Typography>

      {/* Vérification des données préalables */}
      {(bienImmobilier.prixBienFAI === 0 || pretImmobilier.montantEmprunte === 0 || donneesLocation.loyerMensuel === 0) && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Veuillez d'abord saisir les données du bien immobilier, du prêt et de la location dans les onglets précédents.
        </Alert>
      )}

      {/* Résultats des rendements */}
      {resultat && (
        <>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Rendements de l'investissement
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Données de base
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Prix d'achat total</TableCell>
                          <TableCell align="right">{formatMontant(bienImmobilier.prixBienFAI + bienImmobilier.montantTravaux + bienImmobilier.fraisNotaire)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Apport personnel</TableCell>
                          <TableCell align="right">{formatMontant((bienImmobilier.prixBienFAI + bienImmobilier.montantTravaux + bienImmobilier.fraisNotaire) - pretImmobilier.montantEmprunte)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Loyer annuel</TableCell>
                          <TableCell align="right">{formatMontant(donneesLocation.loyerMensuel * 12 * donneesLocation.tauxOccupation)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Cash flow annuel</TableCell>
                          <TableCell align="right">{formatMontant(resultat.cashFlowAnnuel)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Rendements calculés
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Rendement brut</TableCell>
                          <TableCell align="right">{formatPourcentage(resultat.rendementBrut)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Rendement net</TableCell>
                          <TableCell align="right">{formatPourcentage(resultat.rendementNet)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Rendement net-net (après impôt)</TableCell>
                          <TableCell align="right">{formatPourcentage(resultat.rendementNetNet)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>ROI (Return On Investment)</TableCell>
                          <TableCell align="right">{formatPourcentage(resultat.roi)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Indicateurs de performance
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    bgcolor: resultat.rendementBrut >= 0.05 ? '#e8f5e9' : '#fff8e1'
                  }}
                >
                  <Typography variant="subtitle1">Rendement brut</Typography>
                  <Typography 
                    variant="h5" 
                    color={resultat.rendementBrut >= 0.05 ? 'success.main' : 'warning.main'}
                  >
                    {formatPourcentage(resultat.rendementBrut)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {resultat.rendementBrut >= 0.05 
                      ? "Bon rendement brut" 
                      : "Rendement brut moyen"}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    bgcolor: resultat.rendementNet >= 0.03 ? '#e8f5e9' : '#fff8e1'
                  }}
                >
                  <Typography variant="subtitle1">Rendement net</Typography>
                  <Typography 
                    variant="h5" 
                    color={resultat.rendementNet >= 0.03 ? 'success.main' : 'warning.main'}
                  >
                    {formatPourcentage(resultat.rendementNet)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {resultat.rendementNet >= 0.03 
                      ? "Bon rendement net" 
                      : "Rendement net moyen"}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    bgcolor: resultat.roi >= 0.1 ? '#e8f5e9' : '#fff8e1'
                  }}
                >
                  <Typography variant="subtitle1">ROI</Typography>
                  <Typography 
                    variant="h5" 
                    color={resultat.roi >= 0.1 ? 'success.main' : 'warning.main'}
                  >
                    {formatPourcentage(resultat.roi)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {resultat.roi >= 0.1 
                      ? "Excellent retour sur investissement" 
                      : "ROI correct"}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Analyse de l'investissement
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    bgcolor: '#f5f5f5'
                  }}
                >
                  <Typography variant="subtitle1">Délai de récupération</Typography>
                  <Typography variant="h5">
                    {resultat.delaiRecuperation === Infinity 
                      ? 'Jamais' 
                      : `${resultat.delaiRecuperation.toFixed(1)} ans`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Temps nécessaire pour récupérer l'investissement initial
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    bgcolor: '#f5f5f5'
                  }}
                >
                  <Typography variant="subtitle1">Effet de levier</Typography>
                  <Typography variant="h5">
                    {formatPourcentage(resultat.effetLevier)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Impact du financement par emprunt sur le rendement
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    bgcolor: '#f5f5f5'
                  }}
                >
                  <Typography variant="subtitle1">Rentabilité des fonds propres</Typography>
                  <Typography variant="h5">
                    {formatPourcentage(resultat.rentabiliteFondsPropres)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rendement sur l'apport personnel investi
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default Rendement;
