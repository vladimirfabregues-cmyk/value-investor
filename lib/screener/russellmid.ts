import type { ScreenableCompany } from "@/lib/screener/cac40";

// Russell Midcap Index constituents derived from Vanguard VONE (Russell 1000)
// holdings (June 2026) minus the 200 largest by index weight — the Russell
// Midcap is defined as the smallest ~800 of the Russell 1000. Sectors are
// borrowed from overlapping S&P/Russell lists; Yahoo's sector takes precedence
// at screening time.
export const RUSSELLMID_COMPANIES: ScreenableCompany[] = [
  // ── Communication Services ──
  { ticker: "CHTR", sector: "Communication Services" }, // Charter Communications Inc. Class A
  { ticker: "EA", sector: "Communication Services" }, // Electronic Arts Inc.
  { ticker: "FOX", sector: "Communication Services" }, // Fox Corp. Class B
  { ticker: "FOXA", sector: "Communication Services" }, // Fox Corp. Class A
  { ticker: "LYV", sector: "Communication Services" }, // Live Nation Entertainment Inc.
  { ticker: "NXST", sector: "Communication Services" }, // Nexstar Media Group Inc. Class A
  { ticker: "NYT", sector: "Communication Services" }, // New York Times Co. Class A
  { ticker: "OMC", sector: "Communication Services" }, // Omnicom Group Inc.
  { ticker: "PINS", sector: "Communication Services" }, // Pinterest Inc. Class A
  { ticker: "TTWO", sector: "Communication Services" }, // Take-Two Interactive Software Inc.

  // ── Consumer Discretionary ──
  { ticker: "AN", sector: "Consumer Discretionary" }, // AutoNation Inc.
  { ticker: "ARMK", sector: "Consumer Discretionary" }, // Aramark
  { ticker: "BBWI", sector: "Consumer Discretionary" }, // Bath & Body Works Inc.
  { ticker: "BC", sector: "Consumer Discretionary" }, // Brunswick Corp./DE
  { ticker: "BLD", sector: "Consumer Discretionary" }, // TopBuild Corp.
  { ticker: "BROS", sector: "Consumer Discretionary" }, // Dutch Bros Inc. Class A
  { ticker: "BURL", sector: "Consumer Discretionary" }, // Burlington Stores Inc.
  { ticker: "BWA", sector: "Consumer Discretionary" }, // BorgWarner Inc.
  { ticker: "BYD", sector: "Consumer Discretionary" }, // Boyd Gaming Corp.
  { ticker: "CAVA", sector: "Consumer Discretionary" }, // Cava Group Inc.
  { ticker: "CHDN", sector: "Consumer Discretionary" }, // Churchill Downs Inc.
  { ticker: "CHH", sector: "Consumer Discretionary" }, // Choice Hotels International Inc.
  { ticker: "CHWY", sector: "Consumer Discretionary" }, // Chewy Inc.
  { ticker: "CMG", sector: "Consumer Discretionary" }, // Chipotle Mexican Grill Inc. Class A
  { ticker: "COLM", sector: "Consumer Discretionary" }, // Columbia Sportswear Co.
  { ticker: "CROX", sector: "Consumer Discretionary" }, // Crocs Inc.
  { ticker: "CZR", sector: "Consumer Discretionary" }, // Caesars Entertainment Inc.
  { ticker: "DHI", sector: "Consumer Discretionary" }, // DR Horton Inc.
  { ticker: "DKS", sector: "Consumer Discretionary" }, // Dick's Sporting Goods Inc.
  { ticker: "DRI", sector: "Consumer Discretionary" }, // Darden Restaurants Inc.
  { ticker: "DUOL", sector: "Consumer Discretionary" }, // Duolingo Inc.
  { ticker: "EBAY", sector: "Consumer Discretionary" }, // eBay Inc.
  { ticker: "EXPE", sector: "Consumer Discretionary" }, // Expedia Group Inc.
  { ticker: "F", sector: "Consumer Discretionary" }, // Ford Motor Co.
  { ticker: "FIVE", sector: "Consumer Discretionary" }, // Five Below Inc.
  { ticker: "FND", sector: "Consumer Discretionary" }, // Floor & Decor Holdings Inc. Class A
  { ticker: "GAP", sector: "Consumer Discretionary" }, // Gap Inc.
  { ticker: "GME", sector: "Consumer Discretionary" }, // GameStop Corp. Class A
  { ticker: "GNTX", sector: "Consumer Discretionary" }, // Gentex Corp.
  { ticker: "H", sector: "Consumer Discretionary" }, // Hyatt Hotels Corp. Class A
  { ticker: "HOG", sector: "Consumer Discretionary" }, // Harley-Davidson Inc.
  { ticker: "HRB", sector: "Consumer Discretionary" }, // H&R Block Inc.
  { ticker: "LAD", sector: "Consumer Discretionary" }, // Lithia Motors Inc. Class A
  { ticker: "LEA", sector: "Consumer Discretionary" }, // Lear Corp.
  { ticker: "LEN", sector: "Consumer Discretionary" }, // Lennar Corp. Class A
  { ticker: "LOPE", sector: "Consumer Discretionary" }, // Grand Canyon Education Inc.
  { ticker: "M", sector: "Consumer Discretionary" }, // Macy's Inc.
  { ticker: "MAT", sector: "Consumer Discretionary" }, // Mattel Inc.
  { ticker: "MGM", sector: "Consumer Discretionary" }, // MGM Resorts International
  { ticker: "MTN", sector: "Consumer Discretionary" }, // Vail Resorts Inc.
  { ticker: "MUSA", sector: "Consumer Discretionary" }, // Murphy USA Inc.
  { ticker: "NKE", sector: "Consumer Discretionary" }, // NIKE Inc. Class B
  { ticker: "OLLI", sector: "Consumer Discretionary" }, // Ollie's Bargain Outlet Holdings Inc.
  { ticker: "PAG", sector: "Consumer Discretionary" }, // Penske Automotive Group Inc.
  { ticker: "PHM", sector: "Consumer Discretionary" }, // PulteGroup Inc.
  { ticker: "PLNT", sector: "Consumer Discretionary" }, // Planet Fitness Inc. Class A
  { ticker: "PVH", sector: "Consumer Discretionary" }, // PVH Corp.
  { ticker: "RH", sector: "Consumer Discretionary" }, // RH
  { ticker: "RL", sector: "Consumer Discretionary" }, // Ralph Lauren Corp. Class A
  { ticker: "SCI", sector: "Consumer Discretionary" }, // Service Corp. International/US
  { ticker: "SGI", sector: "Consumer Discretionary" }, // Tempur Sealy International Inc.
  { ticker: "THO", sector: "Consumer Discretionary" }, // Thor Industries Inc.
  { ticker: "TNL", sector: "Consumer Discretionary" }, // Travel + Leisure Co.
  { ticker: "TOL", sector: "Consumer Discretionary" }, // Toll Brothers Inc.
  { ticker: "TPR", sector: "Consumer Discretionary" }, // Tapestry Inc.
  { ticker: "TXRH", sector: "Consumer Discretionary" }, // Texas Roadhouse Inc. Class A
  { ticker: "ULTA", sector: "Consumer Discretionary" }, // Ulta Beauty Inc.
  { ticker: "VFC", sector: "Consumer Discretionary" }, // VF Corp.
  { ticker: "VVV", sector: "Consumer Discretionary" }, // Valvoline Inc.
  { ticker: "WH", sector: "Consumer Discretionary" }, // Wyndham Hotels & Resorts Inc.
  { ticker: "WHR", sector: "Consumer Discretionary" }, // Whirlpool Corp.
  { ticker: "WING", sector: "Consumer Discretionary" }, // Wingstop Inc.
  { ticker: "YETI", sector: "Consumer Discretionary" }, // YETI Holdings Inc.
  { ticker: "YUM", sector: "Consumer Discretionary" }, // Yum! Brands Inc.

  // ── Consumer Staples ──
  { ticker: "ACI", sector: "Consumer Staples" }, // Albertsons Cos. Inc. Class A
  { ticker: "ADM", sector: "Consumer Staples" }, // Archer-Daniels-Midland Co.
  { ticker: "BJ", sector: "Consumer Staples" }, // BJ's Wholesale Club Holdings Inc.
  { ticker: "BRBR", sector: "Consumer Staples" }, // BellRing Brands Inc.
  { ticker: "CAG", sector: "Consumer Staples" }, // Conagra Brands Inc.
  { ticker: "CART", sector: "Consumer Staples" }, // Maplebear Inc.
  { ticker: "CELH", sector: "Consumer Staples" }, // Celsius Holdings Inc.
  { ticker: "CHD", sector: "Consumer Staples" }, // Church & Dwight Co. Inc.
  { ticker: "CLX", sector: "Consumer Staples" }, // Clorox Co.
  { ticker: "COKE", sector: "Consumer Staples" }, // Coca-Cola Consolidated Inc.
  { ticker: "COTY", sector: "Consumer Staples" }, // Coty Inc. Class A
  { ticker: "DAR", sector: "Consumer Staples" }, // Darling Ingredients Inc.
  { ticker: "EL", sector: "Consumer Staples" }, // Estee Lauder Cos. Inc. Class A
  { ticker: "ELF", sector: "Consumer Staples" }, // elf Beauty Inc.
  { ticker: "FLO", sector: "Consumer Staples" }, // Flowers Foods Inc.
  { ticker: "GIS", sector: "Consumer Staples" }, // General Mills Inc.
  { ticker: "HSY", sector: "Consumer Staples" }, // Hershey Co.
  { ticker: "INGR", sector: "Consumer Staples" }, // Ingredion Inc.
  { ticker: "KHC", sector: "Consumer Staples" }, // Kraft Heinz Co.
  { ticker: "KMB", sector: "Consumer Staples" }, // Kimberly-Clark Corp.
  { ticker: "KR", sector: "Consumer Staples" }, // Kroger Co.
  { ticker: "MKC", sector: "Consumer Staples" }, // McCormick & Co. Inc./MD
  { ticker: "PFGC", sector: "Consumer Staples" }, // Performance Food Group Co.
  { ticker: "POST", sector: "Consumer Staples" }, // Post Holdings Inc.
  { ticker: "PPC", sector: "Consumer Staples" }, // Pilgrim's Pride Corp.
  { ticker: "SAM", sector: "Consumer Staples" }, // Boston Beer Co. Inc. Class A
  { ticker: "SFM", sector: "Consumer Staples" }, // Sprouts Farmers Market Inc.
  { ticker: "STZ", sector: "Consumer Staples" }, // Constellation Brands Inc. Class A
  { ticker: "SYY", sector: "Consumer Staples" }, // Sysco Corp.
  { ticker: "TAP", sector: "Consumer Staples" }, // Molson Coors Brewing Co. Class B
  { ticker: "USFD", sector: "Consumer Staples" }, // US Foods Holding Corp.

  // ── Energy ──
  { ticker: "AM", sector: "Energy" }, // Antero Midstream Corp.
  { ticker: "APA", sector: "Energy" }, // APA Corp.
  { ticker: "AR", sector: "Energy" }, // Antero Resources Corp.
  { ticker: "CHRD", sector: "Energy" }, // Chord Energy Corp.
  { ticker: "DINO", sector: "Energy" }, // HF Sinclair Corp
  { ticker: "DTM", sector: "Energy" }, // DT Midstream Inc.
  { ticker: "DVN", sector: "Energy" }, // Devon Energy Corp.
  { ticker: "FANG", sector: "Energy" }, // Diamondback Energy Inc.
  { ticker: "FTI", sector: "Energy" }, // TechnipFMC plc
  { ticker: "HAL", sector: "Energy" }, // Halliburton Co.
  { ticker: "MTDR", sector: "Energy" }, // Matador Resources Co.
  { ticker: "NOV", sector: "Energy" }, // NOV Inc.
  { ticker: "OVV", sector: "Energy" }, // Ovintiv Inc.
  { ticker: "OXY", sector: "Energy" }, // Occidental Petroleum Corp.
  { ticker: "PR", sector: "Energy" }, // Permian Resources Corp. Class A
  { ticker: "RRC", sector: "Energy" }, // Range Resources Corp.
  { ticker: "VNOM", sector: "Energy" }, // Viper Energy Inc. Class A
  { ticker: "WFRD", sector: "Energy" }, // Weatherford International plc

  // ── Financials ──
  { ticker: "AFG", sector: "Financials" }, // American Financial Group Inc./OH
  { ticker: "AFL", sector: "Financials" }, // Aflac Inc.
  { ticker: "AIG", sector: "Financials" }, // American International Group Inc.
  { ticker: "ALLY", sector: "Financials" }, // Ally Financial Inc.
  { ticker: "AMG", sector: "Financials" }, // Affiliated Managers Group Inc.
  { ticker: "BHF", sector: "Financials" }, // Brighthouse Financial Inc.
  { ticker: "CBSH", sector: "Financials" }, // Commerce Bancshares Inc./MO
  { ticker: "CFR", sector: "Financials" }, // Cullen/Frost Bankers Inc.
  { ticker: "CG", sector: "Financials" }, // Carlyle Group Inc.
  { ticker: "COLB", sector: "Financials" }, // Columbia Banking System Inc.
  { ticker: "CRBG", sector: "Financials" }, // Corebridge Financial Inc.
  { ticker: "EEFT", sector: "Financials" }, // Euronet Worldwide Inc.
  { ticker: "EQH", sector: "Financials" }, // Equitable Holdings Inc.
  { ticker: "EVR", sector: "Financials" }, // Evercore Inc. Class A
  { ticker: "EWBC", sector: "Financials" }, // East West Bancorp Inc.
  { ticker: "FAF", sector: "Financials" }, // First American Financial Corp.
  { ticker: "FHN", sector: "Financials" }, // First Horizon National Corp.
  { ticker: "FNB", sector: "Financials" }, // FNB Corp./PA
  { ticker: "FNF", sector: "Financials" }, // Fidelity National Financial Inc.
  { ticker: "FOUR", sector: "Financials" }, // Shift4 Payments Inc. Class A
  { ticker: "HIG", sector: "Financials" }, // Hartford Financial Services Group Inc.
  { ticker: "HLI", sector: "Financials" }, // Houlihan Lokey Inc. Class A
  { ticker: "HLNE", sector: "Financials" }, // Hamilton Lane Inc. Class A
  { ticker: "JEF", sector: "Financials" }, // Jefferies Financial Group Inc.
  { ticker: "JHG", sector: "Financials" }, // Janus Henderson Group plc
  { ticker: "KNSL", sector: "Financials" }, // Kinsale Capital Group Inc.
  { ticker: "MET", sector: "Financials" }, // MetLife Inc.
  { ticker: "MORN", sector: "Financials" }, // Morningstar Inc.
  { ticker: "MTG", sector: "Financials" }, // MGIC Investment Corp.
  { ticker: "NLY", sector: "Financials" }, // Annaly Capital Management Inc.
  { ticker: "ORI", sector: "Financials" }, // Old Republic International Corp.
  { ticker: "OZK", sector: "Financials" }, // Bank OZK
  { ticker: "PB", sector: "Financials" }, // Prosperity Bancshares Inc.
  { ticker: "PNFP", sector: "Financials" }, // Pinnacle Financial Partners Inc.
  { ticker: "PRI", sector: "Financials" }, // Primerica Inc.
  { ticker: "PRU", sector: "Financials" }, // Prudential Financial Inc.
  { ticker: "RGA", sector: "Financials" }, // Reinsurance Group of America Inc. Class A
  { ticker: "RLI", sector: "Financials" }, // RLI Corp.
  { ticker: "RNR", sector: "Financials" }, // RenaissanceRe Holdings Ltd.
  { ticker: "RYAN", sector: "Financials" }, // Ryan Specialty Holdings Inc. Class A
  { ticker: "SEIC", sector: "Financials" }, // SEI Investments Co.
  { ticker: "SF", sector: "Financials" }, // Stifel Financial Corp.
  { ticker: "SLM", sector: "Financials" }, // SLM Corp.
  { ticker: "SSB", sector: "Financials" }, // SOUTHSTATE BANK Corp.
  { ticker: "STT", sector: "Financials" }, // State Street Corp.
  { ticker: "STWD", sector: "Financials" }, // Starwood Property Trust Inc.
  { ticker: "THG", sector: "Financials" }, // Hanover Insurance Group Inc.
  { ticker: "UNM", sector: "Financials" }, // Unum Group
  { ticker: "VOYA", sector: "Financials" }, // Voya Financial Inc.
  { ticker: "WAL", sector: "Financials" }, // Western Alliance Bancorp
  { ticker: "WBS", sector: "Financials" }, // Webster Financial Corp.
  { ticker: "WEX", sector: "Financials" }, // WEX Inc.
  { ticker: "WTFC", sector: "Financials" }, // Wintrust Financial Corp.
  { ticker: "ZION", sector: "Financials" }, // Zions Bancorp NA

  // ── Health Care ──
  { ticker: "A", sector: "Health Care" }, // Agilent Technologies Inc.
  { ticker: "AVTR", sector: "Health Care" }, // Avantor Inc.
  { ticker: "BDX", sector: "Health Care" }, // Becton Dickinson and Co.
  { ticker: "BIO", sector: "Health Care" }, // Bio-Rad Laboratories Inc. Class A
  { ticker: "BMRN", sector: "Health Care" }, // BioMarin Pharmaceutical Inc.
  { ticker: "BRKR", sector: "Health Care" }, // Bruker Corp.
  { ticker: "CAH", sector: "Health Care" }, // Cardinal Health Inc.
  { ticker: "CHE", sector: "Health Care" }, // Chemed Corp.
  { ticker: "CNC", sector: "Health Care" }, // Centene Corp.
  { ticker: "DOCS", sector: "Health Care" }, // Doximity Inc. Class A
  { ticker: "EHC", sector: "Health Care" }, // Encompass Health Corp.
  { ticker: "ELAN", sector: "Health Care" }, // Elanco Animal Health Inc.
  { ticker: "EXEL", sector: "Health Care" }, // Exelixis Inc.
  { ticker: "GMED", sector: "Health Care" }, // Globus Medical Inc.
  { ticker: "HALO", sector: "Health Care" }, // Halozyme Therapeutics Inc.
  { ticker: "HUM", sector: "Health Care" }, // Humana Inc.
  { ticker: "IDXX", sector: "Health Care" }, // IDEXX Laboratories Inc.
  { ticker: "ILMN", sector: "Health Care" }, // Illumina Inc.
  { ticker: "JAZZ", sector: "Health Care" }, // Jazz Pharmaceuticals plc
  { ticker: "MASI", sector: "Health Care" }, // Masimo Corp.
  { ticker: "MEDP", sector: "Health Care" }, // Medpace Holdings Inc.
  { ticker: "NBIX", sector: "Health Care" }, // Neurocrine Biosciences Inc.
  { ticker: "NVST", sector: "Health Care" }, // Envista Holdings Corp.
  { ticker: "PEN", sector: "Health Care" }, // Penumbra Inc.
  { ticker: "RGEN", sector: "Health Care" }, // Repligen Corp.
  { ticker: "ROIV", sector: "Health Care" }, // Roivant Sciences Ltd.
  { ticker: "SHC", sector: "Health Care" }, // Sotera Health Co.
  { ticker: "THC", sector: "Health Care" }, // Tenet Healthcare Corp.
  { ticker: "UTHR", sector: "Health Care" }, // United Therapeutics Corp.
  { ticker: "XRAY", sector: "Health Care" }, // Dentsply Sirona Inc.
  { ticker: "ZTS", sector: "Health Care" }, // Zoetis Inc.

  // ── Industrials ──
  { ticker: "AAL", sector: "Industrials" }, // American Airlines Group Inc.
  { ticker: "AAON", sector: "Industrials" }, // AAON Inc.
  { ticker: "ACM", sector: "Industrials" }, // AECOM
  { ticker: "AGCO", sector: "Industrials" }, // AGCO Corp.
  { ticker: "AIT", sector: "Industrials" }, // Applied Industrial Technologies Inc.
  { ticker: "ALK", sector: "Industrials" }, // Alaska Air Group Inc.
  { ticker: "AME", sector: "Industrials" }, // AMETEK Inc.
  { ticker: "APG", sector: "Industrials" }, // API Group Corp.
  { ticker: "ATI", sector: "Industrials" }, // Allegheny Technologies Inc.
  { ticker: "AYI", sector: "Industrials" }, // Acuity Brands Inc.
  { ticker: "BAH", sector: "Industrials" }, // Booz Allen Hamilton Holding Corp. Class A
  { ticker: "BWXT", sector: "Industrials" }, // BWX Technologies Inc.
  { ticker: "CACI", sector: "Industrials" }, // CACI International Inc. Class A
  { ticker: "CAR", sector: "Industrials" }, // Avis Budget Group Inc.
  { ticker: "CARR", sector: "Industrials" }, // Carrier Global Corp.
  { ticker: "CLH", sector: "Industrials" }, // Clean Harbors Inc.
  { ticker: "CNH", sector: "Industrials" }, // CNH Industrial NV
  { ticker: "CNM", sector: "Industrials" }, // Core & Main Inc. Class A
  { ticker: "CNXC", sector: "Industrials" }, // Concentrix Corp.
  { ticker: "CR", sector: "Industrials" }, // Crane Co.
  { ticker: "CRS", sector: "Industrials" }, // Carpenter Technology Corp.
  { ticker: "CSL", sector: "Industrials" }, // Carlisle Cos. Inc.
  { ticker: "CW", sector: "Industrials" }, // Curtiss-Wright Corp.
  { ticker: "DCI", sector: "Industrials" }, // Donaldson Co. Inc.
  { ticker: "ESAB", sector: "Industrials" }, // Esab Corp.
  { ticker: "EXLS", sector: "Industrials" }, // ExlService Holdings Inc.
  { ticker: "FBIN", sector: "Industrials" }, // Fortune Brands Home & Security Inc.
  { ticker: "FCN", sector: "Industrials" }, // FTI Consulting Inc.
  { ticker: "FLS", sector: "Industrials" }, // Flowserve Corp.
  { ticker: "G", sector: "Industrials" }, // Genpact Ltd.
  { ticker: "GGG", sector: "Industrials" }, // Graco Inc.
  { ticker: "GWW", sector: "Industrials" }, // WW Grainger Inc.
  { ticker: "GXO", sector: "Industrials" }, // GXO Logistics Inc.
  { ticker: "HXL", sector: "Industrials" }, // Hexcel Corp.
  { ticker: "ITT", sector: "Industrials" }, // ITT Inc.
  { ticker: "KBR", sector: "Industrials" }, // KBR Inc.
  { ticker: "KEX", sector: "Industrials" }, // Kirby Corp.
  { ticker: "KNX", sector: "Industrials" }, // Knight-Swift Transportation Holdings Inc.
  { ticker: "LECO", sector: "Industrials" }, // Lincoln Electric Holdings Inc.
  { ticker: "LSTR", sector: "Industrials" }, // Landstar System Inc.
  { ticker: "MIDD", sector: "Industrials" }, // Middleby Corp.
  { ticker: "MLI", sector: "Industrials" }, // Mueller Industries Inc.
  { ticker: "MSA", sector: "Industrials" }, // MSA Safety Inc.
  { ticker: "MSM", sector: "Industrials" }, // MSC Industrial Direct Co. Inc. Class A
  { ticker: "MTZ", sector: "Industrials" }, // MasTec Inc.
  { ticker: "NVT", sector: "Industrials" }, // nVent Electric plc
  { ticker: "OC", sector: "Industrials" }, // Owens Corning
  { ticker: "OSK", sector: "Industrials" }, // Oshkosh Corp.
  { ticker: "OTIS", sector: "Industrials" }, // Otis Worldwide Corp.
  { ticker: "PCTY", sector: "Industrials" }, // Paylocity Holding Corp.
  { ticker: "PSN", sector: "Industrials" }, // Parsons Corp.
  { ticker: "R", sector: "Industrials" }, // Ryder System Inc.
  { ticker: "RBA", sector: "Industrials" }, // RB Global Inc.
  { ticker: "RBC", sector: "Industrials" }, // RBC Bearings Inc.
  { ticker: "ROK", sector: "Industrials" }, // Rockwell Automation Inc.
  { ticker: "RRX", sector: "Industrials" }, // Regal Beloit Corp.
  { ticker: "SAIA", sector: "Industrials" }, // Saia Inc.
  { ticker: "SAIC", sector: "Industrials" }, // Science Applications International Corp.
  { ticker: "SARO", sector: "Industrials" }, // StandardAero Inc.
  { ticker: "SSD", sector: "Industrials" }, // Simpson Manufacturing Co. Inc.
  { ticker: "ST", sector: "Industrials" }, // Sensata Technologies Holding plc
  { ticker: "SWK", sector: "Industrials" }, // Stanley Black & Decker Inc.
  { ticker: "TKR", sector: "Industrials" }, // Timken Co.
  { ticker: "TREX", sector: "Industrials" }, // Trex Co. Inc.
  { ticker: "TRU", sector: "Industrials" }, // TransUnion
  { ticker: "TTC", sector: "Industrials" }, // Toro Co.
  { ticker: "TTEK", sector: "Industrials" }, // Tetra Tech Inc.
  { ticker: "VMI", sector: "Industrials" }, // Valmont Industries Inc.
  { ticker: "WCC", sector: "Industrials" }, // WESCO International Inc.
  { ticker: "WMS", sector: "Industrials" }, // Advanced Drainage Systems Inc.
  { ticker: "WSO", sector: "Industrials" }, // Watsco Inc.
  { ticker: "WWD", sector: "Industrials" }, // Woodward Inc.
  { ticker: "XPO", sector: "Industrials" }, // XPO Logistics Inc.
  { ticker: "XYL", sector: "Industrials" }, // Xylem Inc./NY

  // ── Information Technology ──
  { ticker: "ALGM", sector: "Information Technology" }, // Allegro MicroSystems Inc.
  { ticker: "AMKR", sector: "Information Technology" }, // Amkor Technology Inc.
  { ticker: "APPF", sector: "Information Technology" }, // Appfolio Inc.
  { ticker: "ARW", sector: "Information Technology" }, // Arrow Electronics Inc.
  { ticker: "AVT", sector: "Information Technology" }, // Avnet Inc.
  { ticker: "BILL", sector: "Information Technology" }, // Bill.Com Holdings Inc.
  { ticker: "BSY", sector: "Information Technology" }, // Bentley Systems Inc. Class B
  { ticker: "CGNX", sector: "Information Technology" }, // Cognex Corp.
  { ticker: "CRUS", sector: "Information Technology" }, // Cirrus Logic Inc.
  { ticker: "CXT", sector: "Information Technology" }, // Crane NXT Co.
  { ticker: "DBX", sector: "Information Technology" }, // Dropbox Inc. Class A
  { ticker: "DLB", sector: "Information Technology" }, // Dolby Laboratories Inc. Class A
  { ticker: "DOCU", sector: "Information Technology" }, // DocuSign Inc. Class A
  { ticker: "DT", sector: "Information Technology" }, // Dynatrace Inc.
  { ticker: "ENTG", sector: "Information Technology" }, // Entegris Inc.
  { ticker: "FLEX", sector: "Information Technology" }, // Flex Ltd.
  { ticker: "FTNT", sector: "Information Technology" }, // Fortinet Inc.
  { ticker: "GWRE", sector: "Information Technology" }, // Guidewire Software Inc.
  { ticker: "HPE", sector: "Information Technology" }, // Hewlett Packard Enterprise Co.
  { ticker: "HPQ", sector: "Information Technology" }, // HP Inc.
  { ticker: "IPGP", sector: "Information Technology" }, // IPG Photonics Corp.
  { ticker: "KD", sector: "Information Technology" }, // Kyndryl Holdings Inc.
  { ticker: "LFUS", sector: "Information Technology" }, // Littelfuse Inc.
  { ticker: "LSCC", sector: "Information Technology" }, // Lattice Semiconductor Corp.
  { ticker: "MANH", sector: "Information Technology" }, // Manhattan Associates Inc.
  { ticker: "MKSI", sector: "Information Technology" }, // MKS Instruments Inc.
  { ticker: "MTSI", sector: "Information Technology" }, // MACOM Technology Solutions Holdings Inc.
  { ticker: "NTNX", sector: "Information Technology" }, // Nutanix Inc.
  { ticker: "OKTA", sector: "Information Technology" }, // Okta Inc.
  { ticker: "OLED", sector: "Information Technology" }, // Universal Display Corp.
  { ticker: "ONTO", sector: "Information Technology" }, // Onto Innovation Inc.
  { ticker: "PATH", sector: "Information Technology" }, // UiPath Inc. Class A
  { ticker: "PEGA", sector: "Information Technology" }, // Pegasystems Inc.
  { ticker: "PSTG", sector: "Information Technology" }, // Pure Storage Inc. Class A
  { ticker: "SNX", sector: "Information Technology" }, // SYNNEX Corp.
  { ticker: "TWLO", sector: "Information Technology" }, // Twilio Inc. Class A
  { ticker: "VNT", sector: "Information Technology" }, // Vontier Corp.

  // ── Materials ──
  { ticker: "AA", sector: "Materials" }, // Alcoa Corp.
  { ticker: "ALB", sector: "Materials" }, // Albemarle Corp.
  { ticker: "ASH", sector: "Materials" }, // Ashland Global Holdings Inc.
  { ticker: "ATR", sector: "Materials" }, // AptarGroup Inc.
  { ticker: "AXTA", sector: "Materials" }, // Axalta Coating Systems Ltd.
  { ticker: "CCK", sector: "Materials" }, // Crown Holdings Inc.
  { ticker: "CE", sector: "Materials" }, // Celanese Corp. Class A
  { ticker: "CF", sector: "Materials" }, // CF Industries Holdings Inc.
  { ticker: "CLF", sector: "Materials" }, // Cleveland-Cliffs Inc.
  { ticker: "DD", sector: "Materials" }, // DuPont de Nemours Inc.
  { ticker: "DOW", sector: "Materials" }, // Dow Inc.
  { ticker: "EXP", sector: "Materials" }, // Eagle Materials Inc.
  { ticker: "GPK", sector: "Materials" }, // Graphic Packaging Holding Co.
  { ticker: "IFF", sector: "Materials" }, // International Flavors & Fragrances Inc.
  { ticker: "IP", sector: "Materials" }, // International Paper Co.
  { ticker: "LPX", sector: "Materials" }, // Louisiana-Pacific Corp.
  { ticker: "MLM", sector: "Materials" }, // Martin Marietta Materials Inc.
  { ticker: "MOS", sector: "Materials" }, // Mosaic Co.
  { ticker: "MP", sector: "Materials" }, // MP Materials Corp.
  { ticker: "NEU", sector: "Materials" }, // NewMarket Corp.
  { ticker: "NUE", sector: "Materials" }, // Nucor Corp.
  { ticker: "OLN", sector: "Materials" }, // Olin Corp.
  { ticker: "PKG", sector: "Materials" }, // Packaging Corp. of America
  { ticker: "PPG", sector: "Materials" }, // PPG Industries Inc.
  { ticker: "RGLD", sector: "Materials" }, // Royal Gold Inc.
  { ticker: "RPM", sector: "Materials" }, // RPM International Inc.
  { ticker: "RS", sector: "Materials" }, // Reliance Steel & Aluminum Co.
  { ticker: "SLGN", sector: "Materials" }, // Silgan Holdings Inc.
  { ticker: "SMG", sector: "Materials" }, // Scotts Miracle-Gro Co.
  { ticker: "SOLS", sector: "Materials" }, // Solstice Advanced Materials Inc.
  { ticker: "SON", sector: "Materials" }, // Sonoco Products Co.
  { ticker: "SW", sector: "Materials" }, // Smurfit Westrock plc
  { ticker: "VMC", sector: "Materials" }, // Vulcan Materials Co.
  { ticker: "WLK", sector: "Materials" }, // Westlake Chemical Corp.

  // ── Real Estate ──
  { ticker: "ADC", sector: "Real Estate" }, // Agree Realty Corp.
  { ticker: "AMH", sector: "Real Estate" }, // American Homes 4 Rent Class A
  { ticker: "ARE", sector: "Real Estate" }, // Alexandria Real Estate Equities Inc.
  { ticker: "AVB", sector: "Real Estate" }, // AvalonBay Communities Inc.
  { ticker: "BRX", sector: "Real Estate" }, // Brixmor Property Group Inc.
  { ticker: "BXP", sector: "Real Estate" }, // Boston Properties Inc.
  { ticker: "CCI", sector: "Real Estate" }, // Crown Castle International Corp.
  { ticker: "CUBE", sector: "Real Estate" }, // CubeSmart
  { ticker: "CUZ", sector: "Real Estate" }, // Cousins Properties Inc.
  { ticker: "EGP", sector: "Real Estate" }, // EastGroup Properties Inc.
  { ticker: "ELS", sector: "Real Estate" }, // Equity LifeStyle Properties Inc.
  { ticker: "EPR", sector: "Real Estate" }, // EPR Properties
  { ticker: "EQR", sector: "Real Estate" }, // Equity Residential
  { ticker: "FR", sector: "Real Estate" }, // First Industrial Realty Trust Inc.
  { ticker: "GLPI", sector: "Real Estate" }, // Gaming and Leisure Properties Inc.
  { ticker: "HR", sector: "Real Estate" }, // Healthcare Trust of America Inc. Class A
  { ticker: "INVH", sector: "Real Estate" }, // Invitation Homes Inc.
  { ticker: "JLL", sector: "Real Estate" }, // Jones Lang LaSalle Inc.
  { ticker: "KRC", sector: "Real Estate" }, // Kilroy Realty Corp.
  { ticker: "LAMR", sector: "Real Estate" }, // Lamar Advertising Co. Class A
  { ticker: "NNN", sector: "Real Estate" }, // National Retail Properties Inc.
  { ticker: "NSA", sector: "Real Estate" }, // National Storage Affiliates Trust
  { ticker: "OHI", sector: "Real Estate" }, // Omega Healthcare Investors Inc.
  { ticker: "PK", sector: "Real Estate" }, // Park Hotels & Resorts Inc.
  { ticker: "PSA", sector: "Real Estate" }, // Public Storage
  { ticker: "REXR", sector: "Real Estate" }, // Rexford Industrial Realty Inc.
  { ticker: "RYN", sector: "Real Estate" }, // Rayonier Inc.
  { ticker: "STAG", sector: "Real Estate" }, // STAG Industrial Inc.
  { ticker: "VNO", sector: "Real Estate" }, // Vornado Realty Trust
  { ticker: "VTR", sector: "Real Estate" }, // Ventas Inc.
  { ticker: "WPC", sector: "Real Estate" }, // WP Carey Inc.

  // ── Unknown ──
  { ticker: "ACGL", sector: "Unknown" }, // Arch Capital Group Ltd.
  { ticker: "ACHC", sector: "Unknown" }, // Acadia Healthcare Co. Inc.
  { ticker: "ADSK", sector: "Unknown" }, // Autodesk Inc.
  { ticker: "ADT", sector: "Unknown" }, // ADT Inc.
  { ticker: "AEE", sector: "Unknown" }, // Ameren Corp.
  { ticker: "AFRM", sector: "Unknown" }, // Affirm Holdings Inc.
  { ticker: "AGNC", sector: "Unknown" }, // AGNC Investment Corp.
  { ticker: "AGO", sector: "Unknown" }, // Assured Guaranty Ltd.
  { ticker: "AIZ", sector: "Unknown" }, // Assurant Inc.
  { ticker: "AJG", sector: "Unknown" }, // Arthur J Gallagher & Co.
  { ticker: "AKAM", sector: "Unknown" }, // Akamai Technologies Inc.
  { ticker: "ALAB", sector: "Unknown" }, // Astera Labs Inc.
  { ticker: "ALGN", sector: "Unknown" }, // Align Technology Inc.
  { ticker: "ALLE", sector: "Unknown" }, // Allegion plc
  { ticker: "ALNY", sector: "Unknown" }, // Alnylam Pharmaceuticals Inc.
  { ticker: "ALSN", sector: "Unknown" }, // Allison Transmission Holdings Inc.
  { ticker: "AMCR", sector: "Unknown" }, // Amcor plc
  { ticker: "AMP", sector: "Unknown" }, // Ameriprise Financial Inc.
  { ticker: "AMTM", sector: "Unknown" }, // Amentum Holdings Inc.
  { ticker: "AOS", sector: "Unknown" }, // AO Smith Corp.
  { ticker: "APLS", sector: "Unknown" }, // Apellis Pharmaceuticals Inc.
  { ticker: "APO", sector: "Unknown" }, // Apollo Global Management Inc.
  { ticker: "APTV", sector: "Unknown" }, // Aptiv plc
  { ticker: "ARES", sector: "Unknown" }, // Ares Management Corp. Class A
  { ticker: "AS", sector: "Unknown" }, // Amer Sports Inc.
  { ticker: "ASTS", sector: "Unknown" }, // AST SpaceMobile Inc. Class A
  { ticker: "ATO", sector: "Unknown" }, // Atmos Energy Corp.
  { ticker: "AU", sector: "Unknown" }, // Anglogold Ashanti plc
  { ticker: "AUR", sector: "Unknown" }, // Aurora Innovation Inc. Class A
  { ticker: "AVY", sector: "Unknown" }, // Avery Dennison Corp.
  { ticker: "AWI", sector: "Unknown" }, // Armstrong World Industries Inc.
  { ticker: "AXON", sector: "Unknown" }, // Axon Enterprise Inc.
  { ticker: "AXS", sector: "Unknown" }, // Axis Capital Holdings Ltd.
  { ticker: "BALL", sector: "Unknown" }, // Ball Corp.
  { ticker: "BAM", sector: "Unknown" }, // Brookfield Asset Management Ltd. Class A
  { ticker: "BAX", sector: "Unknown" }, // Baxter International Inc.
  { ticker: "BBY", sector: "Unknown" }, // Best Buy Co. Inc.
  { ticker: "BEN", sector: "Unknown" }, // Franklin Resources Inc.
  { ticker: "BEPC", sector: "Unknown" }, // Brookfield Renewable Corp.
  { ticker: "BF-A", sector: "Unknown" }, // Brown-Forman Corp. Class A
  { ticker: "BF-B", sector: "Unknown" }, // Brown-Forman Corp. Class B
  { ticker: "BFAM", sector: "Unknown" }, // Bright Horizons Family Solutions Inc.
  { ticker: "BG", sector: "Unknown" }, // Bunge Global SA
  { ticker: "BIIB", sector: "Unknown" }, // Biogen Inc.
  { ticker: "BIRK", sector: "Unknown" }, // Birkenstock Holding plc
  { ticker: "BLDR", sector: "Unknown" }, // Builders FirstSource Inc.
  { ticker: "BLSH", sector: "Unknown" }, // Bullish
  { ticker: "BOKF", sector: "Unknown" }, // BOK Financial Corp.
  { ticker: "BPOP", sector: "Unknown" }, // Popular Inc.
  { ticker: "BR", sector: "Unknown" }, // Broadridge Financial Solutions Inc.
  { ticker: "BRO", sector: "Unknown" }, // Brown & Brown Inc.
  { ticker: "CACC", sector: "Unknown" }, // Credit Acceptance Corp.
  { ticker: "CAI", sector: "Unknown" }, // Caris Life Sciences Inc.
  { ticker: "CASY", sector: "Unknown" }, // Casey's General Stores Inc.
  { ticker: "CBC", sector: "Unknown" }, // Central BanCo Inc.
  { ticker: "CBOE", sector: "Unknown" }, // Cboe Global Markets Inc.
  { ticker: "CBRE", sector: "Unknown" }, // CBRE Group Inc. Class A
  { ticker: "CCC", sector: "Unknown" }, // CCC Intelligent Solutions Holdings Inc.
  { ticker: "CCL", sector: "Unknown" }, // Carnival Corp.
  { ticker: "CDW", sector: "Unknown" }, // CDW Corp./DE
  { ticker: "CERT", sector: "Unknown" }, // Certara Inc.
  { ticker: "CFG", sector: "Unknown" }, // Citizens Financial Group Inc.
  { ticker: "CHRW", sector: "Unknown" }, // CH Robinson Worldwide Inc.
  { ticker: "CINF", sector: "Unknown" }, // Cincinnati Financial Corp.
  { ticker: "CLVT", sector: "Unknown" }, // Clarivate plc
  { ticker: "CNA", sector: "Unknown" }, // CNA Financial Corp.
  { ticker: "COIN", sector: "Unknown" }, // Coinbase Global Inc. Class A
  { ticker: "COLD", sector: "Unknown" }, // Americold Realty Trust
  { ticker: "COO", sector: "Unknown" }, // Cooper Cos. Inc.
  { ticker: "CORT", sector: "Unknown" }, // Corcept Therapeutics Inc.
  { ticker: "CPAY", sector: "Unknown" }, // Corpay Inc.
  { ticker: "CPB", sector: "Unknown" }, // Campbell's Co.
  { ticker: "CPNG", sector: "Unknown" }, // Coupang Inc.
  { ticker: "CPRT", sector: "Unknown" }, // Copart Inc.
  { ticker: "CPT", sector: "Unknown" }, // Camden Property Trust
  { ticker: "CRCL", sector: "Unknown" }, // Circle Internet Group Inc. Class A
  { ticker: "CRL", sector: "Unknown" }, // Charles River Laboratories International Inc.
  { ticker: "CSGP", sector: "Unknown" }, // CoStar Group Inc.
  { ticker: "CTRA", sector: "Unknown" }, // Cabot Oil & Gas Corp.
  { ticker: "CTSH", sector: "Unknown" }, // Cognizant Technology Solutions Corp. Class A
  { ticker: "CTVA", sector: "Unknown" }, // Corteva Inc.
  { ticker: "CVNA", sector: "Unknown" }, // Carvana Co. Class A
  { ticker: "CWEN", sector: "Unknown" }, // Clearway Energy Inc.
  { ticker: "CWEN-A", sector: "Unknown" }, // Clearway Energy Inc. Class A
  { ticker: "DAL", sector: "Unknown" }, // Delta Air Lines Inc.
  { ticker: "DDOG", sector: "Unknown" }, // Datadog Inc. Class A
  { ticker: "DDS", sector: "Unknown" }, // Dillard's Inc. Class A
  { ticker: "DECK", sector: "Unknown" }, // Deckers Outdoor Corp.
  { ticker: "DG", sector: "Unknown" }, // Dollar General Corp.
  { ticker: "DGX", sector: "Unknown" }, // Quest Diagnostics Inc.
  { ticker: "DJT", sector: "Unknown" }, // Trump Media & Technology Group Corp.
  { ticker: "DKNG", sector: "Unknown" }, // DraftKings Inc.
  { ticker: "DLTR", sector: "Unknown" }, // Dollar Tree Inc.
  { ticker: "DOC", sector: "Unknown" }, // Healthpeak Properties Inc.
  { ticker: "DOV", sector: "Unknown" }, // Dover Corp.
  { ticker: "DOX", sector: "Unknown" }, // Amdocs Ltd.
  { ticker: "DPZ", sector: "Unknown" }, // Domino's Pizza Inc.
  { ticker: "DRS", sector: "Unknown" }, // Leonardo DRS Inc.
  { ticker: "DTE", sector: "Unknown" }, // DTE Energy Co.
  { ticker: "DV", sector: "Unknown" }, // DoubleVerify Holdings Inc.
  { ticker: "DVA", sector: "Unknown" }, // DaVita Inc.
  { ticker: "DXC", sector: "Unknown" }, // DXC Technology Co.
  { ticker: "DXCM", sector: "Unknown" }, // DexCom Inc.
  { ticker: "ECG", sector: "Unknown" }, // Everus Construction Group Inc.
  { ticker: "EFX", sector: "Unknown" }, // Equifax Inc.
  { ticker: "EG", sector: "Unknown" }, // Everest Re Group Ltd.
  { ticker: "EME", sector: "Unknown" }, // EMCOR Group Inc.
  { ticker: "EMN", sector: "Unknown" }, // Eastman Chemical Co.
  { ticker: "ENPH", sector: "Unknown" }, // Enphase Energy Inc.
  { ticker: "EPAM", sector: "Unknown" }, // EPAM Systems Inc.
  { ticker: "EQT", sector: "Unknown" }, // EQT Corp.
  { ticker: "ESI", sector: "Unknown" }, // Element Solutions Inc.
  { ticker: "ESS", sector: "Unknown" }, // Essex Property Trust Inc.
  { ticker: "ESTC", sector: "Unknown" }, // Elastic NV
  { ticker: "ETSY", sector: "Unknown" }, // Etsy Inc.
  { ticker: "EVRG", sector: "Unknown" }, // Evergy Inc.
  { ticker: "EW", sector: "Unknown" }, // Edwards Lifesciences Corp.
  { ticker: "EXE", sector: "Unknown" }, // Expand Energy Corp.
  { ticker: "EXPD", sector: "Unknown" }, // Expeditors International of Washington Inc.
  { ticker: "EXR", sector: "Unknown" }, // Extra Space Storage Inc.
  { ticker: "FAST", sector: "Unknown" }, // Fastenal Co.
  { ticker: "FCNCA", sector: "Unknown" }, // First Citizens BancShares Inc./NC Class A
  { ticker: "FDS", sector: "Unknown" }, // FactSet Research Systems Inc.
  { ticker: "FE", sector: "Unknown" }, // FirstEnergy Corp.
  { ticker: "FERG", sector: "Unknown" }, // Ferguson Enterprises Inc./DE
  { ticker: "FFIV", sector: "Unknown" }, // F5 Networks Inc.
  { ticker: "FHB", sector: "Unknown" }, // First Hawaiian Inc.
  { ticker: "FICO", sector: "Unknown" }, // Fair Isaac Corp.
  { ticker: "FIGR", sector: "Unknown" }, // Figure Technology Solutions Inc. Class A
  { ticker: "FIS", sector: "Unknown" }, // Fidelity National Information Services Inc.
  { ticker: "FISV", sector: "Unknown" }, // Fiserv Inc.
  { ticker: "FITB", sector: "Unknown" }, // Fifth Third Bancorp
  { ticker: "FLUT", sector: "Unknown" }, // Flutter Entertainment plc
  { ticker: "FMC", sector: "Unknown" }, // FMC Corp.
  { ticker: "FRHC", sector: "Unknown" }, // Freedom Holding Corp./NV
  { ticker: "FRMI", sector: "Unknown" }, // Fermi Inc.
  { ticker: "FRPT", sector: "Unknown" }, // Freshpet Inc.
  { ticker: "FRT", sector: "Unknown" }, // Federal Realty Investment Trust
  { ticker: "FSLR", sector: "Unknown" }, // First Solar Inc.
  { ticker: "FTAI", sector: "Unknown" }, // FTAI Aviation Ltd.
  { ticker: "FTV", sector: "Unknown" }, // Fortive Corp.
  { ticker: "FWONA", sector: "Unknown" }, // Liberty Media Corp-Liberty Formula One
  { ticker: "FWONK", sector: "Unknown" }, // Liberty Media Corp-Liberty Formula One
  { ticker: "GDDY", sector: "Unknown" }, // GoDaddy Inc. Class A
  { ticker: "GEHC", sector: "Unknown" }, // GE HealthCare Technologies Inc.
  { ticker: "GEN", sector: "Unknown" }, // NortonLifeLock Inc.
  { ticker: "GFS", sector: "Unknown" }, // GLOBALFOUNDRIES Inc.
  { ticker: "GL", sector: "Unknown" }, // Globe Life Inc.
  { ticker: "GLIBA", sector: "Unknown" }, // GCI Liberty Inc. Class A
  { ticker: "GLIBK", sector: "Unknown" }, // GCI Liberty Inc.
  { ticker: "GLOB", sector: "Unknown" }, // Globant SA
  { ticker: "GNRC", sector: "Unknown" }, // Generac Holdings Inc.
  { ticker: "GPC", sector: "Unknown" }, // Genuine Parts Co.
  { ticker: "GPN", sector: "Unknown" }, // Global Payments Inc.
  { ticker: "GRMN", sector: "Unknown" }, // Garmin Ltd.
  { ticker: "GTES", sector: "Unknown" }, // Gates Industrial Corp. plc
  { ticker: "GTLB", sector: "Unknown" }, // Gitlab Inc. Class A
  { ticker: "GTM", sector: "Unknown" }, // ZoomInfo Technologies Inc. Class A
  { ticker: "HAS", sector: "Unknown" }, // Hasbro Inc.
  { ticker: "HAYW", sector: "Unknown" }, // Hayward Holdings Inc.
  { ticker: "HBAN", sector: "Unknown" }, // Huntington Bancshares Inc./OH
  { ticker: "HEI", sector: "Unknown" }, // HEICO Corp.
  { ticker: "HEI-A", sector: "Unknown" }, // HEICO Corp. Class A
  { ticker: "HHH", sector: "Unknown" }, // Howard Hughes Holdings Inc.
  { ticker: "HII", sector: "Unknown" }, // Huntington Ingalls Industries Inc.
  { ticker: "HIW", sector: "Unknown" }, // Highwoods Properties Inc.
  { ticker: "HOOD", sector: "Unknown" }, // Robinhood Markets Inc. Class A
  { ticker: "HRL", sector: "Unknown" }, // Hormel Foods Corp.
  { ticker: "HSIC", sector: "Unknown" }, // Henry Schein Inc.
  { ticker: "HST", sector: "Unknown" }, // Host Hotels & Resorts Inc.
  { ticker: "HUBB", sector: "Unknown" }, // Hubbell Inc. Class B
  { ticker: "HUBS", sector: "Unknown" }, // HubSpot Inc.
  { ticker: "HUN", sector: "Unknown" }, // Huntsman Corp.
  { ticker: "IAC", sector: "Unknown" }, // IAC Inc.
  { ticker: "IBKR", sector: "Unknown" }, // Interactive Brokers Group Inc.
  { ticker: "IEX", sector: "Unknown" }, // IDEX Corp.
  { ticker: "INCY", sector: "Unknown" }, // Incyte Corp.
  { ticker: "INGM", sector: "Unknown" }, // Ingram Micro Holding Corp.
  { ticker: "INSM", sector: "Unknown" }, // Insmed Inc.
  { ticker: "INSP", sector: "Unknown" }, // Inspire Medical Systems Inc.
  { ticker: "IONS", sector: "Unknown" }, // Ionis Pharmaceuticals Inc.
  { ticker: "IOT", sector: "Unknown" }, // Samsara Inc. Class A
  { ticker: "IQV", sector: "Unknown" }, // IQVIA Holdings Inc.
  { ticker: "IR", sector: "Unknown" }, // Ingersoll Rand Inc.
  { ticker: "IRDM", sector: "Unknown" }, // Iridium Communications Inc.
  { ticker: "IRM", sector: "Unknown" }, // Iron Mountain Inc.
  { ticker: "IT", sector: "Unknown" }, // Gartner Inc.
  { ticker: "IVZ", sector: "Unknown" }, // Invesco Ltd.
  { ticker: "J", sector: "Unknown" }, // Jacobs Solutions Inc.
  { ticker: "JBHT", sector: "Unknown" }, // JB Hunt Transport Services Inc.
  { ticker: "JBL", sector: "Unknown" }, // Jabil Inc.
  { ticker: "JHX", sector: "Unknown" }, // James Hardie Industries plc
  { ticker: "JKHY", sector: "Unknown" }, // Jack Henry & Associates Inc.
  { ticker: "KDP", sector: "Unknown" }, // Keurig Dr Pepper Inc.
  { ticker: "KEY", sector: "Unknown" }, // KeyCorp
  { ticker: "KIM", sector: "Unknown" }, // Kimco Realty Corp.
  { ticker: "KMPR", sector: "Unknown" }, // Kemper Corp.
  { ticker: "KMX", sector: "Unknown" }, // CarMax Inc.
  { ticker: "KRMN", sector: "Unknown" }, // Karman Holdings Inc.
  { ticker: "KVUE", sector: "Unknown" }, // Kenvue Inc.
  { ticker: "L", sector: "Unknown" }, // Loews Corp.
  { ticker: "LAZ", sector: "Unknown" }, // Lazard Ltd. Class A
  { ticker: "LBRDA", sector: "Unknown" }, // Liberty Broadband Corp. Class A
  { ticker: "LBRDK", sector: "Unknown" }, // Liberty Broadband Corp.
  { ticker: "LBTYA", sector: "Unknown" }, // Liberty Global Ltd. Class A
  { ticker: "LBTYK", sector: "Unknown" }, // Liberty Global Ltd.
  { ticker: "LCID", sector: "Unknown" }, // Lucid Group Inc.
  { ticker: "LDOS", sector: "Unknown" }, // Leidos Holdings Inc.
  { ticker: "LEN-B", sector: "Unknown" }, // Lennar Corp. Class B
  { ticker: "LH", sector: "Unknown" }, // Labcorp Holdings Inc.
  { ticker: "LII", sector: "Unknown" }, // Lennox International Inc.
  { ticker: "LINE", sector: "Unknown" }, // Lineage Inc.
  { ticker: "LKQ", sector: "Unknown" }, // LKQ Corp.
  { ticker: "LLYVA", sector: "Unknown" }, // Liberty Live Holdings Inc. Class A
  { ticker: "LLYVK", sector: "Unknown" }, // Liberty Live Holdings Inc.
  { ticker: "LNC", sector: "Unknown" }, // Lincoln National Corp.
  { ticker: "LNT", sector: "Unknown" }, // Alliant Energy Corp.
  { ticker: "LOAR", sector: "Unknown" }, // Loar Holdings Inc.
  { ticker: "LPLA", sector: "Unknown" }, // LPL Financial Holdings Inc.
  { ticker: "LULU", sector: "Unknown" }, // Lululemon Athletica Inc.
  { ticker: "LUV", sector: "Unknown" }, // Southwest Airlines Co.
  { ticker: "LVS", sector: "Unknown" }, // Las Vegas Sands Corp.
  { ticker: "LW", sector: "Unknown" }, // Lamb Weston Holdings Inc.
  { ticker: "LYB", sector: "Unknown" }, // LyondellBasell Industries NV Class A
  { ticker: "LYFT", sector: "Unknown" }, // Lyft Inc. Class A
  { ticker: "MAA", sector: "Unknown" }, // Mid-America Apartment Communities Inc.
  { ticker: "MAN", sector: "Unknown" }, // ManpowerGroup Inc.
  { ticker: "MAS", sector: "Unknown" }, // Masco Corp.
  { ticker: "MCHP", sector: "Unknown" }, // Microchip Technology Inc.
  { ticker: "MDB", sector: "Unknown" }, // MongoDB Inc.
  { ticker: "MDLN", sector: "Unknown" }, // Medline Inc. Class A
  { ticker: "MDU", sector: "Unknown" }, // MDU Resources Group Inc.
  { ticker: "MHK", sector: "Unknown" }, // Mohawk Industries Inc.
  { ticker: "MKL", sector: "Unknown" }, // Markel Corp.
  { ticker: "MKTX", sector: "Unknown" }, // MarketAxess Holdings Inc.
  { ticker: "MNST", sector: "Unknown" }, // Monster Beverage Corp.
  { ticker: "MOH", sector: "Unknown" }, // Molina Healthcare Inc.
  { ticker: "MPT", sector: "Unknown" }, // Medical Properties Trust Inc.
  { ticker: "MRNA", sector: "Unknown" }, // Moderna Inc.
  { ticker: "MRP", sector: "Unknown" }, // Millrose Properties Inc.
  { ticker: "MSCI", sector: "Unknown" }, // MSCI Inc. Class A
  { ticker: "MSGS", sector: "Unknown" }, // Madison Square Garden Co. Class A
  { ticker: "MSTR", sector: "Unknown" }, // MicroStrategy Inc. Class A
  { ticker: "MTB", sector: "Unknown" }, // M&T Bank Corp.
  { ticker: "MTCH", sector: "Unknown" }, // Match Group Inc.
  { ticker: "MTD", sector: "Unknown" }, // Mettler-Toledo International Inc.
  { ticker: "NCLH", sector: "Unknown" }, // Norwegian Cruise Line Holdings Ltd.
  { ticker: "NCNO", sector: "Unknown" }, // nCino Inc.
  { ticker: "NDAQ", sector: "Unknown" }, // Nasdaq Inc.
  { ticker: "NDSN", sector: "Unknown" }, // Nordson Corp.
  { ticker: "NIQ", sector: "Unknown" }, // NIQ Global Intelligence plc
  { ticker: "NRG", sector: "Unknown" }, // NRG Energy Inc.
  { ticker: "NTAP", sector: "Unknown" }, // NetApp Inc.
  { ticker: "NTRA", sector: "Unknown" }, // Natera Inc.
  { ticker: "NTRS", sector: "Unknown" }, // Northern Trust Corp.
  { ticker: "NU", sector: "Unknown" }, // NU Holdings Ltd./Cayman Islands Class A
  { ticker: "NVR", sector: "Unknown" }, // NVR Inc.
  { ticker: "NWL", sector: "Unknown" }, // Newell Brands Inc.
  { ticker: "NWS", sector: "Unknown" }, // News Corp. Class B
  { ticker: "NWSA", sector: "Unknown" }, // News Corp. Class A
  { ticker: "ODFL", sector: "Unknown" }, // Old Dominion Freight Line Inc.
  { ticker: "OGN", sector: "Unknown" }, // Organon & Co.
  { ticker: "OMF", sector: "Unknown" }, // OneMain Holdings Inc.
  { ticker: "ON", sector: "Unknown" }, // ON Semiconductor Corp.
  { ticker: "ONON", sector: "Unknown" }, // On Holding AG Class A
  { ticker: "OWL", sector: "Unknown" }, // Blue Owl Capital Inc. Class A
  { ticker: "PAYC", sector: "Unknown" }, // Paycom Software Inc.
  { ticker: "PAYX", sector: "Unknown" }, // Paychex Inc.
  { ticker: "PCOR", sector: "Unknown" }, // Procore Technologies Inc.
  { ticker: "PEG", sector: "Unknown" }, // Public Service Enterprise Group Inc.
  { ticker: "PENN", sector: "Unknown" }, // Penn National Gaming Inc.
  { ticker: "PFG", sector: "Unknown" }, // Principal Financial Group Inc.
  { ticker: "PNR", sector: "Unknown" }, // Pentair plc
  { ticker: "PNW", sector: "Unknown" }, // Pinnacle West Capital Corp.
  { ticker: "PODD", sector: "Unknown" }, // Insulet Corp.
  { ticker: "POOL", sector: "Unknown" }, // Pool Corp.
  { ticker: "PRGO", sector: "Unknown" }, // Perrigo Co. plc
  { ticker: "PRMB", sector: "Unknown" }, // Primo Brands Corp. Class A
  { ticker: "PTC", sector: "Unknown" }, // PTC Inc.
  { ticker: "PYPL", sector: "Unknown" }, // PayPal Holdings Inc.
  { ticker: "Q", sector: "Unknown" }, // Qnity Electronics Inc.
  { ticker: "QGEN", sector: "Unknown" }, // QIAGEN NV
  { ticker: "QRVO", sector: "Unknown" }, // Qorvo Inc.
  { ticker: "QS", sector: "Unknown" }, // QuantumScape Corp. Class A
  { ticker: "QSR", sector: "Unknown" }, // Restaurant Brands International Inc.
  { ticker: "QXO", sector: "Unknown" }, // QXO Inc.
  { ticker: "RAL", sector: "Unknown" }, // Ralliant Corp.
  { ticker: "RARE", sector: "Unknown" }, // Ultragenyx Pharmaceutical Inc.
  { ticker: "RBLX", sector: "Unknown" }, // ROBLOX Corp.
  { ticker: "RBRK", sector: "Unknown" }, // Rubrik Inc. Class A
  { ticker: "RDDT", sector: "Unknown" }, // Reddit Inc. Class A
  { ticker: "REG", sector: "Unknown" }, // Regency Centers Corp.
  { ticker: "REYN", sector: "Unknown" }, // Reynolds Consumer Products Inc.
  { ticker: "RF", sector: "Unknown" }, // Regions Financial Corp.
  { ticker: "RHI", sector: "Unknown" }, // Robert Half International Inc.
  { ticker: "RITM", sector: "Unknown" }, // New Residential Investment Corp.
  { ticker: "RIVN", sector: "Unknown" }, // Rivian Automotive Inc. Class A
  { ticker: "RJF", sector: "Unknown" }, // Raymond James Financial Inc.
  { ticker: "RKLB", sector: "Unknown" }, // Rocket Lab Corp.
  { ticker: "RKT", sector: "Unknown" }, // Rocket Cos. Inc. Class A
  { ticker: "RMD", sector: "Unknown" }, // ResMed Inc.
  { ticker: "RNG", sector: "Unknown" }, // RingCentral Inc. Class A
  { ticker: "ROKU", sector: "Unknown" }, // Roku Inc.
  { ticker: "ROL", sector: "Unknown" }, // Rollins Inc.
  { ticker: "ROP", sector: "Unknown" }, // Roper Technologies Inc.
  { ticker: "RPRX", sector: "Unknown" }, // Royalty Pharma plc Class A
  { ticker: "RSG", sector: "Unknown" }, // Republic Services Inc. Class A
  { ticker: "RVMD", sector: "Unknown" }, // Revolution Medicines Inc.
  { ticker: "RVTY", sector: "Unknown" }, // PerkinElmer Inc.
  { ticker: "S", sector: "Unknown" }, // SentinelOne Inc. Class A
  { ticker: "SAIL", sector: "Unknown" }, // SailPoint Inc.
  { ticker: "SBAC", sector: "Unknown" }, // SBA Communications Corp. Class A
  { ticker: "SCCO", sector: "Unknown" }, // Southern Copper Corp.
  { ticker: "SEB", sector: "Unknown" }, // Seaboard Corp.
  { ticker: "SFD", sector: "Unknown" }, // Smithfield Foods Inc.
  { ticker: "SIRI", sector: "Unknown" }, // Sirius XM Holdings Inc.
  { ticker: "SITE", sector: "Unknown" }, // SiteOne Landscape Supply Inc.
  { ticker: "SJM", sector: "Unknown" }, // JM Smucker Co.
  { ticker: "SMCI", sector: "Unknown" }, // Super Micro Computer Inc.
  { ticker: "SMMT", sector: "Unknown" }, // Summit Therapeutics Inc.
  { ticker: "SN", sector: "Unknown" }, // SharkNinja Inc.
  { ticker: "SNA", sector: "Unknown" }, // Snap-on Inc.
  { ticker: "SNDR", sector: "Unknown" }, // Schneider National Inc. Class B
  { ticker: "SNOW", sector: "Unknown" }, // Snowflake Inc.
  { ticker: "SOFI", sector: "Unknown" }, // SoFi Technologies Inc.
  { ticker: "SOLV", sector: "Unknown" }, // Solventum Corp.
  { ticker: "SRPT", sector: "Unknown" }, // Sarepta Therapeutics Inc.
  { ticker: "SSNC", sector: "Unknown" }, // SS&C Technologies Holdings Inc.
  { ticker: "STE", sector: "Unknown" }, // STERIS plc
  { ticker: "STLD", sector: "Unknown" }, // Steel Dynamics Inc.
  { ticker: "SUI", sector: "Unknown" }, // Sun Communities Inc.
  { ticker: "SWKS", sector: "Unknown" }, // Skyworks Solutions Inc.
  { ticker: "SYF", sector: "Unknown" }, // Synchrony Financial
  { ticker: "TDC", sector: "Unknown" }, // Teradata Corp.
  { ticker: "TDY", sector: "Unknown" }, // Teledyne Technologies Inc.
  { ticker: "TEAM", sector: "Unknown" }, // Atlassian Corp. Class A
  { ticker: "TECH", sector: "Unknown" }, // Bio-Techne Corp.
  { ticker: "TEM", sector: "Unknown" }, // Tempus AI Inc. Class A
  { ticker: "TER", sector: "Unknown" }, // Teradyne Inc.
  { ticker: "TFSL", sector: "Unknown" }, // TFS Financial Corp.
  { ticker: "TFX", sector: "Unknown" }, // Teleflex Inc.
  { ticker: "TIGO", sector: "Unknown" }, // Millicom International Cellular SA
  { ticker: "TKO", sector: "Unknown" }, // TKO Group Holdings Inc. Class A
  { ticker: "TOST", sector: "Unknown" }, // Toast Inc. Class A
  { ticker: "TPG", sector: "Unknown" }, // TPG Inc. Class A
  { ticker: "TPL", sector: "Unknown" }, // Texas Pacific Land Corp.
  { ticker: "TRGP", sector: "Unknown" }, // Targa Resources Corp.
  { ticker: "TRMB", sector: "Unknown" }, // Trimble Inc.
  { ticker: "TROW", sector: "Unknown" }, // T. Rowe Price Group Inc.
  { ticker: "TSCO", sector: "Unknown" }, // Tractor Supply Co.
  { ticker: "TSN", sector: "Unknown" }, // Tyson Foods Inc. Class A
  { ticker: "TTD", sector: "Unknown" }, // Trade Desk Inc. Class A
  { ticker: "TW", sector: "Unknown" }, // Tradeweb Markets Inc. Class A
  { ticker: "TXT", sector: "Unknown" }, // Textron Inc.
  { ticker: "TYL", sector: "Unknown" }, // Tyler Technologies Inc.
  { ticker: "U", sector: "Unknown" }, // Unity Software Inc.
  { ticker: "UA", sector: "Unknown" }, // Under Armour Inc. Class C
  { ticker: "UAA", sector: "Unknown" }, // Under Armour Inc. Class A
  { ticker: "UAL", sector: "Unknown" }, // United Airlines Holdings Inc.
  { ticker: "UDR", sector: "Unknown" }, // UDR Inc.
  { ticker: "UHAL", sector: "Unknown" }, // AMERCO
  { ticker: "UHAL-B", sector: "Unknown" }, // U-Haul Holding Co.
  { ticker: "UHS", sector: "Unknown" }, // Universal Health Services Inc. Class B
  { ticker: "UI", sector: "Unknown" }, // Ubiquiti Inc.
  { ticker: "UWMC", sector: "Unknown" }, // UWM Holdings Corp.
  { ticker: "VEEV", sector: "Unknown" }, // Veeva Systems Inc. Class A
  { ticker: "VGNT", sector: "Unknown" }, // Versigent plc
  { ticker: "VICI", sector: "Unknown" }, // VICI Properties Inc.
  { ticker: "VIK", sector: "Unknown" }, // Viking Holdings Ltd.
  { ticker: "VIRT", sector: "Unknown" }, // Virtu Financial Inc. Class A
  { ticker: "VKTX", sector: "Unknown" }, // Viking Therapeutics Inc.
  { ticker: "VLTO", sector: "Unknown" }, // Veralto Corp.
  { ticker: "VRSK", sector: "Unknown" }, // Verisk Analytics Inc. Class A
  { ticker: "VRSN", sector: "Unknown" }, // VeriSign Inc.
  { ticker: "VSNT", sector: "Unknown" }, // Versant Media Group Inc.
  { ticker: "VST", sector: "Unknown" }, // Vistra Energy Corp.
  { ticker: "VTRS", sector: "Unknown" }, // Viatris Inc.
  { ticker: "W", sector: "Unknown" }, // Wayfair Inc.
  { ticker: "WAB", sector: "Unknown" }, // Westinghouse Air Brake Technologies Corp.
  { ticker: "WAT", sector: "Unknown" }, // Waters Corp.
  { ticker: "WDAY", sector: "Unknown" }, // Workday Inc. Class A
  { ticker: "WEN", sector: "Unknown" }, // Wendy's Co.
  { ticker: "WRB", sector: "Unknown" }, // WR Berkley Corp.
  { ticker: "WSC", sector: "Unknown" }, // WillScot Holdings Corp.
  { ticker: "WSM", sector: "Unknown" }, // Williams-Sonoma Inc.
  { ticker: "WST", sector: "Unknown" }, // West Pharmaceutical Services Inc.
  { ticker: "WTM", sector: "Unknown" }, // White Mountains Insurance Group Ltd.
  { ticker: "WTW", sector: "Unknown" }, // Willis Towers Watson plc
  { ticker: "WU", sector: "Unknown" }, // Western Union Co.
  { ticker: "WY", sector: "Unknown" }, // Weyerhaeuser Co.
  { ticker: "WYNN", sector: "Unknown" }, // Wynn Resorts Ltd.
  { ticker: "XP", sector: "Unknown" }, // XP Inc.
  { ticker: "XYZ", sector: "Unknown" }, // Square Inc.
  { ticker: "Z", sector: "Unknown" }, // Zillow Group Inc.
  { ticker: "ZBH", sector: "Unknown" }, // Zimmer Biomet Holdings Inc.
  { ticker: "ZBRA", sector: "Unknown" }, // Zebra Technologies Corp.
  { ticker: "ZG", sector: "Unknown" }, // Zillow Group Inc. Class A
  { ticker: "ZM", sector: "Unknown" }, // Zoom Video Communications Inc. Class A
  { ticker: "ZS", sector: "Unknown" }, // Zscaler Inc.

  // ── Utilities ──
  { ticker: "AES", sector: "Utilities" }, // AES Corp./VA
  { ticker: "AWK", sector: "Utilities" }, // American Water Works Co. Inc.
  { ticker: "CMS", sector: "Utilities" }, // CMS Energy Corp.
  { ticker: "CNP", sector: "Utilities" }, // CenterPoint Energy Inc.
  { ticker: "D", sector: "Utilities" }, // Dominion Energy Inc.
  { ticker: "ED", sector: "Utilities" }, // Consolidated Edison Inc.
  { ticker: "EIX", sector: "Utilities" }, // Edison International
  { ticker: "ES", sector: "Utilities" }, // Eversource Energy
  { ticker: "ETR", sector: "Utilities" }, // Entergy Corp.
  { ticker: "EXC", sector: "Utilities" }, // Exelon Corp.
  { ticker: "IDA", sector: "Utilities" }, // IDACORP Inc.
  { ticker: "NFG", sector: "Utilities" }, // National Fuel Gas Co.
  { ticker: "NI", sector: "Utilities" }, // NiSource Inc.
  { ticker: "OGE", sector: "Utilities" }, // OGE Energy Corp.
  { ticker: "PCG", sector: "Utilities" }, // PG&E Corp.
  { ticker: "PPL", sector: "Utilities" }, // PPL Corp.
  { ticker: "TLN", sector: "Utilities" }, // Talen Energy Corp.
  { ticker: "UGI", sector: "Utilities" }, // UGI Corp.
  { ticker: "WEC", sector: "Utilities" }, // WEC Energy Group Inc.
  { ticker: "WTRG", sector: "Utilities" }, // Essential Utilities Inc.
  { ticker: "XEL", sector: "Utilities" }, // Xcel Energy Inc.
];
