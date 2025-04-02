export interface BienImmobilier {
  prixBienFAI: number;
  fraisAgence: number;
  montantTravaux: number;
  fraisNotaire: number;
  valeurTerrain: number; // Pourcentage du prix du bien
}

export interface PretImmobilier {
  montantEmprunte: number;
  tauxInteret: number;
  dureePret: number; // en années
  mensualite: number;
  fraisDossier: number;
  assuranceEmprunteur: number; // taux annuel
}

export interface DonneesLocation {
  loyerMensuel: number;
  chargesLocatives: number;
  tauxOccupation: number; // Pourcentage (ex: 0.95 pour 95%)
  fraisGestion: number; // Pourcentage du loyer (ex: 0.08 pour 8%)
}

export interface DonneesFiscales {
  regimeFiscal: 'LMNP' | 'LMP' | 'NuePropriete';
  tauxImposition: number;
  tauxPrelevementsSociaux: number;
}

export interface ResultatAutofinancement {
  entreesArgent: number;
  sortiesArgent: number;
  cashFlowMensuel: number;
  cashFlowAnnuel: number;
  tauxAutofinancement: number;
  detailEntrees: {
    loyerHorsCharges: number;
    chargesLocatives: number;
    total: number;
  };
  detailSorties: {
    mensualiteCredit: number;
    assuranceEmprunteur: number;
    taxeFonciere: number;
    assurancePNO: number;
    chargesCopropriete: number;
    fraisGestion: number;
    provisionVacanceLocative: number;
    provisionTravaux: number;
    total: number;
  };
}

export interface ResultatImposition {
  revenuImposable: number;
  chargesDeductibles: number;
  amortissements: number;
  montantImpot: number;
  resultatNetApresImpot: number;
  tableauAmortissement: Array<{
    annee: number;
    amortissementBien: number;
    amortissementTravaux: number;
    amortissementMobilier: number;
    totalAmortissement: number;
  }>;
}

export interface ResultatRevente {
  prixVente: number;
  plusValueBrute: number;
  impotPlusValue: number;
  plusValueNette: number;
  rendementGlobal: number;
}

export interface ResultatRendement {
  rendementBrut: number;
  rendementNet: number;
  rendementNetNet: number;
  roi: number;
  delaiRecuperation: number;
}

export interface ModeleDonnees {
  bienImmobilier: BienImmobilier;
  pretImmobilier: PretImmobilier;
  donneesLocation: DonneesLocation;
  donneesFiscales: DonneesFiscales;
  resultatAutofinancement?: ResultatAutofinancement;
  resultatImposition?: ResultatImposition;
  resultatRevente?: ResultatRevente;
  resultatRendement?: ResultatRendement;
}
