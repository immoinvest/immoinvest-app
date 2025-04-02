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
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { BienImmobilier, PretImmobilier, DonneesLocation, DonneesFiscales, ResultatImposition } from '../../types';
import { calculerImposition } from '../../modules/imposition';

interface ImpositionProps {
  bienImmobilier: BienImmobilier;
  pretImmobilier: PretImmobilier;
  donneesLocation: DonneesLocation;
  donneesFiscales: DonneesFiscales;
  updateDonneesFiscales: (donneesFiscales: Partial<DonneesFiscales>) => void;
  updateResultats: (resultats: { resultatImposition: ResultatImposition }) => void;
}

const Imposition: React.FC<ImpositionProps> = ({
  bienImmobilier,
  pretImmobilier,
  donneesLocation,
  donneesFiscales,
  updateDonneesFiscales,
  updateResultats
}) => {
  // État local pour les résultats
  const [resultat, setResultat] = useState<ResultatImposition | null>(null);
  const [dureeDetention, setDureeDetention] = useState<number>(15);
  
  // Calcul de l'imposition lorsque les données changent
  useEffect(() => {
    if (bienImmobilier.prixBienFAI > 0 && pretImmobilier.montantEmprunte > 0 && donneesLocation.loyerMensuel > 0) {
      const resultatCalcul = calculerImposition(
        bienImmobilier, 
        pretImmobilier, 
        donneesLocation, 
        donneesFiscales,
        dureeDetention
      );
      setResultat(resultatCalcul);
      updateResultats({ resultatImposition: resultatCalcul });
    }
  }, [bienImmobilier, pretImmobilier, donneesLocation, donneesFiscales, dureeDetention, updateResultats]);

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
        Calcul de l'imposition
      </Typography>

      {/* Vérification des données préalables */}
      {(bienImmobilier.prixBienFAI === 0 || pretImmobilier.montantEmprunte === 0 || donneesLocation.loyerMensuel === 0) && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Veuillez d'abord saisir les données du bien immobilier, du prêt et de la location dans les onglets précédents.
        </Alert>
      )}

      {/* Données fiscales */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Données fiscales
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id="regime-fiscal-label">Régime fiscal</InputLabel>
              <Select
                labelId="regime-fiscal-label"
                value={donneesFiscales.regimeFiscal}
                label="Régime fiscal"
                onChange={(e) => updateDonneesFiscales({ regimeFiscal: e.target.value as 'LMNP' | 'LMP' | 'NuePropriete' })}
              >
                <MenuItem value="LMNP">LMNP (Loueur Meublé Non Professionnel)</MenuItem>
                <MenuItem value="LMP">LMP (Loueur Meublé Professionnel)</MenuItem>
                <MenuItem value="NuePropriete">Nue-Propriété</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Taux d'imposition (%)"
              type="number"
              fullWidth
              InputProps={{
                endAdornment: (
                  <Tooltip title="Taux marginal d'imposition sur le revenu">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )
              }}
              value={donneesFiscales.tauxImposition * 100 || ''}
              onChange={(e) => updateDonneesFiscales({ tauxImposition: Number(e.target.value) / 100 })}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Taux prélèvements sociaux (%)"
              type="number"
              fullWidth
              InputProps={{
                endAdornment: (
                  <Tooltip title="Taux des prélèvements sociaux (17.2% en 2023)">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )
              }}
              value={donneesFiscales.tauxPrelevementsSociaux * 100 || ''}
              onChange={(e) => updateDonneesFiscales({ tauxPrelevementsSociaux: Number(e.target.value) / 100 })}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Durée de détention (années)"
              type="number"
              fullWidth
              InputProps={{
                endAdornment: (
                  <Tooltip title="Durée de détention pour le calcul des amortissements">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )
              }}
              value={dureeDetention || ''}
              onChange={(e) => setDureeDetention(Number(e.target.value))}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Résultats de l'imposition */}
      {resultat && (
        <>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Résultats de l'imposition ({donneesFiscales.regimeFiscal})
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Revenus et charges
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Revenus locatifs annuels</TableCell>
                          <TableCell align="right">{formatMontant(donneesLocation.loyerMensuel * donneesLocation.tauxOccupation * 12)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Charges déductibles</TableCell>
                          <TableCell align="right">{formatMontant(resultat.chargesDeductibles)}</TableCell>
                        </TableRow>
                        {donneesFiscales.regimeFiscal === 'LMNP' && (
                          <TableRow>
                            <TableCell>Amortissements</TableCell>
                            <TableCell align="right">{formatMontant(resultat.amortissements)}</TableCell>
                          </TableRow>
                        )}
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Revenu imposable</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatMontant(resultat.revenuImposable)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Imposition
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Taux d'imposition</TableCell>
                          <TableCell align="right">{formatPourcentage(donneesFiscales.tauxImposition)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Taux prélèvements sociaux</TableCell>
                          <TableCell align="right">{formatPourcentage(donneesFiscales.tauxPrelevementsSociaux)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Taux global</TableCell>
                          <TableCell align="right">{formatPourcentage(donneesFiscales.tauxImposition + donneesFiscales.tauxPrelevementsSociaux)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Montant de l'impôt</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatMontant(resultat.montantImpot)}</TableCell>
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
              Résultat net après impôt
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    bgcolor: resultat.resultatNetApresImpot >= 0 ? '#e8f5e9' : '#ffebee'
                  }}
                >
                  <Typography variant="subtitle1">Résultat net annuel après impôt</Typography>
                  <Typography 
                    variant="h5" 
                    color={resultat.resultatNetApresImpot >= 0 ? 'success.main' : 'error.main'}
                  >
                    {formatMontant(resultat.resultatNetApresImpot)}
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
                  <Typography variant="subtitle1">Résultat net mensuel après impôt</Typography>
                  <Typography 
                    variant="h5" 
                    color={resultat.resultatNetApresImpot / 12 >= 0 ? 'success.main' : 'error.main'}
                  >
                    {formatMontant(resultat.resultatNetApresImpot / 12)}
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
                  <Typography variant="subtitle1">Taux de rendement net après impôt</Typography>
                  <Typography 
                    variant="h5" 
                    color={resultat.resultatNetApresImpot / (bienImmobilier.prixBienFAI + bienImmobilier.montantTravaux + bienImmobilier.fraisNotaire) >= 0 ? 'success.main' : 'error.main'}
                  >
                    {formatPourcentage(resultat.resultatNetApresImpot / (bienImmobilier.prixBienFAI + bienImmobilier.montantTravaux + bienImmobilier.fraisNotaire))}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>

          {/* Tableau d'amortissement */}
          {donneesFiscales.regimeFiscal === 'LMNP' && resultat.tableauAmortissement.length > 0 && (
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Tableau d'amortissement fiscal
              </Typography>
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Année</TableCell>
                      <TableCell align="right">Amortissement bien</TableCell>
                      <TableCell align="right">Amortissement travaux</TableCell>
                      <TableCell align="right">Amortissement mobilier</TableCell>
                      <TableCell align="right">Total amortissement</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {resultat.tableauAmortissement.map((row) => (
                      <TableRow key={row.annee}>
                        <TableCell>{row.annee}</TableCell>
                        <TableCell align="right">{formatMontant(row.amortissementBien)}</TableCell>
                        <TableCell align="right">{formatMontant(row.amortissementTravaux)}</TableCell>
                        <TableCell align="right">{formatMontant(row.amortissementMobilier)}</TableCell>
                        <TableCell align="right">{formatMontant(row.totalAmortissement)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
};

export default Imposition;
