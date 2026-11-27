import type { PriceSource } from '../../pricing/interface';

export type DraftLineStatus =
  | 'priced'
  | 'no_price'
  | 'unmatched'
  | 'ambiguous'
  | 'needs_quantity'
  | 'needs_unit';

export interface DraftCandidate {
  serviceId: string;
  serviceName: string;
}

export interface DraftLine {
  serviceQuery: string;
  serviceId?: string;
  serviceCode?: string;
  serviceName?: string;
  unitId?: string;
  unitCode?: string;
  requestedUnitCode?: string | null;
  quantity: number | null;
  price?: string;
  currency?: string;
  source?: PriceSource;
  priceListItemId?: string;
  total?: string;
  matchScore?: number;
  candidates?: DraftCandidate[];
  confidence: number;
  status: DraftLineStatus;
}

export type QuestionCode =
  | 'missing_quantity'
  | 'needs_unit'
  | 'unmatched'
  | 'ambiguous'
  | 'no_price'
  | 'model';

export interface DraftQuestion {
  code: QuestionCode;
  itemIndex: number | null;
  text: string;
  candidates?: DraftCandidate[];
}

export interface EstimateDraft {
  lines: DraftLine[];
  questions: DraftQuestion[];
  pricedTotal: string;
  currency: string;
  hasGaps: boolean;
  regionCode: string | null;
  regionName: string | null;
}
