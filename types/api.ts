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

/** `null` when the security has never been analysed — a normal answer, not an error. */
export interface SecurityLookupResponse {
  analysis: SavedAnalysisSummary | null;
}

export interface CompareRequest {
  ids: string[];
}

export interface CompareResponse {
  items: SavedAnalysisRecord[];
}
