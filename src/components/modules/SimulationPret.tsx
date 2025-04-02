import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  TextField, 
  Paper, 
  Slider, 
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Tooltip,
  IconButton
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { BienImmobilier, PretImmobilier } from '../../types';

interface SimulationPretProps {
  bienImmobilier: BienImmobilier;
  pretImmobilier: PretImmobilier;
  updateBienImmobilier: (bienImmobilier: Partial<BienImmobilier>) => void;
  updatePretImmobilier: (pretImmobilier: Partial<PretImmobilier>) => void;
}

const SimulationPret: React.FC<SimulationPretProps> = ({
  bienImmobilier,
  pretImmobilier,
  updateBienImmobilier,
  updatePretImmobilier
}) => {
  // État local pour les calculs
  const [apport, setApport] = useState<number>(0);
  const [tableauAmortissement, setTableauAmortissement] = useState<Array<{
    periode: number;
    capitalRestant: number;
    interet: number;
    capitalRembourse: number;
    mensualite: number;
    assurance: number;
  }>>([]);

  // Calcul du montant emprunté
  useEffect(() => {
    const montantTotal = bienImmobilier.prixBienFAI + bienImmobilier.montantTravaux + bienImmobilier.fraisNotaire;
    const montantEmprunte = montantTotal - apport;
    
    updatePretImmobilier({ montantEmprunte: Math.max(0, montantEmprunte) });
  }, [bienImmobilier.prixBienFAI, bienImmobilier.montantTravaux, bienImmobilier.fraisNotaire, apport, updatePretImmobilier]);

  // Calcul de la mensualité
  useEffect(() => {
    if (pretImmobilier.montantEmprunte > 0 && pretImmobilier.tauxInteret > 0 && pretImmobilier.dureePret > 0) {
      const tauxMensuel = pretImmobilier.tauxInteret / 12;
      const nbMensualites = pretImmobilier.dureePret * 12;
      
      // Formule de calcul de la mensualité
      const mensualite = pretImmobilier.montantEmprunte * 
        (tauxMensuel * Math.pow(1 + tauxMensuel, nbMensualites)) / 
        (Math.pow(1 + tauxMensuel, nbMensualites) - 1);
      
      updatePretImmobilier({ mensualite });
      
      // Génération du tableau d'amortissement
      generateTableauAmortissement();
    }
  }, [pretImmobilier.montantEmprunte, pretImmobilier.tauxInteret, pretImmobilier.dureePret, updatePretImmobilier]);

  // Génération du tableau d'amortissement
  const generateTableauAmortissement = () => {
    if (pretImmobilier.montantEmprunte <= 0 || pretImmobilier.tauxInteret <= 0 || pretImmobilier.dureePret <= 0) {
      setTableauAmortissement([]);
      return;
    }

    const tauxMensuel = pretImmobilier.tauxInteret / 12;
    const nbMensualites = pretImmobilier.dureePret * 12;
    const mensualite = pretImmobilier.mensualite;
    const assuranceMensuelle = (pretImmobilier.montantEmprunte * pretImmobilier.assuranceEmprunteur) / 12;
    
    let capitalRestant = pretImmobilier.montantEmprunte;
    const tableau = [];
    
    for (let i = 1; i <= nbMensualites; i++) {
      const interet = capitalRestant * tauxMensuel;
      const capitalRembourse = mensualite - interet;
      capitalRestant -= capitalRembourse;
      
      tableau.push({
        periode: i,
        capitalRestant: Math.max(0, capitalRestant),
        interet,
        capitalRembourse,
        mensualite,
        assurance: assuranceMensuelle
      });
    }
    
    setTableauAmortissement(tableau);
  };

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
        Simulation de prêt immobilier
      </Typography>

      {/* Données du bien immobilier */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Données du bien immobilier
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Prix du bien FAI"
              type="number"
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">€</InputAdornment>,
                endAdornment: (
                  <Tooltip title="Prix du bien Frais d'Agence Inclus">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )
              }}
              value={bienImmobilier.prixBienFAI || ''}
              onChange={(e) => updateBienImmobilier({ prixBienFAI: Number(e.target.value) })}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Frais d'agence"
              type="number"
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">€</InputAdornment>,
                endAdornment: (
                  <Tooltip title="Frais d'agence immobilière">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )
              }}
              value={bienImmobilier.fraisAgence || ''}
              onChange={(e) => updateBienImmobilier({ fraisAgence: Number(e.target.value) })}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Montant des travaux"
              type="number"
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">€</InputAdornment>,
                endAdornment: (
                  <Tooltip title="Montant des travaux à réaliser">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )
              }}
              value={bienImmobilier.montantTravaux || ''}
              onChange={(e) => updateBienImmobilier({ montantTravaux: Number(e.target.value) })}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Frais de notaire"
              type="number"
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">€</InputAdornment>,
                endAdornment: (
                  <Tooltip title="Frais de notaire (environ 7-8% du prix du bien hors frais d'agence)">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )
              }}
              value={bienImmobilier.fraisNotaire || ''}
              onChange={(e) => updateBienImmobilier({ fraisNotaire: Number(e.target.value) })}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Valeur du terrain (%)"
              type="number"
              fullWidth
              InputProps={{
                endAdornment: (
                  <Tooltip title="Pourcentage du prix du bien correspondant à la valeur du terrain (généralement 10-20%)">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )
              }}
              value={bienImmobilier.valeurTerrain * 100 || ''}
              onChange={(e) => updateBienImmobilier({ valeurTerrain: Number(e.target.value) / 100 })}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Apport personnel"
              type="number"
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">€</InputAdornment>,
                endAdornment: (
                  <Tooltip title="Montant de l'apport personnel">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )
              }}
              value={apport || ''}
              onChange={(e) => setApport(Number(e.target.value))}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Données du prêt */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Données du prêt
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Montant emprunté"
              type="number"
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">€</InputAdornment>,
                endAdornment: (
                  <Tooltip title="Montant total emprunté (Prix + Travaux + Notaire - Apport)">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )
              }}
              value={pretImmobilier.montantEmprunte || ''}
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Taux d'intérêt (%)"
              type="number"
              fullWidth
              InputProps={{
                endAdornment: (
                  <Tooltip title="Taux d'intérêt annuel du prêt">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )
              }}
              value={pretImmobilier.tauxInteret * 100 || ''}
              onChange={(e) => updatePretImmobilier({ tauxInteret: Number(e.target.value) / 100 })}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ width: '100%' }}>
              <Typography gutterBottom>
                Durée du prêt: {pretImmobilier.dureePret} ans
              </Typography>
              <Slider
                value={pretImmobilier.dureePret}
                onChange={(_, value) => updatePretImmobilier({ dureePret: value as number })}
                min={5}
                max={30}
                step={1}
                marks={[
                  { value: 5, label: '5' },
                  { value: 15, label: '15' },
                  { value: 25, label: '25' },
                  { value: 30, label: '30' }
                ]}
                valueLabelDisplay="auto"
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Frais de dossier"
              type="number"
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">€</InputAdornment>,
                endAdornment: (
                  <Tooltip title="Frais de dossier bancaire">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )
              }}
              value={pretImmobilier.fraisDossier || ''}
              onChange={(e) => updatePretImmobilier({ fraisDossier: Number(e.target.value) })}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Taux assurance emprunteur (%)"
              type="number"
              fullWidth
              InputProps={{
                endAdornment: (
                  <Tooltip title="Taux annuel de l'assurance emprunteur">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )
              }}
              value={pretImmobilier.assuranceEmprunteur * 100 || ''}
              onChange={(e) => updatePretImmobilier({ assuranceEmprunteur: Number(e.target.value) / 100 })}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Mensualité"
              type="number"
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">€</InputAdornment>,
                endAdornment: (
                  <Tooltip title="Mensualité calculée (hors assurance)">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )
              }}
              value={pretImmobilier.mensualite.toFixed(2) || ''}
              disabled
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Résumé de la simulation */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Résumé de la simulation
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2">Montant total</Typography>
            <Typography variant="body1">
              {formatMontant(bienImmobilier.prixBienFAI + bienImmobilier.montantTravaux + bienImmobilier.fraisNotaire)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2">Montant emprunté</Typography>
            <Typography variant="body1">
              {formatMontant(pretImmobilier.montantEmprunte)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2">Mensualité (hors assurance)</Typography>
            <Typography variant="body1">
              {formatMontant(pretImmobilier.mensualite)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2">Mensualité (avec assurance)</Typography>
            <Typography variant="body1">
              {formatMontant(pretImmobilier.mensualite + (pretImmobilier.montantEmprunte * pretImmobilier.assuranceEmprunteur) / 12)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2">Coût total du crédit</Typography>
            <Typography variant="body1">
              {formatMontant((pretImmobilier.mensualite * pretImmobilier.dureePret * 12) - pretImmobilier.montantEmprunte)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2">Taux d'endettement</Typography>
            <Typography variant="body1">
              {/* Supposons un revenu mensuel de 3000€ pour l'exemple */}
              {formatPourcentage((pretImmobilier.mensualite + (pretImmobilier.montantEmprunte * pretImmobilier.assuranceEmprunteur) / 12) / 3000)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Tableau d'amortissement */}
      {tableauAmortissement.length > 0 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Tableau d'amortissement
          </Typography>
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Période</TableCell>
                  <TableCell align="right">Capital restant</TableCell>
                  <TableCell align="right">Intérêts</TableCell>
                  <TableCell align="right">Capital remboursé</TableCell>
                  <TableCell align="right">Mensualité</TableCell>
                  <TableCell align="right">Assurance</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableauAmortissement.slice(0, 24).map((row) => (
                  <TableRow key={row.periode}>
                    <TableCell>{row.periode}</TableCell>
                    <TableCell align="right">{formatMontant(row.capitalRestant)}</TableCell>
                    <TableCell align="right">{formatMontant(row.interet)}</TableCell>
                    <TableCell align="right">{formatMontant(row.capitalRembourse)}</TableCell>
                    <TableCell align="right">{formatMontant(row.mensualite)}</TableCell>
                    <TableCell align="right">{formatMontant(row.assurance)}</TableCell>
                    <TableCell align="right">{formatMontant(row.mensualite + row.assurance)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Affichage des 24 premières mensualités sur {tableauAmortissement.length}
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default SimulationPret;
