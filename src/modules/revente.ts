import { BienImmobilier, PretImmobilier, ResultatRevente } from '../types';

/**
 * Calcule les résultats d'un scénario de revente d'un bien immobilier
 * 
 * @param bienImmobilier Données du bien immobilier
 * @param pretImmobilier Données du prêt immobilier
 * @param prixVente Prix de vente estimé du bien
 * @param dureeDetention Durée de détention en années
 * @param tauxImpotPlusValue Taux d'imposition sur la plus-value (IR + prélèvements sociaux)
 * @returns Résultat du scénario de revente
 */
export function calculerScenarioRevente(
  bienImmobilier: BienImmobilier,
  pretImmobilier: PretImmobilier,
  prixVente: number,
  dureeDetention: number,
  tauxImpotPlusValue: number = 0.36 // 19% IR + 17% prélèvements sociaux par défaut
): ResultatRevente {
  // Prix d'achat total (prix du bien + frais)
  const prixAchatTotal = bienImmobilier.prixBienFAI + bienImmobilier.montantTravaux + bienImmobilier.fraisNotaire;
  
  // Calcul de la plus-value brute
  const plusValueBrute = prixVente - prixAchatTotal;
  
  // Calcul de l'abattement pour durée de détention
  // Pour l'IR : 6% par an de la 6ème à la 21ème année, 4% la 22ème année
  // Pour les PS : 1.65% par an de la 6ème à la 21ème année, 1.6% la 22ème année, 9% par an au-delà
  let abattementIR = 0;
  let abattementPS = 0;
  
  if (dureeDetention > 5) {
    // Abattement IR
    if (dureeDetention <= 21) {
      abattementIR = Math.min(1, 0.06 * (dureeDetention - 5));
    } else if (dureeDetention === 22) {
      abattementIR = 0.96 + 0.04;
    } else {
      abattementIR = 1; // Exonération totale après 22 ans
    }
    
    // Abattement PS
    if (dureeDetention <= 21) {
      abattementPS = Math.min(0.297, 0.0165 * (dureeDetention - 5));
    } else if (dureeDetention === 22) {
      abattementPS = 0.297 + 0.016;
    } else if (dureeDetention <= 30) {
      abattementPS = 0.313 + 0.09 * (dureeDetention - 22);
    } else {
      abattementPS = 1; // Exonération totale après 30 ans
    }
  }
  
  // Calcul de la plus-value imposable
  const partIR = 0.19 / tauxImpotPlusValue; // Part de l'IR dans le taux total
  const partPS = 0.17 / tauxImpotPlusValue; // Part des PS dans le taux total
  
  const plusValueImposableIR = Math.max(0, plusValueBrute * (1 - abattementIR));
  const plusValueImposablePS = Math.max(0, plusValueBrute * (1 - abattementPS));
  
  // Calcul de l'impôt sur la plus-value
  const impotIR = plusValueImposableIR * 0.19;
  const impotPS = plusValueImposablePS * 0.17;
  const impotPlusValue = impotIR + impotPS;
  
  // Calcul de la plus-value nette
  const plusValueNette = plusValueBrute - impotPlusValue;
  
  // Calcul du rendement global (plus-value nette / prix d'achat total)
  const rendementGlobal = plusValueNette / prixAchatTotal;
  
  return {
    prixVente,
    plusValueBrute,
    impotPlusValue,
    plusValueNette,
    rendementGlobal
  };
}

/**
 * Estime le prix de vente futur d'un bien immobilier
 * 
 * @param prixAchat Prix d'achat du bien
 * @param tauxValorisationAnnuel Taux de valorisation annuel estimé
 * @param dureeDetention Durée de détention en années
 * @returns Prix de vente estimé
 */
export function estimerPrixVente(
  prixAchat: number,
  tauxValorisationAnnuel: number,
  dureeDetention: number
): number {
  // Calcul du prix de vente avec intérêts composés
  return prixAchat * Math.pow(1 + tauxValorisationAnnuel, dureeDetention);
}

/**
 * Calcule le capital restant dû sur le prêt après une certaine durée
 * 
 * @param pretImmobilier Données du prêt immobilier
 * @param dureeEcoulee Durée écoulée en années
 * @returns Capital restant dû
 */
export function calculerCapitalRestantDu(
  pretImmobilier: PretImmobilier,
  dureeEcoulee: number
): number {
  const tauxMensuel = pretImmobilier.tauxInteret / 12;
  const nbMensualitesInitiales = pretImmobilier.dureePret * 12;
  const nbMensualitesEcoulees = Math.min(dureeEcoulee * 12, nbMensualitesInitiales);
  
  // Formule du capital restant dû
  const capitalRestantDu = pretImmobilier.montantEmprunte * 
    (1 - Math.pow(1 + tauxMensuel, nbMensualitesEcoulees - nbMensualitesInitiales)) / 
    (1 - Math.pow(1 + tauxMensuel, -nbMensualitesInitiales));
  
  return Math.max(0, capitalRestantDu);
}

/**
 * Calcule le résultat net d'une revente anticipée (prise en compte du capital restant dû)
 * 
 * @param bienImmobilier Données du bien immobilier
 * @param pretImmobilier Données du prêt immobilier
 * @param prixVente Prix de vente estimé du bien
 * @param dureeDetention Durée de détention en années
 * @param tauxImpotPlusValue Taux d'imposition sur la plus-value
 * @returns Résultat net de la revente anticipée
 */
export function calculerReventeAnticipee(
  bienImmobilier: BienImmobilier,
  pretImmobilier: PretImmobilier,
  prixVente: number,
  dureeDetention: number,
  tauxImpotPlusValue: number = 0.36
): {
  plusValueNette: number;
  capitalRestantDu: number;
  resultatNetRevente: number;
} {
  // Calcul du scénario de revente standard
  const resultatRevente = calculerScenarioRevente(
    bienImmobilier,
    pretImmobilier,
    prixVente,
    dureeDetention,
    tauxImpotPlusValue
  );
  
  // Calcul du capital restant dû
  const capitalRestantDu = calculerCapitalRestantDu(pretImmobilier, dureeDetention);
  
  // Calcul du résultat net de la revente (plus-value nette - capital restant dû)
  const resultatNetRevente = resultatRevente.plusValueNette - capitalRestantDu;
  
  return {
    plusValueNette: resultatRevente.plusValueNette,
    capitalRestantDu,
    resultatNetRevente
  };
}
