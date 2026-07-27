import { clamp, isFiniteNumber } from "../attributes";
import { getDecisionGrade } from "./calculateSituationFit";
import type {
  DecisionExplanation,
  ExplanationTemplates,
  GenerateExplanationInput,
} from "./types";

export const DEFAULT_EXPLANATION_TEMPLATES: ExplanationTemplates = {
  scoreExcellent: "현재 미션과 매우 높은 적합도를 보이는 선택입니다.",
  scoreGood: "현재 미션에서 뚜렷한 장점이 있는 선택입니다.",
  scoreMixed: "전술적 의도는 분명하지만 보완이 필요한 선택입니다.",
  scoreRisky: "가능한 의도는 있으나 위험 부담이 큰 선택입니다.",
  scoreWeak: "현재 미션 해결과의 거리가 있지만 노린 효과는 검토할 수 있습니다.",
  benefitIncrease:
    "{label}: {delta}점 개선되어 현재 전술 의도를 뒷받침합니다.",
  benefitIntent: "{role} 역할을 통한 전술 변화 의도는 확인할 수 있습니다.",
  riskImpactDecrease:
    "{label}: {delta}점 낮아질 가능성을 함께 관리해야 합니다.",
  riskCaution:
    "수치상 장점과 별개로 실제 경기 흐름과 상대 대응에 따른 변동성이 남습니다.",
  mitigationDefault:
    "경기 흐름을 관찰하며 역할과 팀 지시의 강도를 단계적으로 조정하세요.",
  alternative: "{name}: {comparison}",
  actualDecision:
    "{description} {difference} 실제 선택은 정답 기준이 아니라 서로 다른 장점과 위험을 비교하는 자료입니다.",
  actualDecisionInferred:
    "{description} {difference} 이 목적은 경기 상황과 선수 특성에 근거한 전술적 추론이며, 실제 선택을 정답으로 보지는 않습니다.",
};

export function renderTemplate(
  template: string,
  variables: Readonly<Record<string, unknown>>,
): string {
  return template
    .replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, key: string) => {
      const value = variables[key];
      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        return String(value);
      }
      return "";
    })
    .replace(/\s+/g, " ")
    .trim();
}

function signedMagnitude(value: number): string {
  const magnitude = Math.abs(Math.round(value));
  return `-${magnitude}`;
}

export function generateExplanation({
  score,
  impacts,
  risk,
  roleName,
  alternative,
  actualDecision,
  templates: templateOverrides,
  maxItems = 3,
}: GenerateExplanationInput): DecisionExplanation {
  const templates = {
    ...DEFAULT_EXPLANATION_TEMPLATES,
    ...templateOverrides,
  };
  const safeMaxItems = Math.trunc(clamp(maxItems, 1, 10, 3));
  const grade = getDecisionGrade(score);
  const summary = templates[
    grade === "excellent"
      ? "scoreExcellent"
      : grade === "good"
        ? "scoreGood"
        : grade === "mixed"
          ? "scoreMixed"
          : grade === "risky"
            ? "scoreRisky"
            : "scoreWeak"
  ];
  const impactList = Object.values(impacts).filter(
    (impact) =>
      isFiniteNumber(impact.delta) &&
      typeof impact.label === "string" &&
      impact.label.length > 0,
  );
  const benefits = impactList
    .filter((impact) => impact.delta > 0)
    .sort((left, right) => right.delta - left.delta)
    .slice(0, safeMaxItems)
    .map((impact) =>
      renderTemplate(templates.benefitIncrease, {
        label: impact.label,
        delta: `+${Math.round(impact.delta)}`,
      }),
    );

  if (benefits.length === 0) {
    benefits.push(
      renderTemplate(templates.benefitIntent, {
        role: roleName?.trim() || "선택한",
      }),
    );
  }

  const riskMessages = risk.triggered
    .filter((finding) => finding.message.trim().length > 0)
    .map((finding) => finding.message.trim());
  const impactRisks = impactList
    .filter((impact) => impact.delta < 0)
    .sort((left, right) => left.delta - right.delta)
    .map((impact) =>
      renderTemplate(templates.riskImpactDecrease, {
        label: impact.label,
        delta: signedMagnitude(impact.delta),
      }),
    );
  const risks = [...riskMessages, ...impactRisks].slice(0, safeMaxItems);

  // Every decision, including a high-scoring one, retains a visible caveat.
  if (risks.length === 0) {
    risks.push(templates.riskCaution);
  }

  const mitigations = risk.triggered
    .map((finding) => finding.mitigation?.trim())
    .filter((mitigation): mitigation is string => Boolean(mitigation))
    .slice(0, safeMaxItems);

  if (mitigations.length === 0) {
    mitigations.push(templates.mitigationDefault);
  }

  const alternativeText = alternative
    ? renderTemplate(templates.alternative, {
        name: alternative.name,
        comparison: alternative.comparison,
      })
    : undefined;
  const actualDecisionComparison = actualDecision
    ? renderTemplate(
        actualDecision.isInferred
          ? templates.actualDecisionInferred
          : templates.actualDecision,
        {
          description: actualDecision.description,
          difference: actualDecision.difference ?? "",
        },
      )
    : undefined;

  return {
    summary,
    benefits,
    risks,
    mitigations,
    alternative: alternativeText,
    actualDecisionComparison,
  };
}
