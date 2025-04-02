import { BienImmobilier, PretImmobilier, DonneesLocation, ResultatAutofinancement } from '../types';

/**
 * Calcule l'autofinancement d'un investissement immobilier
 * 
 * @param bienImmobilier Données du bien immobilier
 * @param pretImmobilier Données du prêt immobilier
 * @param donneesLocation Données de location
 * @returns Résultat du calcul d'autofinancement
 */
export function calculerAutofinancement(
  bienImmobilier: BienImmobilier,
  pretImmobilier: PretImmobilier,
  donneesLocation: DonneesLocation
): ResultatAutofinancement {
  // Calcul des entrées d'argent
  const loyerHorsCharges = donneesLocation.loyerMensuel;
  const chargesLocatives = donneesLocation.chargesLocatives;
  
  // Ajustement avec le taux d'occupation (généralement calculé sur 11 mois sur 12)
  const loyerAjuste = loyerHorsCharges * donneesLocation.tauxOccupation;
  
  // Total des entrées
  const totalEntrees = loyerAjuste + chargesLocatives;
  
  // Calcul des sorties d'argent
  const mensualiteCredit = pretImmobilier.mensualite;
  const assuranceEmprunteur = (pretImmobilier.montantEmprunte * pretImmobilier.assuranceEmprunteur) / 12;
  
  // Charges récurrentes (basées sur les formules Excel analysées)
  const taxeFonciere = estimerTaxeFonciere(bienImmobilier.prixBienFAI);
  const assurancePNO = estimerAssurancePNO(bienImmobilier.prixBienFAI);
  const chargesCopropriete = estimerChargesCopropriete(bienImmobilier.prixBienFAI);
  
  // Frais de gestion (si applicable)
  const fraisGestion = loyerAjuste * donneesLocation.fraisGestion;
  
  // Provisions
  const provisionVacanceLocative = loyerHorsCharges * 0.05; // 5% pour la vacance locative
  const provisionTravaux = loyerHorsCharges * 0.10; // 10% pour les travaux
  
  // Total des sorties
  const totalSorties = mensualiteCredit + assuranceEmprunteur + taxeFonciere + 
                      assurancePNO + chargesCopropriete + fraisGestion + 
                      provisionVacanceLocative + provisionTravaux;
  
  // Calcul du cash flow
  const cashFlowMensuel = totalEntrees - totalSorties;
  const cashFlowAnnuel = cashFlowMensuel * 12;
  
  // Calcul du taux d'autofinancement
  const tauxAutofinancement = totalEntrees / totalSorties;
  
  return {
    entreesArgent: totalEntrees,
    sortiesArgent: totalSorties,
    cashFlowMensuel,
    cashFlowAnnuel,
    tauxAutofinancement,
    detailEntrees: {
      loyerHorsCharges: loyerAjuste,
      chargesLocatives,
      total: totalEntrees
    },
    detailSorties: {
      mensualiteCredit,
      assuranceEmprunteur,
      taxeFonciere,
      assurancePNO,
      chargesCopropriete,
      fraisGestion,
      provisionVacanceLocative,
      provisionTravaux,
      total: totalSorties
    }
  };
}

/**
 * Estime la taxe foncière basée sur le prix du bien
 * Cette formule est une approximation basée sur les données Excel analysées
 */
function estimerTaxeFonciere(prixBien: number): number {
  // Approximativement 1% du prix du bien divisé par 12 pour obtenir le montant mensuel
  return (prixBien * 0.01) / 12;
}

/**
 * Estime l'assurance PNO (Propriétaire Non Occupant) basée sur le prix du bien
 * Cette formule est une approximation basée sur les données Excel analysées
 */
function estimerAssurancePNO(prixBien: number): number {
  // Approximativement 0.2% du prix du bien divisé par 12 pour obtenir le montant mensuel
  return (prixBien * 0.002) / 12;
}

/**
 * Estime les charges de copropriété basées sur le prix du bien
 * Cette formule est une approximation basée sur les données Excel analysées
 */
function estimerChargesCopropriete(prixBien: number): number {
  // Approximativement 2% du prix du bien divisé par 12 pour obtenir le montant mensuel
  return (prixBien * 0.02) / 12;
}
