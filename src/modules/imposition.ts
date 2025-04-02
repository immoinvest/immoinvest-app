import { BienImmobilier, PretImmobilier, DonneesLocation, DonneesFiscales, ResultatImposition } from '../types';
import { calculerAutofinancement } from './autofinancement';

/**
 * Calcule l'imposition d'un investissement immobilier selon le régime fiscal choisi
 * 
 * @param bienImmobilier Données du bien immobilier
 * @param pretImmobilier Données du prêt immobilier
 * @param donneesLocation Données de location
 * @param donneesFiscales Données fiscales
 * @param dureeDetention Durée de détention en années
 * @returns Résultat du calcul d'imposition
 */
export function calculerImposition(
  bienImmobilier: BienImmobilier,
  pretImmobilier: PretImmobilier,
  donneesLocation: DonneesLocation,
  donneesFiscales: DonneesFiscales,
  dureeDetention: number = 15 // Durée par défaut de 15 ans
): ResultatImposition {
  // Récupération des résultats d'autofinancement pour les revenus locatifs
  const resultatAutofinancement = calculerAutofinancement(bienImmobilier, pretImmobilier, donneesLocation);
  
  // Calcul des revenus locatifs annuels
  const revenusLocatifsAnnuels = resultatAutofinancement.detailEntrees.loyerHorsCharges * 12;
  
  // Calcul des charges déductibles selon le régime fiscal
  let chargesDeductibles = 0;
  let amortissements = 0;
  let revenuImposable = 0;
  let montantImpot = 0;
  
  // Tableau d'amortissement
  const tableauAmortissement = [];
  
  // Calcul selon le régime fiscal
  switch (donneesFiscales.regimeFiscal) {
    case 'LMNP':
      // En LMNP, on peut déduire les charges réelles et pratiquer l'amortissement
      
      // Charges déductibles annuelles
      chargesDeductibles = 
        (resultatAutofinancement.detailSorties.taxeFonciere +
        resultatAutofinancement.detailSorties.assurancePNO +
        resultatAutofinancement.detailSorties.chargesCopropriete +
        resultatAutofinancement.detailSorties.fraisGestion) * 12;
      
      // Intérêts d'emprunt (première année)
      const interetsEmprunt = calculerInteretsEmpruntPremiereAnnee(pretImmobilier);
      chargesDeductibles += interetsEmprunt;
      
      // Calcul des amortissements
      // Amortissement du bien (hors terrain) sur 30 ans
      const valeurBatiment = bienImmobilier.prixBienFAI * (1 - bienImmobilier.valeurTerrain);
      const amortissementAnnuelBatiment = valeurBatiment / 30;
      
      // Amortissement des travaux sur 10 ans
      const amortissementAnnuelTravaux = bienImmobilier.montantTravaux / 10;
      
      // Amortissement du mobilier (estimé à 10% du prix du bien) sur 5 ans
      const valeurMobilier = bienImmobilier.prixBienFAI * 0.1;
      const amortissementAnnuelMobilier = valeurMobilier / 5;
      
      // Total des amortissements pour la première année
      amortissements = amortissementAnnuelBatiment + amortissementAnnuelTravaux + amortissementAnnuelMobilier;
      
      // Génération du tableau d'amortissement
      for (let annee = 1; annee <= dureeDetention; annee++) {
        // Le mobilier est amorti sur 5 ans
        const amortissementMobilier = annee <= 5 ? amortissementAnnuelMobilier : 0;
        
        // Les travaux sont amortis sur 10 ans
        const amortissementTravaux = annee <= 10 ? amortissementAnnuelTravaux : 0;
        
        // Le bâtiment est amorti sur 30 ans
        const amortissementBien = annee <= 30 ? amortissementAnnuelBatiment : 0;
        
        const totalAmortissement = amortissementBien + amortissementTravaux + amortissementMobilier;
        
        tableauAmortissement.push({
          annee,
          amortissementBien,
          amortissementTravaux,
          amortissementMobilier,
          totalAmortissement
        });
      }
      
      // Calcul du revenu imposable (revenus - charges - amortissements)
      revenuImposable = Math.max(0, revenusLocatifsAnnuels - chargesDeductibles - amortissements);
      
      // Calcul de l'impôt (taux d'imposition + prélèvements sociaux)
      montantImpot = revenuImposable * (donneesFiscales.tauxImposition + donneesFiscales.tauxPrelevementsSociaux);
      
      break;
      
    case 'LMP':
      // En LMP, on peut déduire les charges réelles mais pas d'amortissement
      // Par contre, on peut imputer les déficits sur le revenu global
      
      // Charges déductibles annuelles (similaires à LMNP)
      chargesDeductibles = 
        (resultatAutofinancement.detailSorties.taxeFonciere +
        resultatAutofinancement.detailSorties.assurancePNO +
        resultatAutofinancement.detailSorties.chargesCopropriete +
        resultatAutofinancement.detailSorties.fraisGestion) * 12;
      
      // Intérêts d'emprunt (première année)
      const interetsEmpruntLMP = calculerInteretsEmpruntPremiereAnnee(pretImmobilier);
      chargesDeductibles += interetsEmpruntLMP;
      
      // Pas d'amortissement en LMP pour le calcul de l'impôt sur le revenu
      amortissements = 0;
      
      // Calcul du revenu imposable (revenus - charges)
      revenuImposable = revenusLocatifsAnnuels - chargesDeductibles;
      
      // Calcul de l'impôt (taux d'imposition + prélèvements sociaux)
      // Si déficit, l'impôt est nul (le déficit est imputable sur le revenu global)
      montantImpot = revenuImposable > 0 ? revenuImposable * (donneesFiscales.tauxImposition + donneesFiscales.tauxPrelevementsSociaux) : 0;
      
      break;
      
    case 'NuePropriete':
      // En nue-propriété, pas de revenus locatifs pendant la période de démembrement
      revenuImposable = 0;
      montantImpot = 0;
      break;
  }
  
  // Calcul du résultat net après impôt
  const resultatNetApresImpot = revenusLocatifsAnnuels - chargesDeductibles - montantImpot;
  
  return {
    revenuImposable,
    chargesDeductibles,
    amortissements,
    montantImpot,
    resultatNetApresImpot,
    tableauAmortissement
  };
}

/**
 * Calcule les intérêts d'emprunt pour la première année
 * 
 * @param pretImmobilier Données du prêt immobilier
 * @returns Montant des intérêts d'emprunt pour la première année
 */
function calculerInteretsEmpruntPremiereAnnee(pretImmobilier: PretImmobilier): number {
  // Calcul simplifié des intérêts d'emprunt pour la première année
  // Dans un calcul réel, il faudrait utiliser le tableau d'amortissement complet
  
  const capitalRestantDu = pretImmobilier.montantEmprunte;
  const tauxMensuel = pretImmobilier.tauxInteret / 12;
  let interetsPremiereAnnee = 0;
  
  // Simulation des 12 premiers mois
  let capitalRestant = capitalRestantDu;
  
  for (let mois = 1; mois <= 12; mois++) {
    const interetsMois = capitalRestant * tauxMensuel;
    const amortissementCapital = pretImmobilier.mensualite - interetsMois;
    
    interetsPremiereAnnee += interetsMois;
    capitalRestant -= amortissementCapital;
  }
  
  return interetsPremiereAnnee;
}
