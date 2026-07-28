import resultTemplatesData from "@/data/copy/resultTemplates.json";

/**
 * Presentation-only result copy. This intentionally lives outside the server
 * repository so result components do not bundle the raw match catalog.
 */
export const resultTemplates = resultTemplatesData;
