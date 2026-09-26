export const MINIMUM_SURVEY_RESPONSES = 20;
export const MINIMUM_COMPLETED_ORDERS = 10;

export interface SurveyDataDisclosureInput {
  customerInsightsEnabled: boolean;
  surveyResponseCount: number;
  realSurveyResponseCount: number;
  demoSurveyResponseCount: number;
}

export interface SurveyDataDisclosure {
  surveyResponseCount: number;
  realSurveyResponseCount: number;
  demoSurveyResponseCount: number;
  hasDemoResponses: boolean;
}

export function getSurveyDataDisclosure({
  customerInsightsEnabled,
  surveyResponseCount,
  realSurveyResponseCount,
  demoSurveyResponseCount
}: SurveyDataDisclosureInput): SurveyDataDisclosure | null {
  if (!customerInsightsEnabled) return null;

  return {
    surveyResponseCount,
    realSurveyResponseCount,
    demoSurveyResponseCount,
    hasDemoResponses: demoSurveyResponseCount > 0
  };
}

export function meetsMerchantInsightThreshold({
  surveyResponseCount,
  completedOrderCount
}: {
  surveyResponseCount: number;
  completedOrderCount: number;
}): boolean {
  return (
    surveyResponseCount >= MINIMUM_SURVEY_RESPONSES &&
    completedOrderCount >= MINIMUM_COMPLETED_ORDERS
  );
}
