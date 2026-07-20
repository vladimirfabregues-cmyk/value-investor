import type { ScreenableCompany } from "@/lib/screener/cac40";

// MSCI Europe Small Cap constituents sourced from the Xtrackers MSCI Europe
// Small Cap UCITS ETF (XXSC) holdings file (DWS, June 2026). ISINs resolved to
// Yahoo Finance tickers via Yahoo search, preferring each company's primary
// European listing. GICS sectors from the DWS file.
export const MSCI_EU_SC_COMPANIES: ScreenableCompany[] = [
  // ── Communication Services ──
  { ticker: "A3M.MC", sector: "Communication Services" }, // ATRESMEDIA CORPORACION DE MEDIOS D
  { ticker: "ALHG.PA", sector: "Communication Services" }, // LOUIS HACHETTE GROUP SA
  { ticker: "AUTO.L", sector: "Communication Services" }, // AUTOTRADER GROUP PLC
  { ticker: "BCG.L", sector: "Communication Services" }, // BALTIC CLASSIFIEDS GROUP PLC
  { ticker: "CAN.L", sector: "Communication Services" }, // CANAL+ SA
  { ticker: "DEC.PA", sector: "Communication Services" }, // JCDECAUX
  { ticker: "EMBRAC-B.ST", sector: "Communication Services" }, // EMBRACER GROUP CLASS B
  { ticker: "ETL.PA", sector: "Communication Services" }, // EUTELSAT COMMUNICATIONS SA
  { ticker: "FNTN.DE", sector: "Communication Services" }, // FREENET AG
  { ticker: "FOUR.L", sector: "Communication Services" }, // 4IMPRINT GROUP PLC
  { ticker: "GAMA.L", sector: "Communication Services" }, // GAMMA COMMUNICATIONS PLC
  { ticker: "HACK.ST", sector: "Communication Services" }, // HACKSAW
  { ticker: "HAVAS.AS", sector: "Communication Services" }, // HAVAS NV
  { ticker: "HEM.ST", sector: "Communication Services" }, // HEMNET GROUP
  { ticker: "HTWS.L", sector: "Communication Services" }, // HELIOS TOWERS PLC
  { ticker: "IPS.PA", sector: "Communication Services" }, // IPSOS SA
  { ticker: "ITV.L", sector: "Communication Services" }, // ITV PLC
  { ticker: "JUVE.MI", sector: "Communication Services" }, // JUVENTUS FOOTBAL CLUB
  { ticker: "KIN.BR", sector: "Communication Services" }, // KINEPOLIS NV
  { ticker: "MFEA.MI", sector: "Communication Services" }, // MFE-MEDIAFOREUROPE NV
  { ticker: "MFEB.MI", sector: "Communication Services" }, // MFE B NV
  { ticker: "MMT.PA", sector: "Communication Services" }, // METROPOLE TELEVISION SA
  { ticker: "MN.MI", sector: "Communication Services" }, // ARNOLDO MONDADORI EDITORE
  { ticker: "MONY.L", sector: "Communication Services" }, // MONY GROUP PLC
  { ticker: "MTG-B.ST", sector: "Communication Services" }, // MODERN TIMES GROUP MTG CLASS B
  { ticker: "NOS.LS", sector: "Communication Services" }, // NOS SGPS SA
  { ticker: "PDX.ST", sector: "Communication Services" }, // PARADOX INTERACTIVE
  { ticker: "PROX.BR", sector: "Communication Services" }, // PROXIMUS NV
  { ticker: "PSM.DE", sector: "Communication Services" }, // PROSIEBEN SAT.1 MEDIA N
  { ticker: "RMV.L", sector: "Communication Services" }, // RIGHTMOVE PLC
  { ticker: "RRTL.DE", sector: "Communication Services" }, // RTL GROUP SA
  { ticker: "RWAY.MI", sector: "Communication Services" }, // RAI WAY SPA
  { ticker: "SAX.DE", sector: "Communication Services" }, // STROEER
  { ticker: "SESG.PA", sector: "Communication Services" }, // SES SA FDR
  { ticker: "SMG.SW", sector: "Communication Services" }, // SMG SWISS MARKETPLACE GROUP HOLDIN
  { ticker: "STORY-B.ST", sector: "Communication Services" }, // STORYTEL CLASS B
  { ticker: "SUNN.SW", sector: "Communication Services" }, // SUNRISE N CLASS A LTD
  { ticker: "TFI.PA", sector: "Communication Services" }, // TELEVISION FRANCAISE  SA
  { ticker: "TRST.L", sector: "Communication Services" }, // TRUSTPILOT GROUP PLC
  { ticker: "TXGN.SW", sector: "Communication Services" }, // TX GROUP AG LTD
  { ticker: "UBI.PA", sector: "Communication Services" }, // UBISOFT ENTERTAINMENT SA CAT A
  { ticker: "UTDI.DE", sector: "Communication Services" }, // UNITED INTERNET AG
  { ticker: "VEND.OL", sector: "Communication Services" }, // VEND MARKETPLACES
  { ticker: "VIV.PA", sector: "Communication Services" }, // VIVENDI
  { ticker: "WPP.L", sector: "Communication Services" }, // WPP PLC
  { ticker: "ZEG.L", sector: "Communication Services" }, // ZEGONA COMMUNICATIONS PLC

  // ── Consumer Discretionary ──
  { ticker: "ACAD.ST", sector: "Consumer Discretionary" }, // ACADEMEDIA
  { ticker: "AG1.DE", sector: "Consumer Discretionary" }, // AUTO1 GROUP
  { ticker: "AMV0.DE", sector: "Consumer Discretionary" }, // AUMOVIO N
  { ticker: "AO.L", sector: "Consumer Discretionary" }, // AO WORLD
  { ticker: "ASMDEE-B.ST", sector: "Consumer Discretionary" }, // ASMODEE GROUP CLASS B
  { ticker: "AUTN.SW", sector: "Consumer Discretionary" }, // AUTONEUM HOLDING AG
  { ticker: "BC.MI", sector: "Consumer Discretionary" }, // BRUNELLO CUCINELLI
  { ticker: "BEN.PA", sector: "Consumer Discretionary" }, // BENETEAU SA
  { ticker: "BETCO.ST", sector: "Consumer Discretionary" }, // BETTER COLLECTIVE
  { ticker: "BETS-B.ST", sector: "Consumer Discretionary" }, // BETSSON CLASS B
  { ticker: "BFIT.AS", sector: "Consumer Discretionary" }, // BASIC-FIT NV
  { ticker: "BILI-A.ST", sector: "Consumer Discretionary" }, // BILIA CLASS A
  { ticker: "BKG.L", sector: "Consumer Discretionary" }, // BERKELEY GROUP HOLDINGS (THE) PLC
  { ticker: "BME.L", sector: "Consumer Discretionary" }, // B&M EUROPEAN VALUE RETAIL PLC
  { ticker: "BOOZT.ST", sector: "Consumer Discretionary" }, // BOOZT
  { ticker: "BOSS.DE", sector: "Consumer Discretionary" }, // HUGO BOSS N AG
  { ticker: "BOWL.L", sector: "Consumer Discretionary" }, // HOLLYWOOD BOWL GROUP PLC
  { ticker: "BRBY.L", sector: "Consumer Discretionary" }, // BURBERRY GROUP PLC
  { ticker: "BRE.MI", sector: "Consumer Discretionary" }, // FRENI BREMBO NV
  { ticker: "BTRW.L", sector: "Consumer Discretionary" }, // BARRATT REDROW PLC
  { ticker: "BWY.L", sector: "Consumer Discretionary" }, // BELLWAY PLC
  { ticker: "CDA.PA", sector: "Consumer Discretionary" }, // COMPAGNIE DES ALPES SA
  { ticker: "CECV.DE", sector: "Consumer Discretionary" }, // CECONOMY V AG
  { ticker: "CIE.MC", sector: "Consumer Discretionary" }, // CIE AUTOMOTIVE SA
  { ticker: "CIR.MI", sector: "Consumer Discretionary" }, // CIR SPA - COMPAGNIE INDUSTRIALI RI
  { ticker: "CIRSA.MC", sector: "Consumer Discretionary" }, // CIRSA ENTERPRISES SAU
  { ticker: "CLAS-B.ST", sector: "Consumer Discretionary" }, // CLAS OHLSON CLASS B
  { ticker: "COA.L", sector: "Consumer Discretionary" }, // COATS GROUP PLC
  { ticker: "CRN.L", sector: "Consumer Discretionary" }, // CAIRN HOMES PLC
  { ticker: "CURY.L", sector: "Consumer Discretionary" }, // CURRYS PLC
  { ticker: "DLG.MI", sector: "Consumer Discretionary" }, // DELONGHI
  { ticker: "DNLM.L", sector: "Consumer Discretionary" }, // DUNELM GROUP PLC
  { ticker: "DOCS.L", sector: "Consumer Discretionary" }, // DR. MARTENS PLC
  { ticker: "DOM.L", sector: "Consumer Discretionary" }, // DOMINOS PIZZA GROUP PLC
  { ticker: "DOM.ST", sector: "Consumer Discretionary" }, // DOMETIC GROUPINARY SHARES
  { ticker: "DOU.DE", sector: "Consumer Discretionary" }, // DOUGLAS N AG
  { ticker: "ELIOR.PA", sector: "Consumer Discretionary" }, // ELIOR GROUP SA
  { ticker: "ELUX-B.ST", sector: "Consumer Discretionary" }, // ELECTROLUX CLASS B
  { ticker: "ENT.L", sector: "Consumer Discretionary" }, // ENTAIN PLC
  { ticker: "EPR.OL", sector: "Consumer Discretionary" }, // EUROPRIS
  { ticker: "FDJU.PA", sector: "Consumer Discretionary" }, // FDJ UNITED
  { ticker: "FIE.DE", sector: "Consumer Discretionary" }, // FIELMANN GROUP AG
  { ticker: "FNAC.PA", sector: "Consumer Discretionary" }, // FNAC DARTY SA
  { ticker: "FR.PA", sector: "Consumer Discretionary" }, // VALEO
  { ticker: "FRAS.L", sector: "Consumer Discretionary" }, // FRASERS GROUP PLC
  { ticker: "FRVIA.PA", sector: "Consumer Discretionary" }, // FORVIA
  { ticker: "GAW.L", sector: "Consumer Discretionary" }, // GAMES WORKSHOP GROUP PLC
  { ticker: "GEST.MC", sector: "Consumer Discretionary" }, // GESTAMP AUTOMOCION SA
  { ticker: "GN.CO", sector: "Consumer Discretionary" }, // GN STORE NORD
  { ticker: "GRG.L", sector: "Consumer Discretionary" }, // GREGGS PLC
  { ticker: "GVR.IR", sector: "Consumer Discretionary" }, // GLENVEAGH PROPERTIES PLC
  { ticker: "HARVIA.HE", sector: "Consumer Discretionary" }, // HARVIA
  { ticker: "HBH.DE", sector: "Consumer Discretionary" }, // HORNBACH HOLDING AG
  { ticker: "HBX.MC", sector: "Consumer Discretionary" }, // HBX GROUP INTERNATIONAL PLC
  { ticker: "HOME.MC", sector: "Consumer Discretionary" }, // NEINOR HOMES SA
  { ticker: "INCH.L", sector: "Consumer Discretionary" }, // INCHCAPE PLC
  { ticker: "JD.L", sector: "Consumer Discretionary" }, // JD SPORTS FASHION PLC
  { ticker: "JDW.L", sector: "Consumer Discretionary" }, // WETHERSPOON(J.D.) PLC
  { ticker: "JM.ST", sector: "Consumer Discretionary" }, // JM
  { ticker: "KOF.PA", sector: "Consumer Discretionary" }, // KAUFMAN & BROAD SA
  { ticker: "LTMC.MI", sector: "Consumer Discretionary" }, // LOTTOMATICA GROUP
  { ticker: "MAB.L", sector: "Consumer Discretionary" }, // MITCHELLS AND BUTLERS PLC
  { ticker: "MATAS.CO", sector: "Consumer Discretionary" }, // MATAS
  { ticker: "MEGP.L", sector: "Consumer Discretionary" }, // ME GROUP INTERNATIONAL PLC
  { ticker: "MEL.MC", sector: "Consumer Discretionary" }, // MELIA HOTELS INTERNATIONAL SA
  { ticker: "MIPS.ST", sector: "Consumer Discretionary" }, // MIPS
  { ticker: "MOON.L", sector: "Consumer Discretionary" }, // MOONPIG GROUP PLC
  { ticker: "MOZN.SW", sector: "Consumer Discretionary" }, // MOBILEZONE HOLDING
  { ticker: "NEWA-B.ST", sector: "Consumer Discretionary" }, // NEW WAVE GROUP CLASS B
  { ticker: "OPM.PA", sector: "Consumer Discretionary" }, // OPMOBILITY
  { ticker: "OVS.MI", sector: "Consumer Discretionary" }, // OVS SPA
  { ticker: "PETS.L", sector: "Consumer Discretionary" }, // PETS AT HOME PLC
  { ticker: "PIA.MI", sector: "Consumer Discretionary" }, // PIAGGIO & C
  { ticker: "PIRC.MI", sector: "Consumer Discretionary" }, // PIRELLI & C
  { ticker: "PPH.L", sector: "Consumer Discretionary" }, // PPH HOTEL GROUP LTD
  { ticker: "PSN.L", sector: "Consumer Discretionary" }, // PERSIMMON PLC
  { ticker: "PSNY", sector: "Consumer Discretionary" }, // POLESTAR AUTOMOTIVE HOLDING AMERIC
  { ticker: "PTEC.L", sector: "Consumer Discretionary" }, // PLAYTECH PLC
  { ticker: "PUM.DE", sector: "Consumer Discretionary" }, // PUMA
  { ticker: "PUUILO.HE", sector: "Consumer Discretionary" }, // PUUILO
  { ticker: "RNK.L", sector: "Consumer Discretionary" }, // RANK GROUP PLC
  { ticker: "RUSTA.ST", sector: "Consumer Discretionary" }, // RUSTA
  { ticker: "SATS.OL", sector: "Consumer Discretionary" }, // SATS
  { ticker: "SFER.MI", sector: "Consumer Discretionary" }, // SALVATORE FERRAGAMO
  { ticker: "SFL.MI", sector: "Consumer Discretionary" }, // SAFILO GROUP
  { ticker: "SFQ.DE", sector: "Consumer Discretionary" }, // SAF-HOLLAND
  { ticker: "SHA0.DE", sector: "Consumer Discretionary" }, // SHAEFFLER N AG
  { ticker: "SHOT.ST", sector: "Consumer Discretionary" }, // SCANDIC HOTELS GROUP
  { ticker: "SK.PA", sector: "Consumer Discretionary" }, // SEB SA
  { ticker: "SKIS-B.ST", sector: "Consumer Discretionary" }, // SKISTAR CLASS B
  { ticker: "SL.MI", sector: "Consumer Discretionary" }, // SANLORENZO
  { ticker: "SMWH.L", sector: "Consumer Discretionary" }, // WH SMITH PLC
  { ticker: "SSPG.L", sector: "Consumer Discretionary" }, // SSP GROUP PLC
  { ticker: "SYNSAM.ST", sector: "Consumer Discretionary" }, // SYNSAM
  { ticker: "TGYM.MI", sector: "Consumer Discretionary" }, // TECHNOGYM
  { ticker: "THG.L", sector: "Consumer Discretionary" }, // THG PLC
  { ticker: "THULE.ST", sector: "Consumer Discretionary" }, // THULE GROUP
  { ticker: "TOKMAN.HE", sector: "Consumer Discretionary" }, // TOKMANNI GROUP CORPORATION
  { ticker: "TRI.PA", sector: "Consumer Discretionary" }, // TRIGANO SA
  { ticker: "TRN.L", sector: "Consumer Discretionary" }, // TRAINLINE PLC
  { ticker: "TUI1.DE", sector: "Consumer Discretionary" }, // TUI N AG
  { ticker: "TW.L", sector: "Consumer Discretionary" }, // TAYLOR WIMPEY PLC
  { ticker: "TYRES.HE", sector: "Consumer Discretionary" }, // NOKIAN RENKAAT
  { ticker: "VAC.PA", sector: "Consumer Discretionary" }, // PIERRE ET VACANCES SA
  { ticker: "VTY.L", sector: "Consumer Discretionary" }, // VISTRY GROUP PLC
  { ticker: "WOSG.L", sector: "Consumer Discretionary" }, // WATCHES OF SWITZERLAND GROUP PLC
  { ticker: "WTB.L", sector: "Consumer Discretionary" }, // WHITBREAD PLC
  { ticker: "YACHT.MI", sector: "Consumer Discretionary" }, // FERRETTI
  { ticker: "YIT.HE", sector: "Consumer Discretionary" }, // YIT
  { ticker: "YNGA.L", sector: "Consumer Discretionary" }, // YOUNG AND COS BREWERY PLC

  // ── Consumer Staples ──
  { ticker: "AAK.ST", sector: "Consumer Staples" }, // AAK
  { ticker: "ACOMO.AS", sector: "Consumer Staples" }, // ACOMO NV
  { ticker: "AEP.L", sector: "Consumer Staples" }, // AEP PLANTATIONS PLC
  { ticker: "APOTEA.ST", sector: "Consumer Staples" }, // APOTEA
  { ticker: "ARYN.SW", sector: "Consumer Staples" }, // ARYZTA AG
  { ticker: "AUSS.OL", sector: "Consumer Staples" }, // AUSTEVOLL SEAFOOD
  { ticker: "AXFO.ST", sector: "Consumer Staples" }, // AXFOOD
  { ticker: "BAG.L", sector: "Consumer Staples" }, // A G BARR PLC
  { ticker: "BAKKA.OL", sector: "Consumer Staples" }, // BAKKAFROST
  { ticker: "CCR.L", sector: "Consumer Staples" }, // C C GROUP PLC
  { ticker: "CLA-B.ST", sector: "Consumer Staples" }, // CLOETTA CLASS B
  { ticker: "COLR.BR", sector: "Consumer Staples" }, // COLRUYT GROUP NV
  { ticker: "CWK.L", sector: "Consumer Staples" }, // CRANSWICK PLC
  { ticker: "DIA.MC", sector: "Consumer Staples" }, // DISTRIBUIDORA INTERNACIONAL DE ALI
  { ticker: "EMMN.SW", sector: "Consumer Staples" }, // EMMI AG
  { ticker: "FEVR.L", sector: "Consumer Staples" }, // FEVERTREE DRINKS PLC
  { ticker: "GL9.IR", sector: "Consumer Staples" }, // GLANBIA PLC
  { ticker: "GNC.L", sector: "Consumer Staples" }, // GREENCORE GROUP PLC
  { ticker: "HFG.DE", sector: "Consumer Staples" }, // HELLOFRESH
  { ticker: "HFG.L", sector: "Consumer Staples" }, // HILTON FOOD GROUP PLC
  { ticker: "ICOS.MI", sector: "Consumer Staples" }, // INTERCOS
  { ticker: "ITP.PA", sector: "Consumer Staples" }, // INTERPARFUMS SA
  { ticker: "KWS.DE", sector: "Consumer Staples" }, // KWS SAAT
  { ticker: "LSG.OL", sector: "Consumer Staples" }, // LEROY SEAFOOD GROUP
  { ticker: "MARR.MI", sector: "Consumer Staples" }, // MARR
  { ticker: "MPE.L", sector: "Consumer Staples" }, // M. P. EVANS GROUP PLC
  { ticker: "NWL.MI", sector: "Consumer Staples" }, // NEWPRINCES
  { ticker: "OCDO.L", sector: "Consumer Staples" }, // OCADO GROUP PLC
  { ticker: "PFD.L", sector: "Consumer Staples" }, // PREMIER FOODS PLC
  { ticker: "PHN.MI", sector: "Consumer Staples" }, // PHARMANUTRA
  { ticker: "RBREW.CO", sector: "Consumer Staples" }, // ROYAL UNIBREW
  { ticker: "RCO.PA", sector: "Consumer Staples" }, // REMY COINTREAU SA
  { ticker: "RDC.DE", sector: "Consumer Staples" }, // REDCARE PHARMACY NV
  { ticker: "SCHO.CO", sector: "Consumer Staples" }, // SCHOUW AND CO
  { ticker: "SCST.ST", sector: "Consumer Staples" }, // SCANDI STANDARD
  { ticker: "SLIGR.AS", sector: "Consumer Staples" }, // SLIGRO FOOD GROUP NV
  { ticker: "SON.LS", sector: "Consumer Staples" }, // SONAE SA
  { ticker: "STG.CO", sector: "Consumer Staples" }, // SCANDINAVIAN TOBACCO GROUP
  { ticker: "SZU.DE", sector: "Consumer Staples" }, // SUEDZUCKER AG
  { ticker: "TATE.L", sector: "Consumer Staples" }, // TATE AND LYLE PLC
  { ticker: "VIS.MC", sector: "Consumer Staples" }, // VISCOFAN SA

  // ── Energy ──
  { ticker: "AKSO.OL", sector: "Energy" }, // AKER SOLUTIONS
  { ticker: "BNOR.OL", sector: "Energy" }, // BLUENORD
  { ticker: "BWE.OL", sector: "Energy" }, // BW ENERGY LTD
  { ticker: "BWLPG.OL", sector: "Energy" }, // BW LPG LTD
  { ticker: "BWO.OL", sector: "Energy" }, // BW OFFSHORE LTD
  { ticker: "CMBT.BR", sector: "Energy" }, // CMB.TECH NV
  { ticker: "DCC.L", sector: "Energy" }, // DCC PLC
  { ticker: "DIS.MI", sector: "Energy" }, // DAMICO INTERNATIONAL SHIPPING SA
  { ticker: "DNO.OL", sector: "Energy" }, // DNO
  { ticker: "DOFG.OL", sector: "Energy" }, // DOF GROUP
  { ticker: "ENOG.L", sector: "Energy" }, // ENERGEAN PLC
  { ticker: "FRO", sector: "Energy" }, // FRONTLINE PLC
  { ticker: "GTT.PA", sector: "Energy" }, // GAZTRANSPORT & TECHNIGAZ SA
  { ticker: "HBR.L", sector: "Energy" }, // HARBOUR ENERGY PLC
  { ticker: "HTG.L", sector: "Energy" }, // HUNTING PLC
  { ticker: "MAU.PA", sector: "Energy" }, // MAUREL ET PROM SA
  { ticker: "ODL.OL", sector: "Energy" }, // ODFJELL DRILLING LTD
  { ticker: "PLSV.OL", sector: "Energy" }, // PARATUS ENERGY SER LTD
  { ticker: "RKH.L", sector: "Energy" }, // ROCKHOPPER EXPLORATION PLC
  { ticker: "SBMO.AS", sector: "Energy" }, // SBM OFFSHORE NV
  { ticker: "SPM.MI", sector: "Energy" }, // SAIPEM
  { ticker: "SQZ.L", sector: "Energy" }, // SERICA ENERGY PLC
  { ticker: "SUBC.OL", sector: "Energy" }, // SUBSEA  SA
  { ticker: "TE.PA", sector: "Energy" }, // TECHNIP ENERGIES NV
  { ticker: "TGS.OL", sector: "Energy" }, // TGS
  { ticker: "TRE.MC", sector: "Energy" }, // TECNICAS REUNIDAS SA
  { ticker: "TRMD-A.CO", sector: "Energy" }, // TORM PLC CLASS A
  { ticker: "VBK.DE", sector: "Energy" }, // VERBIO
  { ticker: "VH2.DE", sector: "Energy" }, // FRIEDRICH VORWERK GROUP
  { ticker: "VIRI.PA", sector: "Energy" }, // VIRIDIEN SA
  { ticker: "VK.PA", sector: "Energy" }, // VALLOUREC SA
  { ticker: "VPK.AS", sector: "Energy" }, // KONINKLIJKE VOPAK NV
  { ticker: "YCA.L", sector: "Energy" }, // YELLOW CAKE PLC

  // ── Financials ──
  { ticker: "ABDN.L", sector: "Financials" }, // ABERDEEN GROUP PLC
  { ticker: "AJB.L", sector: "Financials" }, // AJ BELL PLC
  { ticker: "ALLFG.AS", sector: "Financials" }, // ALLFUNDS GROUP PLC
  { ticker: "ALMB.CO", sector: "Financials" }, // ALM BRAND
  { ticker: "ALSYDB.CO", sector: "Financials" }, // AL SYDBANK
  { ticker: "ANTIN.PA", sector: "Financials" }, // ANTIN INFRASTRUCTURE PARTNERS
  { ticker: "ASHM.L", sector: "Financials" }, // ASHMORE GROUP PLC
  { ticker: "AVARDA.ST", sector: "Financials" }, // AVARDA BANK
  { ticker: "AZA.ST", sector: "Financials" }, // AVANZA BANK HOLDING
  { ticker: "AZM.MI", sector: "Financials" }, // AZIMUT HOLDING
  { ticker: "B2I.OL", sector: "Financials" }, // B2 IMPACT
  { ticker: "BDB.MI", sector: "Financials" }, // BANCO DI DESIO E DELLA BRIANZA
  { ticker: "BEZ.L", sector: "Financials" }, // BEAZLEY PLC
  { ticker: "BGEO.L", sector: "Financials" }, // LION FINANCE GROUP PLC
  { ticker: "BGN.MI", sector: "Financials" }, // BANCA GENERALI
  { ticker: "BPT.L", sector: "Financials" }, // BRIDGEPOINT GROUP PLC
  { ticker: "BURE.ST", sector: "Financials" }, // BURE EQUITY
  { ticker: "CBG.L", sector: "Financials" }, // CLOSE BROS GROUP PLC
  { ticker: "CE.MI", sector: "Financials" }, // CREDITO EMILIANO
  { ticker: "CFT.SW", sector: "Financials" }, // COMPAGNIE FINANCIERE TRADITION SA
  { ticker: "CGEO.L", sector: "Financials" }, // GEORGIA CAPITAL PLC
  { ticker: "CMBN.SW", sector: "Financials" }, // CEMBRA MONEY BANK AG
  { ticker: "CMCX.L", sector: "Financials" }, // CMC MARKETS PLC
  { ticker: "COFA.PA", sector: "Financials" }, // COFACE SA
  { ticker: "CRE.L", sector: "Financials" }, // CONDUIT HOLDINGS LTD
  { ticker: "CRED-A.ST", sector: "Financials" }, // CREADES CLASS A
  { ticker: "CSN.L", sector: "Financials" }, // CHESNARA PLC
  { ticker: "EDEN.PA", sector: "Financials" }, // EDENRED
  { ticker: "EFGN.SW", sector: "Financials" }, // EFG INTERNATIONAL AG
  { ticker: "EMG.L", sector: "Financials" }, // MAN GROUP PLC
  { ticker: "EWG.L", sector: "Financials" }, // W.A.G PAYMENT SOLUTIONS PLC
  { ticker: "FLOW.AS", sector: "Financials" }, // FLOW TRADERS LTD
  { ticker: "FSG.L", sector: "Financials" }, // FORESIGHT GROUP HOLDINGS LTD
  { ticker: "FTK.DE", sector: "Financials" }, // FLATEXDEGIRO N
  { ticker: "GIMB.BR", sector: "Financials" }, // GIMV NV
  { ticker: "GLJ.DE", sector: "Financials" }, // GRENKE N AG
  { ticker: "GROW.L", sector: "Financials" }, // MOLTEN VENTURES PLC
  { ticker: "HOFI.ST", sector: "Financials" }, // HOIST FINANCE
  { ticker: "HSX.L", sector: "Financials" }, // HISCOX LTD
  { ticker: "HYQ.DE", sector: "Financials" }, // HYPOPORT N
  { ticker: "ICG.L", sector: "Financials" }, // ICG PLC
  { ticker: "IF.MI", sector: "Financials" }, // BANCA IFIS
  { ticker: "IGG.L", sector: "Financials" }, // IG GROUP HOLDINGS PLC
  { ticker: "IHP.L", sector: "Financials" }, // INTEGRAFIN HOLDINGS
  { ticker: "INVP.L", sector: "Financials" }, // INVESTEC PLC
  { ticker: "IPO.L", sector: "Financials" }, // IP GROUP PLC
  { ticker: "JTC.L", sector: "Financials" }, // JTC PLC
  { ticker: "JUP.L", sector: "Financials" }, // JUPITER FUND MANAGEMENT PLC
  { ticker: "JYSK.CO", sector: "Financials" }, // JYSKE BANK
  { ticker: "KBCA.BR", sector: "Financials" }, // KBC ANCORA NV
  { ticker: "KINV-B.ST", sector: "Financials" }, // KINNEVIK CLASS B
  { ticker: "KLAR", sector: "Financials" }, // KLARNA GROUP PLC
  { ticker: "LDA.MC", sector: "Financials" }, // LINEA DIRECTA ASEGURADORA SA
  { ticker: "LRE.L", sector: "Financials" }, // LANCASHIRE HOLDINGS LTD
  { ticker: "MANTA.HE", sector: "Financials" }, // MANDATUM
  { ticker: "MF.PA", sector: "Financials" }, // WENDEL
  { ticker: "MING.OL", sector: "Financials" }, // SPAREBANK  SMNS
  { ticker: "MTRO.L", sector: "Financials" }, // METRO BANK HOLDINGS PLC
  { ticker: "MUX.DE", sector: "Financials" }, // MUTARES
  { ticker: "N91.L", sector: "Financials" }, // NINETY ONE PLC
  { ticker: "NEXI.MI", sector: "Financials" }, // NEXI
  { ticker: "NOBA.ST", sector: "Financials" }, // NOBA BANK GROUP
  { ticker: "NONG.OL", sector: "Financials" }, // SPAREBANK  NORD-NORGE
  { ticker: "NORION.ST", sector: "Financials" }, // NORION BANK
  { ticker: "OSB.L", sector: "Financials" }, // OSB GROUP PLC
  { ticker: "PAG.L", sector: "Financials" }, // PARAGON BANKING GROUP PLC
  { ticker: "PBB.DE", sector: "Financials" }, // DEUTSCHE PFANDBRIEFBANK AG
  { ticker: "PEUG.PA", sector: "Financials" }, // PEUGEOT INVEST SA
  { ticker: "PLUS.L", sector: "Financials" }, // PLUS500 LTD
  { ticker: "PLX.PA", sector: "Financials" }, // PLUXEE NV
  { ticker: "POLR.L", sector: "Financials" }, // POLAR CAPITAL HOLDINGS PLC
  { ticker: "PROT.OL", sector: "Financials" }, // PROTECTOR FORSIKRING
  { ticker: "QLT.L", sector: "Financials" }, // QUILTER PLC
  { ticker: "RAT.L", sector: "Financials" }, // RATHBONES GROUP PLC
  { ticker: "RATO-B.ST", sector: "Financials" }, // RATOS CLASS B
  { ticker: "RF.PA", sector: "Financials" }, // EURAZEO
  { ticker: "RILBA.CO", sector: "Financials" }, // RINGKJOBING LANDBOBANK
  { ticker: "ROKO-B.ST", sector: "Financials" }, // ROKO CLASS B
  { ticker: "SAGA.L", sector: "Financials" }, // SAGA PLC
  { ticker: "SAVE.ST", sector: "Financials" }, // NORDNET
  { ticker: "SB1NO.OL", sector: "Financials" }, // SPAREBANK  SR-NORGE
  { ticker: "SCR.PA", sector: "Financials" }, // SCOR
  { ticker: "SHAW.L", sector: "Financials" }, // SHAWBROOK GROUP PLC
  { ticker: "SPOL.OL", sector: "Financials" }, // SPAREBANK  OSTLANDET
  { ticker: "SQN.SW", sector: "Financials" }, // SWISSQUOTE GROUP HOLDING SA
  { ticker: "STB.OL", sector: "Financials" }, // STOREBRAND
  { ticker: "STJ.L", sector: "Financials" }, // ST.JAMES PLACE PLC
  { ticker: "TBCG.L", sector: "Financials" }, // TBC BANK GROUP PLC
  { ticker: "TCAP.L", sector: "Financials" }, // TP ICAP GROUP PLC
  { ticker: "TIP.MI", sector: "Financials" }, // TAMBURI INVESTMENT PARTNERS
  { ticker: "TKO.PA", sector: "Financials" }, // TIKEHAU CAPITAL
  { ticker: "UNI.MC", sector: "Financials" }, // UNICAJA BANCO SA
  { ticker: "UQA.VI", sector: "Financials" }, // UNIQA INSURANCE GROUP AG
  { ticker: "VAHN.SW", sector: "Financials" }, // VAUDOISE ASSURANCES SA
  { ticker: "VATN.SW", sector: "Financials" }, // VALIANT HOLDING AG
  { ticker: "VIG.VI", sector: "Financials" }, // VIENNA INSURANCE GROUP AG
  { ticker: "VLK.AS", sector: "Financials" }, // VAN LANSCHOT KEMPEN NV
  { ticker: "VONN.SW", sector: "Financials" }, // VONTOBEL HOLDING AG
  { ticker: "WLN.PA", sector: "Financials" }, // WORLDLINE SA
  { ticker: "WUW.DE", sector: "Financials" }, // WUESTENROT & WUERTTEMBERGISCHE AG
  { ticker: "XPS.L", sector: "Financials" }, // XPS PENSIONS GROUP PLC

  // ── Health Care ──
  { ticker: "1SXP.DE", sector: "Health Care" }, // SCHOTT PHARMA AG
  { ticker: "AFX.DE", sector: "Health Care" }, // CARL ZEISS MEDITEC AG
  { ticker: "ALIF-B.ST", sector: "Health Care" }, // ADDLIFE CLASS B
  { ticker: "ALK-B.CO", sector: "Health Care" }, // ALK-ABELLO CLASS B
  { ticker: "ALM.MC", sector: "Health Care" }, // ALMIRALL SA
  { ticker: "AMBEA.ST", sector: "Health Care" }, // AMBEA
  { ticker: "AMBU-B.CO", sector: "Health Care" }, // AMBU CLASS B
  { ticker: "AMP.MI", sector: "Health Care" }, // AMPLIFON
  { ticker: "AMS.L", sector: "Health Care" }, // ADVANCED MEDICAL SOLUTIONS GROUP P
  { ticker: "ARJO-B.ST", sector: "Health Care" }, // ARJO CLASS B
  { ticker: "ASKER.ST", sector: "Health Care" }, // ASKER HEALTHCARE GROUP
  { ticker: "ATT.ST", sector: "Health Care" }, // ATTENDO
  { ticker: "BANB.SW", sector: "Health Care" }, // BACHEM HOLDING AG
  { ticker: "BAVA.CO", sector: "Health Care" }, // BAVARIAN NORDIC
  { ticker: "BIOA-B.ST", sector: "Health Care" }, // BIOARCTIC CLASS B
  { ticker: "BIOG-B.ST", sector: "Health Care" }, // BIOGAIA CLASS B
  { ticker: "BONEX.ST", sector: "Health Care" }, // BONESUPPORT HOLDING
  { ticker: "BSLN.SW", sector: "Health Care" }, // BASILEA PHARMACEUTICA AG
  { ticker: "CAMX.ST", sector: "Health Care" }, // CAMURUS
  { ticker: "CHEMM.CO", sector: "Health Care" }, // CHEMOMETEC
  { ticker: "CLARI.PA", sector: "Health Care" }, // CLARIANE
  { ticker: "COPN.SW", sector: "Health Care" }, // COSMO N NV
  { ticker: "CRW.L", sector: "Health Care" }, // CRANEWARE PLC
  { ticker: "CTEC.L", sector: "Health Care" }, // CONVATEC GROUP PLC
  { ticker: "CVSG.L", sector: "Health Care" }, // CVS GROUP PLC
  { ticker: "DBV.PA", sector: "Health Care" }, // DBV TECHNOLOGIES SA
  { ticker: "DESN.SW", sector: "Health Care" }, // DOTTIKON ES HOLDING AG
  { ticker: "DIA.MI", sector: "Health Care" }, // DIASORIN
  { ticker: "DMP.DE", sector: "Health Care" }, // DERMAPHARM HOLDING
  { ticker: "DRW3.DE", sector: "Health Care" }, // DRAEGERWERK PREF AG
  { ticker: "EKTA-B.ST", sector: "Health Care" }, // ELEKTA CLASS B
  { ticker: "ELN.MI", sector: "Health Care" }, // EL EN
  { ticker: "EMEIS.PA", sector: "Health Care" }, // EMEIS SA
  { ticker: "EQS.PA", sector: "Health Care" }, // EQUASENS SA
  { ticker: "EUZ.DE", sector: "Health Care" }, // ECKERT & ZIEGLER
  { ticker: "EVT.DE", sector: "Health Care" }, // EVOTEC
  { ticker: "FAGR.BR", sector: "Health Care" }, // FAGRON NV
  { ticker: "GALE.SW", sector: "Health Care" }, // GALENICA AG
  { ticker: "GETI-B.ST", sector: "Health Care" }, // GETINGE CLASS B
  { ticker: "GNS.L", sector: "Health Care" }, // GENUS PLC
  { ticker: "GRF.MC", sector: "Health Care" }, // GRIFOLS SA CLASS A
  { ticker: "GUBRA.CO", sector: "Health Care" }, // GUBRA
  { ticker: "GVS.MI", sector: "Health Care" }, // GVS
  { ticker: "GXI.DE", sector: "Health Care" }, // GERRESHEIMER AG
  { ticker: "HIK.L", sector: "Health Care" }, // HIKMA PHARMACEUTICALS PLC
  { ticker: "HLUN-B.CO", sector: "Health Care" }, // H. LUNDBECK CLASS B
  { ticker: "IDIA.SW", sector: "Health Care" }, // IDORSIA N LTD
  { ticker: "IVA.PA", sector: "Health Care" }, // INVENTIVA SA
  { ticker: "KURN.SW", sector: "Health Care" }, // KUROS BIOSCIENCES AG
  { ticker: "LKFT.AS", sector: "Health Care" }, // GALAPAGOS ORD
  { ticker: "MCAP.ST", sector: "Health Care" }, // MEDCAP
  { ticker: "MCOV-B.ST", sector: "Health Care" }, // MEDICOVER CLASS B
  { ticker: "MEDCL.PA", sector: "Health Care" }, // MEDINCELL SA
  { ticker: "MOVE.SW", sector: "Health Care" }, // MEDACTA GROUP SA
  { ticker: "NANO.PA", sector: "Health Care" }, // NANOBIOTIX SA
  { ticker: "ONT.L", sector: "Health Care" }, // OXFORD NANOPORE TECHNOLOGIES PLC
  { ticker: "OXB.L", sector: "Health Care" }, // OXFORD BIOMEDICA PLC
  { ticker: "PHARM.AS", sector: "Health Care" }, // PHARMING GROUP NV
  { ticker: "PHM.MC", sector: "Health Care" }, // PHARMA MAR SA
  { ticker: "PHVS", sector: "Health Care" }, // PHARVARIS N V NV
  { ticker: "PPGN.SW", sector: "Health Care" }, // POLYPEPTIDE N AG
  { ticker: "RAY-B.ST", sector: "Health Care" }, // RAYSEARCH LABORATORIES CLASS B
  { ticker: "REG1V.HE", sector: "Health Care" }, // REVENIO GROUP
  { ticker: "ROVI.MC", sector: "Health Care" }, // LABORATORIOS FARMACEUTICOS ROVI SA
  { ticker: "SECT-B.ST", sector: "Health Care" }, // SECTRA CLASS B
  { ticker: "SFZN.SW", sector: "Health Care" }, // SIEGFRIED HOLDING AG
  { ticker: "SKAN.SW", sector: "Health Care" }, // SKAN N AG
  { ticker: "SPI.L", sector: "Health Care" }, // SPIRE HEALTHCARE GROUP PLCINARY
  { ticker: "TECN.SW", sector: "Health Care" }, // TECAN GROUP AG
  { ticker: "UPR.IR", sector: "Health Care" }, // UNIPHAR PLC
  { ticker: "VIMIAN.ST", sector: "Health Care" }, // VIMIAN GROUP
  { ticker: "VIRP.PA", sector: "Health Care" }, // VIRBAC SA
  { ticker: "VITR.ST", sector: "Health Care" }, // VITROLIFE
  { ticker: "VLA.PA", sector: "Health Care" }, // VALNEVA
  { ticker: "XVIVO.ST", sector: "Health Care" }, // XVIVO PERFUSION
  { ticker: "YPSN.SW", sector: "Health Care" }, // YPSOMED HOLDING AG
  { ticker: "ZEAL.CO", sector: "Health Care" }, // ZEALAND PHARMA

  // ── Industrials ──
  { ticker: "2GB.DE", sector: "Industrials" }, // 2G ENERGY AG
  { ticker: "AALB.AS", sector: "Industrials" }, // AALBERTS NV
  { ticker: "ACKB.BR", sector: "Industrials" }, // ACKERMANS & VAN HAAREN NV
  { ticker: "ACLN.SW", sector: "Industrials" }, // ACCELLERON N AG
  { ticker: "ADEN.SW", sector: "Industrials" }, // ADECCO GROUP AG
  { ticker: "AERO.SW", sector: "Industrials" }, // MONTANA N AG
  { ticker: "AF.PA", sector: "Industrials" }, // AIR FRANCE-KLM SA
  { ticker: "AFRY.ST", sector: "Industrials" }, // AFRY CLASS B
  { ticker: "AKER.OL", sector: "Industrials" }, // AKER
  { ticker: "ALIG.ST", sector: "Industrials" }, // ALIMAK GROUP
  { ticker: "ANDR.VI", sector: "Industrials" }, // ANDRITZ AG
  { ticker: "AQ.ST", sector: "Industrials" }, // AQ GROUP
  { ticker: "ARCAD.AS", sector: "Industrials" }, // ARCADIS NV
  { ticker: "ARIS.MI", sector: "Industrials" }, // ARISTON HOLDING NV
  { ticker: "ASY.PA", sector: "Industrials" }, // ASSYSTEM SA
  { ticker: "AUTO.OL", sector: "Industrials" }, // AUTOSTORE HOLDINGS LTD
  { ticker: "AVIO.MI", sector: "Industrials" }, // AVIO
  { ticker: "AVON.L", sector: "Industrials" }, // AVON TECHNOLOGIES PLC
  { ticker: "AZE.BR", sector: "Industrials" }, // AZELIS GROUP NV
  { ticker: "BAB.L", sector: "Industrials" }, // BABCOCK INTERNATIONAL GROUP PLC
  { ticker: "BAMNB.AS", sector: "Industrials" }, // BAM GROEP KONINKLIJKE NV
  { ticker: "BB.PA", sector: "Industrials" }, // BIC SA
  { ticker: "BBY.L", sector: "Industrials" }, // BALFOUR BEATTY PLC
  { ticker: "BCHN.SW", sector: "Industrials" }, // BURCKHARDT COMPRESSION HOLDING AG
  { ticker: "BFSA.DE", sector: "Industrials" }, // BEFESA SA
  { ticker: "BOSN.SW", sector: "Industrials" }, // BOSSARD HOLDING AG
  { ticker: "BOY.L", sector: "Industrials" }, // BODYCOTE PLC
  { ticker: "BRAV.ST", sector: "Industrials" }, // BRAVIDA HOLDING
  { ticker: "BRKN.SW", sector: "Industrials" }, // BURKHALTER HOLDING AG
  { ticker: "BUCN.SW", sector: "Industrials" }, // BUCHER INDUSTRIES AG
  { ticker: "BUFAB.ST", sector: "Industrials" }, // BUFAB
  { ticker: "BYS.SW", sector: "Industrials" }, // BYSTRONIC AG
  { ticker: "CADLR.OL", sector: "Industrials" }, // CADELER
  { ticker: "CAF.MC", sector: "Industrials" }, // CONSTRUCCIONES Y AUXILIAR DE FERRO
  { ticker: "CHG.L", sector: "Industrials" }, // CHEMRING GROUP PLC
  { ticker: "CHRT.L", sector: "Industrials" }, // COHORT PLC
  { ticker: "CKN.L", sector: "Industrials" }, // CLARKSON PLC
  { ticker: "CMB.MI", sector: "Industrials" }, // CEMBRE
  { ticker: "CRL.MI", sector: "Industrials" }, // CAREL
  { ticker: "CTT.LS", sector: "Industrials" }, // CTT CORREIOS DE PORTUGAL SA
  { ticker: "CWC.DE", sector: "Industrials" }, // CEWE STIFTUNG
  { ticker: "CWR.L", sector: "Industrials" }, // CERES POWER HOLDINGS PLC
  { ticker: "DAE.SW", sector: "Industrials" }, // DAETWYLER HOLDING INC
  { ticker: "DAN.MI", sector: "Industrials" }, // DANIELI
  { ticker: "DANR.MI", sector: "Industrials" }, // DANIELI & C OFFICINE MECCANICHE SA
  { ticker: "DATA.L", sector: "Industrials" }, // GLOBALDATA PLC
  { ticker: "DBG.PA", sector: "Industrials" }, // DERICHEBOURG SA
  { ticker: "DEME.BR", sector: "Industrials" }, // DEME GROUP NV
  { ticker: "DEZ.DE", sector: "Industrials" }, // DEUTZ AG
  { ticker: "DFDS.CO", sector: "Industrials" }, // DFDS
  { ticker: "DKSH.SW", sector: "Industrials" }, // DKSH HOLDING AG
  { ticker: "DNORD.CO", sector: "Industrials" }, // DAMPSKIBSSELSKABET NORDEN
  { ticker: "DNR.MI", sector: "Industrials" }, // INDUSTRIE DE NORA
  { ticker: "DOC.VI", sector: "Industrials" }, // DO & CO AKTIENGESELLSCHAFT AG
  { ticker: "DOKA.SW", sector: "Industrials" }, // DORMAKABA HOLDING AG
  { ticker: "DPLM.L", sector: "Industrials" }, // DIPLOMA PLC
  { ticker: "DSCV.L", sector: "Industrials" }, // DISCOVERIE GROUP
  { ticker: "DUE.DE", sector: "Industrials" }, // DUERR AG
  { ticker: "EGL.LS", sector: "Industrials" }, // MOTA-ENGIL SGPS SA
  { ticker: "EKT.DE", sector: "Industrials" }, // ENERGIEKONTOR AG
  { ticker: "ELIS.PA", sector: "Industrials" }, // ELIS SA
  { ticker: "ENAV.MI", sector: "Industrials" }, // ENAV SPA
  { ticker: "ENGCON-B.ST", sector: "Industrials" }, // ENGCON CLASS B
  { ticker: "ENO.MC", sector: "Industrials" }, // ELECNOR SA
  { ticker: "EPRO-B.ST", sector: "Industrials" }, // ELECTROLUX PROFESSIONAL CLASS B
  { ticker: "EXA.PA", sector: "Industrials" }, // EXAIL TECHNOLOGIES SA
  { ticker: "EXENS.PA", sector: "Industrials" }, // EXOSENS SA
  { ticker: "EZJ.L", sector: "Industrials" }, // EASYJET PLC
  { ticker: "FAN.L", sector: "Industrials" }, // VOLUTION GROUP PLCINARY
  { ticker: "FCT.MI", sector: "Industrials" }, // FINCANTIERI
  { ticker: "FDR.MC", sector: "Industrials" }, // FLUIDRA SA
  { ticker: "FERGR.AS", sector: "Industrials" }, // FERRARI GROUP PLC
  { ticker: "FGP.L", sector: "Industrials" }, // FIRSTGROUP PLC
  { ticker: "FHZN.SW", sector: "Industrials" }, // FLUGHAFEN ZUERICH AG
  { ticker: "FIA1S.HE", sector: "Industrials" }, // FINNAIR
  { ticker: "FII.PA", sector: "Industrials" }, // LISI SA
  { ticker: "FILA.MI", sector: "Industrials" }, // FILA
  { ticker: "FLS.CO", sector: "Industrials" }, // FLSMIDTH AND CO CLASS B
  { ticker: "FORN.SW", sector: "Industrials" }, // FORBO HOLDING AG
  { ticker: "FQT.F", sector: "Industrials" }, // FREQUENTIS AG
  { ticker: "FRA.DE", sector: "Industrials" }, // FRAPORT FRANKFURT AIRPORT SERVICES
  { ticker: "FUR.AS", sector: "Industrials" }, // FUGRO NV CLASS C
  { ticker: "GBF.DE", sector: "Industrials" }, // BILFINGER
  { ticker: "GEN.L", sector: "Industrials" }, // GENUIT GROUP PLC
  { ticker: "GF.SW", sector: "Industrials" }, // GEORG FISCHER AG
  { ticker: "GFTU.L", sector: "Industrials" }, // GRAFTON GROUP PLC
  { ticker: "GLO.PA", sector: "Industrials" }, // GL EVENTS SA
  { ticker: "HAS.L", sector: "Industrials" }, // HAYS PLC
  { ticker: "HAUTO.OL", sector: "Industrials" }, // HOEGH AUTOLINERS
  { ticker: "HEIJM.AS", sector: "Industrials" }, // KONINKLIJKE HEIJMANS DUTCH CERTIFI
  { ticker: "HIAB.HE", sector: "Industrials" }, // HIAB OYJ
  { ticker: "HUBN.SW", sector: "Industrials" }, // HUBER & SUHNER AG
  { ticker: "HUSQ-B.ST", sector: "Industrials" }, // HUSQVARNA CLASS B
  { ticker: "HWDN.L", sector: "Industrials" }, // HOWDEN JOINERY GROUP PLC
  { ticker: "IDL.PA", sector: "Industrials" }, // ID LOGISTICS
  { ticker: "IMCD.AS", sector: "Industrials" }, // IMCD NV
  { ticker: "IMI.L", sector: "Industrials" }, // IMI PLC
  { ticker: "IMPN.SW", sector: "Industrials" }, // IMPLENIA AG
  { ticker: "INH.DE", sector: "Industrials" }, // INDUS HOLDING AG
  { ticker: "INRN.SW", sector: "Industrials" }, // INTERROLL HOLDING AG
  { ticker: "INSTAL.ST", sector: "Industrials" }, // INSTALCO
  { ticker: "INTRUM.ST", sector: "Industrials" }, // INTRUM
  { ticker: "INWI.ST", sector: "Industrials" }, // INWIDO
  { ticker: "IP.MI", sector: "Industrials" }, // INTERPUMP GROUP
  { ticker: "ISS.CO", sector: "Industrials" }, // ISS
  { ticker: "ITM.L", sector: "Industrials" }, // ITM POWER PLC
  { ticker: "ITM.MI", sector: "Industrials" }, // ITALMOBILIARE
  { ticker: "IVG.MI", sector: "Industrials" }, // IVECO GROUP NV
  { ticker: "IVSO.ST", sector: "Industrials" }, // INVISIO
  { ticker: "JET2.L", sector: "Industrials" }, // JET2 PLC
  { ticker: "JFN.SW", sector: "Industrials" }, // JUNGFRAUBAHN HOLDING AG
  { ticker: "JSG.L", sector: "Industrials" }, // JOHNSON SERVICE GROUP PLC
  { ticker: "JST.DE", sector: "Industrials" }, // JOST WERKE
  { ticker: "JUN3.DE", sector: "Industrials" }, // JUNGHEINRICH PREF AG
  { ticker: "KALMAR.HE", sector: "Industrials" }, // KALMAR CORPORATION CLASS B
  { ticker: "KARN.SW", sector: "Industrials" }, // KARDEX HOLDING AG
  { ticker: "KCR.HE", sector: "Industrials" }, // KONECRANES
  { ticker: "KEMPOWR.HE", sector: "Industrials" }, // KEMPOWER
  { ticker: "KGX.DE", sector: "Industrials" }, // KION GROUP AG
  { ticker: "KIE.L", sector: "Industrials" }, // KIER GROUP PLC
  { ticker: "KLR.L", sector: "Industrials" }, // KELLER GROUP PLC
  { ticker: "KMAR.OL", sector: "Industrials" }, // KONGSBERG MARITIME
  { ticker: "KRN.DE", sector: "Industrials" }, // KRONES AG
  { ticker: "KSB3.DE", sector: "Industrials" }, // KSB PREF
  { ticker: "LIAB.ST", sector: "Industrials" }, // LINDAB INTERNATIONAL
  { ticker: "LIGHT.AS", sector: "Industrials" }, // SIGNIFY NV
  { ticker: "LOG.MC", sector: "Industrials" }, // LOGISTA INTEGRAL SA
  { ticker: "LOOMIS.ST", sector: "Industrials" }, // LOOMIS CLASS B
  { ticker: "LUVE.MI", sector: "Industrials" }, // LUVE
  { ticker: "MAIRE.MI", sector: "Industrials" }, // MARIE
  { ticker: "MBB.DE", sector: "Industrials" }, // MBB
  { ticker: "MGAM.L", sector: "Industrials" }, // MORGAN ADVANCED MATERIALS PLC
  { ticker: "MGNS.L", sector: "Industrials" }, // MORGAN SINDALL GROUP PLC
  { ticker: "MILDEF.ST", sector: "Industrials" }, // MILDEF GROUP
  { ticker: "MPCC.OL", sector: "Industrials" }, // MPC CONTAINER SHIPS
  { ticker: "MRN.PA", sector: "Industrials" }, // MERSEN SA
  { ticker: "MTLN.AT", sector: "Industrials" }, // METLEN ENERGY & METALS PLC
  { ticker: "MTO.L", sector: "Industrials" }, // MITIE GROUP PLC
  { ticker: "MTRS.ST", sector: "Industrials" }, // MUNTERS GROUP
  { ticker: "MTU.PA", sector: "Industrials" }, // MANITOU BF SA
  { ticker: "NAS.OL", sector: "Industrials" }, // NORWEGIAN AIR SHUTTLE
  { ticker: "NCGB.F", sector: "Industrials" }, // NCC CLASS B
  { ticker: "NCH2.DE", sector: "Industrials" }, // THYSSENKRUPP NUCERA AG
  { ticker: "NDX1.DE", sector: "Industrials" }, // NORDEX
  { ticker: "NEX.PA", sector: "Industrials" }, // NEXANS SA
  { ticker: "NKT.CO", sector: "Industrials" }, // NKT
  { ticker: "NOEJ.DE", sector: "Industrials" }, // NORMA GROUP
  { ticker: "NOLA-B.ST", sector: "Industrials" }, // NOLATO CLASS B
  { ticker: "NORCO.OL", sector: "Industrials" }, // NORCONSULT
  { ticker: "NTG.CO", sector: "Industrials" }, // NTG NORDIC TRANSPORT GROUP
  { ticker: "ODF.OL", sector: "Industrials" }, // ODFJELL CLASS A
  { ticker: "OERL.SW", sector: "Industrials" }, // OC OERLIKON CORPORATION
  { ticker: "PAAL-B.CO", sector: "Industrials" }, // PER AARSLEFF HOLDING CLASS B
  { ticker: "PAGE.L", sector: "Industrials" }, // PAGEGROUP PLC
  { ticker: "PAL.VI", sector: "Industrials" }, // PALFINGER AG
  { ticker: "PEAB-B.ST", sector: "Industrials" }, // PEAB CLASS B
  { ticker: "PFSE.DE", sector: "Industrials" }, // PFISTERER
  { ticker: "PLEJD.ST", sector: "Industrials" }, // PLEJD
  { ticker: "PNE3.DE", sector: "Industrials" }, // PNE AG
  { ticker: "PNL.AS", sector: "Industrials" }, // POSTNL NV
  { ticker: "POS.VI", sector: "Industrials" }, // PORR AG
  { ticker: "POST.VI", sector: "Industrials" }, // OSTERREICHISCHE POST AG
  { ticker: "PSG.MC", sector: "Industrials" }, // PROSEGUR COMPANIA DE SEGURIDAD SA
  { ticker: "QQ.L", sector: "Industrials" }, // QINETIQ GROUP PLC
  { ticker: "R3NK.DE", sector: "Industrials" }, // RENK GROUP AG
  { ticker: "RAND.AS", sector: "Industrials" }, // RANDSTAD NV
  { ticker: "RECT.BR", sector: "Industrials" }, // RECTICEL SA
  { ticker: "RNWH.L", sector: "Industrials" }, // RENEW HOLDINGS PLC
  { ticker: "ROR.L", sector: "Industrials" }, // ROTORK PLC
  { ticker: "ROSE.L", sector: "Industrials" }, // ROSEBANK INDUSTRIES PLC
  { ticker: "RS1.L", sector: "Industrials" }, // RS GROUP PLC
  { ticker: "RSGN.SW", sector: "Industrials" }, // R&S GROUP HOLDING AG
  { ticker: "S92.DE", sector: "Industrials" }, // SMA SOLAR TECHNOLOGY AG
  { ticker: "SCHP.PA", sector: "Industrials" }, // SECHE ENVIRONNEMENT SA
  { ticker: "SCYR.MC", sector: "Industrials" }, // SACYR SA
  { ticker: "SDIP-B.ST", sector: "Industrials" }, // SDIPTECH CLASS B
  { ticker: "SFSN.SW", sector: "Industrials" }, // SFS GROUP AG
  { ticker: "SIX2.DE", sector: "Industrials" }, // SIXT
  { ticker: "SIX3.DE", sector: "Industrials" }, // SIXT PREF
  { ticker: "SNI.OL", sector: "Industrials" }, // STOLT-NIELSEN LTD
  { ticker: "SNR.L", sector: "Industrials" }, // SENIOR PLC
  { ticker: "SPIE.PA", sector: "Industrials" }, // SPIE SA
  { ticker: "SRAIL.SW", sector: "Industrials" }, // STADLER RAIL AG
  { ticker: "SRP.L", sector: "Industrials" }, // SERCO GROUP PLC
  { ticker: "STOR-B.ST", sector: "Industrials" }, // STORSKOGEN GROUP CLASS B
  { ticker: "SUN.SW", sector: "Industrials" }, // SULZER AG
  { ticker: "SWEC-B.ST", sector: "Industrials" }, // SWECO CLASS B
  { ticker: "TEP.PA", sector: "Industrials" }, // TELEPERFORMANCE
  { ticker: "TKMS.DE", sector: "Industrials" }, // TKMS AG
  { ticker: "TOM.OL", sector: "Industrials" }, // TOMRA SYSTEMS
  { ticker: "TPK.L", sector: "Industrials" }, // TRAVIS PERKINS PLC
  { ticker: "TROAX.ST", sector: "Industrials" }, // TROAX GROUP
  { ticker: "TWEKA.AS", sector: "Industrials" }, // TKH GROUP NV
  { ticker: "VALMT.HE", sector: "Industrials" }, // VALMET CORP
  { ticker: "VBG-B.ST", sector: "Industrials" }, // VBG GROUP CLASS B
  { ticker: "VLX.L", sector: "Industrials" }, // VOLEX PLC
  { ticker: "VOS.DE", sector: "Industrials" }, // VOSSLOH AG
  { ticker: "VSVS.L", sector: "Industrials" }, // VESUVIUS
  { ticker: "WAC.DE", sector: "Industrials" }, // WACKER NEUSON N
  { ticker: "WAWI.OL", sector: "Industrials" }, // WALLENIUS WILHELMSEN
  { ticker: "WBD.MI", sector: "Industrials" }, // WEBUILD
  { ticker: "WEIR.L", sector: "Industrials" }, // WEIR GROUP PLC
  { ticker: "WWI.OL", sector: "Industrials" }, // WILH. WILHELMSEN HOLDING A
  { ticker: "ZEHN.SW", sector: "Industrials" }, // ZEHNDER GROUP AG
  { ticker: "ZIG.L", sector: "Industrials" }, // ZIGUP PLC

  // ── Information Technology ──
  { ticker: "AIXA.DE", sector: "Information Technology" }, // AIXTRON
  { ticker: "AL2SI.PA", sector: "Information Technology" }, // 2CRSI SA
  { ticker: "ALFA.L", sector: "Information Technology" }, // ALFA FINANCIAL SOFTWARE HOLDINGS P
  { ticker: "ALSN.SW", sector: "Information Technology" }, // ALSO HOLDING AG
  { ticker: "AMS.SW", sector: "Information Technology" }, // AMS-OSRAM AG
  { ticker: "ANOD-B.ST", sector: "Information Technology" }, // ADDNODE GROUP CLASS B
  { ticker: "AOF.DE", sector: "Information Technology" }, // ATOSS SOFTWARE
  { ticker: "ATE.PA", sector: "Information Technology" }, // ALTEN SA
  { ticker: "ATEA.OL", sector: "Information Technology" }, // ATEA
  { ticker: "ATS.VI", sector: "Information Technology" }, // AT & S AUSTRIA TECHNOLOGIE & SYSTE
  { ticker: "AUB.PA", sector: "Information Technology" }, // AUBAY SA
  { ticker: "BAR.BR", sector: "Information Technology" }, // BARCO NV
  { ticker: "BC8.DE", sector: "Information Technology" }, // BECHTLE AG
  { ticker: "BITTI.HE", sector: "Information Technology" }, // BITTIUM
  { ticker: "BYIT.L", sector: "Information Technology" }, // BYTES TECHNOLOGY GROUP PLC
  { ticker: "CCC.L", sector: "Information Technology" }, // COMPUTACENTER PLC
  { ticker: "CER.L", sector: "Information Technology" }, // CERILLION PLC
  { ticker: "CICN.SW", sector: "Information Technology" }, // CICOR TECHNOLOGIES B LTD
  { ticker: "COK.DE", sector: "Information Technology" }, // CANCOM
  { ticker: "COTN.SW", sector: "Information Technology" }, // COMET HOLDING AG
  { ticker: "DYVOX.ST", sector: "Information Technology" }, // DYNAVOX GROUP
  { ticker: "ELG.DE", sector: "Information Technology" }, // ELMOS SEMICONDUCTOR
  { ticker: "GBG.L", sector: "Information Technology" }, // GB GROUP PLC
  { ticker: "GFT.DE", sector: "Information Technology" }, // GFT TECHNOLOGIES
  { ticker: "HANZA.ST", sector: "Information Technology" }, // HANZA
  { ticker: "HMS.ST", sector: "Information Technology" }, // HMS NETWORKS
  { ticker: "IFCN.SW", sector: "Information Technology" }, // INFICON HOLDING AG
  { ticker: "IOS.DE", sector: "Information Technology" }, // IONOS GROUP N
  { ticker: "JEN.DE", sector: "Information Technology" }, // JENOPTIK N AG
  { ticker: "KIT.OL", sector: "Information Technology" }, // KITRON
  { ticker: "KNOS.L", sector: "Information Technology" }, // KAINOS GROUP PLC
  { ticker: "KTN.DE", sector: "Information Technology" }, // KONTRON AG
  { ticker: "LAGR-B.ST", sector: "Information Technology" }, // LAGERCRANTZ GROUP CLASS B
  { ticker: "LAND.SW", sector: "Information Technology" }, // LANDIS+GYR GROUP AG
  { ticker: "LINK.OL", sector: "Information Technology" }, // LINK MOBILITY GROUP HOLDING
  { ticker: "MELE.BR", sector: "Information Technology" }, // MELEXIS NV
  { ticker: "MYCR.ST", sector: "Information Technology" }, // MYCRONIC
  { ticker: "NA9.DE", sector: "Information Technology" }, // NAGARRO N
  { ticker: "NCAB.ST", sector: "Information Technology" }, // NCAB GROUP
  { ticker: "NETC.CO", sector: "Information Technology" }, // NETCOMPANY GROUP
  { ticker: "NOD.OL", sector: "Information Technology" }, // NORDIC SEMICONDUCTOR
  { ticker: "NORBT.OL", sector: "Information Technology" }, // NORBIT
  { ticker: "OVH.PA", sector: "Information Technology" }, // OVH GROUPE SA
  { ticker: "OXIG.L", sector: "Information Technology" }, // OXFORD INSTRUMENTS PLC
  { ticker: "PLNW.PA", sector: "Information Technology" }, // PLANISWARE SA
  { ticker: "QTCOM.HE", sector: "Information Technology" }, // QT GROUP
  { ticker: "REY.MI", sector: "Information Technology" }, // REPLY
  { ticker: "RPI.L", sector: "Information Technology" }, // RASPBERRY PI HOLDINGS PLC
  { ticker: "RSW.L", sector: "Information Technology" }, // RENISHAW PLC
  { ticker: "SCT.L", sector: "Information Technology" }, // SOFTCAT PLC
  { ticker: "SENS.SW", sector: "Information Technology" }, // SENSIRION HOLDING AG
  { ticker: "SES.MI", sector: "Information Technology" }, // SESA
  { ticker: "SINCH.ST", sector: "Information Technology" }, // SINCH
  { ticker: "SIVE.ST", sector: "Information Technology" }, // SIVERS SEMICONDUCTORS
  { ticker: "SMHN.DE", sector: "Information Technology" }, // SUSS MICROTEC N
  { ticker: "SOI.PA", sector: "Information Technology" }, // SOITEC SA
  { ticker: "SOP.PA", sector: "Information Technology" }, // SOPRA STERIA GROUP SA
  { ticker: "SWON.SW", sector: "Information Technology" }, // SOFTWAREONE HOLDING AG
  { ticker: "TEMN.SW", sector: "Information Technology" }, // TEMENOS AG
  { ticker: "TIETO.HE", sector: "Information Technology" }, // TIETO
  { ticker: "TMV.DE", sector: "Information Technology" }, // TEAMVIEWER
  { ticker: "TOM2.AS", sector: "Information Technology" }, // TOMTOM NV
  { ticker: "TPE.DE", sector: "Information Technology" }, // PVA TEPLA AG
  { ticker: "VIT-B.ST", sector: "Information Technology" }, // VITEC SOFTWARE GROUP CLASS B
  { ticker: "VU.PA", sector: "Information Technology" }, // VUSION SA
  { ticker: "WAF.DE", sector: "Information Technology" }, // SILTRONIC N AG
  { ticker: "WAVE.PA", sector: "Information Technology" }, // WAVESTONE SA
  { ticker: "WIIT.MI", sector: "Information Technology" }, // WIIT
  { ticker: "XFAB.PA", sector: "Information Technology" }, // X-FAB SILICON FOUNDRIES
  { ticker: "YSN.DE", sector: "Information Technology" }, // SECUNET SECURITY AG

  // ── Materials ──
  { ticker: "ACT.DE", sector: "Materials" }, // ALZCHEM AG
  { ticker: "ACX.MC", sector: "Materials" }, // ACERINOX SA
  { ticker: "AKE.PA", sector: "Materials" }, // ARKEMA SA
  { ticker: "ALLEI.ST", sector: "Materials" }, // ALLEIMA
  { ticker: "ALTR.LS", sector: "Materials" }, // ALTRI SGPS SA
  { ticker: "AMG.AS", sector: "Materials" }, // AMG CRITICAL MATERIALS NV
  { ticker: "APAM.AS", sector: "Materials" }, // APERAM SA
  { ticker: "ATYM.L", sector: "Materials" }, // ATALAYA MINING COPPER SA
  { ticker: "BEKB.BR", sector: "Materials" }, // BEKAERT (D) SA
  { ticker: "BILL.ST", sector: "Materials" }, // BILLERUD AKTIEBOLAG
  { ticker: "BREE.L", sector: "Materials" }, // BREEDON GROUP PLC
  { ticker: "CEM.MI", sector: "Materials" }, // CEMENTIR HOLDING NV
  { ticker: "CLN.SW", sector: "Materials" }, // CLARIANT AG
  { ticker: "COR.LS", sector: "Materials" }, // CORTICEIRA AMORIM SA
  { ticker: "CRBN.AS", sector: "Materials" }, // CORBION NV CLASS C
  { ticker: "CRDA.L", sector: "Materials" }, // CRODA INTERNATIONAL PLC
  { ticker: "ELK.OL", sector: "Materials" }, // ELKEM
  { ticker: "ELM.L", sector: "Materials" }, // ELEMENTIS PLC
  { ticker: "ELO.OL", sector: "Materials" }, // ELOPAK
  { ticker: "ENC.MC", sector: "Materials" }, // ENCE ENERGIA Y CELULOSA SA
  { ticker: "ERA.PA", sector: "Materials" }, // ERAMET SA
  { ticker: "FPE3.DE", sector: "Materials" }, // FUCHS PREF
  { ticker: "GRNG.ST", sector: "Materials" }, // GRANGES
  { ticker: "HILS.L", sector: "Materials" }, // HILL AND SMITH PLC
  { ticker: "HOC.L", sector: "Materials" }, // HOCHSCHILD MINING PLC
  { ticker: "HOLM-B.ST", sector: "Materials" }, // HOLMEN CLASS B
  { ticker: "HPOL-B.ST", sector: "Materials" }, // HEXPOL CLASS B
  { ticker: "HUH1V.HE", sector: "Materials" }, // HUHTAMAKI
  { ticker: "IBST.L", sector: "Materials" }, // IBSTOCK PLC
  { ticker: "JMAT.L", sector: "Materials" }, // JOHNSON MATTHEY PLC
  { ticker: "KEMIRA.HE", sector: "Materials" }, // KEMIRA
  { ticker: "LNZ.VI", sector: "Materials" }, // LENZING AG
  { ticker: "LXS.DE", sector: "Materials" }, // LANXESS AG
  { ticker: "MMK.VI", sector: "Materials" }, // MAYR MELNHOF KARTON AG
  { ticker: "MNDI.L", sector: "Materials" }, // MONDI PLC
  { ticker: "NDA.DE", sector: "Materials" }, // AURUBIS AG
  { ticker: "NK.PA", sector: "Materials" }, // IMERYS SA
  { ticker: "NVG.LS", sector: "Materials" }, // THE NAVIGATOR COMPANY SA
  { ticker: "OCI.AS", sector: "Materials" }, // OCI NV
  { ticker: "OUT1V.HE", sector: "Materials" }, // OUTOKUMPU
  { ticker: "PAF.L", sector: "Materials" }, // PAN AFRICAN RESOURCES PLC
  { ticker: "RBT.PA", sector: "Materials" }, // ROBERTET SA
  { ticker: "RHIM.L", sector: "Materials" }, // RHI MAGNESITA NV
  { ticker: "SDF.DE", sector: "Materials" }, // K+S N AG
  { ticker: "SEM.LS", sector: "Materials" }, // SEMAPA SGPS SA
  { ticker: "SIGN.SW", sector: "Materials" }, // SIG GROUP N AG
  { ticker: "SOL.MI", sector: "Materials" }, // SOL
  { ticker: "SOLB.BR", sector: "Materials" }, // SOLVAY SA
  { ticker: "SRC.L", sector: "Materials" }, // SIGMAROC PLC
  { ticker: "SSAB-A.ST", sector: "Materials" }, // SSAB CLASS A
  { ticker: "SSAB-B.ST", sector: "Materials" }, // SSAB CLASS B
  { ticker: "STO3.DE", sector: "Materials" }, // STO PREF
  { ticker: "SZG.DE", sector: "Materials" }, // SALZGITTER AG
  { ticker: "TESB.BR", sector: "Materials" }, // TESSENDERLO GROUP NV
  { ticker: "TKA.DE", sector: "Materials" }, // THYSSENKRUPP AG
  { ticker: "UMI.BR", sector: "Materials" }, // UMICORE SA
  { ticker: "VCT.L", sector: "Materials" }, // VICTREX PLC
  { ticker: "VCT.PA", sector: "Materials" }, // VICAT SA
  { ticker: "VETN.SW", sector: "Materials" }, // VETROPACK HOLDING SA
  { ticker: "VID.MC", sector: "Materials" }, // VIDRALA SA
  { ticker: "VOE.VI", sector: "Materials" }, // VOESTALPINE AG
  { ticker: "WCH.DE", sector: "Materials" }, // WACKER CHEMIE AG
  { ticker: "WIE.VI", sector: "Materials" }, // WIENERBERGER AG
  { ticker: "ZV.MI", sector: "Materials" }, // ZIGNAGO VETRO

  // ── Real Estate ──
  { ticker: "AED.BR", sector: "Real Estate" }, // AEDIFICA NV
  { ticker: "ALLN.SW", sector: "Real Estate" }, // ALLREAL HOLDING AG
  { ticker: "ALTA.PA", sector: "Real Estate" }, // ALTAREA
  { ticker: "ALTRA.ST", sector: "Real Estate" }, // ALTRA FASTIGHETER
  { ticker: "ARG.PA", sector: "Real Estate" }, // ARGAN SA
  { ticker: "AT1.DE", sector: "Real Estate" }, // AROUNDTOWN SA
  { ticker: "ATRLJ-B.ST", sector: "Real Estate" }, // ATRIUM LJUNGBERG CLASS B
  { ticker: "BBOX.L", sector: "Real Estate" }, // TRITAX BIG BOX REIT PLC
  { ticker: "BLND.L", sector: "Real Estate" }, // BRITISH LAND REIT PLC
  { ticker: "BYG.L", sector: "Real Estate" }, // BIG YELLOW GROUP PLC
  { ticker: "CAI.VI", sector: "Real Estate" }, // CA IMMOBILIEN ANLAGEN AG
  { ticker: "CARM.PA", sector: "Real Estate" }, // CARMILA SA
  { ticker: "CAST.ST", sector: "Real Estate" }, // CASTELLUM
  { ticker: "CATE.ST", sector: "Real Estate" }, // CATENA
  { ticker: "CIBUS.ST", sector: "Real Estate" }, // CIBUS REAL ESTATE
  { ticker: "COFB.BR", sector: "Real Estate" }, // COFINIMMO REIT SA
  { ticker: "COL.MC", sector: "Real Estate" }, // COLONIAL SFL SOCIMI SA
  { ticker: "CORE-B.ST", sector: "Real Estate" }, // COREM PROPERTY GROUP CLASS B
  { ticker: "CPI.VI", sector: "Real Estate" }, // CPI EUROPE AGE AG
  { ticker: "DIOS.ST", sector: "Real Estate" }, // DIOS FASTIGHETER
  { ticker: "DLN.L", sector: "Real Estate" }, // DERWENT LONDON REIT PLC
  { ticker: "ECMPA.AS", sector: "Real Estate" }, // EUROCOMMERCIAL PROPERTIES NV
  { ticker: "ENTRA.OL", sector: "Real Estate" }, // ENTRA
  { ticker: "FABG.ST", sector: "Real Estate" }, // FABEGE
  { ticker: "FPAR-A.ST", sector: "Real Estate" }, // FAST PARTNER CLASS A
  { ticker: "GPE.L", sector: "Real Estate" }, // GREAT PORTLAND ESTATES PLC
  { ticker: "GRI.L", sector: "Real Estate" }, // GRAINGER PLC
  { ticker: "GYC.DE", sector: "Real Estate" }, // GRAND CITY PROPERTIES SA
  { ticker: "HIAG.SW", sector: "Real Estate" }, // HIAG IMMOBILIEN HOLDING AG
  { ticker: "HMSO.L", sector: "Real Estate" }, // HAMMERSON REIT PLC
  { ticker: "HUFV-A.ST", sector: "Real Estate" }, // HUFVUDSTADEN CLASS A
  { ticker: "ICAD.PA", sector: "Real Estate" }, // ICADE REIT SA
  { ticker: "INTEA-B.ST", sector: "Real Estate" }, // INTEA FASTIGHETER CLASS B
  { ticker: "IRES.IR", sector: "Real Estate" }, // IRISH RESIDENTIAL PROPERTIES PLC
  { ticker: "ISN.SW", sector: "Real Estate" }, // INTERSHOP HOLDING N AG
  { ticker: "IWG.L", sector: "Real Estate" }, // INTERNATIONAL WORKPLACE GROUP PLC
  { ticker: "LEG.DE", sector: "Real Estate" }, // LEG IMMOBILIEN N
  { ticker: "LMP.L", sector: "Real Estate" }, // LONDONMETRIC PROPERTY REIT PLC
  { ticker: "LOGI-B.ST", sector: "Real Estate" }, // LOGISTEA CLASS B
  { ticker: "LUMO.HE", sector: "Real Estate" }, // LUMO KODIT OYJ
  { ticker: "MERY.PA", sector: "Real Estate" }, // MERCIALYS REIT SA
  { ticker: "MOBN.SW", sector: "Real Estate" }, // MOBIMO HOLDING AG
  { ticker: "MONT.BR", sector: "Real Estate" }, // MONTEA NV
  { ticker: "MRL.MC", sector: "Real Estate" }, // MERLIN PROPERTIES REIT SA
  { ticker: "NP3.ST", sector: "Real Estate" }, // NP3 FASTIGHETER
  { ticker: "NXI.PA", sector: "Real Estate" }, // NEXITY SA
  { ticker: "PAT.DE", sector: "Real Estate" }, // PATRIZIA
  { ticker: "PHP.L", sector: "Real Estate" }, // PRIMARY HEALTH PROPERTIES REIT PLC
  { ticker: "PLAZ-B.ST", sector: "Real Estate" }, // PLATZER FASTIGHETER HOLDING CLASS
  { ticker: "PNDX-B.ST", sector: "Real Estate" }, // PANDOX CLASS B
  { ticker: "PSPN.SW", sector: "Real Estate" }, // PSP SWISS PROPERTY AG
  { ticker: "PUBLI.ST", sector: "Real Estate" }, // PPI PUBLIC PROPERTY INVEST
  { ticker: "RET.BR", sector: "Real Estate" }, // RETAIL ESTATES NV
  { ticker: "SAFE.L", sector: "Real Estate" }, // SAFESTORE HOLDINGS PLC
  { ticker: "SBB-B.ST", sector: "Real Estate" }, // SAMHALLSBYGGNADSBOLAGET I NORDEN C
  { ticker: "SHC.L", sector: "Real Estate" }, // SHAFTESBURY CAPITAL PLC
  { ticker: "SHUR.BR", sector: "Real Estate" }, // SHURGARD SELF STORAGE LTD
  { ticker: "SRE.L", sector: "Real Estate" }, // SIRIUS REAL ESTATE LIMITED LTD
  { ticker: "SUPR.L", sector: "Real Estate" }, // SUPERMARKET INCOME REIT PLC
  { ticker: "SVEAF.ST", sector: "Real Estate" }, // SVEAFASTIGHETER
  { ticker: "SVS.L", sector: "Real Estate" }, // SAVILLS PLC
  { ticker: "TEG.DE", sector: "Real Estate" }, // TAG IMMOBILIEN AG
  { ticker: "THRL.L", sector: "Real Estate" }, // TARGET HEALTHCARE REIT PLC
  { ticker: "UTG.L", sector: "Real Estate" }, // UNITE GROUP PLC
  { ticker: "VASTB.BR", sector: "Real Estate" }, // VASTNED BELGIUM NV
  { ticker: "VGP.BR", sector: "Real Estate" }, // VGP NV
  { ticker: "WALL-B.ST", sector: "Real Estate" }, // WALLENSTAM CLASS B
  { ticker: "WDP.BR", sector: "Real Estate" }, // WAREHOUSES DE PAUW NV
  { ticker: "WHA.AS", sector: "Real Estate" }, // WERELDHAVE NV
  { ticker: "WIHL.ST", sector: "Real Estate" }, // WIHLBORGS FASTIGHETER
  { ticker: "WKP.L", sector: "Real Estate" }, // WORKSPACE GROUP REIT PLC
  { ticker: "XIOR.BR", sector: "Real Estate" }, // XIOR STUDENT HOUSING NV

  // ── Utilities ──
  { ticker: "A2A.MI", sector: "Utilities" }, // A2A
  { ticker: "ACE.MI", sector: "Utilities" }, // ACEA
  { ticker: "ASC.MI", sector: "Utilities" }, // ASCOPIAVE
  { ticker: "DRX.L", sector: "Utilities" }, // DRAX GROUP PLC
  { ticker: "ENG.MC", sector: "Utilities" }, // ENAGAS SA
  { ticker: "ERG.MI", sector: "Utilities" }, // ERG
  { ticker: "EVN.VI", sector: "Utilities" }, // EVN AG
  { ticker: "GRE.MC", sector: "Utilities" }, // GRENERGY RENOVABLES SA
  { ticker: "HER.MI", sector: "Utilities" }, // HERA
  { ticker: "IRE.MI", sector: "Utilities" }, // IREN
  { ticker: "PNN.L", sector: "Utilities" }, // PENNON GROUP PLC
  { ticker: "RENE.LS", sector: "Utilities" }, // REN REDES ENERGETICAS NACIONAIS SA
  { ticker: "RUI.PA", sector: "Utilities" }, // RUBIS
  { ticker: "SCATC.OL", sector: "Utilities" }, // SCATEC
  { ticker: "SLR.MC", sector: "Utilities" }, // SOLARIA ENERGIA Y MEDIO AMBIENTE S
  { ticker: "TEP.L", sector: "Utilities" }, // TELECOM PLUS PLC
  { ticker: "VLTSA.PA", sector: "Utilities" }, // VOLTALIA SA
];
