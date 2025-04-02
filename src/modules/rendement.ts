import { BienImmobilier, PretImmobilier, DonneesLocation, DonneesFiscales, ResultatRendement } from '../types';
import { calculerAutofinancement } from './autofinancement';
import { calculerImposition } from './imposition';
import { estimerPrixVente } from './revente';

/**
 * Calcule les différents indicateurs de rendement d'un investissement immobilier
 * 
 * @param bienImmobilier Données du bien immobilier
 * @param pretImmobilier Données du prêt immobilier
 * @param donneesLocation Données de location
 * @param donneesFiscales Données fiscales
 * @param tauxValorisationAnnuel Taux de valorisation annuel estimé du bien
 * @param dureeDetention Durée de détention en années
 * @returns Résultat du calcul des rendements
 */
export function calculerRendements(
  bienImmobilier: BienImmobilier,
  pretImmobilier: PretImmobilier,
  donneesLocation: DonneesLocation,
  donneesFiscales: DonneesFiscales,
  tauxValorisationAnnuel: number = 0.02, // 2% par défaut
  dureeDetention: number = 15 // 15 ans par défaut
): ResultatRendement {
  // Calcul du montant total investi
  const montantInvesti = bienImmobilier.prixBienFAI + bienImmobilier.montantTravaux + bienImmobilier.fraisNotaire;
  
  // Calcul de l'autofinancement
  const resultatAutofinancement = calculerAutofinancement(bienImmobilier, pretImmobilier, donneesLocation);
  
  // Calcul de l'imposition
  const resultatImposition = calculerImposition(bienImmobilier, pretImmobilier, donneesLocation, donneesFiscales, dureeDetention);
  
  // Calcul du prix de vente estimé
  const prixVenteEstime = estimerPrixVente(bienImmobilier.prixBienFAI, tauxValorisationAnnuel, dureeDetention);
  
  // Calcul du rendement brut (loyers annuels / montant investi)
  const loyersAnnuels = resultatAutofinancement.detailEntrees.loyerHorsCharges * 12;
  const rendementBrut = loyersAnnuels / montantInvesti;
  
  // Calcul du rendement net (loyers - charges) / montant investi
  const chargesAnnuelles = (
    resultatAutofinancement.detailSorties.taxeFonciere +
    resultatAutofinancement.detailSorties.assurancePNO +
    resultatAutofinancement.detailSorties.chargesCopropriete +
    resultatAutofinancement.detailSorties.fraisGestion +
    resultatAutofinancement.detailSorties.provisionVacanceLocative +
    resultatAutofinancement.detailSorties.provisionTravaux
  ) * 12;
  
  const rendementNet = (loyersAnnuels - chargesAnnuelles) / montantInvesti;
  
  // Calcul du rendement net-net (après impôts)
  const rendementNetNet = resultatImposition.resultatNetApresImpot / montantInvesti;
  
  // Calcul du ROI (Return On Investment)
  // ROI = (Gain total - Investissement initial) / Investissement initial
  
  // Gain total = Cash flow cumulé + Plus-value
  const cashFlowCumule = resultatImposition.resultatNetApresImpot * dureeDetention;
  const plusValue = prixVenteEstime - bienImmobilier.prixBienFAI;
  
  // Impôt sur la plus-value (simplifié)
  // On suppose un taux d'imposition moyen de 20% après abattements
  const impotPlusValue = Math.max(0, plusValue * 0.2);
  
  const gainTotal = cashFlowCumule + (plusValue - impotPlusValue);
  const roi = (gainTotal - montantInvesti) / montantInvesti;
  
  // Calcul du délai de récupération (en années)
  // C'est le temps nécessaire pour que les cash flows cumulés égalent l'investissement initial
  const cashFlowAnnuel = resultatImposition.resultatNetApresImpot;
  const delaiRecuperation = cashFlowAnnuel > 0 ? montantInvesti / cashFlowAnnuel : Infinity;
  
  return {
    rendementBrut,
    rendementNet,
    rendementNetNet,
    roi,
    delaiRecuperation
  };
}

/**
 * Calcule le taux de rentabilité interne (TRI) d'un investissement immobilier
 * 
 * @param bienImmobilier Données du bien immobilier
 * @param pretImmobilier Données du prêt immobilier
 * @param donneesLocation Données de location
 * @param donneesFiscales Données fiscales
 * @param tauxValorisationAnnuel Taux de valorisation annuel estimé du bien
 * @param dureeDetention Durée de détention en années
 * @returns Taux de rentabilité interne (TRI)
 */
