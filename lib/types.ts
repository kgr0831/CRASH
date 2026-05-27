export interface LineResult {
  code: string;
  score: number;
  tags: string[];
  advice: string;
  safety: number;
  performance: number;
  structure: number;
}

export interface IssueCounts {
  critical: number;
  warning: number;
  info: number;
}

export interface Summary {
  riskScore: number;
  linesScanned: number;
  hotspots: number;
  estComplexity: string;
  issues: IssueCounts;
}

export interface AnalyzeResponse {
  language: string;
  filename: string;
  summary: Summary;
  lines: LineResult[];
}
