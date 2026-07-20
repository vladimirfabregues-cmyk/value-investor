import type { ScreenableCompany } from "@/lib/screener/cac40";

// TOPIX Small (Small 1 + Small 2) constituents from the official JPX
// TOPIX component weights file (April 2026). Sectors mapped from the TSE
// 33-industry classification to GICS approximations; Yahoo Finance's own
// sector takes precedence at screening time.
export const TOPIXSMALL_COMPANIES: ScreenableCompany[] = [
  // ── Communication Services ──
  { ticker: "2121.T", sector: "Communication Services" }, // MIXI,Inc.
  { ticker: "2307.T", sector: "Communication Services" }, // CROSS CAT CO.,LTD.
  { ticker: "2317.T", sector: "Communication Services" }, // Systena Corporation
  { ticker: "2326.T", sector: "Communication Services" }, // Digital Arts Inc.
  { ticker: "2335.T", sector: "Communication Services" }, // CUBE SYSTEM INC.
  { ticker: "2359.T", sector: "Communication Services" }, // CORE CORPORATION
  { ticker: "2477.T", sector: "Communication Services" }, // Temairazu,Inc.
  { ticker: "3031.T", sector: "Communication Services" }, // RACCOON HOLDINGS,Inc.
  { ticker: "3040.T", sector: "Communication Services" }, // SOLITON SYSTEMS K.K.
  { ticker: "3371.T", sector: "Communication Services" }, // SOFTCREATE HOLDINGS CORP.
  { ticker: "3632.T", sector: "Communication Services" }, // GREE Holdings,Inc.
  { ticker: "3633.T", sector: "Communication Services" }, // GMO Pepabo,Inc.
  { ticker: "3636.T", sector: "Communication Services" }, // Mitsubishi Research Institute,Inc.
  { ticker: "3649.T", sector: "Communication Services" }, // FINDEX Inc.
  { ticker: "3656.T", sector: "Communication Services" }, // KLab Inc.
  { ticker: "3657.T", sector: "Communication Services" }, // Pole To Win Holdings,Inc.
  { ticker: "3660.T", sector: "Communication Services" }, // istyle Inc.
  { ticker: "3661.T", sector: "Communication Services" }, // m-up holdings,Inc.
  { ticker: "3662.T", sector: "Communication Services" }, // Ateam Holdings Co.,Ltd.
  { ticker: "3663.T", sector: "Communication Services" }, // CELSYS,Inc.
  { ticker: "3665.T", sector: "Communication Services" }, // Enigmo Inc.
  { ticker: "3668.T", sector: "Communication Services" }, // COLOPL,Inc.
  { ticker: "3673.T", sector: "Communication Services" }, // Broadleaf Co.,Ltd.
  { ticker: "3676.T", sector: "Communication Services" }, // DIGITAL HEARTS HOLDINGS Co.,Ltd.
  { ticker: "3678.T", sector: "Communication Services" }, // MEDIA DO Co.,Ltd.
  { ticker: "3679.T", sector: "Communication Services" }, // ZIGExN Co.,Ltd.
  { ticker: "3681.T", sector: "Communication Services" }, // V-cube,Inc.
  { ticker: "3687.T", sector: "Communication Services" }, // Fixstars Corporation
  { ticker: "3694.T", sector: "Communication Services" }, // OPTiM CORPORATION
  { ticker: "3696.T", sector: "Communication Services" }, // CERES INC.
  { ticker: "3741.T", sector: "Communication Services" }, // Systems Engineering Consultants Co.,LTD.
  { ticker: "3762.T", sector: "Communication Services" }, // TECHMATRIX CORPORATION
  { ticker: "3763.T", sector: "Communication Services" }, // Pro-Ship Incorporated
  { ticker: "3765.T", sector: "Communication Services" }, // GungHo Online Entertainment,Inc.
  { ticker: "3771.T", sector: "Communication Services" }, // SYSTEM RESEARCH CO.,LTD.
  { ticker: "3778.T", sector: "Communication Services" }, // SAKURA internet Inc.
  { ticker: "3788.T", sector: "Communication Services" }, // GMO GlobalSign Holdings K.K.
  { ticker: "3817.T", sector: "Communication Services" }, // SRA Holdings,Inc.
  { ticker: "3834.T", sector: "Communication Services" }, // Asahi Net,Inc.
  { ticker: "3835.T", sector: "Communication Services" }, // eBASE Co.,Ltd.
  { ticker: "3836.T", sector: "Communication Services" }, // AVANT GROUP CORPORATION
  { ticker: "3837.T", sector: "Communication Services" }, // Ad-Sol Nissin Corporation
  { ticker: "3843.T", sector: "Communication Services" }, // FreeBit Co.,Ltd.
  { ticker: "3844.T", sector: "Communication Services" }, // COMTURE CORPORATION
  { ticker: "3853.T", sector: "Communication Services" }, // ASTERIA Corporation
  { ticker: "3854.T", sector: "Communication Services" }, // I'LL INC
  { ticker: "3901.T", sector: "Communication Services" }, // MarkLines Co.,Ltd.
  { ticker: "3903.T", sector: "Communication Services" }, // gumi Inc.
  { ticker: "3915.T", sector: "Communication Services" }, // TerraSky Co.,Ltd
  { ticker: "3916.T", sector: "Communication Services" }, // Digital Information Technologies Corporation
  { ticker: "3921.T", sector: "Communication Services" }, // NEOJAPAN Inc.
  { ticker: "3922.T", sector: "Communication Services" }, // PR TIMES Corporation
  { ticker: "3925.T", sector: "Communication Services" }, // Double Standard Inc.
  { ticker: "3926.T", sector: "Communication Services" }, // Open Door Inc.
  { ticker: "3932.T", sector: "Communication Services" }, // Akatsuki Inc.
  { ticker: "3937.T", sector: "Communication Services" }, // Ubicom Holdings,Inc.
  { ticker: "3939.T", sector: "Communication Services" }, // Kanamic Network Co.,LTD
  { ticker: "3962.T", sector: "Communication Services" }, // CHANGE Holdings,Inc.
  { ticker: "3964.T", sector: "Communication Services" }, // AUCNET INC.
  { ticker: "3983.T", sector: "Communication Services" }, // ORO Co.,Ltd.
  { ticker: "3984.T", sector: "Communication Services" }, // User Local,Inc.
  { ticker: "3993.T", sector: "Communication Services" }, // PKSHA Technology Inc.
  { ticker: "4051.T", sector: "Communication Services" }, // GMO Financial Gate,Inc.
  { ticker: "4053.T", sector: "Communication Services" }, // Sun* Inc.
  { ticker: "4071.T", sector: "Communication Services" }, // Plus Alpha Consulting Co.,LTD.
  { ticker: "4072.T", sector: "Communication Services" }, // Densan System Holdings Co.,Ltd.
  { ticker: "4180.T", sector: "Communication Services" }, // Appier Group,Inc.
  { ticker: "4299.T", sector: "Communication Services" }, // HIMACS,Ltd.
  { ticker: "4323.T", sector: "Communication Services" }, // Japan System Techniques Co.,Ltd.
  { ticker: "4326.T", sector: "Communication Services" }, // INTAGE HOLDINGS Inc.
  { ticker: "4344.T", sector: "Communication Services" }, // SOURCENEXT CORPORATION
  { ticker: "4373.T", sector: "Communication Services" }, // Simplex Holdings,Inc.
  { ticker: "4382.T", sector: "Communication Services" }, // HEROZ,Inc.
  { ticker: "4384.T", sector: "Communication Services" }, // RAKSUL INC.
  { ticker: "4390.T", sector: "Communication Services" }, // IPS,Inc.
  { ticker: "4396.T", sector: "Communication Services" }, // System Support Holdings Inc.
  { ticker: "4413.T", sector: "Communication Services" }, // baudroie,inc.
  { ticker: "441A.T", sector: "Communication Services" }, // NE Inc.
  { ticker: "4420.T", sector: "Communication Services" }, // eSOL Co.,Ltd.
  { ticker: "4432.T", sector: "Communication Services" }, // WingArc1st Inc.
  { ticker: "4434.T", sector: "Communication Services" }, // Serverworks Co.,Ltd.
  { ticker: "4443.T", sector: "Communication Services" }, // Sansan,Inc.
  { ticker: "4449.T", sector: "Communication Services" }, // giftee Inc.
  { ticker: "4480.T", sector: "Communication Services" }, // MEDLEY,INC.
  { ticker: "4481.T", sector: "Communication Services" }, // BASE CO.,LTD.
  { ticker: "4483.T", sector: "Communication Services" }, // JMDC Inc.
  { ticker: "4662.T", sector: "Communication Services" }, // Focus Systems Corporation
  { ticker: "4674.T", sector: "Communication Services" }, // CRESCO LTD.
  { ticker: "4686.T", sector: "Communication Services" }, // JUSTSYSTEMS CORPORATION
  { ticker: "4687.T", sector: "Communication Services" }, // TDC SOFT Inc.
  { ticker: "4709.T", sector: "Communication Services" }, // ID Holdings Corporation
  { ticker: "4719.T", sector: "Communication Services" }, // ALPHA SYSTEMS INC.
  { ticker: "4722.T", sector: "Communication Services" }, // Future Corporation
  { ticker: "4725.T", sector: "Communication Services" }, // CAC Holdings Corporation
  { ticker: "4743.T", sector: "Communication Services" }, // ITFOR Inc.
  { ticker: "4746.T", sector: "Communication Services" }, // Toukei Computer Co.,Ltd.
  { ticker: "4776.T", sector: "Communication Services" }, // Cybozu,Inc.
  { ticker: "4812.T", sector: "Communication Services" }, // DENTSU SOKEN INC.
  { ticker: "4819.T", sector: "Communication Services" }, // Digital Garage,Inc.
  { ticker: "4820.T", sector: "Communication Services" }, // EM SYSTEMS CO.,LTD.
  { ticker: "4825.T", sector: "Communication Services" }, // WEATHERNEWS INC.
  { ticker: "4826.T", sector: "Communication Services" }, // Computer Institute of Japan, Ltd.
  { ticker: "4828.T", sector: "Communication Services" }, // Business Engineering Corporation
  { ticker: "4839.T", sector: "Communication Services" }, // WOWOW INC.
  { ticker: "4845.T", sector: "Communication Services" }, // Scala,Inc.
  { ticker: "5032.T", sector: "Communication Services" }, // ANYCOLOR Inc.
  { ticker: "5036.T", sector: "Communication Services" }, // Japan Business Systems,Inc.
  { ticker: "545A.T", sector: "Communication Services" }, // Toranvia Co.,Ltd.
  { ticker: "6199.T", sector: "Communication Services" }, // SERAKU Co.,Ltd.
  { ticker: "7527.T", sector: "Communication Services" }, // SystemSoft Corporation
  { ticker: "7595.T", sector: "Communication Services" }, // ARGO GRAPHICS Inc.
  { ticker: "7844.T", sector: "Communication Services" }, // Marvelous Inc.
  { ticker: "7860.T", sector: "Communication Services" }, // Avex Inc.
  { ticker: "8157.T", sector: "Communication Services" }, // TSUZUKI DENKI CO.,LTD.
  { ticker: "9405.T", sector: "Communication Services" }, // ASAHI BROADCASTING GROUP HOLDINGS CORPORATION
  { ticker: "9409.T", sector: "Communication Services" }, // TV Asahi Holdings Corporation
  { ticker: "9412.T", sector: "Communication Services" }, // SKY Perfect JSAT Corporation
  { ticker: "9413.T", sector: "Communication Services" }, // TV TOKYO Holdings Corporation
  { ticker: "9416.T", sector: "Communication Services" }, // VISION INC.
  { ticker: "9418.T", sector: "Communication Services" }, // U-NEXT HOLDINGS Co.,Ltd.
  { ticker: "9424.T", sector: "Communication Services" }, // Japan Communications Inc.
  { ticker: "9438.T", sector: "Communication Services" }, // MTI Ltd.
  { ticker: "9450.T", sector: "Communication Services" }, // Fibergate Inc.
  { ticker: "9470.T", sector: "Communication Services" }, // GAKKEN HOLDINGS CO.,LTD.
  { ticker: "9474.T", sector: "Communication Services" }, // ZENRIN CO.,LTD.
  { ticker: "9601.T", sector: "Communication Services" }, // Shochiku Co.,Ltd.
  { ticker: "9605.T", sector: "Communication Services" }, // TOEI COMPANY,LTD.
  { ticker: "9629.T", sector: "Communication Services" }, // PCA CORPORATION
  { ticker: "9658.T", sector: "Communication Services" }, // BUSINESS BRAIN SHOWA・OTA INC.
  { ticker: "9682.T", sector: "Communication Services" }, // DTS CORPORATION
  { ticker: "9692.T", sector: "Communication Services" }, // COMPUTER ENGINEERING & CONSULTING LTD.
  { ticker: "9702.T", sector: "Communication Services" }, // ISB CORPORATION
  { ticker: "9739.T", sector: "Communication Services" }, // NSW Inc.
  { ticker: "9742.T", sector: "Communication Services" }, // INES Corporation
  { ticker: "9746.T", sector: "Communication Services" }, // TKC Corporation
  { ticker: "9790.T", sector: "Communication Services" }, // Fukui Computer Holdings,Inc.
  { ticker: "9889.T", sector: "Communication Services" }, // JBCC Holdings Inc.
  { ticker: "9928.T", sector: "Communication Services" }, // MIROKU JYOHO SERVICE CO.,LTD.

  // ── Consumer Discretionary ──
  { ticker: "262A.T", sector: "Consumer Discretionary" }, // INTERMESTIC INC.
  { ticker: "2659.T", sector: "Consumer Discretionary" }, // SAN-A CO.,LTD.
  { ticker: "2664.T", sector: "Consumer Discretionary" }, // CAWACHI LIMITED
  { ticker: "2674.T", sector: "Consumer Discretionary" }, // HARD OFF CORPORATION Co.,Ltd.
  { ticker: "2678.T", sector: "Consumer Discretionary" }, // ASKUL Corporation
  { ticker: "2681.T", sector: "Consumer Discretionary" }, // GEO HOLDINGS CORPORATION
  { ticker: "2685.T", sector: "Consumer Discretionary" }, // and ST HD Co.,Ltd.
  { ticker: "2695.T", sector: "Consumer Discretionary" }, // Kura Sushi,Inc.
  { ticker: "2698.T", sector: "Consumer Discretionary" }, // CAN DO CO.,LTD.
  { ticker: "2726.T", sector: "Consumer Discretionary" }, // PAL GROUP Holdings CO.,LTD
  { ticker: "2730.T", sector: "Consumer Discretionary" }, // EDION Corporation
  { ticker: "2734.T", sector: "Consumer Discretionary" }, // SALA CORPORATION
  { ticker: "2742.T", sector: "Consumer Discretionary" }, // HALOWS CO.,LTD.
  { ticker: "2752.T", sector: "Consumer Discretionary" }, // FUJIO FOOD GROUP INC.
  { ticker: "2753.T", sector: "Consumer Discretionary" }, // AMIYAKI TEI CO.,LTD.
  { ticker: "2791.T", sector: "Consumer Discretionary" }, // DAIKOKUTENBUSSAN CO.,LTD.
  { ticker: "2792.T", sector: "Consumer Discretionary" }, // HONEYS HOLDINGS CO.,LTD.
  { ticker: "3001.T", sector: "Consumer Discretionary" }, // Katakura Industries Co.,Ltd.
  { ticker: "3002.T", sector: "Consumer Discretionary" }, // GUNZE LIMITED
  { ticker: "3028.T", sector: "Consumer Discretionary" }, // Alpen Co.,Ltd.
  { ticker: "3034.T", sector: "Consumer Discretionary" }, // Qol Holdings Co.,Ltd.
  { ticker: "3046.T", sector: "Consumer Discretionary" }, // JINS HOLDINGS Inc.
  { ticker: "3050.T", sector: "Consumer Discretionary" }, // DCM Holdings Co.,Ltd.
  { ticker: "3053.T", sector: "Consumer Discretionary" }, // PEPPER FOOD SERVICE CO.,LTD.
  { ticker: "3087.T", sector: "Consumer Discretionary" }, // DOUTOR・NICHIRES Holdings Co.,Ltd.
  { ticker: "3091.T", sector: "Consumer Discretionary" }, // BRONCO BILLY Co.,LTD.
  { ticker: "3093.T", sector: "Consumer Discretionary" }, // Treasure Factory Co.,LTD.
  { ticker: "3097.T", sector: "Consumer Discretionary" }, // The Monogatari Corporation
  { ticker: "3103.T", sector: "Consumer Discretionary" }, // UNITIKA LTD.
  { ticker: "3104.T", sector: "Consumer Discretionary" }, // Fujibo Holdings,Inc.
  { ticker: "3106.T", sector: "Consumer Discretionary" }, // KURABO INDUSTRIES LTD.
  { ticker: "3109.T", sector: "Consumer Discretionary" }, // SHIKIBO LTD.
  { ticker: "3134.T", sector: "Consumer Discretionary" }, // Hamee Corp.
  { ticker: "3148.T", sector: "Consumer Discretionary" }, // CREATE SD HOLDINGS CO.,LTD.
  { ticker: "3179.T", sector: "Consumer Discretionary" }, // Syuppin Co.,Ltd.
  { ticker: "3182.T", sector: "Consumer Discretionary" }, // Oisix ra daichi Inc.
  { ticker: "3186.T", sector: "Consumer Discretionary" }, // NEXTAGE Co.,Ltd.
  { ticker: "3191.T", sector: "Consumer Discretionary" }, // JOYFUL HONDA CO.,LTD.
  { ticker: "3193.T", sector: "Consumer Discretionary" }, // Eternal Hospitality Group Co.,Ltd.
  { ticker: "3196.T", sector: "Consumer Discretionary" }, // HOTLAND HOLDINGS Co.,Ltd.
  { ticker: "3198.T", sector: "Consumer Discretionary" }, // SFP Holdings Co.,Ltd.
  { ticker: "3199.T", sector: "Consumer Discretionary" }, // Watahan & Co.,Ltd.
  { ticker: "3201.T", sector: "Consumer Discretionary" }, // THE JAPAN WOOL TEXTILE CO.,LTD.
  { ticker: "3221.T", sector: "Consumer Discretionary" }, // Yossix Holdings Co.,Ltd.
  { ticker: "3222.T", sector: "Consumer Discretionary" }, // United Super Markets Holdings Inc.
  { ticker: "3302.T", sector: "Consumer Discretionary" }, // TEIKOKU SEN-I Co.,Ltd.
  { ticker: "3333.T", sector: "Consumer Discretionary" }, // ASAHI CO.,LTD.
  { ticker: "3387.T", sector: "Consumer Discretionary" }, // create restaurants holdings inc.
  { ticker: "3395.T", sector: "Consumer Discretionary" }, // Saint Marc Holdings Co.,Ltd.
  { ticker: "3415.T", sector: "Consumer Discretionary" }, // TOKYO BASE Co.,Ltd.
  { ticker: "3539.T", sector: "Consumer Discretionary" }, // JM HOLDINGS CO.,LTD.
  { ticker: "3546.T", sector: "Consumer Discretionary" }, // Alleanza Holdings Co.,Ltd.
  { ticker: "3547.T", sector: "Consumer Discretionary" }, // UNISIA HOLDINGS CO.
  { ticker: "3548.T", sector: "Consumer Discretionary" }, // BAROQUE JAPAN LIMITED
  { ticker: "3561.T", sector: "Consumer Discretionary" }, // CHIKARANOMOTO HOLDINGS Co.,Ltd.
  { ticker: "3569.T", sector: "Consumer Discretionary" }, // SEIREN CO.,LTD.
  { ticker: "3580.T", sector: "Consumer Discretionary" }, // KOMATSU MATERE Co.,Ltd.
  { ticker: "3593.T", sector: "Consumer Discretionary" }, // HOGY MEDICAL CO.,LTD.
  { ticker: "3608.T", sector: "Consumer Discretionary" }, // TSI HOLDINGS CO.,LTD.
  { ticker: "3612.T", sector: "Consumer Discretionary" }, // WORLD CO.,LTD.
  { ticker: "4350.T", sector: "Consumer Discretionary" }, // MEDICAL SYSTEM NETWORK Co.,Ltd.
  { ticker: "5121.T", sector: "Consumer Discretionary" }, // FUJIKURA COMPOSITES Inc.
  { ticker: "5122.T", sector: "Consumer Discretionary" }, // OKAMOTO INDUSTRIES,INC.
  { ticker: "5185.T", sector: "Consumer Discretionary" }, // Fukoku Co.,Ltd.
  { ticker: "5186.T", sector: "Consumer Discretionary" }, // Nitta Corporation
  { ticker: "5192.T", sector: "Consumer Discretionary" }, // Mitsuboshi Belting Ltd.
  { ticker: "5195.T", sector: "Consumer Discretionary" }, // Bando Chemical Industries,Ltd.
  { ticker: "543A.T", sector: "Consumer Discretionary" }, // ARCHION Corporation
  { ticker: "5889.T", sector: "Consumer Discretionary" }, // Japan Eyewear Holdings Co.,Ltd.
  { ticker: "5949.T", sector: "Consumer Discretionary" }, // UNIPRES CORPORATION
  { ticker: "6455.T", sector: "Consumer Discretionary" }, // MORITA HOLDINGS CORPORATION
  { ticker: "6584.T", sector: "Consumer Discretionary" }, // Sanoh Industrial Co.,Ltd.
  { ticker: "6995.T", sector: "Consumer Discretionary" }, // TOKAI RIKA CO.,LTD.
  { ticker: "7014.T", sector: "Consumer Discretionary" }, // Namura Shipbuilding Co.,Ltd.
  { ticker: "7102.T", sector: "Consumer Discretionary" }, // NIPPON SHARYO,LTD.
  { ticker: "7220.T", sector: "Consumer Discretionary" }, // MUSASHI SEIMITSU INDUSTRY CO.,LTD.
  { ticker: "7222.T", sector: "Consumer Discretionary" }, // NISSAN SHATAI CO.,LTD.
  { ticker: "7224.T", sector: "Consumer Discretionary" }, // ShinMaywa Industries,LTD.
  { ticker: "7226.T", sector: "Consumer Discretionary" }, // KYOKUTO KAIHATSU KOGYO CO.,LTD.
  { ticker: "7231.T", sector: "Consumer Discretionary" }, // TOPY INDUSTRIES,LIMITED
  { ticker: "7236.T", sector: "Consumer Discretionary" }, // T.RAD Co., Ltd.
  { ticker: "7238.T", sector: "Consumer Discretionary" }, // AKEBONO BRAKE INDUSTRY CO.,LTD.
  { ticker: "7239.T", sector: "Consumer Discretionary" }, // TACHI-S CO.,LTD.
  { ticker: "7241.T", sector: "Consumer Discretionary" }, // FUTABA INDUSTRIAL CO.,LTD.
  { ticker: "7242.T", sector: "Consumer Discretionary" }, // KYB Corporation
  { ticker: "7245.T", sector: "Consumer Discretionary" }, // DAIDO METAL CO.,LTD.
  { ticker: "7246.T", sector: "Consumer Discretionary" }, // PRESS KOGYO CO.,LTD.
  { ticker: "7278.T", sector: "Consumer Discretionary" }, // EXEDY Corporation
  { ticker: "7283.T", sector: "Consumer Discretionary" }, // AISAN INDUSTRY CO.,LTD.
  { ticker: "7294.T", sector: "Consumer Discretionary" }, // YOROZU CORPORATION
  { ticker: "7296.T", sector: "Consumer Discretionary" }, // F.C.C.CO.,LTD.
  { ticker: "7419.T", sector: "Consumer Discretionary" }, // Nojima Co.,Ltd.
  { ticker: "7421.T", sector: "Consumer Discretionary" }, // KAPPA・CREATE CO.,LTD.
  { ticker: "7463.T", sector: "Consumer Discretionary" }, // ADVAN GROUP CO.,LTD.
  { ticker: "7475.T", sector: "Consumer Discretionary" }, // ALBIS Co.,Ltd.
  { ticker: "7508.T", sector: "Consumer Discretionary" }, // G-7 HOLDINGS Inc.
  { ticker: "7512.T", sector: "Consumer Discretionary" }, // Aeon Hokkaido Corporation
  { ticker: "7513.T", sector: "Consumer Discretionary" }, // Kojima Co.,Ltd.
  { ticker: "7516.T", sector: "Consumer Discretionary" }, // KOHNAN SHOJI CO.,LTD.
  { ticker: "7520.T", sector: "Consumer Discretionary" }, // Eco's Co.,Ltd.
  { ticker: "7522.T", sector: "Consumer Discretionary" }, // WATAMI CO.,LTD.
  { ticker: "7545.T", sector: "Consumer Discretionary" }, // NISHIMATSUYA CHAIN Co.,Ltd.
  { ticker: "7554.T", sector: "Consumer Discretionary" }, // KOURAKUEN CORPORATION
  { ticker: "7581.T", sector: "Consumer Discretionary" }, // SAIZERIYA CO.,LTD.
  { ticker: "7593.T", sector: "Consumer Discretionary" }, // VT HOLDINGS CO.,LTD.
  { ticker: "7596.T", sector: "Consumer Discretionary" }, // UORIKI CO.,LTD.
  { ticker: "7606.T", sector: "Consumer Discretionary" }, // UNITED ARROWS LTD.
  { ticker: "7611.T", sector: "Consumer Discretionary" }, // HIDAY HIDAKA Corp.
  { ticker: "7630.T", sector: "Consumer Discretionary" }, // ICHIBANYA CO.,LTD.
  { ticker: "7679.T", sector: "Consumer Discretionary" }, // YAKUODO HOLDINGS Co.,Ltd.
  { ticker: "7683.T", sector: "Consumer Discretionary" }, // WA,Inc.
  { ticker: "8005.T", sector: "Consumer Discretionary" }, // Scroll Corporation
  { ticker: "8008.T", sector: "Consumer Discretionary" }, // YONDOSHI HOLDINGS INC.
  { ticker: "8011.T", sector: "Consumer Discretionary" }, // SANYO SHOKAI LTD.
  { ticker: "8016.T", sector: "Consumer Discretionary" }, // ONWARD HOLDINGS CO.,LTD.
  { ticker: "8029.T", sector: "Consumer Discretionary" }, // LOOK HOLDINGS INCORPORATED
  { ticker: "8160.T", sector: "Consumer Discretionary" }, // KISOJI CO.,LTD.
  { ticker: "8163.T", sector: "Consumer Discretionary" }, // SRS HOLDINGS CO.,LTD.
  { ticker: "8165.T", sector: "Consumer Discretionary" }, // SENSHUKAI CO.,LTD.
  { ticker: "8167.T", sector: "Consumer Discretionary" }, // RETAIL PARTNERS CO.,LTD.
  { ticker: "8173.T", sector: "Consumer Discretionary" }, // Joshin Corporation
  { ticker: "8179.T", sector: "Consumer Discretionary" }, // ROYAL HOLDINGS Co., Ltd.
  { ticker: "8185.T", sector: "Consumer Discretionary" }, // CHIYODA CO.,LTD.
  { ticker: "8194.T", sector: "Consumer Discretionary" }, // LIFE CORPORATION
  { ticker: "8200.T", sector: "Consumer Discretionary" }, // RINGER HUT CO.,LTD.
  { ticker: "8203.T", sector: "Consumer Discretionary" }, // MrMax Holdings Ltd.
  { ticker: "8214.T", sector: "Consumer Discretionary" }, // AOKI Holdings Inc.
  { ticker: "8217.T", sector: "Consumer Discretionary" }, // OKUWA CO.,LTD.
  { ticker: "8218.T", sector: "Consumer Discretionary" }, // KOMERI CO.,LTD.
  { ticker: "8219.T", sector: "Consumer Discretionary" }, // AOYAMA TRADING Co.,Ltd.
  { ticker: "8237.T", sector: "Consumer Discretionary" }, // MATSUYA CO.,LTD.
  { ticker: "8244.T", sector: "Consumer Discretionary" }, // Kintetsu Department Store CO.,Ltd.
  { ticker: "8255.T", sector: "Consumer Discretionary" }, // Axial Retailing Inc.
  { ticker: "8273.T", sector: "Consumer Discretionary" }, // IZUMI CO.,LTD.
  { ticker: "8276.T", sector: "Consumer Discretionary" }, // HEIWADO CO.,LTD.
  { ticker: "8278.T", sector: "Consumer Discretionary" }, // FUJI CO.,LTD.
  { ticker: "8281.T", sector: "Consumer Discretionary" }, // XEBIO holdings CO.,LTD.
  { ticker: "9262.T", sector: "Consumer Discretionary" }, // SILVER LIFE CO.,LTD.
  { ticker: "9267.T", sector: "Consumer Discretionary" }, // Genky DrugStores Co.,Ltd.
  { ticker: "9278.T", sector: "Consumer Discretionary" }, // BOOKOFF GROUP HOLDINGS LIMITED
  { ticker: "9279.T", sector: "Consumer Discretionary" }, // GIFT HOLDINGS INC.
  { ticker: "9828.T", sector: "Consumer Discretionary" }, // Genki Global Dining Concepts Corporation
  { ticker: "9842.T", sector: "Consumer Discretionary" }, // ARCLANDS CORPORATION
  { ticker: "9850.T", sector: "Consumer Discretionary" }, // GOURMET KINEYA CO.,LTD.
  { ticker: "9856.T", sector: "Consumer Discretionary" }, // KU HOLDINGS CO.,LTD.
  { ticker: "9887.T", sector: "Consumer Discretionary" }, // MATSUYA FOODS HOLDINGS CO.,LTD.
  { ticker: "9900.T", sector: "Consumer Discretionary" }, // Sagami Holdings Corporation
  { ticker: "9936.T", sector: "Consumer Discretionary" }, // OHSHO FOOD SERVICE CORP.
  { ticker: "9946.T", sector: "Consumer Discretionary" }, // MINISTOP CO.,LTD.
  { ticker: "9948.T", sector: "Consumer Discretionary" }, // ARCS COMPANY,LIMITED
  { ticker: "9956.T", sector: "Consumer Discretionary" }, // VALOR HOLDINGS CO.,LTD.
  { ticker: "9974.T", sector: "Consumer Discretionary" }, // Belc CO.,LTD.
  { ticker: "9979.T", sector: "Consumer Discretionary" }, // DAISYO CORPORATION
  { ticker: "9990.T", sector: "Consumer Discretionary" }, // SAC'S BAR HOLDINGS INC.
  { ticker: "9997.T", sector: "Consumer Discretionary" }, // BELLUNA CO.,LTD.

  // ── Consumer Staples ──
  { ticker: "1301.T", sector: "Consumer Staples" }, // KYOKUYO CO.,LTD.
  { ticker: "1375.T", sector: "Consumer Staples" }, // YUKIGUNI FACTORY CO.,LTD.
  { ticker: "1376.T", sector: "Consumer Staples" }, // KANEKO SEEDS CO.,LTD.
  { ticker: "1377.T", sector: "Consumer Staples" }, // SAKATA SEED CORPORATION
  { ticker: "1379.T", sector: "Consumer Staples" }, // HOKUTO CORPORATION
  { ticker: "2001.T", sector: "Consumer Staples" }, // NIPPN CORPORATION
  { ticker: "2003.T", sector: "Consumer Staples" }, // NITTO FUJI FLOUR MILLING CO.,LTD.
  { ticker: "2004.T", sector: "Consumer Staples" }, // Showa Sangyo Co.,Ltd.
  { ticker: "2053.T", sector: "Consumer Staples" }, // CHUBU SHIRYO CO.,LTD.
  { ticker: "2060.T", sector: "Consumer Staples" }, // FEED ONE CO.,LTD.
  { ticker: "2108.T", sector: "Consumer Staples" }, // Nippon Beet Sugar Manufacturing Co.,Ltd.
  { ticker: "2109.T", sector: "Consumer Staples" }, // Mitsui DM Sugar Co.,Ltd.
  { ticker: "2117.T", sector: "Consumer Staples" }, // WELLNEO SUGAR Co.,Ltd.
  { ticker: "2204.T", sector: "Consumer Staples" }, // NAKAMURAYA CO.,LTD.
  { ticker: "2207.T", sector: "Consumer Staples" }, // MEITO CO.,LTD.
  { ticker: "2209.T", sector: "Consumer Staples" }, // IMURAYA GROUP CO.,LTD.
  { ticker: "2211.T", sector: "Consumer Staples" }, // Fujiya Co.,Ltd.
  { ticker: "2217.T", sector: "Consumer Staples" }, // Morozoff Limited
  { ticker: "2220.T", sector: "Consumer Staples" }, // KAMEDA SEIKA CO.,LTD.
  { ticker: "2266.T", sector: "Consumer Staples" }, // ROKKO BUTTER CO.,LTD.
  { ticker: "2270.T", sector: "Consumer Staples" }, // MEGMILK SNOW BRAND Co.,Ltd.
  { ticker: "2281.T", sector: "Consumer Staples" }, // Prima Meat Packers,Ltd.
  { ticker: "2288.T", sector: "Consumer Staples" }, // MARUDAI FOOD CO.,LTD.
  { ticker: "2292.T", sector: "Consumer Staples" }, // S Foods Inc.
  { ticker: "2294.T", sector: "Consumer Staples" }, // Kakiyasu Honten Co.,Ltd.
  { ticker: "2296.T", sector: "Consumer Staples" }, // ITOHAM YONEKYU HOLDINGS INC.
  { ticker: "250A.T", sector: "Consumer Staples" }, // Shimadaya Corporation
  { ticker: "2533.T", sector: "Consumer Staples" }, // Oenon Holdings,Inc.
  { ticker: "2540.T", sector: "Consumer Staples" }, // YOMEISHU SEIZO CO.,LTD.
  { ticker: "2585.T", sector: "Consumer Staples" }, // LIFEDRINK COMPANY,INC.
  { ticker: "2590.T", sector: "Consumer Staples" }, // DyDo GROUP HOLDINGS,INC.
  { ticker: "2594.T", sector: "Consumer Staples" }, // KEY COFFEE INC
  { ticker: "2602.T", sector: "Consumer Staples" }, // The Nisshin OilliO Group,Ltd.
  { ticker: "2613.T", sector: "Consumer Staples" }, // J-OIL MILLS, INC.
  { ticker: "2804.T", sector: "Consumer Staples" }, // BULL-DOG SAUCE CO.,LTD.
  { ticker: "2815.T", sector: "Consumer Staples" }, // ARIAKE JAPAN Co.,Ltd.
  { ticker: "2819.T", sector: "Consumer Staples" }, // EBARA Foods Industry,Inc.
  { ticker: "2882.T", sector: "Consumer Staples" }, // EAT&HOLDINGS Co.,Ltd
  { ticker: "2884.T", sector: "Consumer Staples" }, // Yoshimura Food Holdings K.K.
  { ticker: "2908.T", sector: "Consumer Staples" }, // FUJICCO CO.,LTD.
  { ticker: "2910.T", sector: "Consumer Staples" }, // ROCK FIELD CO.,LTD.
  { ticker: "2915.T", sector: "Consumer Staples" }, // KENKO Mayonnaise Co.,Ltd.
  { ticker: "2918.T", sector: "Consumer Staples" }, // WARABEYA NICHIYO HOLDINGS CO.,LTD.
  { ticker: "2922.T", sector: "Consumer Staples" }, // NATORI CO.,LTD.
  { ticker: "2929.T", sector: "Consumer Staples" }, // Pharma Foods International Co.,Ltd.
  { ticker: "2931.T", sector: "Consumer Staples" }, // Euglena Co.,Ltd.
  { ticker: "2933.T", sector: "Consumer Staples" }, // KIBUN FOODS INC.
  { ticker: "2935.T", sector: "Consumer Staples" }, // PICKLES HOLDINGS CO.,LTD.
  { ticker: "409A.T", sector: "Consumer Staples" }, // ORION BREWERIES,LTD.
  { ticker: "4526.T", sector: "Consumer Staples" }, // RIKEN VITAMIN CO.,LTD.

  // ── Energy ──
  { ticker: "1514.T", sector: "Energy" }, // Sumiseki Holdings,Inc.
  { ticker: "1515.T", sector: "Energy" }, // Nittetsu Mining Co.,Ltd.
  { ticker: "1662.T", sector: "Energy" }, // Japan Petroleum Exploration Co.,Ltd.
  { ticker: "1663.T", sector: "Energy" }, // K&O Energy Group Inc.
  { ticker: "3315.T", sector: "Energy" }, // NIPPON COKE & ENGINEERING COMPANY,LIMITED
  { ticker: "5011.T", sector: "Energy" }, // NICHIREKI GROUP CO.,LTD.
  { ticker: "5013.T", sector: "Energy" }, // Yushiro Inc.

  // ── Financials ──
  { ticker: "471A.T", sector: "Financials" }, // NS Group,Inc.
  { ticker: "547A.T", sector: "Financials" }, // Muninova Holdings Inc.
  { ticker: "7148.T", sector: "Financials" }, // Financial Partners Group Co.,Ltd.
  { ticker: "7157.T", sector: "Financials" }, // LIFENET INSURANCE COMPANY
  { ticker: "7172.T", sector: "Financials" }, // Japan Investment Adviser Co.,Ltd.
  { ticker: "7173.T", sector: "Financials" }, // Tokyo Kiraboshi Financial Group,Inc.
  { ticker: "7184.T", sector: "Financials" }, // THE FIRST BANK OF TOYAMA,LTD.
  { ticker: "7187.T", sector: "Financials" }, // J-LEASE CO.,LTD.
  { ticker: "7198.T", sector: "Financials" }, // SBI ARUHI Corporation
  { ticker: "7199.T", sector: "Financials" }, // Premium Group Co.,Ltd.
  { ticker: "7322.T", sector: "Financials" }, // San ju San Financial Group,Inc.
  { ticker: "7327.T", sector: "Financials" }, // Daishi Hokuetsu Financial Group,Inc.
  { ticker: "7350.T", sector: "Financials" }, // Okinawa Financial Group,Inc.
  { ticker: "7380.T", sector: "Financials" }, // Juroku Financial Group,Inc.
  { ticker: "7381.T", sector: "Financials" }, // CCI Group,Inc.
  { ticker: "7383.T", sector: "Financials" }, // Net Protections Holdings,Inc.
  { ticker: "7384.T", sector: "Financials" }, // Procrea Holdings,Inc.
  { ticker: "7388.T", sector: "Financials" }, // FP Partner Inc.
  { ticker: "7389.T", sector: "Financials" }, // Aichi Financial Group,Inc.
  { ticker: "8336.T", sector: "Financials" }, // The Musashino Bank,Ltd.
  { ticker: "8337.T", sector: "Financials" }, // The Chiba Kogyo Bank,Ltd.
  { ticker: "8338.T", sector: "Financials" }, // Tsukuba Bank,Ltd.
  { ticker: "8343.T", sector: "Financials" }, // THE AKITA BANK,LTD.
  { ticker: "8344.T", sector: "Financials" }, // The Yamagata Bank,Ltd.
  { ticker: "8345.T", sector: "Financials" }, // The Bank of Iwate,Ltd.
  { ticker: "8346.T", sector: "Financials" }, // The Toho Bank,Ltd.
  { ticker: "8358.T", sector: "Financials" }, // Suruga Bank Ltd.
  { ticker: "8360.T", sector: "Financials" }, // The Yamanashi Chuo Bank,Ltd.
  { ticker: "8361.T", sector: "Financials" }, // The Ogaki Kyoritsu Bank,Ltd.
  { ticker: "8362.T", sector: "Financials" }, // The Fukui Bank,Ltd.
  { ticker: "8364.T", sector: "Financials" }, // THE SHIMIZU BANK,LTD.
  { ticker: "8366.T", sector: "Financials" }, // THE SHIGA BANK,LTD.
  { ticker: "8367.T", sector: "Financials" }, // The Nanto Bank,Ltd.
  { ticker: "8368.T", sector: "Financials" }, // The Hyakugo Bank,Ltd.
  { ticker: "8370.T", sector: "Financials" }, // The Kiyo Bank,Ltd.
  { ticker: "8381.T", sector: "Financials" }, // The San-in Godo Bank,Ltd.
  { ticker: "8386.T", sector: "Financials" }, // The Hyakujushi Bank,Ltd.
  { ticker: "8387.T", sector: "Financials" }, // The Shikoku Bank, Ltd.
  { ticker: "8388.T", sector: "Financials" }, // The Awa Bank,Ltd.
  { ticker: "8392.T", sector: "Financials" }, // THE OITA BANK,LTD.
  { ticker: "8393.T", sector: "Financials" }, // The Miyazaki Bank,Ltd.
  { ticker: "8395.T", sector: "Financials" }, // THE BANK OF SAGA LTD.
  { ticker: "8399.T", sector: "Financials" }, // Bank of The Ryukyus,Limited
  { ticker: "8425.T", sector: "Financials" }, // Mizuho Leasing Company,Limited
  { ticker: "8511.T", sector: "Financials" }, // Japan Securities Finance Co.,Ltd.
  { ticker: "8522.T", sector: "Financials" }, // The Bank of Nagoya,Ltd.
  { ticker: "8524.T", sector: "Financials" }, // North Pacific Bank,Ltd.
  { ticker: "8541.T", sector: "Financials" }, // The Ehime Bank,Ltd.
  { ticker: "8544.T", sector: "Financials" }, // The Keiyo Bank,Ltd.
  { ticker: "8550.T", sector: "Financials" }, // THE TOCHIGI BANK,LTD.
  { ticker: "8551.T", sector: "Financials" }, // The Kita-Nippon Bank,Ltd.
  { ticker: "8558.T", sector: "Financials" }, // THE TOWA BANK,LTD.
  { ticker: "8566.T", sector: "Financials" }, // RICOH LEASING COMPANY,LTD.
  { ticker: "8584.T", sector: "Financials" }, // JACCS CO.,LTD.
  { ticker: "8585.T", sector: "Financials" }, // Orient Corporation
  { ticker: "8600.T", sector: "Financials" }, // TOMONY Holdings,Inc.
  { ticker: "8609.T", sector: "Financials" }, // OKASAN SECURITIES GROUP INC.
  { ticker: "8613.T", sector: "Financials" }, // Marusan Securities Co.,Ltd.
  { ticker: "8614.T", sector: "Financials" }, // TOYO SECURITIES CO.,LTD.
  { ticker: "8616.T", sector: "Financials" }, // Tokai Tokyo Financial Holdings,Inc.
  { ticker: "8622.T", sector: "Financials" }, // Mito Securities Co.,Ltd.
  { ticker: "8624.T", sector: "Financials" }, // Ichiyoshi Securities Co.,Ltd.
  { ticker: "8628.T", sector: "Financials" }, // MATSUI SECURITIES CO.,LTD.
  { ticker: "8698.T", sector: "Financials" }, // Monex Group,Inc.
  { ticker: "8706.T", sector: "Financials" }, // KYOKUTO SECURITIES CO.,LTD.
  { ticker: "8707.T", sector: "Financials" }, // IwaiCosmo Holdings,Inc.
  { ticker: "8708.T", sector: "Financials" }, // AIZAWA SECURITIES GROUP CO.,LTD.
  { ticker: "8713.T", sector: "Financials" }, // FIDEA Holdings Co.Ltd.
  { ticker: "8714.T", sector: "Financials" }, // Senshu Ikeda Holdings,Inc.
  { ticker: "8715.T", sector: "Financials" }, // Anicom Holdings,Inc.
  { ticker: "8739.T", sector: "Financials" }, // SPARX Group Co.,Ltd.
  { ticker: "8771.T", sector: "Financials" }, // eGuarantee,Inc.
  { ticker: "8793.T", sector: "Financials" }, // NEC Capital Solutions Limited
  { ticker: "8798.T", sector: "Financials" }, // Advance Create Co.,Ltd.

  // ── Health Care ──
  { ticker: "4521.T", sector: "Health Care" }, // KAKEN PHARMACEUTICAL CO.,LTD.
  { ticker: "4534.T", sector: "Health Care" }, // Mochida Pharmaceutical Co.,Ltd.
  { ticker: "4538.T", sector: "Health Care" }, // Fuso Pharmaceutical Industries,Ltd.
  { ticker: "4547.T", sector: "Health Care" }, // KISSEI PHARMACEUTICAL CO.,LTD.
  { ticker: "4548.T", sector: "Health Care" }, // SEIKAGAKU CORPORATION
  { ticker: "4549.T", sector: "Health Care" }, // EIKEN CHEMICAL CO.,LTD.
  { ticker: "4552.T", sector: "Health Care" }, // JCR Pharmaceuticals Co.,Ltd.
  { ticker: "4553.T", sector: "Health Care" }, // TOWA PHARMACEUTICAL CO.,LTD.
  { ticker: "4554.T", sector: "Health Care" }, // Fuji Pharma Co.,Ltd.
  { ticker: "4559.T", sector: "Health Care" }, // ZERIA PHARMACEUTICAL CO.,LTD.
  { ticker: "4565.T", sector: "Health Care" }, // Nxera Pharma Co.,Ltd.
  { ticker: "4569.T", sector: "Health Care" }, // KYORIN Pharmaceutical Co.,Ltd.
  { ticker: "4574.T", sector: "Health Care" }, // TAIKO PHARMACEUTICAL CO.,LTD.
  { ticker: "4577.T", sector: "Health Care" }, // Daito Pharmaceutical Co.,Ltd.
  { ticker: "4880.T", sector: "Health Care" }, // CellSource Co.,Ltd.
  { ticker: "4886.T", sector: "Health Care" }, // ASKA Pharmaceutical Holdings Co.,Ltd.

  // ── Industrials ──
  { ticker: "1419.T", sector: "Industrials" }, // Tama Home Co.,Ltd.
  { ticker: "1518.T", sector: "Industrials" }, // MITSUI MATSUSHIMA HOLDINGS CO.,LTD.
  { ticker: "167A.T", sector: "Industrials" }, // Ryoyo Ryosan Holdings,Inc.
  { ticker: "1716.T", sector: "Industrials" }, // DAI-ICHI CUTTER KOGYO K.K.
  { ticker: "1720.T", sector: "Industrials" }, // TOKYU CONSTRUCTION CO., LTD.
  { ticker: "1726.T", sector: "Industrials" }, // Br.Holdings Corporation
  { ticker: "1762.T", sector: "Industrials" }, // TAKAMATSU CONSTRUCTION GROUP CO.,LTD.
  { ticker: "1766.T", sector: "Industrials" }, // TOKEN CORPORATION
  { ticker: "1780.T", sector: "Industrials" }, // YAMAURA CORPORATION
  { ticker: "1786.T", sector: "Industrials" }, // Oriental Shiraishi Corporation
  { ticker: "1810.T", sector: "Industrials" }, // MATSUI CONSTRUCTION CO.,LTD.
  { ticker: "1813.T", sector: "Industrials" }, // Fudo Tetra Corporation
  { ticker: "1815.T", sector: "Industrials" }, // TEKKEN CORPORATION
  { ticker: "1822.T", sector: "Industrials" }, // DAIHO CORPORATION
  { ticker: "1833.T", sector: "Industrials" }, // OKUMURA CORPORATION
  { ticker: "1835.T", sector: "Industrials" }, // TOTETSU KOGYO CO.,LTD.
  { ticker: "1852.T", sector: "Industrials" }, // ASANUMA CORPORATION
  { ticker: "1861.T", sector: "Industrials" }, // Kumagai Gumi Co.,Ltd.
  { ticker: "1870.T", sector: "Industrials" }, // YAHAGI CONSTRUCTION CO.,LTD.
  { ticker: "1871.T", sector: "Industrials" }, // PS Construction Co.,Ltd.
  { ticker: "1873.T", sector: "Industrials" }, // NIHON HOUSE HOLDINGS CO.,LTD.
  { ticker: "1879.T", sector: "Industrials" }, // SHINNIHON CORPORATION
  { ticker: "1882.T", sector: "Industrials" }, // TOA ROAD CORPORATION
  { ticker: "1885.T", sector: "Industrials" }, // TOA CORPORATION
  { ticker: "1887.T", sector: "Industrials" }, // JDC CORPORATION
  { ticker: "1888.T", sector: "Industrials" }, // WAKACHIKU CONSTRUCTION CO.,LTD.
  { ticker: "1898.T", sector: "Industrials" }, // SEIKITOKYU KOGYO CO.,LTD.
  { ticker: "1899.T", sector: "Industrials" }, // FUKUDA CORPORATION
  { ticker: "1926.T", sector: "Industrials" }, // RAITO KOGYO CO.,LTD.
  { ticker: "1929.T", sector: "Industrials" }, // NITTOC CONSTRUCTION CO.,LTD.
  { ticker: "1930.T", sector: "Industrials" }, // HOKURIKU ELECTRICAL CONSTRUCTION CO.,LTD.
  { ticker: "1934.T", sector: "Industrials" }, // YURTEC CORPORATION
  { ticker: "1938.T", sector: "Industrials" }, // NIPPON RIETEC CO.,LTD.
  { ticker: "1939.T", sector: "Industrials" }, // YONDENKO CORPORATION
  { ticker: "1941.T", sector: "Industrials" }, // CHUDENKO CORPORATION
  { ticker: "1945.T", sector: "Industrials" }, // TOKYO ENERGY & SYSTEMS INC.
  { ticker: "1946.T", sector: "Industrials" }, // TOENEC CORPORATION
  { ticker: "1950.T", sector: "Industrials" }, // NIPPON DENSETSU KOGYO CO.,LTD.
  { ticker: "1952.T", sector: "Industrials" }, // Shin Nippon Air Technologies Co.,Ltd.
  { ticker: "1961.T", sector: "Industrials" }, // SANKI ENGINEERING CO.,LTD.
  { ticker: "1964.T", sector: "Industrials" }, // Chugai Ro Co.,Ltd.
  { ticker: "1968.T", sector: "Industrials" }, // TAIHEI DENGYO KAISHA,LTD.
  { ticker: "1975.T", sector: "Industrials" }, // ASAHI KOGYOSHA CO.,LTD.
  { ticker: "1976.T", sector: "Industrials" }, // MEISEI INDUSTRIAL Co.,Ltd.
  { ticker: "1979.T", sector: "Industrials" }, // Taikisha Ltd.
  { ticker: "1980.T", sector: "Industrials" }, // DAI-DAN CO.,LTD.
  { ticker: "1982.T", sector: "Industrials" }, // Hibiya Engineering,Ltd.
  { ticker: "2120.T", sector: "Industrials" }, // LIFULL Co.,Ltd.
  { ticker: "2124.T", sector: "Industrials" }, // JAC Recruitment Co.,Ltd.
  { ticker: "212A.T", sector: "Industrials" }, // FIT EASY Inc.
  { ticker: "2130.T", sector: "Industrials" }, // Members Co.,Ltd.
  { ticker: "2146.T", sector: "Industrials" }, // UT Group Co.,Ltd.
  { ticker: "2148.T", sector: "Industrials" }, // ITmedia Inc.
  { ticker: "2153.T", sector: "Industrials" }, // E・J Holdings Inc.
  { ticker: "2154.T", sector: "Industrials" }, // Open Up Group Inc.
  { ticker: "2157.T", sector: "Industrials" }, // KOSHIDAKA HOLDINGS Co.,LTD.
  { ticker: "2168.T", sector: "Industrials" }, // Pasona Group Inc.
  { ticker: "2170.T", sector: "Industrials" }, // Link and Motivation Inc.
  { ticker: "2175.T", sector: "Industrials" }, // SMS CO.,LTD.
  { ticker: "2193.T", sector: "Industrials" }, // Cookpad Inc.
  { ticker: "2301.T", sector: "Industrials" }, // GAKUJO CO.,Ltd.
  { ticker: "2305.T", sector: "Industrials" }, // STUDIO ALICE Co.,Ltd.
  { ticker: "2325.T", sector: "Industrials" }, // NJS Co.,Ltd.
  { ticker: "2378.T", sector: "Industrials" }, // RENAISSANCE,INCORPORATED
  { ticker: "2379.T", sector: "Industrials" }, // dip Corporation
  { ticker: "2384.T", sector: "Industrials" }, // SBS Holdings,Inc.
  { ticker: "2395.T", sector: "Industrials" }, // SHIN NIPPON BIOMEDICAL LABORATORIES,LTD.
  { ticker: "2429.T", sector: "Industrials" }, // WORLD HOLDINGS CO.,LTD.
  { ticker: "2440.T", sector: "Industrials" }, // Gurunavi,Inc.
  { ticker: "2445.T", sector: "Industrials" }, // Takamiya Co.,Ltd.
  { ticker: "2461.T", sector: "Industrials" }, // FAN Communications,Inc.
  { ticker: "2462.T", sector: "Industrials" }, // LIKE,Inc.
  { ticker: "2471.T", sector: "Industrials" }, // S-Pool,Inc.
  { ticker: "2475.T", sector: "Industrials" }, // WDB HOLDINGS CO.,LTD.
  { ticker: "2489.T", sector: "Industrials" }, // Adways Inc.
  { ticker: "2491.T", sector: "Industrials" }, // ValueCommerce Co.,Ltd.
  { ticker: "2492.T", sector: "Industrials" }, // Infomart Corporation
  { ticker: "256A.T", sector: "Industrials" }, // TOBISHIMA HOLDINGS Inc.
  { ticker: "2676.T", sector: "Industrials" }, // TAKACHIHO KOHEKI CO.,LTD.
  { ticker: "2692.T", sector: "Industrials" }, // ITOCHU-SHOKUHIN Co.,Ltd.
  { ticker: "2733.T", sector: "Industrials" }, // ARATA CORPORATION
  { ticker: "2737.T", sector: "Industrials" }, // TOMEN DEVICES CORPORATION
  { ticker: "2749.T", sector: "Industrials" }, // JP-HOLDINGS,INC.
  { ticker: "2760.T", sector: "Industrials" }, // TOKYO ELECTRON DEVICE LIMITED
  { ticker: "2767.T", sector: "Industrials" }, // TSUBURAYA FIELDS HOLDINGS INC.
  { ticker: "2874.T", sector: "Industrials" }, // YOKOREI CO.,LTD.
  { ticker: "3023.T", sector: "Industrials" }, // Rasa Corporation
  { ticker: "3036.T", sector: "Industrials" }, // ALCONIX CORPORATION
  { ticker: "3076.T", sector: "Industrials" }, // Ai Holdings Corporation
  { ticker: "3139.T", sector: "Industrials" }, // Lacto Japan Co.,Ltd.
  { ticker: "3151.T", sector: "Industrials" }, // VITAL KSK HOLDINGS,INC.
  { ticker: "3153.T", sector: "Industrials" }, // Yashima Denki Co.,Ltd.
  { ticker: "3154.T", sector: "Industrials" }, // MEDIUS HOLDINGS Co.,Ltd.
  { ticker: "3156.T", sector: "Industrials" }, // Restar Corporation
  { ticker: "3167.T", sector: "Industrials" }, // TOKAI Holdings Corporation
  { ticker: "3176.T", sector: "Industrials" }, // Sanyo Trading Co.,Ltd.
  { ticker: "3180.T", sector: "Industrials" }, // BEAUTY GARAGE Inc.
  { ticker: "3183.T", sector: "Industrials" }, // WIN-Partners Co.,Ltd.
  { ticker: "3267.T", sector: "Industrials" }, // Phil Company,Inc.
  { ticker: "3388.T", sector: "Industrials" }, // MEIJI ELECTRIC INDUSTRIES CO.,LTD.
  { ticker: "3543.T", sector: "Industrials" }, // KOMEDA Holdings Co.,Ltd.
  { ticker: "3565.T", sector: "Industrials" }, // Ascentech K.K.
  { ticker: "4286.T", sector: "Industrials" }, // CL Holdings Inc.
  { ticker: "4290.T", sector: "Industrials" }, // Prestige International Inc.
  { ticker: "429A.T", sector: "Industrials" }, // Tekscend Photomask Corp.
  { ticker: "4301.T", sector: "Industrials" }, // AMUSE INC.
  { ticker: "4310.T", sector: "Industrials" }, // Dream Incubator Inc.
  { ticker: "4318.T", sector: "Industrials" }, // QUICK CO.,LTD.
  { ticker: "4331.T", sector: "Industrials" }, // TAKE AND GIVE. NEEDS Co.,Ltd.
  { ticker: "4337.T", sector: "Industrials" }, // PIA CORPORATION
  { ticker: "4343.T", sector: "Industrials" }, // AEON Fantasy Co.,LTD.
  { ticker: "4345.T", sector: "Industrials" }, // CTS Co.,Ltd.
  { ticker: "4433.T", sector: "Industrials" }, // HITO-Communications Holdings,Inc.
  { ticker: "4641.T", sector: "Industrials" }, // Altech Corporation
  { ticker: "4651.T", sector: "Industrials" }, // SANIX HOLDINGS INCORPORATED
  { ticker: "4658.T", sector: "Industrials" }, // Nippon Air Conditioning Services Co.,Ltd.
  { ticker: "4668.T", sector: "Industrials" }, // MEIKO NETWORK JAPAN CO.,LTD.
  { ticker: "4671.T", sector: "Industrials" }, // FALCO HOLDINGS Co.,Ltd.
  { ticker: "4694.T", sector: "Industrials" }, // BML,INC.
  { ticker: "4714.T", sector: "Industrials" }, // RISO KYOIKU GROUP CORPORATION
  { ticker: "4718.T", sector: "Industrials" }, // WASEDA ACADEMY CO.,LTD.
  { ticker: "4763.T", sector: "Industrials" }, // CREEK & RIVER Co.,Ltd.
  { ticker: "4765.T", sector: "Industrials" }, // SBI Global Asset Management Co.,Ltd.
  { ticker: "4767.T", sector: "Industrials" }, // TOW CO.,LTD.
  { ticker: "4784.T", sector: "Industrials" }, // GMO internet,Inc.
  { ticker: "4792.T", sector: "Industrials" }, // YAMADA Consulting Group Co.,Ltd.
  { ticker: "4801.T", sector: "Industrials" }, // CENTRAL SPORTS CO.,LTD.
  { ticker: "4848.T", sector: "Industrials" }, // FULLCAST HOLDINGS CO.,LTD.
  { ticker: "4849.T", sector: "Industrials" }, // en Inc.
  { ticker: "5074.T", sector: "Industrials" }, // TESS Holdings Co.,Ltd.
  { ticker: "544A.T", sector: "Industrials" }, // GMS Group Co.,Ltd.
  { ticker: "546A.T", sector: "Industrials" }, // MIRAINI HOLDINGS CO.,LTD.
  { ticker: "6013.T", sector: "Industrials" }, // TAKUMA CO.,LTD.
  { ticker: "6027.T", sector: "Industrials" }, // Bengo4.com,Inc.
  { ticker: "6035.T", sector: "Industrials" }, // IR Japan Holdings,Ltd.
  { ticker: "6036.T", sector: "Industrials" }, // KeePer Technical Laboratory Co.,Ltd.
  { ticker: "6047.T", sector: "Industrials" }, // Gunosy Inc.
  { ticker: "6050.T", sector: "Industrials" }, // E-Guardian Inc.
  { ticker: "6055.T", sector: "Industrials" }, // JAPAN MATERIAL Co.,Ltd.
  { ticker: "6058.T", sector: "Industrials" }, // VECTOR INC.
  { ticker: "6062.T", sector: "Industrials" }, // CHARM CARE CORPORATION
  { ticker: "6070.T", sector: "Industrials" }, // CAREERLINK CO.,LTD.
  { ticker: "6071.T", sector: "Industrials" }, // IBJ,Inc.
  { ticker: "6073.T", sector: "Industrials" }, // ASANTE INCORPORATED
  { ticker: "6078.T", sector: "Industrials" }, // Value HR Co.,Ltd.
  { ticker: "6080.T", sector: "Industrials" }, // M&A Capital Partners Co.,Ltd.
  { ticker: "6082.T", sector: "Industrials" }, // RIDE ON EXPRESS HOLDINGS Co.,Ltd.
  { ticker: "6088.T", sector: "Industrials" }, // SIGMAXYZ Holdings Inc.
  { ticker: "6089.T", sector: "Industrials" }, // WILL GROUP,INC.
  { ticker: "6099.T", sector: "Industrials" }, // ELAN Corporation
  { ticker: "6101.T", sector: "Industrials" }, // TSUGAMI CORPORATION
  { ticker: "6103.T", sector: "Industrials" }, // OKUMA Corporation
  { ticker: "6104.T", sector: "Industrials" }, // SHIBAURA MACHINE CO.,LTD.
  { ticker: "6118.T", sector: "Industrials" }, // AIDA ENGINEERING,LTD.
  { ticker: "6135.T", sector: "Industrials" }, // Makino Milling Machine Co.,Ltd.
  { ticker: "6140.T", sector: "Industrials" }, // Asahi Diamond Industrial Co.,Ltd.
  { ticker: "6143.T", sector: "Industrials" }, // Sodick Co.,Ltd.
  { ticker: "6151.T", sector: "Industrials" }, // NITTO KOHKI CO.,LTD.
  { ticker: "6157.T", sector: "Industrials" }, // NS TOOL CO.,LTD.
  { ticker: "6167.T", sector: "Industrials" }, // Fuji Die Co.,Ltd.
  { ticker: "6183.T", sector: "Industrials" }, // BELLSYSTEM24 HOLDINGS,INC.
  { ticker: "6184.T", sector: "Industrials" }, // Kamakura Shinsho,Ltd.
  { ticker: "6191.T", sector: "Industrials" }, // AirTrip Corp.
  { ticker: "6194.T", sector: "Industrials" }, // Atrae,Inc.
  { ticker: "6196.T", sector: "Industrials" }, // Strike Group Co.,Ltd.
  { ticker: "6197.T", sector: "Industrials" }, // Solasto Corporation
  { ticker: "6200.T", sector: "Industrials" }, // Insource Co.,Ltd.
  { ticker: "6209.T", sector: "Industrials" }, // NPR-RIKEN CORPORATION
  { ticker: "6222.T", sector: "Industrials" }, // SHIMA SEIKI MFG.,LTD.
  { ticker: "6235.T", sector: "Industrials" }, // OPTORUN CO.,LTD.
  { ticker: "6237.T", sector: "Industrials" }, // IWAKI CO.,LTD.
  { ticker: "6238.T", sector: "Industrials" }, // FURYU CORPORATION
  { ticker: "6240.T", sector: "Industrials" }, // YAMASHIN-FILTER CORP.
  { ticker: "6247.T", sector: "Industrials" }, // HISAKA WORKS,LTD.
  { ticker: "6250.T", sector: "Industrials" }, // YAMABIKO CORPORATION
  { ticker: "6254.T", sector: "Industrials" }, // Nomura Micro Science Co.,Ltd.
  { ticker: "6258.T", sector: "Industrials" }, // HIRATA Corporation
  { ticker: "6262.T", sector: "Industrials" }, // PEGASUS CO.,LTD.
  { ticker: "6264.T", sector: "Industrials" }, // Marumae Co.,Ltd.
  { ticker: "6266.T", sector: "Industrials" }, // TAZMO CO.,LTD.
  { ticker: "6272.T", sector: "Industrials" }, // RHEON AUTOMATIC MACHINERY CO.,LTD.
  { ticker: "6277.T", sector: "Industrials" }, // HOSOKAWA MICRON CORPORATION
  { ticker: "6278.T", sector: "Industrials" }, // UNION TOOL CO.
  { ticker: "6279.T", sector: "Industrials" }, // ZUIKO CORPORATION
  { ticker: "6282.T", sector: "Industrials" }, // OILES CORPORATION
  { ticker: "6284.T", sector: "Industrials" }, // NISSEI ASB MACHINE CO.,LTD.
  { ticker: "6287.T", sector: "Industrials" }, // SATO CORPORATION
  { ticker: "6289.T", sector: "Industrials" }, // GIKEN LTD.
  { ticker: "6291.T", sector: "Industrials" }, // AIRTECH JAPAN,LTD.
  { ticker: "6298.T", sector: "Industrials" }, // Y.A.C.HOLDINGS CO.,LTD.
  { ticker: "6306.T", sector: "Industrials" }, // NIKKO CO.,LTD.
  { ticker: "6309.T", sector: "Industrials" }, // TOMOE ENGINEERING CO.,LTD.(TOMOE KOGYO CO.,LTD.)
  { ticker: "6310.T", sector: "Industrials" }, // ISEKI & CO.,LTD.
  { ticker: "6315.T", sector: "Industrials" }, // TOWA CORPORATION
  { ticker: "6317.T", sector: "Industrials" }, // Kitagawa Corporation
  { ticker: "6324.T", sector: "Industrials" }, // Harmonic Drive Systems Inc.
  { ticker: "6328.T", sector: "Industrials" }, // EBARA JITSUGYO CO.,LTD.
  { ticker: "6330.T", sector: "Industrials" }, // TOYO ENGINEERING CORPORATION
  { ticker: "6331.T", sector: "Industrials" }, // Mitsubishi Kakoki Kaisha,Ltd.
  { ticker: "6332.T", sector: "Industrials" }, // TSUKISHIMA HOLDINGS CO.,LTD.
  { ticker: "6333.T", sector: "Industrials" }, // TEIKOKU CORPORATION
  { ticker: "6339.T", sector: "Industrials" }, // Sintokogio,Ltd.
  { ticker: "6340.T", sector: "Industrials" }, // SHIBUYA CORPORATION
  { ticker: "6345.T", sector: "Industrials" }, // AICHI CORPORATION
  { ticker: "6349.T", sector: "Industrials" }, // KOMORI CORPORATION
  { ticker: "6351.T", sector: "Industrials" }, // TSURUMI MANUFACTURING CO.,LTD.
  { ticker: "6358.T", sector: "Industrials" }, // SAKAI HEAVY INDUSTRIES,LTD.
  { ticker: "6363.T", sector: "Industrials" }, // Torishima Pump Mfg.Co.,Ltd.
  { ticker: "6364.T", sector: "Industrials" }, // AIRMAN CORPORATION
  { ticker: "6369.T", sector: "Industrials" }, // TOYO KANETSU K.K.
  { ticker: "6371.T", sector: "Industrials" }, // TSUBAKIMOTO CHAIN CO.
  { ticker: "6378.T", sector: "Industrials" }, // KIMURA CHEMICAL PLANTS CO.,LTD.
  { ticker: "6379.T", sector: "Industrials" }, // RAIZNEXT Corporation
  { ticker: "6381.T", sector: "Industrials" }, // ANEST IWATA Corporation
  { ticker: "6387.T", sector: "Industrials" }, // SAMCO INC.
  { ticker: "6395.T", sector: "Industrials" }, // TADANO LTD.
  { ticker: "6407.T", sector: "Industrials" }, // CKD Corporation
  { ticker: "6412.T", sector: "Industrials" }, // Heiwa Corporation
  { ticker: "6413.T", sector: "Industrials" }, // RISO KAGAKU CORPORATION
  { ticker: "6418.T", sector: "Industrials" }, // JAPAN CASH MACHINE CO.,LTD.
  { ticker: "6419.T", sector: "Industrials" }, // Mars Group Holdings Corporation
  { ticker: "6420.T", sector: "Industrials" }, // GALILEI CO.LTD.
  { ticker: "6430.T", sector: "Industrials" }, // DAIKOKU DENKI CO.,LTD.
  { ticker: "6432.T", sector: "Industrials" }, // TAKEUCHI MFG.CO.,LTD.
  { ticker: "6440.T", sector: "Industrials" }, // JUKI CORPORATION
  { ticker: "6445.T", sector: "Industrials" }, // JANOME Corporation
  { ticker: "6454.T", sector: "Industrials" }, // MAX CO.,LTD.
  { ticker: "6458.T", sector: "Industrials" }, // SINKO INDUSTRIES LTD.
  { ticker: "6459.T", sector: "Industrials" }, // DAIWA INDUSTRIES LTD.
  { ticker: "6463.T", sector: "Industrials" }, // TPR CO.,LTD.
  { ticker: "6464.T", sector: "Industrials" }, // TSUBAKI NAKASHIMA CO.,LTD.
  { ticker: "6470.T", sector: "Industrials" }, // TAIHO KOGYO CO.,LTD.
  { ticker: "6474.T", sector: "Industrials" }, // NACHI-FUJIKOSHI CORP.
  { ticker: "6480.T", sector: "Industrials" }, // NIPPON THOMPSON CO.,LTD.
  { ticker: "6482.T", sector: "Industrials" }, // Yushin Company
  { ticker: "6485.T", sector: "Industrials" }, // MAEZAWA KYUSO INDUSTRIES CO.,LTD.
  { ticker: "6486.T", sector: "Industrials" }, // EAGLE INDUSTRY CO.,LTD.
  { ticker: "6490.T", sector: "Industrials" }, // PILLAR Corporation
  { ticker: "6498.T", sector: "Industrials" }, // KITZ CORPORATION
  { ticker: "6533.T", sector: "Industrials" }, // Orchestra Holdings Inc.
  { ticker: "6535.T", sector: "Industrials" }, // i-mobile Co.,Ltd.
  { ticker: "6539.T", sector: "Industrials" }, // MATCHING SERVICE JAPAN CO.,LTD.
  { ticker: "6560.T", sector: "Industrials" }, // LTS,Inc.
  { ticker: "6564.T", sector: "Industrials" }, // MIDAC HOLDINGS CO.,LTD.
  { ticker: "6571.T", sector: "Industrials" }, // QB Net Holdings Co.,Ltd.
  { ticker: "6572.T", sector: "Industrials" }, // OPEN Group,Inc.
  { ticker: "7004.T", sector: "Industrials" }, // Kanadevia Corporation
  { ticker: "7033.T", sector: "Industrials" }, // Management Solutions Co.,Ltd.
  { ticker: "7034.T", sector: "Industrials" }, // Prored Partners CO.,LTD.
  { ticker: "7038.T", sector: "Industrials" }, // Frontier Management Inc.
  { ticker: "7071.T", sector: "Industrials" }, // Amvis Holdings,Inc.
  { ticker: "7085.T", sector: "Industrials" }, // CURVES HOLDINGS Co.,Ltd.
  { ticker: "7095.T", sector: "Industrials" }, // Macbee Planet,Inc.
  { ticker: "7128.T", sector: "Industrials" }, // UNISOL Holdings Corporation
  { ticker: "7130.T", sector: "Industrials" }, // YAMAE GROUP HOLDINGS CO.,LTD.
  { ticker: "7354.T", sector: "Industrials" }, // Direct Marketing MiX Inc.
  { ticker: "7358.T", sector: "Industrials" }, // Poppins Corporation
  { ticker: "7366.T", sector: "Industrials" }, // LITALICO Inc.
  { ticker: "7414.T", sector: "Industrials" }, // ONOKEN CO.,LTD.
  { ticker: "7433.T", sector: "Industrials" }, // Hakuto Co.,Ltd.
  { ticker: "7438.T", sector: "Industrials" }, // KONDOTEC INC.
  { ticker: "7447.T", sector: "Industrials" }, // NAGAILEBEN Co.,Ltd.
  { ticker: "7456.T", sector: "Industrials" }, // MATSUDA SANGYO Co.,Ltd.
  { ticker: "7466.T", sector: "Industrials" }, // SPK CORPORATION
  { ticker: "7480.T", sector: "Industrials" }, // SUZUDEN CORPORATION
  { ticker: "7482.T", sector: "Industrials" }, // SHIMOJIMA Co.,Ltd.
  { ticker: "7483.T", sector: "Industrials" }, // DOSHISHA CO.,LTD.
  { ticker: "7504.T", sector: "Industrials" }, // KOHSOKU CORPORATION
  { ticker: "7510.T", sector: "Industrials" }, // TAKEBISHI CORPORATION
  { ticker: "7525.T", sector: "Industrials" }, // RIX CORPORATION
  { ticker: "7537.T", sector: "Industrials" }, // MARUBUN CORPORATION
  { ticker: "7552.T", sector: "Industrials" }, // HAPPINET CORPORATION
  { ticker: "7570.T", sector: "Industrials" }, // HASHIMOTO SOGYO HOLDINGS CO.,LTD.
  { ticker: "7575.T", sector: "Industrials" }, // Japan Lifeline Co.,Ltd.
  { ticker: "7590.T", sector: "Industrials" }, // TAKASHO CO.,LTD.
  { ticker: "7599.T", sector: "Industrials" }, // IDOM Inc.
  { ticker: "7607.T", sector: "Industrials" }, // Shinwa Co.,Ltd.
  { ticker: "7609.T", sector: "Industrials" }, // Daitron Co.,Ltd.
  { ticker: "7613.T", sector: "Industrials" }, // SIIX CORPORATION
  { ticker: "7628.T", sector: "Industrials" }, // OHASHI TECHNICA INC.
  { ticker: "7637.T", sector: "Industrials" }, // Hakudo Co.,Ltd.
  { ticker: "7818.T", sector: "Industrials" }, // TRANSACTION CO.,Ltd.
  { ticker: "7820.T", sector: "Industrials" }, // NIHON FLUSH CO.,LTD.
  { ticker: "7821.T", sector: "Industrials" }, // MAEDA KOSEN CO.,LTD.
  { ticker: "7823.T", sector: "Industrials" }, // ARTNATURE INC.
  { ticker: "7826.T", sector: "Industrials" }, // FURUYA METAL CO.,LTD.
  { ticker: "7839.T", sector: "Industrials" }, // SHOEI CO.,LTD.
  { ticker: "7840.T", sector: "Industrials" }, // FRANCE BED HOLDINGS CO.,LTD.
  { ticker: "7856.T", sector: "Industrials" }, // HAGIHARA INDUSTRIES INC.
  { ticker: "7864.T", sector: "Industrials" }, // FUJI SEAL INTERNATIONAL,INC.
  { ticker: "7868.T", sector: "Industrials" }, // KOSAIDO Holdings Co.,Ltd.
  { ticker: "7893.T", sector: "Industrials" }, // PRONEXUS INC.
  { ticker: "7914.T", sector: "Industrials" }, // Kyodo Printing Co.,Ltd.
  { ticker: "7915.T", sector: "Industrials" }, // Nissha Co.,Ltd.
  { ticker: "7921.T", sector: "Industrials" }, // TAKARA & COMPANY LTD.
  { ticker: "7937.T", sector: "Industrials" }, // TSUTSUMI JEWELRY CO.,LTD.
  { ticker: "7944.T", sector: "Industrials" }, // Roland Corporation
  { ticker: "7949.T", sector: "Industrials" }, // KOMATSU WALL INDUSTRY CO.,LTD.
  { ticker: "7952.T", sector: "Industrials" }, // Kawai Musical Instruments Manufacturing Co.,Ltd.
  { ticker: "7955.T", sector: "Industrials" }, // Cleanup Corporation
  { ticker: "7962.T", sector: "Industrials" }, // KING JIM CO.,LTD.
  { ticker: "7966.T", sector: "Industrials" }, // LINTEC Corporation
  { ticker: "7972.T", sector: "Industrials" }, // ITOKI CORPORATION
  { ticker: "7976.T", sector: "Industrials" }, // MITSUBISHI PENCIL COMPANY,LIMITED
  { ticker: "7981.T", sector: "Industrials" }, // TAKARA STANDARD CO.,LTD.
  { ticker: "7987.T", sector: "Industrials" }, // NAKABAYASHI CO.,LTD.
  { ticker: "7990.T", sector: "Industrials" }, // GLOBERIDE,Inc.
  { ticker: "7994.T", sector: "Industrials" }, // OKAMURA CORPORATION
  { ticker: "8014.T", sector: "Industrials" }, // CHORI CO.,LTD.
  { ticker: "8018.T", sector: "Industrials" }, // SANKYO SEIKO CO.,LTD.
  { ticker: "8022.T", sector: "Industrials" }, // Mizuno Corporation
  { ticker: "8032.T", sector: "Industrials" }, // JAPAN PULP AND PAPER COMPANY LIMITED
  { ticker: "8037.T", sector: "Industrials" }, // KAMEI CORPORATION
  { ticker: "8043.T", sector: "Industrials" }, // Starzen Company Limited
  { ticker: "8051.T", sector: "Industrials" }, // YAMAZEN CORPORATION
  { ticker: "8052.T", sector: "Industrials" }, // TSUBAKIMOTO KOGYO CO.,LTD.
  { ticker: "8057.T", sector: "Industrials" }, // UCHIDA YOKO CO.,LTD.
  { ticker: "8059.T", sector: "Industrials" }, // DAIICHI JITSUGYO CO.,LTD.
  { ticker: "8061.T", sector: "Industrials" }, // SEIKA CORPORATION
  { ticker: "8065.T", sector: "Industrials" }, // SATO SHO-JI CORPORATION
  { ticker: "8070.T", sector: "Industrials" }, // TOKYO SANGYO CO.,LTD.
  { ticker: "8074.T", sector: "Industrials" }, // YUASA CO.,LTD.
  { ticker: "8075.T", sector: "Industrials" }, // Shinsho Corporation
  { ticker: "8078.T", sector: "Industrials" }, // HANWA CO.,LTD.
  { ticker: "8079.T", sector: "Industrials" }, // SHOEI FOODS CORPORATION
  { ticker: "8081.T", sector: "Industrials" }, // KANADEN CORPORATION
  { ticker: "8084.T", sector: "Industrials" }, // RYODEN CORPORATION
  { ticker: "8093.T", sector: "Industrials" }, // Kyokuto Boeki Kaisha,Limited
  { ticker: "8095.T", sector: "Industrials" }, // Astena Holdings Co.,Ltd.
  { ticker: "8097.T", sector: "Industrials" }, // SAN-AI OBBLI CO.,LTD.
  { ticker: "8098.T", sector: "Industrials" }, // Inabata & Co.,Ltd.
  { ticker: "8101.T", sector: "Industrials" }, // GSI Creos Corporation
  { ticker: "8103.T", sector: "Industrials" }, // Meiwa Corporation
  { ticker: "8125.T", sector: "Industrials" }, // Wakita & Co.,LTD.
  { ticker: "8130.T", sector: "Industrials" }, // Sangetsu Corporation
  { ticker: "8131.T", sector: "Industrials" }, // Mitsuuroko Group Holdings Co.,Ltd.
  { ticker: "8132.T", sector: "Industrials" }, // SINANEN HOLDINGS CO.,LTD.
  { ticker: "8133.T", sector: "Industrials" }, // ITOCHU ENEX CO.,LTD.
  { ticker: "8137.T", sector: "Industrials" }, // SUN-WA TECHNOS CORPORATION
  { ticker: "8141.T", sector: "Industrials" }, // Shinko Shoji Co.,Ltd.
  { ticker: "8142.T", sector: "Industrials" }, // TOHO Co.,Ltd.
  { ticker: "8150.T", sector: "Industrials" }, // SANSHIN ELECTRONICS CO.,LTD.
  { ticker: "8151.T", sector: "Industrials" }, // TOYO Corporation
  { ticker: "8153.T", sector: "Industrials" }, // MOS FOOD SERVICES,INC.
  { ticker: "8154.T", sector: "Industrials" }, // KAGA ELECTRONICS CO.,LTD.
  { ticker: "8158.T", sector: "Industrials" }, // SODA NIKKA CO.,LTD.
  { ticker: "8159.T", sector: "Industrials" }, // TACHIBANA ELETECH CO.,LTD.
  { ticker: "8275.T", sector: "Industrials" }, // FORVAL CORPORATION
  { ticker: "8285.T", sector: "Industrials" }, // MITANI SANGYO CO.,LTD.
  { ticker: "8920.T", sector: "Industrials" }, // TOSHO CO.,LTD.
  { ticker: "9010.T", sector: "Industrials" }, // FUJI KYUKO CO.,LTD.
  { ticker: "9025.T", sector: "Industrials" }, // Konoike Transport Co.,Ltd.
  { ticker: "9037.T", sector: "Industrials" }, // HAMAKYOREX CO.,LTD.
  { ticker: "9039.T", sector: "Industrials" }, // Sakai Moving Service Co.,Ltd.
  { ticker: "9046.T", sector: "Industrials" }, // Kobe Electric Railway Co.,Ltd.
  { ticker: "9052.T", sector: "Industrials" }, // Sanyo Electric Railway Co.,Ltd.
  { ticker: "9068.T", sector: "Industrials" }, // Maruzen Showa Unyu Co.,Ltd.
  { ticker: "9075.T", sector: "Industrials" }, // FUKUYAMA TRANSPORTING CO.,LTD.
  { ticker: "9081.T", sector: "Industrials" }, // Kanagawa Chuo Kotsu Co.,Ltd.
  { ticker: "9090.T", sector: "Industrials" }, // AZ-COM MARUWA Holdings Inc.
  { ticker: "9110.T", sector: "Industrials" }, // NS United Kaiun Kaisha,Ltd.
  { ticker: "9119.T", sector: "Industrials" }, // IINO KAIUN KAISHA,LTD.
  { ticker: "9216.T", sector: "Industrials" }, // Bewith,Inc.
  { ticker: "9229.T", sector: "Industrials" }, // SUNWELS Co.,Ltd.
  { ticker: "9247.T", sector: "Industrials" }, // TRE HOLDINGS CORPORATION
  { ticker: "9248.T", sector: "Industrials" }, // People, Dreams & Technologies Group Co.,Ltd.
  { ticker: "9273.T", sector: "Industrials" }, // KOA SHOJI HOLDINGS CO.,LTD.
  { ticker: "9274.T", sector: "Industrials" }, // KPP GROUP HOLDINGS CO.,LTD.
  { ticker: "9303.T", sector: "Industrials" }, // The Sumitomo Warehouse Co.,Ltd.
  { ticker: "9304.T", sector: "Industrials" }, // Shibusawa Logistics Corporation
  { ticker: "9305.T", sector: "Industrials" }, // Yamatane Corporation
  { ticker: "9308.T", sector: "Industrials" }, // Inui Global Logistics Co.,Ltd.
  { ticker: "9310.T", sector: "Industrials" }, // Japan Transcity Corporation
  { ticker: "9319.T", sector: "Industrials" }, // Chuo Warehouse Co.,Ltd.
  { ticker: "9324.T", sector: "Industrials" }, // Yasuda Logistics Corporation
  { ticker: "9332.T", sector: "Industrials" }, // NISSO HOLDINGS Co.,Ltd.
  { ticker: "9336.T", sector: "Industrials" }, // Daiei Kankyo Co.,Ltd.
  { ticker: "9341.T", sector: "Industrials" }, // GENOVA,Inc.
  { ticker: "9347.T", sector: "Industrials" }, // NIPPON KANZAI Holdings Co.,Ltd.
  { ticker: "9369.T", sector: "Industrials" }, // K.R.S.Corporation
  { ticker: "9381.T", sector: "Industrials" }, // AIT CORPORATION
  { ticker: "9552.T", sector: "Industrials" }, // Quants Research Institute Holdings,Inc.
  { ticker: "9603.T", sector: "Industrials" }, // H.I.S.Co.,Ltd.
  { ticker: "9612.T", sector: "Industrials" }, // LUCKLAND CO.,LTD.
  { ticker: "9619.T", sector: "Industrials" }, // ICHINEN HOLDINGS CO.,LTD.
  { ticker: "9621.T", sector: "Industrials" }, // CTI Engineering Co.,Ltd.
  { ticker: "9622.T", sector: "Industrials" }, // SPACE CO.,LTD.
  { ticker: "9628.T", sector: "Industrials" }, // SAN HOLDINGS,INC.
  { ticker: "9632.T", sector: "Industrials" }, // Subaru Enterprise Co.,Ltd.
  { ticker: "9644.T", sector: "Industrials" }, // TANABE CONSULTING GROUP CO.,LTD.
  { ticker: "9663.T", sector: "Industrials" }, // NAGAWA CO.,Ltd
  { ticker: "9672.T", sector: "Industrials" }, // TOKYOTOKEIBA CO.,LTD.
  { ticker: "9678.T", sector: "Industrials" }, // KANAMOTO CO.,LTD.
  { ticker: "9699.T", sector: "Industrials" }, // NISHIO HOLDINGS CO.,LTD.
  { ticker: "9715.T", sector: "Industrials" }, // transcosmos inc.
  { ticker: "9716.T", sector: "Industrials" }, // NOMURA Co.,Ltd.
  { ticker: "9722.T", sector: "Industrials" }, // FUJITA KANKO INC.
  { ticker: "9726.T", sector: "Industrials" }, // KNT-CT Holdings Co.,Ltd.
  { ticker: "9729.T", sector: "Industrials" }, // TOKAI Corp.
  { ticker: "9740.T", sector: "Industrials" }, // CENTRAL SECURITY PATROLS CO.,LTD.
  { ticker: "9743.T", sector: "Industrials" }, // TANSEISHA CO.,LTD.
  { ticker: "9755.T", sector: "Industrials" }, // OYO Corporation
  { ticker: "9757.T", sector: "Industrials" }, // Funai Soken Holdings Incorporated
  { ticker: "9769.T", sector: "Industrials" }, // GAKKYUSHA CO.,LTD.
  { ticker: "9788.T", sector: "Industrials" }, // NAC CO.,LTD.
  { ticker: "9793.T", sector: "Industrials" }, // Daiseki Co.,Ltd.
  { ticker: "9795.T", sector: "Industrials" }, // STEP CO.,LTD.
  { ticker: "9824.T", sector: "Industrials" }, // SENSHU ELECTRIC CO.,LTD.
  { ticker: "9830.T", sector: "Industrials" }, // TRUSCO NAKAYAMA CORPORATION
  { ticker: "9832.T", sector: "Industrials" }, // AUTOBACS SEVEN CO.,LTD.
  { ticker: "9837.T", sector: "Industrials" }, // MORITO CO.,LTD.
  { ticker: "9869.T", sector: "Industrials" }, // KATO SANGYO CO.,LTD.
  { ticker: "9882.T", sector: "Industrials" }, // YELLOW HAT LTD.
  { ticker: "9896.T", sector: "Industrials" }, // JK Holdings Co.,Ltd.
  { ticker: "9902.T", sector: "Industrials" }, // NICHIDEN Corporation
  { ticker: "9932.T", sector: "Industrials" }, // SUGIMOTO & CO.,LTD.
  { ticker: "9960.T", sector: "Industrials" }, // TOTECH CORPORATION
  { ticker: "9991.T", sector: "Industrials" }, // GECOSS CORPORATION

  // ── Information Technology ──
  { ticker: "268A.T", sector: "Information Technology" }, // Rigaku Holdings Corporation
  { ticker: "368A.T", sector: "Information Technology" }, // Kitazato Corporation
  { ticker: "6376.T", sector: "Information Technology" }, // NIKKISO CO.,LTD.
  { ticker: "6507.T", sector: "Information Technology" }, // SINFONIA TECHNOLOGY CO.,LTD.
  { ticker: "6508.T", sector: "Information Technology" }, // MEIDENSHA CORPORATION
  { ticker: "6516.T", sector: "Information Technology" }, // SANYO DENKI CO.,LTD.
  { ticker: "6517.T", sector: "Information Technology" }, // Denyo Co.,Ltd.
  { ticker: "6523.T", sector: "Information Technology" }, // PHC Holdings Corporation
  { ticker: "6588.T", sector: "Information Technology" }, // TOSHIBA TEC CORPORATION
  { ticker: "6590.T", sector: "Information Technology" }, // SHIBAURA MECHATRONICS CORPORATION
  { ticker: "6615.T", sector: "Information Technology" }, // UMC Electronics Co.,Ltd.
  { ticker: "6616.T", sector: "Information Technology" }, // TOREX SEMICONDUCTOR LTD.
  { ticker: "6617.T", sector: "Information Technology" }, // TAKAOKA TOKO CO.,LTD.
  { ticker: "6619.T", sector: "Information Technology" }, // W-SCOPE Corporation
  { ticker: "6622.T", sector: "Information Technology" }, // DAIHEN CORPORATION
  { ticker: "6630.T", sector: "Information Technology" }, // YA-MAN LTD.
  { ticker: "6638.T", sector: "Information Technology" }, // MIMAKI ENGINEERING CO.,LTD.
  { ticker: "6644.T", sector: "Information Technology" }, // Osaki Electric Co.,Ltd.
  { ticker: "6651.T", sector: "Information Technology" }, // NITTO KOGYO CORPORATION
  { ticker: "6652.T", sector: "Information Technology" }, // IDEC CORPORATION
  { ticker: "6676.T", sector: "Information Technology" }, // BUFFALO INC.
  { ticker: "6678.T", sector: "Information Technology" }, // Techno Medica Co.,Ltd.
  { ticker: "6699.T", sector: "Information Technology" }, // DIAMOND ELECTRIC HOLDINGS Co.,Ltd.
  { ticker: "6703.T", sector: "Information Technology" }, // Oki Electric Industry Company,Limited
  { ticker: "6706.T", sector: "Information Technology" }, // DKK Co.,Ltd.
  { ticker: "6718.T", sector: "Information Technology" }, // AIPHONE CO.,LTD.
  { ticker: "6727.T", sector: "Information Technology" }, // Wacom Co.,Ltd.
  { ticker: "6730.T", sector: "Information Technology" }, // AXELL CORPORATION
  { ticker: "6737.T", sector: "Information Technology" }, // EIZO Corporation
  { ticker: "6740.T", sector: "Information Technology" }, // Japan Display Inc.
  { ticker: "6741.T", sector: "Information Technology" }, // Nippon Signal Company,Limited
  { ticker: "6742.T", sector: "Information Technology" }, // Kyosan Electric Manufacturing Co.,Ltd.
  { ticker: "6744.T", sector: "Information Technology" }, // NOHMI BOSAI LTD.
  { ticker: "6745.T", sector: "Information Technology" }, // HOCHIKI CORPORATION
  { ticker: "6750.T", sector: "Information Technology" }, // ELECOM CO.,LTD.
  { ticker: "6763.T", sector: "Information Technology" }, // Teikoku Tsushin Kogyo Co.,Ltd.
  { ticker: "6768.T", sector: "Information Technology" }, // TAMURA CORPORATION
  { ticker: "6779.T", sector: "Information Technology" }, // NIHON DEMPA KOGYO CO.,LTD.
  { ticker: "6785.T", sector: "Information Technology" }, // SUZUKI CO.,LTD.
  { ticker: "6787.T", sector: "Information Technology" }, // Meiko Electronics Co.,Ltd.
  { ticker: "6788.T", sector: "Information Technology" }, // NIHON TRIM CO.,LTD.
  { ticker: "6794.T", sector: "Information Technology" }, // Foster Electric Company,Limited
  { ticker: "6798.T", sector: "Information Technology" }, // SMK Corporation
  { ticker: "6800.T", sector: "Information Technology" }, // YOKOWO CO.,LTD.
  { ticker: "6804.T", sector: "Information Technology" }, // Hosiden Corporation
  { ticker: "6807.T", sector: "Information Technology" }, // Japan Aviation Electronics Industry,Limited
  { ticker: "6809.T", sector: "Information Technology" }, // TOA CORPORATION
  { ticker: "6810.T", sector: "Information Technology" }, // Maxell,Ltd.
  { ticker: "6814.T", sector: "Information Technology" }, // FURUNO ELECTRIC CO.,LTD.
  { ticker: "6817.T", sector: "Information Technology" }, // SUMIDA CORPORATION
  { ticker: "6820.T", sector: "Information Technology" }, // ICOM INCORPORATED
  { ticker: "6823.T", sector: "Information Technology" }, // RION CO.,LTD.
  { ticker: "6844.T", sector: "Information Technology" }, // Shindengen Electric Manufacturing Co.,Ltd.
  { ticker: "6850.T", sector: "Information Technology" }, // Chino Corporation
  { ticker: "6855.T", sector: "Information Technology" }, // JAPAN ELECTRONIC MATERIALS CORPORATION
  { ticker: "6859.T", sector: "Information Technology" }, // ESPEC CORP.
  { ticker: "6866.T", sector: "Information Technology" }, // HIOKI E.E.CORPORATION
  { ticker: "6871.T", sector: "Information Technology" }, // MICRONICS JAPAN CO.,LTD.
  { ticker: "6875.T", sector: "Information Technology" }, // MegaChips Corporation
  { ticker: "6877.T", sector: "Information Technology" }, // Obara Group Incorporated
  { ticker: "6905.T", sector: "Information Technology" }, // COSEL CO.,LTD.
  { ticker: "6908.T", sector: "Information Technology" }, // IRISO ELECTRONICS CO.,LTD.
  { ticker: "6914.T", sector: "Information Technology" }, // OPTEX GROUP Company,Limited
  { ticker: "6915.T", sector: "Information Technology" }, // CHIYODA INTEGRE CO.,LTD.
  { ticker: "6929.T", sector: "Information Technology" }, // NIPPON CERAMIC CO.,LTD.
  { ticker: "6941.T", sector: "Information Technology" }, // YAMAICHI ELECTRONICS CO.,LTD.
  { ticker: "6947.T", sector: "Information Technology" }, // ZUKEN INC.
  { ticker: "6958.T", sector: "Information Technology" }, // CMK CORPORATION
  { ticker: "6961.T", sector: "Information Technology" }, // ENPLAS CORPORATION
  { ticker: "6962.T", sector: "Information Technology" }, // DAISHINKU CORP.
  { ticker: "6966.T", sector: "Information Technology" }, // Mitsui High-tec,Inc.
  { ticker: "6986.T", sector: "Information Technology" }, // FUTABA CORPORATION
  { ticker: "6996.T", sector: "Information Technology" }, // NICHICON CORPORATION
  { ticker: "6997.T", sector: "Information Technology" }, // NIPPON CHEMI-CON CORPORATION
  { ticker: "6999.T", sector: "Information Technology" }, // KOA CORPORATION
  { ticker: "7244.T", sector: "Information Technology" }, // ICHIKOH INDUSTRIES,LTD.
  { ticker: "7280.T", sector: "Information Technology" }, // MITSUBA Corporation
  { ticker: "7600.T", sector: "Information Technology" }, // Japan Medical Dynamic Marketing,INC.
  { ticker: "7702.T", sector: "Information Technology" }, // JMS CO.,LTD.
  { ticker: "7715.T", sector: "Information Technology" }, // NAGANO KEIKI CO.,LTD.
  { ticker: "7717.T", sector: "Information Technology" }, // V Technology Co.,Ltd.
  { ticker: "7721.T", sector: "Information Technology" }, // TOKYO KEIKI INC.
  { ticker: "7723.T", sector: "Information Technology" }, // Aichi Tokei Denki Co.,Ltd.
  { ticker: "7725.T", sector: "Information Technology" }, // INTER ACTION Corporation
  { ticker: "7730.T", sector: "Information Technology" }, // MANI,INC.
  { ticker: "7734.T", sector: "Information Technology" }, // RIKEN KEIKI CO.,LTD.
  { ticker: "7740.T", sector: "Information Technology" }, // Tamron Co.,Ltd.
  { ticker: "7744.T", sector: "Information Technology" }, // Noritsu Koki Co.,Ltd.
  { ticker: "7745.T", sector: "Information Technology" }, // A&D HOLON Holdings Company,Limited
  { ticker: "7762.T", sector: "Information Technology" }, // Citizen Watch Co.,Ltd.
  { ticker: "7780.T", sector: "Information Technology" }, // Menicon Co.,Ltd.
  { ticker: "7965.T", sector: "Information Technology" }, // Zojirushi Corporation
  { ticker: "7979.T", sector: "Information Technology" }, // SHOFU INC.
  { ticker: "8050.T", sector: "Information Technology" }, // SEIKO GROUP CORPORATION
  { ticker: "9880.T", sector: "Information Technology" }, // INNOTECH CORPORATION

  // ── Materials ──
  { ticker: "2930.T", sector: "Materials" }, // Kitanotatsujin Corporation
  { ticker: "3101.T", sector: "Materials" }, // TOYOBO CO.,LTD.
  { ticker: "3110.T", sector: "Materials" }, // NITTO BOSEKI CO.,LTD.
  { ticker: "3421.T", sector: "Materials" }, // INABA SEISAKUSHO Co.,Ltd.
  { ticker: "3431.T", sector: "Materials" }, // MIYAJI ENGINEERING GROUP,INC.
  { ticker: "3433.T", sector: "Materials" }, // TOCALO Co.,Ltd.
  { ticker: "3443.T", sector: "Materials" }, // KAWADA TECHNOLOGIES,INC.
  { ticker: "3445.T", sector: "Materials" }, // RS Technologies Co.,Ltd.
  { ticker: "3708.T", sector: "Materials" }, // Tokushu Tokai Paper Co.,Ltd.
  { ticker: "3863.T", sector: "Materials" }, // Nippon Paper Industries Co.,Ltd.
  { ticker: "3865.T", sector: "Materials" }, // Hokuetsu Corporation
  { ticker: "3880.T", sector: "Materials" }, // Daio Paper Corporation
  { ticker: "3946.T", sector: "Materials" }, // TOMOKU CO.,LTD.
  { ticker: "3950.T", sector: "Materials" }, // THE PACK CORPORATION
  { ticker: "4008.T", sector: "Materials" }, // Sumitomo Seika Chemicals Company,Limited.
  { ticker: "4022.T", sector: "Materials" }, // Rasa Industries,Ltd.
  { ticker: "4023.T", sector: "Materials" }, // KUREHA CORPORATION
  { ticker: "4025.T", sector: "Materials" }, // TAKI CHEMICAL CO.,LTD.
  { ticker: "4027.T", sector: "Materials" }, // TAYCA CORPORATION
  { ticker: "4028.T", sector: "Materials" }, // ISHIHARA SANGYO KAISHA,LTD.
  { ticker: "4041.T", sector: "Materials" }, // Nippon Soda Co.,Ltd.
  { ticker: "4044.T", sector: "Materials" }, // Central Glass Co.,Ltd.
  { ticker: "4046.T", sector: "Materials" }, // OSAKA SODA CO.,LTD.
  { ticker: "4047.T", sector: "Materials" }, // KANTO DENKA KOGYO CO.,LTD.
  { ticker: "4064.T", sector: "Materials" }, // Nippon Carbide Industries Company,Incorporated
  { ticker: "4078.T", sector: "Materials" }, // Sakai Chemical Industry Co.,Ltd.
  { ticker: "4082.T", sector: "Materials" }, // DAIICHI KIGENSO KAGAKU-KOGYO CO.,LTD
  { ticker: "4092.T", sector: "Materials" }, // Nippon Chemical Industrial Co.,Ltd.
  { ticker: "4095.T", sector: "Materials" }, // NIHON PARKERIZING CO.,LTD.
  { ticker: "4097.T", sector: "Materials" }, // KOATSU GAS KOGYO CO.,LTD.
  { ticker: "4099.T", sector: "Materials" }, // SHIKOKU KASEI HOLDINGS CORPORATION
  { ticker: "4100.T", sector: "Materials" }, // TODA KOGYO CORP.
  { ticker: "4109.T", sector: "Materials" }, // STELLA CHEMIFA CORPORATION
  { ticker: "4112.T", sector: "Materials" }, // Hodogaya Chemical Co.,Ltd.
  { ticker: "4116.T", sector: "Materials" }, // Dainichiseika Color & Chemicals Mfg.Co.,Ltd.
  { ticker: "4187.T", sector: "Materials" }, // OSAKA ORGANIC CHEMICAL INDUSTRY LTD.
  { ticker: "4189.T", sector: "Materials" }, // KH Neochem Co.,Ltd.
  { ticker: "4212.T", sector: "Materials" }, // Sekisui Jushi Corporation
  { ticker: "4216.T", sector: "Materials" }, // ASAHI YUKIZAI CORPORATION
  { ticker: "4218.T", sector: "Materials" }, // NICHIBAN CO.,LTD.
  { ticker: "4220.T", sector: "Materials" }, // RIKEN TECHNOS CORPORATION
  { ticker: "4221.T", sector: "Materials" }, // Okura Industrial Co.,Ltd.
  { ticker: "4228.T", sector: "Materials" }, // Sekisui Kasei Co.,Ltd.
  { ticker: "4229.T", sector: "Materials" }, // Gun Ei Chemical Industry Co.,Ltd.
  { ticker: "4246.T", sector: "Materials" }, // DaikyoNishikawa Corporation
  { ticker: "4249.T", sector: "Materials" }, // MORIROKU COMPANY,LTD.
  { ticker: "4251.T", sector: "Materials" }, // KEIWA Incorporated
  { ticker: "4275.T", sector: "Materials" }, // Carlit Co.,Ltd.
  { ticker: "4362.T", sector: "Materials" }, // Nippon Fine Chemical Co.,Ltd.
  { ticker: "4368.T", sector: "Materials" }, // FUSO CHEMICAL CO.,LTD.
  { ticker: "4369.T", sector: "Materials" }, // Tri Chemical Laboratories Inc.
  { ticker: "4410.T", sector: "Materials" }, // HARIMA CHEMICALS GROUP,INC.
  { ticker: "4461.T", sector: "Materials" }, // DKS Co.Ltd.
  { ticker: "4462.T", sector: "Materials" }, // ISHIHARA CHEMICAL CO.,LTD.
  { ticker: "4471.T", sector: "Materials" }, // SANYO CHEMICAL INDUSTRIES,LTD.
  { ticker: "4611.T", sector: "Materials" }, // Dai Nippon Toryo Company,Limited
  { ticker: "4617.T", sector: "Materials" }, // Chugoku Marine Paints,Ltd.
  { ticker: "4620.T", sector: "Materials" }, // FUJIKURA KASEI CO.,LTD.
  { ticker: "4633.T", sector: "Materials" }, // SAKATA INX CORPORATION
  { ticker: "4634.T", sector: "Materials" }, // artience Co.,Ltd.
  { ticker: "4914.T", sector: "Materials" }, // TAKASAGO INTERNATIONAL CORPORATION
  { ticker: "4917.T", sector: "Materials" }, // MANDOM CORPORATION
  { ticker: "4919.T", sector: "Materials" }, // Milbon Co.,Ltd.
  { ticker: "4923.T", sector: "Materials" }, // COTA CO.,LTD.
  { ticker: "4928.T", sector: "Materials" }, // Noevir Holdings Co.,Ltd.
  { ticker: "4931.T", sector: "Materials" }, // Shinnihonseiyaku Co.,Ltd.
  { ticker: "4933.T", sector: "Materials" }, // I-ne CO.,LTD.
  { ticker: "4936.T", sector: "Materials" }, // AXXZIA Inc.
  { ticker: "4951.T", sector: "Materials" }, // S.T.CORPORATION
  { ticker: "4956.T", sector: "Materials" }, // KONISHI CO.,LTD.
  { ticker: "4958.T", sector: "Materials" }, // T.HASEGAWA CO.,LTD.
  { ticker: "4968.T", sector: "Materials" }, // ARAKAWA CHEMICAL INDUSTRIES,LTD.
  { ticker: "4971.T", sector: "Materials" }, // MEC COMPANY LTD.
  { ticker: "4973.T", sector: "Materials" }, // JAPAN PURE CHEMICAL CO.,LTD.
  { ticker: "4974.T", sector: "Materials" }, // TAKARA BIO INC.
  { ticker: "4975.T", sector: "Materials" }, // JCU CORPORATION
  { ticker: "4979.T", sector: "Materials" }, // OAT Agrio Co.,Ltd.
  { ticker: "4985.T", sector: "Materials" }, // Earth Corporation
  { ticker: "4992.T", sector: "Materials" }, // HOKKO CHEMICAL INDUSTRY CO.,LTD.
  { ticker: "4994.T", sector: "Materials" }, // Taisei Lamick Group Head Quarter & Innovation Co.,Ltd.
  { ticker: "4996.T", sector: "Materials" }, // KUMIAI CHEMICAL INDUSTRY CO.,LTD.
  { ticker: "4997.T", sector: "Materials" }, // NIHON NOHYAKU CO.,LTD.
  { ticker: "5142.T", sector: "Materials" }, // Achilles Corporation
  { ticker: "5202.T", sector: "Materials" }, // Nippon Sheet Glass Company,Limited
  { ticker: "5208.T", sector: "Materials" }, // Arisawa Mfg.Co.,Ltd.
  { ticker: "5218.T", sector: "Materials" }, // OHARA INC.
  { ticker: "5262.T", sector: "Materials" }, // Nippon Hume Corporation
  { ticker: "5269.T", sector: "Materials" }, // NIPPON CONCRETE INDUSTRIES CO.,LTD.
  { ticker: "5273.T", sector: "Materials" }, // MITANI SEKISAN CO.,LTD.
  { ticker: "5288.T", sector: "Materials" }, // ASIA PILE HOLDINGS CORPORATION
  { ticker: "5302.T", sector: "Materials" }, // Nippon Carbon Co.,Ltd.
  { ticker: "5310.T", sector: "Materials" }, // TOYO TANSO CO.,LTD.
  { ticker: "5331.T", sector: "Materials" }, // NORITAKE CO.,LIMITED
  { ticker: "5351.T", sector: "Materials" }, // SHINAGAWA REFRA CO.,LTD.
  { ticker: "5357.T", sector: "Materials" }, // YOTAI REFRACTORIES CO.,LTD.
  { ticker: "5384.T", sector: "Materials" }, // FUJIMI INCORPORATED
  { ticker: "5408.T", sector: "Materials" }, // NAKAYAMA STEEL WORKS,LTD.
  { ticker: "5410.T", sector: "Materials" }, // Godo Steel,Ltd.
  { ticker: "5423.T", sector: "Materials" }, // TOKYO STEEL MANUFACTURING CO.,LTD.
  { ticker: "5440.T", sector: "Materials" }, // KYOEI STEEL LTD.
  { ticker: "5445.T", sector: "Materials" }, // TOKYO TEKKO CO.,LTD.
  { ticker: "5449.T", sector: "Materials" }, // OSAKA STEEL CO.,LTD.
  { ticker: "5451.T", sector: "Materials" }, // YODOKO,Ltd.
  { ticker: "5461.T", sector: "Materials" }, // Chubu Steel Plate Co.,Ltd.
  { ticker: "5464.T", sector: "Materials" }, // MORY INDUSTRIES INC.
  { ticker: "5480.T", sector: "Materials" }, // Nippon Yakin kogyo Co.,Ltd.
  { ticker: "5482.T", sector: "Materials" }, // AICHI STEEL CORPORATION
  { ticker: "5541.T", sector: "Materials" }, // PACIFIC METALS CO.,LTD.
  { ticker: "5563.T", sector: "Materials" }, // Nippon Denko Co.,Ltd.
  { ticker: "5602.T", sector: "Materials" }, // Kurimoto,Ltd.
  { ticker: "5632.T", sector: "Materials" }, // Mitsubishi Steel Mfg.Co.,Ltd.
  { ticker: "5659.T", sector: "Materials" }, // Nippon Seisen Co.,Ltd.
  { ticker: "5698.T", sector: "Materials" }, // ENVIPRO HOLDINGS Inc.
  { ticker: "5702.T", sector: "Materials" }, // DAIKI ALUMINIUM INDUSTRY CO.,LTD.
  { ticker: "5703.T", sector: "Materials" }, // Nippon Light Metal Holdings Company,Ltd.
  { ticker: "5707.T", sector: "Materials" }, // Toho Zinc Co.,Ltd.
  { ticker: "5715.T", sector: "Materials" }, // FURUKAWA CO.,LTD.
  { ticker: "5726.T", sector: "Materials" }, // OSAKA Titanium technologies Co.,Ltd.
  { ticker: "5727.T", sector: "Materials" }, // TOHO TITANIUM COMPANY,LIMITED
  { ticker: "5741.T", sector: "Materials" }, // UACJ Corporation
  { ticker: "5757.T", sector: "Materials" }, // CK SAN-ETSU Co.,Ltd.
  { ticker: "5805.T", sector: "Materials" }, // SWCC Corporation
  { ticker: "5821.T", sector: "Materials" }, // HIRAKAWA HEWTECH CORP.
  { ticker: "5851.T", sector: "Materials" }, // RYOBI LIMITED
  { ticker: "5857.T", sector: "Materials" }, // ARE Holdings,Inc.
  { ticker: "5902.T", sector: "Materials" }, // HOKKAN HOLDINGS LIMITED
  { ticker: "5909.T", sector: "Materials" }, // CORONA CORPORATION
  { ticker: "5911.T", sector: "Materials" }, // Yokogawa Bridge Holdings Corp.
  { ticker: "5930.T", sector: "Materials" }, // Bunka Shutter Co.,Ltd.
  { ticker: "5932.T", sector: "Materials" }, // Sankyo Tateyama,Inc.
  { ticker: "5933.T", sector: "Materials" }, // ALINCO INCORPORATED
  { ticker: "5943.T", sector: "Materials" }, // NORITZ CORPORATION
  { ticker: "5946.T", sector: "Materials" }, // CHOFU SEISAKUSHO CO.,LTD.
  { ticker: "5957.T", sector: "Materials" }, // NITTOSEIKO CO.,LTD.
  { ticker: "5959.T", sector: "Materials" }, // OKABE CO.,LTD.
  { ticker: "5970.T", sector: "Materials" }, // G-TEKT CORPORATION
  { ticker: "5975.T", sector: "Materials" }, // Topre Corporation
  { ticker: "5976.T", sector: "Materials" }, // Neturen Co.,Ltd.
  { ticker: "5981.T", sector: "Materials" }, // TOKYO ROPE MFG.CO.,LTD
  { ticker: "5985.T", sector: "Materials" }, // SUNCALL CORPORATION
  { ticker: "5988.T", sector: "Materials" }, // PIOLAX,INC.
  { ticker: "5989.T", sector: "Materials" }, // H-ONE CO.,LTD.
  { ticker: "5992.T", sector: "Materials" }, // CHUO SPRING CO.,LTD.
  { ticker: "7874.T", sector: "Materials" }, // LEC,INC.
  { ticker: "7888.T", sector: "Materials" }, // SANKO GOSEI LTD.
  { ticker: "7917.T", sector: "Materials" }, // ZACROS Corporation
  { ticker: "7925.T", sector: "Materials" }, // MAEZAWA KASEI INDUSTRIES CO.,LTD.
  { ticker: "7931.T", sector: "Materials" }, // MIRAI INDUSTRY CO.,LTD.
  { ticker: "7942.T", sector: "Materials" }, // JSP Corporation
  { ticker: "7943.T", sector: "Materials" }, // NICHIHA CORPORATION
  { ticker: "7947.T", sector: "Materials" }, // FP CORPORATION
  { ticker: "7970.T", sector: "Materials" }, // Shin-Etsu Polymer Co.,Ltd.
  { ticker: "7989.T", sector: "Materials" }, // TACHIKAWA CORPORATION
  { ticker: "7995.T", sector: "Materials" }, // VALQUA,LTD.

  // ── Real Estate ──
  { ticker: "1435.T", sector: "Real Estate" }, // robot home Inc.
  { ticker: "2337.T", sector: "Real Estate" }, // Ichigo Inc.
  { ticker: "2353.T", sector: "Real Estate" }, // NIPPON PARKING DEVELOPMENT Co.,Ltd.
  { ticker: "2975.T", sector: "Real Estate" }, // Star Mica Holdings Co.,Ltd.
  { ticker: "2980.T", sector: "Real Estate" }, // SRE Holdings Corporation
  { ticker: "3232.T", sector: "Real Estate" }, // Mie Kotsu Group Holdings,Inc.
  { ticker: "3245.T", sector: "Real Estate" }, // DEAR LIFE CO.,LTD.
  { ticker: "3252.T", sector: "Real Estate" }, // JINUSHI Co.,Ltd.
  { ticker: "3276.T", sector: "Real Estate" }, // Japan Property Management Center Co.,Ltd.
  { ticker: "3284.T", sector: "Real Estate" }, // Hoosiers Holdings Co.,Ltd.
  { ticker: "3457.T", sector: "Real Estate" }, // &Do Holdings Co.,Ltd.
  { ticker: "3465.T", sector: "Real Estate" }, // KI-STAR REAL ESTATE CO.,LTD
  { ticker: "3475.T", sector: "Real Estate" }, // Good Com Asset Co.,Ltd.
  { ticker: "3480.T", sector: "Real Estate" }, // J.S.B.Co.,Ltd.
  { ticker: "3482.T", sector: "Real Estate" }, // Loadstar Capital K.K.
  { ticker: "3496.T", sector: "Real Estate" }, // AZOOM CO.,LTD
  { ticker: "3498.T", sector: "Real Estate" }, // Kasumigaseki Capital Co.,Ltd.
  { ticker: "4809.T", sector: "Real Estate" }, // Paraca Inc.
  { ticker: "6620.T", sector: "Real Estate" }, // Miyakoshi Holdings,Inc.
  { ticker: "8803.T", sector: "Real Estate" }, // HEIWA REAL ESTATE CO.,LTD.
  { ticker: "8818.T", sector: "Real Estate" }, // Keihanshin Building Co.,Ltd.
  { ticker: "8841.T", sector: "Real Estate" }, // TOC Co.,Ltd.
  { ticker: "8848.T", sector: "Real Estate" }, // LEOPALACE21 CORPORATION
  { ticker: "8850.T", sector: "Real Estate" }, // STARTS CORPORATION INC.
  { ticker: "8860.T", sector: "Real Estate" }, // FUJI CORPORATION LIMITED
  { ticker: "8864.T", sector: "Real Estate" }, // AIRPORT FACILITIES Co.,LTD.
  { ticker: "8869.T", sector: "Real Estate" }, // Meiwa Estate Company Limited
  { ticker: "8871.T", sector: "Real Estate" }, // GOLDCREST Co.,Ltd.
  { ticker: "8877.T", sector: "Real Estate" }, // ESLEAD CORPORATION
  { ticker: "8881.T", sector: "Real Estate" }, // NISSHIN GROUP HOLDINGS Company,Limited
  { ticker: "8892.T", sector: "Real Estate" }, // ES-CON JAPAN Ltd.
  { ticker: "8897.T", sector: "Real Estate" }, // MIRARTH HOLDINGS,Inc.
  { ticker: "8918.T", sector: "Real Estate" }, // LAND Co.,Ltd.
  { ticker: "8919.T", sector: "Real Estate" }, // KATITAS CO.,LTD
  { ticker: "8923.T", sector: "Real Estate" }, // TOSEI CORPORATION
  { ticker: "8934.T", sector: "Real Estate" }, // Sun Frontier Fudousan Co.,Ltd.
  { ticker: "8935.T", sector: "Real Estate" }, // FJ NEXT HOLDINGS CO.,LTD.
  { ticker: "8999.T", sector: "Real Estate" }, // Grandy House Corporation

  // ── Utilities ──
  { ticker: "3150.T", sector: "Utilities" }, // grems,Inc.
  { ticker: "9511.T", sector: "Utilities" }, // The Okinawa Electric Power Company,Incorporated
  { ticker: "9514.T", sector: "Utilities" }, // EF-ON INC.
  { ticker: "9517.T", sector: "Utilities" }, // eREX Co.,Ltd.
  { ticker: "9519.T", sector: "Utilities" }, // RENOVA,Inc.
  { ticker: "9534.T", sector: "Utilities" }, // HOKKAIDO GAS CO.,LTD.
  { ticker: "9535.T", sector: "Utilities" }, // HIROSHIMA GAS CO.,LTD.
  { ticker: "9536.T", sector: "Utilities" }, // SAIBU GAS HOLDINGS CO.,LTD.
  { ticker: "9543.T", sector: "Utilities" }, // SHIZUOKA GAS CO.,LTD.
  { ticker: "9551.T", sector: "Utilities" }, // METAWATER Co.,Ltd.
];
