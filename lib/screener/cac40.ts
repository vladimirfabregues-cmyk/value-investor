export interface ScreenableCompany {
  ticker: string;
  sector: string;
}

export const CAC40_COMPANIES: ScreenableCompany[] = [
  // Communication Services
  { ticker: "ORA.PA", sector: "Communication Services" },
  { ticker: "PUB.PA", sector: "Communication Services" },
  { ticker: "VIV.PA", sector: "Communication Services" },
  // Consumer Discretionary
  { ticker: "AC.PA", sector: "Consumer Discretionary" },
  { ticker: "RMS.PA", sector: "Consumer Discretionary" },
  { ticker: "KER.PA", sector: "Consumer Discretionary" },
  { ticker: "MC.PA", sector: "Consumer Discretionary" },
  { ticker: "ML.PA", sector: "Consumer Discretionary" },
  { ticker: "RNO.PA", sector: "Consumer Discretionary" },
  { ticker: "STLAM.PA", sector: "Consumer Discretionary" },
  // Consumer Staples
  { ticker: "BN.PA", sector: "Consumer Staples" },
  { ticker: "CA.PA", sector: "Consumer Staples" },
  { ticker: "OR.PA", sector: "Consumer Staples" },
  { ticker: "RI.PA", sector: "Consumer Staples" },
  // Energy
  { ticker: "TTE.PA", sector: "Energy" },
  // Financials
  { ticker: "ACA.PA", sector: "Financials" },
  { ticker: "BNP.PA", sector: "Financials" },
  { ticker: "CS.PA", sector: "Financials" },
  { ticker: "GLE.PA", sector: "Financials" },
  { ticker: "URW.PA", sector: "Financials" },
  // Health Care
  { ticker: "EL.PA", sector: "Health Care" },
  { ticker: "ERF.PA", sector: "Health Care" },
  { ticker: "SAN.PA", sector: "Health Care" },
  // Industrials
  { ticker: "AIR.PA", sector: "Industrials" },
  { ticker: "ALO.PA", sector: "Industrials" },
  { ticker: "EN.PA", sector: "Industrials" },
  { ticker: "FGR.PA", sector: "Industrials" },
  { ticker: "HO.PA", sector: "Industrials" },
  { ticker: "LR.PA", sector: "Industrials" },
  { ticker: "SAF.PA", sector: "Industrials" },
  { ticker: "SGO.PA", sector: "Industrials" },
  { ticker: "SU.PA", sector: "Industrials" },
  { ticker: "DG.PA", sector: "Industrials" },
  // Information Technology
  { ticker: "CAP.PA", sector: "Information Technology" },
  { ticker: "DSY.PA", sector: "Information Technology" },
  { ticker: "STM.PA", sector: "Information Technology" },
  // Materials
  { ticker: "AI.PA", sector: "Materials" },
  { ticker: "MT.PA", sector: "Materials" },
  // Utilities
  { ticker: "ENGI.PA", sector: "Utilities" },
  { ticker: "VIE.PA", sector: "Utilities" },
];
