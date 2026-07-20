import type {
  SavedAnalysisRecord,
  SavedAnalysisSummary,
  ValueInvestingAnalysis,
} from "@/types/analysis";

export interface AnalyzeRequest {
  ticker: string;
}

export interface AnalyzeResponse {
  id: string;
  analysis: ValueInvestingAnalysis;
}

export interface HistoryResponse {
  items: SavedAnalysisSummary[];
}

export interface CompareRequest {
  ids: string[];
}

export interface CompareResponse {
  items: SavedAnalysisRecord[];
}
