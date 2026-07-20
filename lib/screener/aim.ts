import type { ScreenableCompany } from "@/lib/screener/cac40";

// Full FTSE AIM All-Share constituent list sourced from shareprices.com (April 2026).
// All tickers use the .L suffix (London Stock Exchange). Yahoo Finance returns prices
// in GBp (pence); the provider layer normalises these to GBP automatically.
export const AIM_COMPANIES: ScreenableCompany[] = [
  // ── Communication Services ────────────────────────────────────────────────
  { ticker: "BBSN.L", sector: "Communication Services" }, // Brave Bison
  { ticker: "BGO.L",  sector: "Communication Services" }, // Bango
  { ticker: "BOOM.L", sector: "Communication Services" }, // Audioboom
  { ticker: "DBOX.L", sector: "Communication Services" }, // Digitalbox
  { ticker: "DEVO.L", sector: "Communication Services" }, // Devolver Digital
  { ticker: "DNM.L",  sector: "Communication Services" }, // Dianomi
  { ticker: "EMAN.L", sector: "Communication Services" }, // Everyman Media
  { ticker: "EVPL.L", sector: "Communication Services" }, // Everplay Group
  { ticker: "FDEV.L", sector: "Communication Services" }, // Frontier Developments
  { ticker: "GAMA.L", sector: "Communication Services" }, // Gamma Communications
  { ticker: "GFIN.L", sector: "Communication Services" }, // Gfinity
  { ticker: "LBG.L",  sector: "Communication Services" }, // LBG Media
  { ticker: "MIRI.L", sector: "Communication Services" }, // Mirriad Advertising
  { ticker: "NFG.L",  sector: "Communication Services" }, // Next 15 Group
  { ticker: "SAA.L",  sector: "Communication Services" }, // M&C Saatchi
  { ticker: "SAL.L",  sector: "Communication Services" }, // SpaceandPeople
  { ticker: "SEED.L", sector: "Communication Services" }, // Seed
  { ticker: "SEEN.L", sector: "Communication Services" }, // Seeen
  { ticker: "SYS1.L", sector: "Communication Services" }, // System1 Group
  { ticker: "TBLD.L", sector: "Communication Services" }, // TinyBuild
  { ticker: "TIG.L",  sector: "Communication Services" }, // Team Internet
  { ticker: "TMG.L",  sector: "Communication Services" }, // The Mission Group
  { ticker: "TMO.L",  sector: "Communication Services" }, // Time Out
  { ticker: "YOU.L",  sector: "Communication Services" }, // YouGov
  { ticker: "ZIN.L",  sector: "Communication Services" }, // Zinc Media
  { ticker: "ZOO.L",  sector: "Communication Services" }, // Zoo Digital

  // ── Consumer Discretionary ───────────────────────────────────────────────
  { ticker: "ANG.L",  sector: "Consumer Discretionary" }, // Angling Direct
  { ticker: "AUTG.L", sector: "Consumer Discretionary" }, // Autins Group
  { ticker: "CCT.L",  sector: "Consumer Discretionary" }, // Character Group
  { ticker: "CHH.L",  sector: "Consumer Discretionary" }, // Churchill China
  { ticker: "COM.L",  sector: "Consumer Discretionary" }, // Comptoir Group
  { ticker: "DPP.L",  sector: "Consumer Discretionary" }, // DP Poland
  { ticker: "G4M.L",  sector: "Consumer Discretionary" }, // Gear4music
  { ticker: "GMR.L",  sector: "Consumer Discretionary" }, // Gaming Realms
  { ticker: "HUD.L",  sector: "Consumer Discretionary" }, // Huddled Group
  { ticker: "IGR.L",  sector: "Consumer Discretionary" }, // Design Group
  { ticker: "KETL.L", sector: "Consumer Discretionary" }, // Strix Group
  { ticker: "MEX.L",  sector: "Consumer Discretionary" }, // Tortilla Mexican Grill
  { ticker: "MLVN.L", sector: "Consumer Discretionary" }, // Malvern International
  { ticker: "MTC.L",  sector: "Consumer Discretionary" }, // Mothercare
  { ticker: "PMP.L",  sector: "Consumer Discretionary" }, // Portmeirion Group
  { ticker: "SDG.L",  sector: "Consumer Discretionary" }, // Sanderson Design Group
  { ticker: "SHOE.L", sector: "Consumer Discretionary" }, // Shoe Zone
  { ticker: "SOS.L",  sector: "Consumer Discretionary" }, // Sosandar
  { ticker: "SSTY.L", sector: "Consumer Discretionary" }, // Safestay
  { ticker: "TND.L",  sector: "Consumer Discretionary" }, // Tandem Group
  { ticker: "TUNE.L", sector: "Consumer Discretionary" }, // Focusrite
  { ticker: "VCP.L",  sector: "Consumer Discretionary" }, // Victoria
  { ticker: "VIC.L",  sector: "Consumer Discretionary" }, // Victorian Plumbing
  { ticker: "WRKS.L", sector: "Consumer Discretionary" }, // TheWorks.co.uk
  { ticker: "XPF.L",  sector: "Consumer Discretionary" }, // XP Factory

  // ── Consumer Staples ──────────────────────────────────────────────────────
  { ticker: "CAM.L",  sector: "Consumer Staples" }, // Camellia
  { ticker: "CBOX.L", sector: "Consumer Staples" }, // Cake Box
  { ticker: "CDGP.L", sector: "Consumer Staples" }, // Chapel Down Group
  { ticker: "FEVR.L", sector: "Consumer Staples" }, // Fever-Tree
  { ticker: "MPE.L",  sector: "Consumer Staples" }, // M P Evans
  { ticker: "NICL.L", sector: "Consumer Staples" }, // Nichols (Vimto)
  { ticker: "REVB.L", sector: "Consumer Staples" }, // Revolution Beauty
  { ticker: "VINO.L", sector: "Consumer Staples" }, // Virgin Wines
  { ticker: "W7L.L",  sector: "Consumer Staples" }, // Warpaint London
  { ticker: "WINE.L", sector: "Consumer Staples" }, // Naked Wines
  { ticker: "WYN.L",  sector: "Consumer Staples" }, // Wynnstay Group
  { ticker: "YNGA.L", sector: "Consumer Staples" }, // Young & Co's Brewery (A)
  { ticker: "YNGN.L", sector: "Consumer Staples" }, // Young & Co's Brewery (NV)
  { ticker: "ZAM.L",  sector: "Consumer Staples" }, // Zambeef Products

  // ── Energy ───────────────────────────────────────────────────────────────
  { ticker: "88E.L",  sector: "Energy" }, // 88 Energy
  { ticker: "AFC.L",  sector: "Energy" }, // AFC Energy
  { ticker: "AET.L",  sector: "Energy" }, // Afentra
  { ticker: "ANGS.L", sector: "Energy" }, // Angus Energy
  { ticker: "ATOM.L", sector: "Energy" }, // Atome Energy
  { ticker: "AURA.L", sector: "Energy" }, // Aura Energy
  { ticker: "BLOE.L", sector: "Energy" }, // Block Energy
  { ticker: "BOR.L",  sector: "Energy" }, // Borders & Southern Petroleum
  { ticker: "CASP.L", sector: "Energy" }, // Caspian Sunrise
  { ticker: "CHAR.L", sector: "Energy" }, // Chariot
  { ticker: "CLON.L", sector: "Energy" }, // Clontarf Energy
  { ticker: "CPH2.L", sector: "Energy" }, // Clean Power Hydrogen
  { ticker: "DELT.L", sector: "Energy" }, // Deltic Energy
  { ticker: "ECO.L",  sector: "Energy" }, // Eco Atlantic Oil & Gas
  { ticker: "EGT.L",  sector: "Energy" }, // European Green Transition
  { ticker: "EME.L",  sector: "Energy" }, // Empyrean Energy
  { ticker: "ENW.L",  sector: "Energy" }, // Enwell Energy
  { ticker: "EOG.L",  sector: "Energy" }, // Europa Oil & Gas
  { ticker: "EPP.L",  sector: "Energy" }, // EnergyPathways
  { ticker: "FOG.L",  sector: "Energy" }, // Falcon Oil & Gas
  { ticker: "GCM.L",  sector: "Energy" }, // GCM Resources
  { ticker: "GTC.L",  sector: "Energy" }, // Getech Group
  { ticker: "HE1.L",  sector: "Energy" }, // Helium One
  { ticker: "HEX.L",  sector: "Energy" }, // Helix Exploration
  { ticker: "IES.L",  sector: "Energy" }, // Invinity Energy Systems
  { ticker: "ITM.L",  sector: "Energy" }, // ITM Power
  { ticker: "JOG.L",  sector: "Energy" }, // Jersey Oil & Gas
  { ticker: "KIST.L", sector: "Energy" }, // Kistos Holdings
  { ticker: "ORCA.L", sector: "Energy" }, // Orcadian Energy
  { ticker: "PANR.L", sector: "Energy" }, // Pantheon Resources
  { ticker: "PET.L",  sector: "Energy" }, // Petrel Resources
  { ticker: "PHE.L",  sector: "Energy" }, // Powerhouse Energy
  { ticker: "PLSR.L", sector: "Energy" }, // Pulsar Helium
  { ticker: "PMG.L",  sector: "Energy" }, // Parkmead Group
  { ticker: "POS.L",  sector: "Energy" }, // Plexus Holdings
  { ticker: "PTAL.L", sector: "Energy" }, // PetroTal
  { ticker: "QED.L",  sector: "Energy" }, // Quadrise
  { ticker: "RBD.L",  sector: "Energy" }, // Reabold Resources
  { ticker: "RKH.L",  sector: "Energy" }, // Rockhopper Exploration
  { ticker: "SEA.L",  sector: "Energy" }, // Seascape Energy
  { ticker: "SNDA.L", sector: "Energy" }, // Sunda Energy
  { ticker: "SOU.L",  sector: "Energy" }, // Sound Energy
  { ticker: "SOUC.L", sector: "Energy" }, // Southern Energy
  { ticker: "SQZ.L",  sector: "Energy" }, // Serica Energy
  { ticker: "STAR.L", sector: "Energy" }, // Star Energy Group
  { ticker: "SYN.L",  sector: "Energy" }, // Synergia Energy
  { ticker: "TGP.L",  sector: "Energy" }, // Tekmar Group
  { ticker: "TRP.L",  sector: "Energy" }, // Tower Resources
  { ticker: "TXP.L",  sector: "Energy" }, // Touchstone Exploration
  { ticker: "UKOG.L", sector: "Energy" }, // UK Oil & Gas
  { ticker: "UOG.L",  sector: "Energy" }, // United Oil & Gas
  { ticker: "WTE.L",  sector: "Energy" }, // Westmount Energy
  { ticker: "ZPHR.L", sector: "Energy" }, // Zephyr Energy

  // ── Financials ───────────────────────────────────────────────────────────
  { ticker: "ARBB.L", sector: "Financials" }, // Arbuthnot Banking Group
  { ticker: "BPM.L",  sector: "Financials" }, // B.P. Marsh & Partners
  { ticker: "BRK.L",  sector: "Financials" }, // Brooks Macdonald
  { ticker: "CAV.L",  sector: "Financials" }, // Cavendish Financial
  { ticker: "CPP.L",  sector: "Financials" }, // CPP Group
  { ticker: "CRS.L",  sector: "Financials" }, // Crystal Amber Fund
  { ticker: "DFCH.L", sector: "Financials" }, // Distribution Finance Capital
  { ticker: "DSW.L",  sector: "Financials" }, // DSW Capital
  { ticker: "DUKE.L", sector: "Financials" }, // Duke Capital
  { ticker: "EMVC.L", sector: "Financials" }, // EMV Capital
  { ticker: "ESO.L",  sector: "Financials" }, // EPE Special Opportunities
  { ticker: "FEN.L",  sector: "Financials" }, // Frenkel Topping
  { ticker: "FIN.L",  sector: "Financials" }, // Finseta
  { ticker: "FIPP.L", sector: "Financials" }, // Frontier IP
  { ticker: "FKE.L",  sector: "Financials" }, // Fiske
  { ticker: "FRP.L",  sector: "Financials" }, // FRP Advisory
  { ticker: "GUN.L",  sector: "Financials" }, // Gunsynd
  { ticker: "HUW.L",  sector: "Financials" }, // Helios Underwriting
  { ticker: "IPX.L",  sector: "Financials" }, // Impax Asset Management
  { ticker: "JIM.L",  sector: "Financials" }, // Jarvis Securities
  { ticker: "LINV.L", sector: "Financials" }, // LendInvest
  { ticker: "LIT.L",  sector: "Financials" }, // Litigation Capital Management
  { ticker: "MAB1.L", sector: "Financials" }, // Mortgage Advice Bureau
  { ticker: "MAC.L",  sector: "Financials" }, // Marechale Capital
  { ticker: "MAFL.L", sector: "Financials" }, // Mineral & Financial Investments
  { ticker: "MANO.L", sector: "Financials" }, // Manolete Partners
  { ticker: "MERC.L", sector: "Financials" }, // Mercia Asset Management
  { ticker: "MFX.L",  sector: "Financials" }, // Manx Financial Group
  { ticker: "NAHL.L", sector: "Financials" }, // NAHL Group
  { ticker: "ONWD.L", sector: "Financials" }, // Onward Opportunities
  { ticker: "ORCH.L", sector: "Financials" }, // Orchard Funding
  { ticker: "PEEL.L", sector: "Financials" }, // Peel Hunt
  { ticker: "PGH.L",  sector: "Financials" }, // Personal Group Holdings
  { ticker: "PMI.L",  sector: "Financials" }, // Premier Miton Group
  { ticker: "POLR.L", sector: "Financials" }, // Polar Capital Holdings
  { ticker: "PRIM.L", sector: "Financials" }, // Primorus Investments
  { ticker: "RFX.L",  sector: "Financials" }, // Ramsdens Holdings
  { ticker: "TAM.L",  sector: "Financials" }, // Tatton Asset Management
  { ticker: "TAVI.L", sector: "Financials" }, // Tavistock Investments
  { ticker: "TEAM.L", sector: "Financials" }, // Team
  { ticker: "TEK.L",  sector: "Financials" }, // Tekcapital
  { ticker: "TERN.L", sector: "Financials" }, // Tern
  { ticker: "TIME.L", sector: "Financials" }, // Time Finance
  { ticker: "TMT.L",  sector: "Financials" }, // TMT Investments
  { ticker: "TRU.L",  sector: "Financials" }, // Trufin
  { ticker: "VLE.L",  sector: "Financials" }, // Volvere

  // ── Health Care ───────────────────────────────────────────────────────────
  { ticker: "ABDX.L", sector: "Health Care" }, // Abingdon Health
  { ticker: "AMS.L",  sector: "Health Care" }, // Advanced Medical Solutions
  { ticker: "ANCR.L", sector: "Health Care" }, // Animalcare Group
  { ticker: "AOTI.L", sector: "Health Care" }, // Aoti
  { ticker: "APTA.L", sector: "Health Care" }, // Aptamer Group
  { ticker: "AVCT.L", sector: "Health Care" }, // Avacta Group
  { ticker: "BVXP.L", sector: "Health Care" }, // Bioventix
  { ticker: "CNSL.L", sector: "Health Care" }, // Cambridge Nutritional Sciences
  { ticker: "COG.L",  sector: "Health Care" }, // Cambridge Cognition
  { ticker: "CREO.L", sector: "Health Care" }, // Creo Medical
  { ticker: "CRTX.L", sector: "Health Care" }, // Crism Therapeutics
  { ticker: "CVSG.L", sector: "Health Care" }, // CVS Group
  { ticker: "DXRX.L", sector: "Health Care" }, // Diaceutics
  { ticker: "EAH.L",  sector: "Health Care" }, // Eco Animal Health
  { ticker: "EKF.L",  sector: "Health Care" }, // EKF Diagnostics
  { ticker: "FAB.L",  sector: "Health Care" }, // Fusion Antibodies
  { ticker: "FARN.L", sector: "Health Care" }, // Faron Pharmaceuticals
  { ticker: "FUM.L",  sector: "Health Care" }, // Futura Medical
  { ticker: "GDR.L",  sector: "Health Care" }, // Genedrive
  { ticker: "HCM.L",  sector: "Health Care" }, // Hutchmed
  { ticker: "HVO.L",  sector: "Health Care" }, // hVIVO
  { ticker: "IHC.L",  sector: "Health Care" }, // Inspiration Healthcare
  { ticker: "IMM.L",  sector: "Health Care" }, // ImmuPharma
  { ticker: "IXI.L",  sector: "Health Care" }, // IXICO
  { ticker: "KOO.L",  sector: "Health Care" }, // Kooth
  { ticker: "MIND.L", sector: "Health Care" }, // Mind Gym
  { ticker: "NCYT.L", sector: "Health Care" }, // Novacyt
  { ticker: "NIOX.L", sector: "Health Care" }, // Circassia / NIOX Group
  { ticker: "OBD.L",  sector: "Health Care" }, // Oxford Biodynamics
  { ticker: "OBI.L",  sector: "Health Care" }, // Ondine Biomedical
  { ticker: "OPT.L",  sector: "Health Care" }, // Optima Health
  { ticker: "OPTI.L", sector: "Health Care" }, // OptiBiotix Health
  { ticker: "POLB.L", sector: "Health Care" }, // Poolbeg Pharma
  { ticker: "PRM.L",  sector: "Health Care" }, // Proteome Sciences
  { ticker: "PXS.L",  sector: "Health Care" }, // Provexis
  { ticker: "PYC.L",  sector: "Health Care" }, // Physiomics
  { ticker: "RENX.L", sector: "Health Care" }, // Renalytix
  { ticker: "RUA.L",  sector: "Health Care" }, // Rua Life Sciences
  { ticker: "SAR.L",  sector: "Health Care" }, // Sareum Holdings
  { ticker: "SBTX.L", sector: "Health Care" }, // SkinBioTherapeutics
  { ticker: "SCLP.L", sector: "Health Care" }, // Scancell Holdings
  { ticker: "SPEC.L", sector: "Health Care" }, // Inspecs Group
  { ticker: "STX.L",  sector: "Health Care" }, // Shield Therapeutics
  { ticker: "SUN.L",  sector: "Health Care" }, // Surgical Innovations
  { ticker: "TRLS.L", sector: "Health Care" }, // Trellus Health
  { ticker: "TSTL.L", sector: "Health Care" }, // Tristel
  { ticker: "VAL.L",  sector: "Health Care" }, // ValiRx
  { ticker: "VLG.L",  sector: "Health Care" }, // Venture Life Group
  { ticker: "VRCI.L", sector: "Health Care" }, // Verici Dx

  // ── Industrials ──────────────────────────────────────────────────────────
  { ticker: "ABDP.L", sector: "Industrials" }, // AB Dynamics
  { ticker: "ADF.L",  sector: "Industrials" }, // ADF Group
  { ticker: "AIEA.L", sector: "Industrials" }, // AIREA
  { ticker: "ALU.L",  sector: "Industrials" }, // Alumasc Group
  { ticker: "ASY.L",  sector: "Industrials" }, // Andrew Sykes Group
  { ticker: "AT.L",   sector: "Industrials" }, // Ashtead Technology
  { ticker: "AURR.L", sector: "Industrials" }, // Aurrigo International
  { ticker: "AVG.L",  sector: "Industrials" }, // Avingtrans
  { ticker: "BILN.L", sector: "Industrials" }, // Billington Holdings
  { ticker: "BRCK.L", sector: "Industrials" }, // Brickability Group
  { ticker: "CHRT.L", sector: "Industrials" }, // Cohort
  { ticker: "CKT.L",  sector: "Industrials" }, // Checkit
  { ticker: "CML.L",  sector: "Industrials" }, // CML Microsystems
  { ticker: "CRPR.L", sector: "Industrials" }, // James Cropper
  { ticker: "CSSG.L", sector: "Industrials" }, // Croma Security Solutions
  { ticker: "CTA.L",  sector: "Industrials" }, // CT Automotive Group
  { ticker: "CTG.L",  sector: "Industrials" }, // Christie Group
  { ticker: "DIAL.L", sector: "Industrials" }, // Diales Group
  { ticker: "EAAS.L", sector: "Industrials" }, // eEnergy Group
  { ticker: "EARN.L", sector: "Industrials" }, // Earnz (smart energy services)
  { ticker: "FIH.L",  sector: "Industrials" }, // FIH Group
  { ticker: "FLO.L",  sector: "Industrials" }, // Flowtech Fluidpower
  { ticker: "FRAN.L", sector: "Industrials" }, // Franchise Brands
  { ticker: "GATC.L", sector: "Industrials" }, // Gattaca
  { ticker: "GHH.L",  sector: "Industrials" }, // Gooch & Housego
  { ticker: "GTLY.L", sector: "Industrials" }, // Gateley Holdings
  { ticker: "HDD.L",  sector: "Industrials" }, // Hardide
  { ticker: "HSP.L",  sector: "Industrials" }, // Hargreaves Services
  { ticker: "IGE.L",  sector: "Industrials" }, // Image Scan Holdings
  { ticker: "JDG.L",  sector: "Industrials" }, // Judges Scientific
  { ticker: "JHD.L",  sector: "Industrials" }, // James Halstead
  { ticker: "JNEO.L", sector: "Industrials" }, // Journeo
  { ticker: "JSG.L",  sector: "Industrials" }, // Johnson Service Group
  { ticker: "KEYS.L", sector: "Industrials" }, // Keystone Law Group
  { ticker: "KGH.L",  sector: "Industrials" }, // Knights Group Holdings
  { ticker: "KMK.L",  sector: "Industrials" }, // Kromek Group
  { ticker: "LDG.L",  sector: "Industrials" }, // Logistics Development Group
  { ticker: "LORD.L", sector: "Industrials" }, // Lords Group Trading
  { ticker: "LPA.L",  sector: "Industrials" }, // LPA Group
  { ticker: "LST.L",  sector: "Industrials" }, // Light Science Technologies
  { ticker: "LTHM.L", sector: "Industrials" }, // Latham (James) Timber
  { ticker: "MBH.L",  sector: "Industrials" }, // Michelmersh Brick Holdings
  { ticker: "MIDW.L", sector: "Industrials" }, // Midwich Group
  { ticker: "MPAC.L", sector: "Industrials" }, // Mpac Group
  { ticker: "MPL.L",  sector: "Industrials" }, // Mercantile Ports & Logistics
  { ticker: "MRK.L",  sector: "Industrials" }, // Marks Electrical Group
  { ticker: "MSI.L",  sector: "Industrials" }, // MS International
  { ticker: "MWE.L",  sector: "Industrials" }, // MTI Wireless Edge
  { ticker: "NAR.L",  sector: "Industrials" }, // Northamber
  { ticker: "NBB.L",  sector: "Industrials" }, // Norman Broadbent
  { ticker: "NEXS.L", sector: "Industrials" }, // Nexus Infrastructure
  { ticker: "NTBR.L", sector: "Industrials" }, // Northern Bear
  { ticker: "NWF.L",  sector: "Industrials" }, // NWF Group
  { ticker: "NWT.L",  sector: "Industrials" }, // Newmark Security
  { ticker: "PEG.L",  sector: "Industrials" }, // Petards Group
  { ticker: "PEN.L",  sector: "Industrials" }, // Pennant International
  { ticker: "PIP.L",  sector: "Industrials" }, // PipeHawk
  { ticker: "REAT.L", sector: "Industrials" }, // React Group
  { ticker: "RBN.L",  sector: "Industrials" }, // Robinson
  { ticker: "RNWH.L", sector: "Industrials" }, // Renew Holdings
  { ticker: "RST.L",  sector: "Industrials" }, // Restore
  { ticker: "RTC.L",  sector: "Industrials" }, // RTC Group
  { ticker: "SCE.L",  sector: "Industrials" }, // Surface Transforms
  { ticker: "SNX.L",  sector: "Industrials" }, // Synectics
  { ticker: "SOLI.L", sector: "Industrials" }, // Solid State
  { ticker: "SOM.L",  sector: "Industrials" }, // Somero Enterprises
  { ticker: "STAF.L", sector: "Industrials" }, // Staffline Group
  { ticker: "STCM.L", sector: "Industrials" }, // Steppe Cement
  { ticker: "STG.L",  sector: "Industrials" }, // Strip Tinning Holdings
  { ticker: "SWG.L",  sector: "Industrials" }, // Shearwater Group
  { ticker: "TENG.L", sector: "Industrials" }, // Ten Lifestyle Group
  { ticker: "TFW.L",  sector: "Industrials" }, // Thorpe (F W)
  { ticker: "THR.L",  sector: "Industrials" }, // Thor Energy (resources)
  { ticker: "THRU.L", sector: "Industrials" }, // Thruvision Group
  { ticker: "TIDE.L", sector: "Industrials" }, // Crimson Tide
  { ticker: "TON.L",  sector: "Industrials" }, // Titon Holdings
  { ticker: "TRAC.L", sector: "Industrials" }, // T42 IoT Tracking Solutions
  { ticker: "TRCS.L", sector: "Industrials" }, // Tracsis
  { ticker: "TRB.L",  sector: "Industrials" }, // Tribal Group
  { ticker: "TRT.L",  sector: "Industrials" }, // Transense Technologies
  { ticker: "TST.L",  sector: "Industrials" }, // Touchstar
  { ticker: "VANL.L", sector: "Industrials" }, // Van Elle Holdings
  { ticker: "VLX.L",  sector: "Industrials" }, // Volex
  { ticker: "WATR.L", sector: "Industrials" }, // Water Intelligence
  { ticker: "WPHO.L", sector: "Industrials" }, // Windar Photonics
  { ticker: "WSG.L",  sector: "Industrials" }, // Westminster Group
  { ticker: "ZED.L",  sector: "Industrials" }, // Zenova Group

  // ── Information Technology ───────────────────────────────────────────────
  { ticker: "ACSO.L", sector: "Information Technology" }, // accesso Technology
  { ticker: "ACRM.L", sector: "Information Technology" }, // Acuity RM Group
  { ticker: "ADVT.L", sector: "Information Technology" }, // Advantage Smollan
  { ticker: "AOM.L",  sector: "Information Technology" }, // ActiveOps
  { ticker: "ARC.L",  sector: "Information Technology" }, // Arcontech Group
  { ticker: "BIRD.L", sector: "Information Technology" }, // Blackbird
  { ticker: "BKS.L",  sector: "Information Technology" }, // Beeks Financial Cloud
  { ticker: "BOKU.L", sector: "Information Technology" }, // Boku
  { ticker: "CLBS.L", sector: "Information Technology" }, // Celebrus Technologies
  { ticker: "CLCO.L", sector: "Information Technology" }, // CloudCoCo Group
  { ticker: "CNC.L",  sector: "Information Technology" }, // Concurrent Technologies
  { ticker: "CNS.L",  sector: "Information Technology" }, // Corero Network Security
  { ticker: "CODE.L", sector: "Information Technology" }, // Northcoders Group
  { ticker: "CRW.L",  sector: "Information Technology" }, // Craneware
  { ticker: "CRTA.L", sector: "Information Technology" }, // Cirata
  { ticker: "CYAN.L", sector: "Information Technology" }, // CyanConnode Holdings
  { ticker: "DATA.L", sector: "Information Technology" }, // GlobalData
  { ticker: "DOTD.L", sector: "Information Technology" }, // dotDigital Group
  { ticker: "DSG.L",  sector: "Information Technology" }, // Dillistone Group
  { ticker: "ELCO.L", sector: "Information Technology" }, // Elecosoft
  { ticker: "ENSI.L", sector: "Information Technology" }, // EnSilica
  { ticker: "ESYS.L", sector: "Information Technology" }, // Essensys
  { ticker: "EXR.L",  sector: "Information Technology" }, // Engage XR Holdings
  { ticker: "EYE.L",  sector: "Information Technology" }, // Eagle Eye Solutions
  { ticker: "FNTL.L", sector: "Information Technology" }, // Fintel
  { ticker: "FNX.L",  sector: "Information Technology" }, // Fonix Mobile
  { ticker: "FTC.L",  sector: "Information Technology" }, // Filtronic
  { ticker: "GBG.L",  sector: "Information Technology" }, // GB Group
  { ticker: "GETB.L", sector: "Information Technology" }, // GetBusy
  { ticker: "IDOX.L", sector: "Information Technology" }, // Idox Group
  { ticker: "IGP.L",  sector: "Information Technology" }, // Intercede Group
  { ticker: "ING.L",  sector: "Information Technology" }, // Ingenta
  { ticker: "INSG.L", sector: "Information Technology" }, // Insig AI
  { ticker: "IOM.L",  sector: "Information Technology" }, // iomart Group
  { ticker: "IQE.L",  sector: "Information Technology" }, // IQE
  { ticker: "ITIM.L", sector: "Information Technology" }, // Itim Group
  { ticker: "JNEO.L", sector: "Information Technology" }, // Journeo (fleet tech)
  { ticker: "MAI.L",  sector: "Information Technology" }, // Maintel Holdings
  { ticker: "MFAI.L", sector: "Information Technology" }, // MindFlair
  { ticker: "MBO.L",  sector: "Information Technology" }, // MobilityOne
  { ticker: "MTEC.L", sector: "Information Technology" }, // Made Tech Group
  { ticker: "MYX.L",  sector: "Information Technology" }, // Mycelx Technologies
  { ticker: "NAH.L",  sector: "Information Technology" }, // NAHL Group (digital legal)
  { ticker: "NET.L",  sector: "Information Technology" }, // Netcall
  { ticker: "NXQ.L",  sector: "Information Technology" }, // Nexteq
  { ticker: "OMG.L",  sector: "Information Technology" }, // Oxford Metrics
  { ticker: "PCIP.L", sector: "Information Technology" }, // PCI-PAL
  { ticker: "PULS.L", sector: "Information Technology" }, // Pulsar Group
  { ticker: "QTX.L",  sector: "Information Technology" }, // Quartix Technologies
  { ticker: "RCN.L",  sector: "Information Technology" }, // Redcentric
  { ticker: "RDT.L",  sector: "Information Technology" }, // Rosslyn Data Technologies
  { ticker: "RWS.L",  sector: "Information Technology" }, // RWS Holdings
  { ticker: "SAAS.L", sector: "Information Technology" }, // Microlise Group
  { ticker: "SAG.L",  sector: "Information Technology" }, // Science Group
  { ticker: "SBDS.L", sector: "Information Technology" }, // Silver Bullet Data Services
  { ticker: "SDI.L",  sector: "Information Technology" }, // SDI Group
  { ticker: "SEE.L",  sector: "Information Technology" }, // Seeing Machines
  { ticker: "SFT.L",  sector: "Information Technology" }, // Software Circle
  { ticker: "SKL.L",  sector: "Information Technology" }, // Skillcast Group
  { ticker: "SNT.L",  sector: "Information Technology" }, // Sabien Technology
  { ticker: "SORT.L", sector: "Information Technology" }, // Sorted Group
  { ticker: "SPA.L",  sector: "Information Technology" }, // 1Spatial
  { ticker: "SRT.L",  sector: "Information Technology" }, // SRT Marine Systems
  { ticker: "SYS.L",  sector: "Information Technology" }, // Sysgroup
  { ticker: "TBLD.L", sector: "Information Technology" }, // TinyBuild
  { ticker: "TPX.L",  sector: "Information Technology" }, // TPXimpact Holdings
  { ticker: "TPFG.L", sector: "Information Technology" }, // Property Franchise Group (PropTech)
  { ticker: "TRB.L",  sector: "Information Technology" }, // Tribal Group
  { ticker: "TST.L",  sector: "Information Technology" }, // Touchstar
  { ticker: "VEL.L",  sector: "Information Technology" }, // Velocity Composites
  { ticker: "VNET.L", sector: "Information Technology" }, // Vianet Group
  { ticker: "XSG.L",  sector: "Information Technology" }, // Xeros Technology

  // ── Materials ────────────────────────────────────────────────────────────
  { ticker: "4BB.L",  sector: "Materials" }, // 4basebio
  { ticker: "80M.L",  sector: "Materials" }, // 80 Mile
  { ticker: "AAU.L",  sector: "Materials" }, // Ariana Resources
  { ticker: "AAZ.L",  sector: "Materials" }, // Anglo Asian Mining
  { ticker: "ALBA.L", sector: "Materials" }, // Alba Mineral Resources
  { ticker: "ALL.L",  sector: "Materials" }, // Atlantic Lithium
  { ticker: "ALT.L",  sector: "Materials" }, // Altitude Group (resources)
  { ticker: "AMRQ.L", sector: "Materials" }, // Amaroq Minerals
  { ticker: "ARCM.L", sector: "Materials" }, // Arc Minerals
  { ticker: "ARS.L",  sector: "Materials" }, // Asiamet Resources
  { ticker: "ART.L",  sector: "Materials" }, // Artisanal Spirits Company
  { ticker: "ATM.L",  sector: "Materials" }, // Andrada Mining
  { ticker: "AYM.L",  sector: "Materials" }, // Anglesey Mining
  { ticker: "BEM.L",  sector: "Materials" }, // Beowulf Mining
  { ticker: "BHL.L",  sector: "Materials" }, // Bradda Head Lithium
  { ticker: "BZT.L",  sector: "Materials" }, // Bezant Resources
  { ticker: "CAML.L", sector: "Materials" }, // Central Asia Metals
  { ticker: "CGNR.L", sector: "Materials" }, // Conroy Gold & Natural Resources
  { ticker: "CLA.L",  sector: "Materials" }, // Celsius Resources
  { ticker: "CMCL.L", sector: "Materials" }, // Caledonia Mining
  { ticker: "CMET.L", sector: "Materials" }, // Capital Metals
  { ticker: "CORA.L", sector: "Materials" }, // Cora Gold
  { ticker: "CTL.L",  sector: "Materials" }, // Cleantech Lithium
  { ticker: "DCTA.L", sector: "Materials" }, // Directa Plus (graphene)
  { ticker: "ECR.L",  sector: "Materials" }, // ECR Minerals
  { ticker: "EEE.L",  sector: "Materials" }, // Empire Metals
  { ticker: "EMH.L",  sector: "Materials" }, // European Metals Holdings
  { ticker: "EML.L",  sector: "Materials" }, // Emmerson
  { ticker: "FMET.L", sector: "Materials" }, // Fulcrum Metals
  { ticker: "FRG.L",  sector: "Materials" }, // Firering Strategic Minerals
  { ticker: "GAL.L",  sector: "Materials" }, // Galantas Gold
  { ticker: "GDP.L",  sector: "Materials" }, // GoldPlat
  { ticker: "GEM.L",  sector: "Materials" }, // Gemfields Group
  { ticker: "GELN.L", sector: "Materials" }, // Gelion
  { ticker: "GFM.L",  sector: "Materials" }, // Griffin Mining
  { ticker: "GGP.L",  sector: "Materials" }, // Greatland Resources
  { ticker: "GLR.L",  sector: "Materials" }, // Galileo Resources
  { ticker: "GMET.L", sector: "Materials" }, // Guardian Metal Resources
  { ticker: "GRL.L",  sector: "Materials" }, // Goldstone Resources
  { ticker: "GROC.L", sector: "Materials" }, // GreenRoc Strategic Materials
  { ticker: "GWMO.L", sector: "Materials" }, // Great Western Mining
  { ticker: "JAN.L",  sector: "Materials" }, // Jangada Mines
  { ticker: "JLP.L",  sector: "Materials" }, // Jubilee Metals Group
  { ticker: "KDNC.L", sector: "Materials" }, // Cadence Minerals
  { ticker: "KDR.L",  sector: "Materials" }, // Karelian Diamond Resources
  { ticker: "KEFI.L", sector: "Materials" }, // KEFI Gold and Copper
  { ticker: "KOD.L",  sector: "Materials" }, // Kodal Minerals
  { ticker: "KP2.L",  sector: "Materials" }, // Kore Potash
  { ticker: "KRS.L",  sector: "Materials" }, // Keras Resources
  { ticker: "KZG.L",  sector: "Materials" }, // Kazera Global
  { ticker: "LEX.L",  sector: "Materials" }, // Lexington Gold
  { ticker: "LND.L",  sector: "Materials" }, // Landore Resources
  { ticker: "MET1.L", sector: "Materials" }, // Metals One
  { ticker: "MKA.L",  sector: "Materials" }, // Mkango Resources
  { ticker: "MTL.L",  sector: "Materials" }, // Metals Exploration
  { ticker: "OMI.L",  sector: "Materials" }, // Orosur Mining
  { ticker: "ORR.L",  sector: "Materials" }, // Oriole Resources
  { ticker: "PAF.L",  sector: "Materials" }, // Pan African Resources
  { ticker: "POW.L",  sector: "Materials" }, // Power Metal Resources
  { ticker: "PREM.L", sector: "Materials" }, // Premier African Minerals
  { ticker: "PXC.L",  sector: "Materials" }, // Phoenix Copper
  { ticker: "QBT.L",  sector: "Materials" }, // Quantum Blockchain Technologies
  { ticker: "RMR.L",  sector: "Materials" }, // Rome Resources
  { ticker: "ROCK.L", sector: "Materials" }, // Rockfire Resources
  { ticker: "RRR.L",  sector: "Materials" }, // Red Rock Resources
  { ticker: "SAV.L",  sector: "Materials" }, // Savannah Resources
  { ticker: "SKA.L",  sector: "Materials" }, // Shuka Minerals
  { ticker: "SLP.L",  sector: "Materials" }, // Sylvania Platinum
  { ticker: "SML.L",  sector: "Materials" }, // Strategic Minerals
  { ticker: "SRB.L",  sector: "Materials" }, // Serabi Gold
  { ticker: "SRES.L", sector: "Materials" }, // Sunrise Resources
  { ticker: "THX.L",  sector: "Materials" }, // Thor Explorations
  { ticker: "TUN.L",  sector: "Materials" }, // Tungsten West
  { ticker: "TYM.L",  sector: "Materials" }, // Tertiary Minerals
  { ticker: "UFO.L",  sector: "Materials" }, // Alien Metals
  { ticker: "URU.L",  sector: "Materials" }, // URU Metals
  { ticker: "VAST.L", sector: "Materials" }, // Vast Resources
  { ticker: "WSBN.L", sector: "Materials" }, // Wishbone Gold
  { ticker: "XIOC.L", sector: "Materials" }, // Zanaga Iron Ore
  { ticker: "YCA.L",  sector: "Materials" }, // Yellow Cake (uranium)
  { ticker: "ZNWD.L", sector: "Materials" }, // Zinnwald Lithium

  // ── Real Estate ───────────────────────────────────────────────────────────
  { ticker: "CIC.L",  sector: "Real Estate" }, // Conygar Investment Company
  { ticker: "FPO.L",  sector: "Real Estate" }, // First Property Group
  { ticker: "ROAD.L", sector: "Real Estate" }, // Roadside Real Estate
  { ticker: "SPR.L",  sector: "Real Estate" }, // Springfield Properties
  { ticker: "WINK.L", sector: "Real Estate" }, // M Winkworth
  { ticker: "WJG.L",  sector: "Real Estate" }, // Watkin Jones

  // ── Utilities ────────────────────────────────────────────────────────────
  { ticker: "GRP.L",  sector: "Utilities" }, // Greencoat Renewables
  { ticker: "SYM.L",  sector: "Utilities" }, // Symphony Environmental Technologies
  { ticker: "YU.L",   sector: "Utilities" }, // Yu Group
];
