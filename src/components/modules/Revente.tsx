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
  Slider
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { BienImmobilier, PretImmobilier, ResultatRevente } from '../../types';
import { calculerRevente } from '../../modules/revente';

interface ReventeProps {
  bienImmobilier: BienImmobilier;
  pretImmobilier: PretImmobilier;
  updateResultats: (resultats: { resultatRevente: ResultatRevente }) => void;
}

const Revente: React.FC<ReventeProps> = ({
  bienImmobilier,
  pretImmobilier,
  updateResultats
}) => {
  // États locaux pour les paramètres de revente
  const [dureeDetention, setDureeDetention] = useState<number>(10);
  const [tauxValorisationAnnuel, setTauxValorisationAnnuel] = useState<number>(0.02); // 2% par défaut
  const [fraisRevente, setFraisRevente] = useState<number>(0);
  
  // État local pour les résultats
  const [resultat, setResultat] = useState<ResultatRevente | null>(null);
  
  // Calcul du scénario de revente lorsque les données changent
  useEffect(() => {
    if (bienImmobilier.prixBienFAI > 0 && pretImmobilier.montantEmprunte > 0) {
      const resultatCalcul = calculerRevente(
        bienImmobilier, 
        pretImmobilier, 
        dureeDetention,
        tauxValorisationAnnuel,
        fraisRevente
      );
      setResultat(resultatCalcul);
      updateResultats({ resultatRevente: resultatCalcul });
    }
  }, [bienImmobilier, pretImmobilier, dureeDetention, tauxValorisationAnnuel, fraisRevente, updateResultats]);

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
        Scénario de revente
      </Typography>

      {/* Vérification des données préalables */}
      {(bienImmobilier.prixBienFAI === 0 || pretImmobilier.montantEmprunte === 0) && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Veuillez d'abord saisir les données du bien immobilier et du prêt dans l'onglet "Simulation de prêt".
        </Alert>
      )}

      {/* Paramètres de revente */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Paramètres de revente
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ width: '100%' }}>
              <Typography gutterBottom>
                Durée de détention: {dureeDetention} ans
              </Typography>
              <Slider
                value={dureeDetention}
                onChange={(_, value) => setDureeDetention(value as number)}
                min={1}
                max={30}
                step={1}
                marks={[
                  { value: 1, label: '1' },
                  { value: 10, label: '10' },
                  { value: 20, label: '20' },
                  { value: 30, label: '30' }
                ]}
                valueLabelDisplay="auto"
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Taux de valorisation annuel (%)"
              type="number"
              fullWidth
              InputProps={{
                endAdornment: (
                  <Tooltip title="Taux d'appréciation annuel du bien immobilier">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )
              }}
              value={tauxValorisationAnnuel * 100 || ''}
              onChange={(e) => setTauxValorisationAnnuel(Number(e.target.value) / 100)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Frais de revente"
              type="number"
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">€</InputAdornment>,
                endAdornment: (
                  <Tooltip title="Frais liés à la revente (agence, etc.)">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )
              }}
              value={fraisRevente || ''}
              onChange={(e) => setFraisRevente(Number(e.target.value))}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Résultats de la revente */}
      {resultat && (
        <>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Résultats de la revente après {dureeDetention} ans
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Valeurs à la revente
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Prix d'achat initial</TableCell>
                          <TableCell align="right">{formatMontant(bienImmobilier.prixBienFAI)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Valorisation totale</TableCell>
                          <TableCell align="right">{formatMontant(resultat.valorisationTotale)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Prix de vente estimé</TableCell>
                          <TableCell align="right">{formatMontant(resultat.prixVente)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Frais de revente</TableCell>
                          <TableCell align="right">{formatMontant(fraisRevente)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Capital restant dû</TableCell>
                          <TableCell align="right">{formatMontant(resultat.capitalRestantDu)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Bilan financier
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Investissement initial</TableCell>
                          <TableCell align="right">{formatMontant(resultat.investissementInitial)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Capital remboursé</TableCell>
                          <TableCell align="right">{formatMontant(resultat.capitalRembourse)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Intérêts payés</TableCell>
                          <TableCell align="right">{formatMontant(resultat.interetsPayes)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Plus-value brute</TableCell>
                          <TableCell align="right">{formatMontant(resultat.plusValueBrute)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Impôt sur la plus-value</TableCell>
                          <TableCell align="right">{formatMontant(resultat.impotPlusValue)}</TableCell>
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
              Résultat net de l'opération
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    bgcolor: resultat.resultatNetRevente >= 0 ? '#e8f5e9' : '#ffebee'
                  }}
                >
                  <Typography variant="subtitle1">Résultat net de la revente</Typography>
                  <Typography 
                    variant="h5" 
                    color={resultat.resultatNetRevente >= 0 ? 'success.main' : 'error.main'}
                  >
                    {formatMontant(resultat.resultatNetRevente)}
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
                  <Typography variant="subtitle1">Rentabilité totale</Typography>
                  <Typography 
                    variant="h5" 
                    color={resultat.rentabiliteTotale >= 0 ? 'success.main' : 'error.main'}
                  >
                    {formatPourcentage(resultat.rentabiliteTotale)}
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
                  <Typography variant="subtitle1">Rentabilité annualisée</Typography>
                  <Typography 
                    variant="h5" 
                    color={resultat.rentabiliteAnnualisee >= 0 ? 'success.main' : 'error.main'}
                  >
                    {formatPourcentage(resultat.rentabiliteAnnualisee)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>

          {/* Tableau d'évolution */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Évolution sur la durée de détention
            </Typography>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Année</TableCell>
                    <TableCell align="right">Valeur du bien</TableCell>
                    <TableCell align="right">Capital restant dû</TableCell>
                    <TableCell align="right">Valorisation</TableCell>
                    <TableCell align="right">Résultat net potentiel</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resultat.evolutionAnnuelle.map((row) => (
                    <TableRow key={row.annee}>
                      <TableCell>{row.annee}</TableCell>
                      <TableCell align="right">{formatMontant(row.valeurBien)}</TableCell>
                      <TableCell align="right">{formatMontant(row.capitalRestantDu)}</TableCell>
                      <TableCell align="right">{formatMontant(row.valorisation)}</TableCell>
                      <TableCell align="right">{formatMontant(row.resultatNetPotentiel)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default Revente;
