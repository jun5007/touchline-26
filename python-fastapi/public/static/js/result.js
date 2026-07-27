/* Restore and render a validated tactical decision. */
(() => {
  "use strict";

  const contextNode = document.querySelector("#result-context");
  const loading = document.querySelector("#result-loading");
  const page = document.querySelector("#result-page");
  const empty = document.querySelector("#result-empty");
  if (!contextNode || !loading || !page || !empty) return;

  let context;
  try {
    context = JSON.parse(contextNode.textContent);
  } catch {
    showEmpty();
    return;
  }

  const key = `touchline26:decision:${context.matchId}:${context.scenarioId}`;
  const record = readRecord(key);
  if (!record) {
    showEmpty();
    return;
  }

  hydrate(record).catch(() => showEmpty());

  async function hydrate(saved) {
    let evaluation = saved.evaluation;
    if (!evaluation && saved.decision) {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(saved.decision),
      });
      if (!response.ok) throw new Error("평가 복원 실패");
      evaluation = await response.json();
    }
    if (!isEvaluation(evaluation)) throw new Error("저장된 평가가 올바르지 않습니다.");
    render(saved.decision || {}, evaluation);
    loading.hidden = true;
    empty.hidden = true;
    page.hidden = false;
    document.querySelector(".result-hero")?.focus?.();
  }

  function readRecord(storageKey) {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (
        !parsed ||
        parsed.version !== 1 ||
        parsed.matchId !== context.matchId ||
        parsed.scenarioId !== context.scenarioId ||
        !parsed.decision ||
        parsed.decision.matchId !== context.matchId ||
        parsed.decision.scenarioId !== context.scenarioId
      ) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  function isEvaluation(value) {
    return Boolean(value && Number.isFinite(Number(value.score)));
  }

  function showEmpty() {
    loading.hidden = true;
    page.hidden = true;
    empty.hidden = false;
  }

  function render(decision, result) {
    const score = clamp(result.score, 0, 100, 0);
    text("[data-result-score]", Math.round(score));
    text("[data-result-grade]", result.grade || result.gradeDescription || gradeFromScore(score));
    text("[data-result-headline]", headlineForScore(score));
    text("[data-result-summary]", result.summary || "선택의 기대 효과와 위험을 함께 확인하세요.");
    const ring = document.querySelector("[data-result-score-ring]");
    if (ring) {
      ring.style.setProperty("--score", String(score));
      ring.setAttribute("aria-label", `상황 적합도 ${Math.round(score)}점`);
    }

    const selected = result.selected || {};
    const outgoing = selected.outgoingPlayer || result.outgoingPlayer || {};
    const incoming = selected.incomingPlayer || result.selectedPlayer || {};
    const role = selected.role || result.selectedRole || {};
    text("[data-result-out]", outgoing.name || decision.outgoingPlayerId || "선택 선수");
    text("[data-result-out-position]", outgoing.position || outgoing.officialPosition || "필드 선수");
    text("[data-result-in]", incoming.name || decision.incomingPlayerId || "투입 선수");
    text("[data-result-in-position]", incoming.position || incoming.officialPosition || "벤치 선수");
    text("[data-result-role]", role.name || role.shortName || decision.roleId || "선택 역할");
    text("[data-result-penalty]", `−${Math.abs(Number(result.riskPenalty) || 0)}점`);

    renderInstructions(decision.instructions || selected.instructions || {});
    renderImpacts(result.impactsBefore || {}, result.impactsAfter || {});
    renderList("[data-result-benefits]", result.benefits, "선택의 강점이 분석되었습니다.");
    renderRisks(result.risks, result.remedies);
    renderActual(result, outgoing, incoming);
  }

  function renderInstructions(instructions) {
    const target = document.querySelector("[data-result-instructions]");
    if (!target) return;
    target.replaceChildren();
    const labels = {
      attackDirection: { left: "왼쪽 집중", centre: "중앙 집중", right: "오른쪽 집중", balanced: "공격 균형" },
      pressing: { low: "낮은 압박", medium: "보통 압박", high: "높은 압박" },
      defensiveLine: { low: "낮은 수비선", medium: "보통 수비선", high: "높은 수비선" },
      mentality: { safe: "안정 성향", balanced: "균형 성향", attacking: "공격 성향" },
    };
    Object.entries(labels).forEach(([key, map]) => {
      if (!instructions[key]) return;
      const chip = document.createElement("span");
      chip.textContent = map[instructions[key]] || String(instructions[key]);
      target.append(chip);
    });
  }

  function renderImpacts(before, after) {
    ["attack", "control", "defense", "energy"].forEach((keyName) => {
      const beforeValue = clamp(before[keyName], 0, 100, 50);
      const afterValue = clamp(after[keyName], 0, 100, beforeValue);
      const delta = Math.round(afterValue - beforeValue);
      text(`[data-result-impact-delta="${keyName}"]`, `${delta > 0 ? "+" : ""}${delta}`);
      text(`[data-result-before-value="${keyName}"]`, Math.round(beforeValue));
      text(`[data-result-after-value="${keyName}"]`, Math.round(afterValue));
      const beforeBar = document.querySelector(`[data-result-before="${keyName}"]`);
      const afterBar = document.querySelector(`[data-result-after="${keyName}"]`);
      const deltaNode = document.querySelector(`[data-result-impact-delta="${keyName}"]`);
      if (beforeBar) beforeBar.style.width = `${beforeValue}%`;
      if (afterBar) afterBar.style.width = `${afterValue}%`;
      if (deltaNode) deltaNode.style.color = delta < 0 ? "var(--danger)" : "var(--mint)";
    });
  }

  function renderList(selector, values, fallback) {
    const target = document.querySelector(selector);
    if (!target) return;
    target.replaceChildren();
    const entries = Array.isArray(values) && values.length ? values : [fallback];
    entries.forEach((value) => {
      const item = document.createElement("li");
      item.textContent = String(value);
      target.append(item);
    });
  }

  function renderRisks(risks, remedies) {
    const target = document.querySelector("[data-result-risks]");
    if (!target) return;
    target.replaceChildren();
    const riskList = Array.isArray(risks) && risks.length ? risks : ["큰 전술 충돌은 감지되지 않았습니다."];
    const remedyList = Array.isArray(remedies) ? remedies : [];
    riskList.forEach((risk, index) => {
      const item = document.createElement("div");
      item.className = "risk-item";
      const riskText = document.createElement("p");
      riskText.textContent = String(risk);
      item.append(riskText);
      if (remedyList[index] || remedyList[0]) {
        const remedy = document.createElement("small");
        remedy.textContent = String(remedyList[index] || remedyList[0]);
        item.append(remedy);
      }
      target.append(item);
    });
  }

  function renderActual(result, outgoing, incoming) {
    const fact = document.querySelector("[data-actual-fact]");
    if (!fact) return;
    const actual = result.actualDecision || context.actualDecision || {};
    if (typeof result.actualComparison === "string" && result.actualComparison.trim()) {
      fact.textContent = result.actualComparison;
      return;
    }
    const pieces = [];
    if (actual.outPlayerName || actual.outgoingPlayerName) pieces.push(`${actual.outPlayerName || actual.outgoingPlayerName} OUT`);
    if (actual.inPlayerName || actual.incomingPlayerName) pieces.push(`${actual.inPlayerName || actual.incomingPlayerName} IN`);
    if (pieces.length) {
      fact.textContent = pieces.join(" · ");
    } else {
      fact.textContent = `공식 기록상 ${actual.minute || "해당"}분에 교체가 이루어졌습니다. 당신은 ${outgoing.name || "선수"} 대신 ${incoming.name || "다른 선수"}를 선택했습니다.`;
    }
  }

  function text(selector, value) {
    const node = document.querySelector(selector);
    if (node) node.textContent = String(value ?? "");
  }

  function clamp(value, min, max, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
  }

  function gradeFromScore(score) {
    if (score >= 85) return "탁월";
    if (score >= 70) return "우수";
    if (score >= 55) return "균형";
    return "도전적";
  }

  function headlineForScore(score) {
    if (score >= 85) return "경기의 요구를 정확히 읽었습니다.";
    if (score >= 70) return "설득력 있는 터치라인 결정입니다.";
    if (score >= 55) return "장점과 위험이 맞서는 선택입니다.";
    return "의도는 선명하지만 보완이 필요합니다.";
  }
})();