export function calculerTRI(
  bienImmobilier: BienImmobilier,
  pretImmobilier: PretImmobilier,
  donneesLocation: DonneesLocation,
  donneesFiscales: DonneesFiscales,
  tauxValorisationAnnuel: number = 0.02,
  dureeDetention: number = 15
): number {
  // Montant investi (flux initial négatif)
  const montantInvesti = bienImmobilier.prixBienFAI + bienImmobilier.montantTravaux + bienImmobilier.fraisNotaire;
  
  // Calcul de l'imposition pour obtenir le cash flow annuel
  const resultatImposition = calculerImposition(bienImmobilier, pretImmobilier, donneesLocation, donneesFiscales, dureeDetention);
  const cashFlowAnnuel = resultatImposition.resultatNetApresImpot;
  
  // Prix de vente estimé
  const prixVenteEstime = estimerPrixVente(bienImmobilier.prixBienFAI, tauxValorisationAnnuel, dureeDetention);
  
  // Impôt sur la plus-value (simplifié)
  const plusValue = prixVenteEstime - bienImmobilier.prixBienFAI;
  const impotPlusValue = Math.max(0, plusValue * 0.2);
  
  // Flux final (vente du bien - impôt sur la plus-value)
  const fluxFinal = prixVenteEstime - impotPlusValue;
  
  // Construction des flux de trésorerie
  const fluxTresorerie = [-montantInvesti];
  
  // Flux intermédiaires (cash flow annuel)
  for (let i = 1; i < dureeDetention; i++) {
    fluxTresorerie.push(cashFlowAnnuel);
  }
  
  // Dernier flux (cash flow + vente)
  fluxTresorerie.push(cashFlowAnnuel + fluxFinal);
  
  // Calcul du TRI par la méthode de Newton-Raphson
  return calculerTRINewtonRaphson(fluxTresorerie);
}

/**
 * Calcule le taux de rentabilité interne (TRI) par la méthode de Newton-Raphson
 * 
 * @param fluxTresorerie Tableau des flux de trésorerie (le premier est négatif, représentant l'investissement)
 * @param precision Précision souhaitée
 * @param maxIterations Nombre maximum d'itérations
 * @returns Taux de rentabilité interne (TRI)
 */
function calculerTRINewtonRaphson(
  fluxTresorerie: number[],
  precision: number = 0.0001,
  maxIterations: number = 100
): number {
  // Estimation initiale du TRI
  let tri = 0.1; // 10%
  
  // Fonction VAN (Valeur Actuelle Nette)
  const van = (taux: number): number => {
    return fluxTresorerie.reduce((acc, flux, index) => {
      return acc + flux / Math.pow(1 + taux, index);
    }, 0);
  };
  
  // Dérivée de la fonction VAN
  const vanDerivee = (taux: number): number => {
    return fluxTresorerie.reduce((acc, flux, index) => {
      if (index === 0) return acc;
      return acc - (index * flux) / Math.pow(1 + taux, index + 1);
    }, 0);
  };
  
  // Méthode de Newton-Raphson
  let iteration = 0;
  let vanCourante = van(tri);
  
  while (Math.abs(vanCourante) > precision && iteration < maxIterations) {
    const derivee = vanDerivee(tri);
    
    // Éviter la division par zéro
    if (Math.abs(derivee) < 1e-10) break;
    
    // Mise à jour du TRI
    tri = tri - vanCourante / derivee;
    
    // Calcul de la nouvelle VAN
    vanCourante = van(tri);
    
    iteration++;
  }
  
  return tri;
}

/**
 * Calcule le cash flow cumulé sur la durée de détention
 * 
 * @param cashFlowAnnuel Cash flow annuel
 * @param dureeDetention Durée de détention en années
 * @returns Cash flow cumulé
 */
export function calculerCashFlowCumule(
  cashFlowAnnuel: number,
  dureeDetention: number
): number {
  return cashFlowAnnuel * dureeDetention;
}

/**
 * Calcule l'effort d'épargne mensuel nécessaire pour atteindre un objectif d'apport
 * 
 * @param objectifApport Montant de l'apport souhaité
 * @param dureeEpargne Durée d'épargne en années
 * @param tauxRendementEpargne Taux de rendement annuel de l'épargne
 * @returns Effort d'épargne mensuel nécessaire
 */
export function calculerEffortEpargneMensuel(
  objectifApport: number,
  dureeEpargne: number,
  tauxRendementEpargne: number = 0.02
): number {
  // Conversion du taux annuel en taux mensuel
  const tauxMensuel = Math.pow(1 + tauxRendementEpargne, 1/12) - 1;
  
  // Nombre de mois
  const nombreMois = dureeEpargne * 12;
  
  // Formule de l'épargne mensuelle nécessaire
  // M = P / ((1 + r)^n - 1) / r * (1 + r)
  // où M est l'épargne mensuelle, P est l'objectif, r est le taux mensuel, n est le nombre de mois
  
  return objectifApport / ((Math.pow(1 + tauxMensuel, nombreMois) - 1) / tauxMensuel * (1 + tauxMensuel));
}
