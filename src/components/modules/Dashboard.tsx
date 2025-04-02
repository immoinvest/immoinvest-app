import React from 'react';
import { Box, Typography, Grid, Paper, Divider } from '@mui/material';
import { ModeleDonnees } from '../types';
import { calculerAutofinancement } from '../modules/autofinancement';
import { calculerImposition } from '../modules/imposition';
import { calculerRendements } from '../modules/rendement';

interface DashboardProps {
  donnees: ModeleDonnees;
}

const Dashboard: React.FC<DashboardProps> = ({ donnees }) => {
  // Calcul des résultats si les données nécessaires sont disponibles
  const hasBasicData = donnees.bienImmobilier.prixBienFAI > 0 && donnees.pretImmobilier.montantEmprunte > 0;
  const hasLocationData = donnees.donneesLocation.loyerMensuel > 0;
  
  // Résultats calculés à la volée pour le tableau de bord
  const resultatAutofinancement = hasBasicData && hasLocationData 
    ? calculerAutofinancement(donnees.bienImmobilier, donnees.pretImmobilier, donnees.donneesLocation)
    : null;
    
  const resultatImposition = hasBasicData && hasLocationData 
    ? calculerImposition(donnees.bienImmobilier, donnees.pretImmobilier, donnees.donneesLocation, donnees.donneesFiscales)
    : null;
    
  const resultatRendement = hasBasicData && hasLocationData 
    ? calculerRendements(donnees.bienImmobilier, donnees.pretImmobilier, donnees.donneesLocation, donnees.donneesFiscales)
    : null;

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
        Tableau de bord de l'investissement
      </Typography>

      {!hasBasicData ? (
        <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: '#f5f5f5' }}>
          <Typography variant="body1" align="center">
            Veuillez saisir les données du bien immobilier et du prêt dans l'onglet "Simulation de prêt" pour voir le tableau de bord.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Résumé de l'investissement */}
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Résumé de l'investissement
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">Bien immobilier</Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography>Prix du bien: {formatMontant(donnees.bienImmobilier.prixBienFAI)}</Typography>
                  <Typography>Frais de notaire: {formatMontant(donnees.bienImmobilier.fraisNotaire)}</Typography>
                  <Typography>Travaux: {formatMontant(donnees.bienImmobilier.montantTravaux)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">Prêt immobilier</Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography>Montant emprunté: {formatMontant(donnees.pretImmobilier.montantEmprunte)}</Typography>
                  <Typography>Taux d'intérêt: {formatPourcentage(donnees.pretImmobilier.tauxInteret)}</Typography>
                  <Typography>Durée: {donnees.pretImmobilier.dureePret} ans</Typography>
                  <Typography>Mensualité: {formatMontant(donnees.pretImmobilier.mensualite)}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Indicateurs clés */}
          {resultatAutofinancement && resultatRendement && (
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Indicateurs clés
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                    <Typography variant="subtitle2">Cash flow mensuel</Typography>
                    <Typography variant="h6" color={resultatAutofinancement.cashFlowMensuel >= 0 ? 'success.main' : 'error.main'}>
                      {formatMontant(resultatAutofinancement.cashFlowMensuel)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                    <Typography variant="subtitle2">Rendement brut</Typography>
                    <Typography variant="h6" color="success.main">
                      {formatPourcentage(resultatRendement.rendementBrut)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: '#fff8e1' }}>
                    <Typography variant="subtitle2">Rendement net</Typography>
                    <Typography variant="h6" color={resultatRendement.rendementNet >= 0 ? 'success.main' : 'error.main'}>
                      {formatPourcentage(resultatRendement.rendementNet)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: '#f3e5f5' }}>
                    <Typography variant="subtitle2">ROI</Typography>
                    <Typography variant="h6" color={resultatRendement.roi >= 0 ? 'success.main' : 'error.main'}>
                      {formatPourcentage(resultatRendement.roi)}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Autofinancement */}
          {resultatAutofinancement && (
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Autofinancement
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Entrées d'argent</Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography>Loyer HC: {formatMontant(resultatAutofinancement.detailEntrees.loyerHorsCharges)}</Typography>
                    <Typography>Charges locatives: {formatMontant(resultatAutofinancement.detailEntrees.chargesLocatives)}</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography fontWeight="bold">Total: {formatMontant(resultatAutofinancement.entreesArgent)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Sorties d'argent</Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography>Mensualité crédit: {formatMontant(resultatAutofinancement.detailSorties.mensualiteCredit)}</Typography>
                    <Typography>Assurance emprunteur: {formatMontant(resultatAutofinancement.detailSorties.assuranceEmprunteur)}</Typography>
                    <Typography>Taxe foncière: {formatMontant(resultatAutofinancement.detailSorties.taxeFonciere)}</Typography>
                    <Typography>Charges copropriété: {formatMontant(resultatAutofinancement.detailSorties.chargesCopropriete)}</Typography>
                    <Typography>Frais de gestion: {formatMontant(resultatAutofinancement.detailSorties.fraisGestion)}</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography fontWeight="bold">Total: {formatMontant(resultatAutofinancement.sortiesArgent)}</Typography>
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, p: 2, bgcolor: resultatAutofinancement.cashFlowMensuel >= 0 ? '#e8f5e9' : '#ffebee', borderRadius: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Cash flow mensuel: {formatMontant(resultatAutofinancement.cashFlowMensuel)}
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  Cash flow annuel: {formatMontant(resultatAutofinancement.cashFlowAnnuel)}
                </Typography>
              </Box>
            </Paper>
          )}

          {/* Imposition */}
          {resultatImposition && (
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Imposition ({donnees.donneesFiscales.regimeFiscal})
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography>Revenu imposable: {formatMontant(resultatImposition.revenuImposable)}</Typography>
                  <Typography>Charges déductibles: {formatMontant(resultatImposition.chargesDeductibles)}</Typography>
                  <Typography>Amortissements: {formatMontant(resultatImposition.amortissements)}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography>Montant de l'impôt: {formatMontant(resultatImposition.montantImpot)}</Typography>
                  <Typography fontWeight="bold">Résultat net après impôt: {formatMontant(resultatImposition.resultatNetApresImpot)}</Typography>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Rendements */}
          {resultatRendement && (
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Rendements
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography>Rendement brut: {formatPourcentage(resultatRendement.rendementBrut)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography>Rendement net: {formatPourcentage(resultatRendement.rendementNet)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography>Rendement net-net: {formatPourcentage(resultatRendement.rendementNetNet)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography>ROI: {formatPourcentage(resultatRendement.roi)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography>
                    Délai de récupération: {
                      resultatRendement.delaiRecuperation === Infinity 
                        ? 'Jamais' 
                        : `${resultatRendement.delaiRecuperation.toFixed(1)} ans`
                    }
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
};

export default Dashboard;
