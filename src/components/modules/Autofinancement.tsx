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
import { BienImmobilier, PretImmobilier, DonneesLocation, ResultatAutofinancement } from '../../types';
import { calculerAutofinancement } from '../../modules/autofinancement';

interface AutofinancementProps {
  bienImmobilier: BienImmobilier;
  pretImmobilier: PretImmobilier;
  donneesLocation: DonneesLocation;
  updateDonneesLocation: (donneesLocation: Partial<DonneesLocation>) => void;
  updateResultats: (resultats: { resultatAutofinancement: ResultatAutofinancement }) => void;
}

const Autofinancement: React.FC<AutofinancementProps> = ({
  bienImmobilier,
  pretImmobilier,
  donneesLocation,
  updateDonneesLocation,
  updateResultats
}) => {
  // État local pour les résultats
  const [resultat, setResultat] = useState<ResultatAutofinancement | null>(null);
  
  // Calcul de l'autofinancement lorsque les données changent
  useEffect(() => {
    if (bienImmobilier.prixBienFAI > 0 && pretImmobilier.montantEmprunte > 0 && donneesLocation.loyerMensuel > 0) {
      const resultatCalcul = calculerAutofinancement(bienImmobilier, pretImmobilier, donneesLocation);
      setResultat(resultatCalcul);
      updateResultats({ resultatAutofinancement: resultatCalcul });
    }
  }, [bienImmobilier, pretImmobilier, donneesLocation, updateResultats]);

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
        Calcul de l'autofinancement
      </Typography>

      {/* Vérification des données préalables */}
      {(bienImmobilier.prixBienFAI === 0 || pretImmobilier.montantEmprunte === 0) && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Veuillez d'abord saisir les données du bien immobilier et du prêt dans l'onglet "Simulation de prêt".
        </Alert>
      )}

      {/* Données de location */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Données de location
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Loyer mensuel hors charges"
              type="number"
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">€</InputAdornment>,
                endAdornment: (
                  <Tooltip title="Loyer mensuel que vous comptez percevoir, hors charges">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )
              }}
              value={donneesLocation.loyerMensuel || ''}
              onChange={(e) => updateDonneesLocation({ loyerMensuel: Number(e.target.value) })}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Charges locatives"
              type="number"
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">€</InputAdornment>,
                endAdornment: (
                  <Tooltip title="Charges locatives récupérables auprès du locataire">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )
              }}
              value={donneesLocation.chargesLocatives || ''}
              onChange={(e) => updateDonneesLocation({ chargesLocatives: Number(e.target.value) })}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Taux d'occupation (%)"
              type="number"
              fullWidth
              InputProps={{
                endAdornment: (
                  <Tooltip title="Taux d'occupation annuel estimé (généralement 95% pour tenir compte de la vacance locative)">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )
              }}
              value={donneesLocation.tauxOccupation * 100 || ''}
              onChange={(e) => updateDonneesLocation({ tauxOccupation: Number(e.target.value) / 100 })}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Frais de gestion (%)"
              type="number"
              fullWidth
              InputProps={{
                endAdornment: (
                  <Tooltip title="Pourcentage du loyer prélevé par l'agence de gestion (généralement 7-10%)">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )
              }}
              value={donneesLocation.fraisGestion * 100 || ''}
              onChange={(e) => updateDonneesLocation({ fraisGestion: Number(e.target.value) / 100 })}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Résultats de l'autofinancement */}
      {resultat && (
        <>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Résultats de l'autofinancement
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Entrées d'argent mensuelles
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Loyer hors charges</TableCell>
                          <TableCell align="right">{formatMontant(resultat.detailEntrees.loyerHorsCharges)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Charges locatives</TableCell>
                          <TableCell align="right">{formatMontant(resultat.detailEntrees.chargesLocatives)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Total des entrées</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatMontant(resultat.entreesArgent)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Sorties d'argent mensuelles
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Mensualité crédit</TableCell>
                          <TableCell align="right">{formatMontant(resultat.detailSorties.mensualiteCredit)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Assurance emprunteur</TableCell>
                          <TableCell align="right">{formatMontant(resultat.detailSorties.assuranceEmprunteur)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Taxe foncière</TableCell>
                          <TableCell align="right">{formatMontant(resultat.detailSorties.taxeFonciere)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Assurance PNO</TableCell>
                          <TableCell align="right">{formatMontant(resultat.detailSorties.assurancePNO)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Charges copropriété</TableCell>
                          <TableCell align="right">{formatMontant(resultat.detailSorties.chargesCopropriete)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Frais de gestion</TableCell>
                          <TableCell align="right">{formatMontant(resultat.detailSorties.fraisGestion)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Provision vacance locative</TableCell>
                          <TableCell align="right">{formatMontant(resultat.detailSorties.provisionVacanceLocative)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Provision travaux</TableCell>
                          <TableCell align="right">{formatMontant(resultat.detailSorties.provisionTravaux)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Total des sorties</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatMontant(resultat.sortiesArgent)}</TableCell>
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
              Cash flow
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    bgcolor: resultat.cashFlowMensuel >= 0 ? '#e8f5e9' : '#ffebee'
                  }}
                >
                  <Typography variant="subtitle1">Cash flow mensuel</Typography>
                  <Typography 
                    variant="h5" 
                    color={resultat.cashFlowMensuel >= 0 ? 'success.main' : 'error.main'}
                  >
                    {formatMontant(resultat.cashFlowMensuel)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    bgcolor: resultat.cashFlowAnnuel >= 0 ? '#e8f5e9' : '#ffebee'
                  }}
                >
                  <Typography variant="subtitle1">Cash flow annuel</Typography>
                  <Typography 
                    variant="h5" 
                    color={resultat.cashFlowAnnuel >= 0 ? 'success.main' : 'error.main'}
                  >
                    {formatMontant(resultat.cashFlowAnnuel)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    bgcolor: resultat.tauxAutofinancement >= 1 ? '#e8f5e9' : '#ffebee'
                  }}
                >
                  <Typography variant="subtitle1">Taux d'autofinancement</Typography>
                  <Typography 
                    variant="h5" 
                    color={resultat.tauxAutofinancement >= 1 ? 'success.main' : 'error.main'}
                  >
                    {formatPourcentage(resultat.tauxAutofinancement)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {resultat.tauxAutofinancement >= 1 
                      ? "Les revenus couvrent les charges" 
                      : "Les revenus ne couvrent pas toutes les charges"}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>

          {/* Échéancier */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Échéancier
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Période</TableCell>
                    <TableCell align="right">Échéance mensuelle hors assurance</TableCell>
                    <TableCell align="right">Échéance mensuelle assurance comprise</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>1 à 12 mois</TableCell>
                    <TableCell align="right">{formatMontant(resultat.detailSorties.mensualiteCredit)}</TableCell>
                    <TableCell align="right">{formatMontant(resultat.detailSorties.mensualiteCredit + resultat.detailSorties.assuranceEmprunteur)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>13 à {pretImmobilier.dureePret * 12} mois</TableCell>
                    <TableCell align="right">{formatMontant(resultat.detailSorties.mensualiteCredit)}</TableCell>
                    <TableCell align="right">{formatMontant(resultat.detailSorties.mensualiteCredit + resultat.detailSorties.assuranceEmprunteur)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default Autofinancement;
