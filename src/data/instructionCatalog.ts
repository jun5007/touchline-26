import instructionsData from "@/data/instructions/instructions.json";
import type { InstructionCategory } from "@/data/types";

const instructions = instructionsData as InstructionCategory[];

/**
 * Decision-safe instruction metadata.
 *
 * Keep this module independent from the server repository. Client decision
 * code may import it without pulling matches, scenarios, or result-only facts
 * into the pre-decision bundle.
 */
export function getInstructions(): InstructionCategory[] {
  return instructions;
}
