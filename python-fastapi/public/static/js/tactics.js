/* Build, evaluate, and persist the user's tactical decision. */
(() => {
  "use strict";

  const form = document.querySelector("#tactics-form");
  const dataNode = document.querySelector("#tactics-data");
  if (!form || !dataNode) return;

  let payloadData;
  try {
    payloadData = JSON.parse(dataNode.textContent);
  } catch {
    showFatal("전술 데이터를 읽지 못했습니다. 페이지를 새로고침해 주세요.");
    return;
  }

  const unwrapPlayer = (item) => item && item.player ? { ...item.player, x: item.x, y: item.y, slot: item.slot } : item;
  const lineup = (payloadData.lineupPlayers || []).map(unwrapPlayer);
  const bench = (payloadData.benchPlayers || []).map(unwrapPlayer);
  const roles = payloadData.roles || [];
  const playerById = new Map([...lineup, ...bench].filter(Boolean).map((player) => [player.id, player]));
  const roleById = new Map(roles.map((role) => [role.roleId, role]));

  const state = {
    outgoingPlayerId: "",
    incomingPlayerId: "",
    roleId: "",
    evaluation: null,
    requestController: null,
    requestSequence: 0,
    draggedPlayerId: "",
  };

  const els = {
    pitch: document.querySelector("#football-pitch"),
    pitchPlayers: [...document.querySelectorAll(".pitch-player")],
    benchPlayers: [...document.querySelectorAll(".bench-player")],
    roleFieldset: document.querySelector("#role-fieldset"),
    roleHelp: document.querySelector("#role-help"),
    roleChoices: [...document.querySelectorAll(".role-choice")],
    roleInputs: [...document.querySelectorAll('input[name="roleId"]')],
    outState: document.querySelector("#out-state"),
    inState: document.querySelector("#in-state"),
    apiStatus: document.querySelector("#api-status"),
    confirm: document.querySelector("#confirm-decision"),
    mobileConfirm: document.querySelector("[data-mobile-confirm]"),
    mobileScore: document.querySelector("[data-mobile-score]"),
    error: document.querySelector("#form-error"),
    score: document.querySelector("[data-fit-score]"),
    scoreRing: document.querySelector("[data-score-ring]"),
    grade: document.querySelector("[data-fit-grade]"),
    summary: document.querySelector("[data-fit-summary]"),
    risk: document.querySelector("#risk-preview"),
    previewOut: document.querySelector("[data-preview-out]"),
    previewOutPosition: document.querySelector("[data-preview-out-position]"),
    previewIn: document.querySelector("[data-preview-in]"),
    previewInPosition: document.querySelector("[data-preview-in-position]"),
  };

  function showFatal(message) {
    const error = document.querySelector("#form-error");
    if (error) {
      error.hidden = false;
      error.textContent = message;
    }
  }

  function setApiStatus(kind, label) {
    if (!els.apiStatus) return;
    els.apiStatus.className = `api-status${kind ? ` is-${kind}` : ""}`;
    els.apiStatus.innerHTML = "<i aria-hidden=\"true\"></i>";
    els.apiStatus.append(document.createTextNode(label));
  }

  function getInstructions() {
    const result = {};
    ["attackDirection", "pressing", "defensiveLine", "mentality"].forEach((key) => {
      const selected = form.querySelector(`input[name="${key}"]:checked`);
      result[key] = selected ? selected.value : "";
    });
    return result;
  }

  function selectionComplete() {
    const instructions = getInstructions();
    return Boolean(
      state.outgoingPlayerId &&
      state.incomingPlayerId &&
      state.roleId &&
      Object.values(instructions).every(Boolean)
    );
  }

  function setPressed(buttons, selectedId) {
    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.playerId === selectedId));
    });
  }

  function refreshSelectionUI() {
    const outgoing = playerById.get(state.outgoingPlayerId);
    const incoming = playerById.get(state.incomingPlayerId);
    setPressed(els.pitchPlayers, state.outgoingPlayerId);
    setPressed(els.benchPlayers, state.incomingPlayerId);

    if (els.outState) els.outState.textContent = outgoing ? `${outgoing.name} OUT 선택` : "교체할 선수를 선택하세요";
    if (els.inState) els.inState.textContent = incoming ? `${incoming.name} IN 선택` : "투입할 선수를 선택하세요";
    if (els.previewOut) els.previewOut.textContent = outgoing ? outgoing.name : "선수 선택";
    if (els.previewOutPosition) els.previewOutPosition.textContent = outgoing ? (outgoing.position || outgoing.slot || outgoing.officialPosition) : "필드에서 선택하세요";
    if (els.previewIn) els.previewIn.textContent = incoming ? incoming.name : "선수 선택";
    if (els.previewInPosition) els.previewInPosition.textContent = incoming ? (incoming.position || incoming.officialPosition) : "벤치에서 선택하세요";

    updateRoleCompatibility(incoming);
    state.evaluation = null;
    setConfirmEnabled(false);
  }

  function updateRoleCompatibility(incoming) {
    const group = incoming ? incoming.positionGroup : "";
    if (els.roleFieldset) els.roleFieldset.disabled = !incoming;
    if (els.roleHelp) els.roleHelp.textContent = incoming
      ? `${incoming.name}에게 맡길 수 있는 역할만 표시합니다.`
      : "먼저 투입 선수를 선택하세요.";

    let checkedStillAllowed = false;
    els.roleChoices.forEach((choice) => {
      const allowed = String(choice.dataset.allowed || "").split(",");
      const compatible = Boolean(group && allowed.includes(group));
      choice.classList.toggle("is-incompatible", !compatible);
      const input = choice.querySelector("input");
      if (input) {
        input.disabled = !compatible;
        if (compatible && input.checked) checkedStillAllowed = true;
      }
    });

    if (!checkedStillAllowed) {
      state.roleId = "";
      els.roleInputs.forEach((input) => { input.checked = false; });
      const firstCompatible = els.roleInputs.find((input) => !input.disabled);
      if (incoming && firstCompatible) {
        firstCompatible.checked = true;
        state.roleId = firstCompatible.value;
      }
    }
  }

  function chooseOutgoing(playerId) {
    if (!playerById.has(playerId)) return;
    state.outgoingPlayerId = playerId;
    refreshSelectionUI();
    queueEvaluation();
  }

  function chooseIncoming(playerId) {
    if (!playerById.has(playerId)) return;
    state.incomingPlayerId = playerId;
    refreshSelectionUI();
    queueEvaluation();
  }

  els.pitchPlayers.forEach((button) => {
    button.addEventListener("click", () => chooseOutgoing(button.dataset.playerId));
    button.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      chooseOutgoing(button.dataset.playerId);
    });
    button.addEventListener("dragover", (event) => {
      if (!state.draggedPlayerId) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    });
    button.addEventListener("drop", (event) => {
      event.preventDefault();
      if (!state.draggedPlayerId) return;
      chooseOutgoing(button.dataset.playerId);
      chooseIncoming(state.draggedPlayerId);
      state.draggedPlayerId = "";
      window.Touchline?.showToast("교체 조합을 선택했습니다.");
    });
  });

  els.benchPlayers.forEach((button) => {
    button.addEventListener("click", () => chooseIncoming(button.dataset.playerId));
    button.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      chooseIncoming(button.dataset.playerId);
    });
    button.addEventListener("dragstart", (event) => {
      state.draggedPlayerId = button.dataset.playerId;
      button.classList.add("is-dragging");
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", state.draggedPlayerId);
      }
    });
    button.addEventListener("dragend", () => {
      state.draggedPlayerId = "";
      button.classList.remove("is-dragging");
      els.pitch?.classList.remove("is-dragover");
    });
  });

  if (els.pitch) {
    els.pitch.addEventListener("dragover", (event) => {
      if (!state.draggedPlayerId) return;
      event.preventDefault();
      els.pitch.classList.add("is-dragover");
    });
    els.pitch.addEventListener("dragleave", (event) => {
      if (!els.pitch.contains(event.relatedTarget)) els.pitch.classList.remove("is-dragover");
    });
    els.pitch.addEventListener("drop", (event) => {
      event.preventDefault();
      els.pitch.classList.remove("is-dragover");
      const droppedId = state.draggedPlayerId || event.dataTransfer?.getData("text/plain");
      if (!droppedId) return;
      chooseIncoming(droppedId);
      if (!state.outgoingPlayerId) {
        window.Touchline?.showToast("이제 필드에서 교체할 선수를 선택하세요.");
      }
      state.draggedPlayerId = "";
    });
  }

  els.roleInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) state.roleId = input.value;
      queueEvaluation();
    });
  });

  form.querySelectorAll(".instruction-fieldset input").forEach((input) => {
    input.addEventListener("change", queueEvaluation);
  });

  let evaluationTimer = 0;
  function queueEvaluation() {
    window.clearTimeout(evaluationTimer);
    if (!selectionComplete()) {
      setApiStatus("", "선택 대기");
      setConfirmEnabled(false);
      return;
    }
    evaluationTimer = window.setTimeout(evaluateDecision, 180);
  }

  function decisionPayload() {
    return {
      matchId: payloadData.matchId,
      scenarioId: payloadData.scenarioId,
      outgoingPlayerId: state.outgoingPlayerId,
      incomingPlayerId: state.incomingPlayerId,
      roleId: state.roleId,
      instructions: getInstructions(),
    };
  }

  async function evaluateDecision() {
    if (!selectionComplete()) return;
    if (state.requestController) state.requestController.abort();
    state.requestController = new AbortController();
    const sequence = ++state.requestSequence;
    setApiStatus("loading", "Python 분석 중");
    setConfirmEnabled(false);
    hideError();

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(decisionPayload()),
        signal: state.requestController.signal,
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        const detail = result && (result.detail || result.message);
        throw new Error(typeof detail === "string" ? detail : "분석 요청을 처리하지 못했습니다.");
      }
      if (sequence !== state.requestSequence) return;
      state.evaluation = result;
      renderEvaluation(result);
      setApiStatus("live", "분석 완료");
      setConfirmEnabled(true);
    } catch (error) {
      if (error.name === "AbortError") return;
      state.evaluation = null;
      setApiStatus("error", "분석 오류");
      showError(error.message || "분석 엔진에 연결할 수 없습니다.");
    }
  }

  function renderEvaluation(result) {
    const score = clampNumber(result.score, 0, 100, 0);
    if (els.score) els.score.textContent = String(Math.round(score));
    if (els.mobileScore) els.mobileScore.textContent = `${Math.round(score)}점`;
    if (els.scoreRing) {
      els.scoreRing.style.setProperty("--score", String(score));
      els.scoreRing.setAttribute("aria-label", `상황 적합도 ${Math.round(score)}점`);
    }
    if (els.grade) els.grade.textContent = result.grade || result.gradeDescription || gradeFromScore(score);
    if (els.summary) els.summary.textContent = result.summary || "선택의 기대 효과와 위험이 균형을 이루는지 확인하세요.";

    const before = result.impactsBefore || {};
    const after = result.impactsAfter || {};
    ["attack", "control", "defense", "energy"].forEach((key) => {
      const beforeValue = clampNumber(before[key], 0, 100, 50);
      const afterValue = clampNumber(after[key], 0, 100, beforeValue);
      const delta = Math.round(afterValue - beforeValue);
      const value = document.querySelector(`[data-impact-value="${key}"]`);
      const bar = document.querySelector(`[data-impact-bar="${key}"]`);
      const deltaNode = document.querySelector(`[data-impact-delta="${key}"]`);
      if (value) value.textContent = String(Math.round(afterValue));
      if (bar) bar.style.width = `${afterValue}%`;
      if (deltaNode) {
        deltaNode.textContent = `${delta > 0 ? "+" : ""}${delta}`;
        deltaNode.style.color = delta < 0 ? "var(--danger)" : "var(--mint)";
      }
    });

    if (els.risk) {
      els.risk.replaceChildren();
      const title = document.createElement("span");
      title.textContent = "RISK WATCH";
      els.risk.append(title);
      const risks = Array.isArray(result.risks) ? result.risks : [];
      if (risks.length) {
        const list = document.createElement("ul");
        risks.slice(0, 3).forEach((risk) => {
          const item = document.createElement("li");
          item.textContent = String(risk);
          list.append(item);
        });
        els.risk.append(list);
      } else {
        const note = document.createElement("p");
        note.textContent = "현재 조합에서 큰 전술 충돌은 감지되지 않았습니다.";
        els.risk.append(note);
      }
    }
  }

  function setConfirmEnabled(enabled) {
    if (els.confirm) els.confirm.disabled = !enabled;
    if (els.mobileConfirm) els.mobileConfirm.disabled = !enabled;
  }

  function showError(message) {
    if (!els.error) return;
    els.error.hidden = false;
    els.error.textContent = message;
  }

  function hideError() {
    if (!els.error) return;
    els.error.hidden = true;
    els.error.textContent = "";
  }

  function clampNumber(value, min, max, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
  }

  function gradeFromScore(score) {
    if (score >= 85) return "탁월한 선택";
    if (score >= 70) return "설득력 있는 선택";
    if (score >= 55) return "균형 잡힌 선택";
    return "위험 관리가 필요해요";
  }

  function storageKey() {
    return `touchline26:decision:${payloadData.matchId}:${payloadData.scenarioId}`;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!selectionComplete()) {
      showError("OUT, IN, 역할과 팀 지시를 모두 선택해 주세요.");
      return;
    }
    if (!state.evaluation) {
      await evaluateDecision();
      if (!state.evaluation) return;
    }

    const record = {
      version: 1,
      matchId: payloadData.matchId,
      scenarioId: payloadData.scenarioId,
      decision: decisionPayload(),
      evaluation: state.evaluation,
      savedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(storageKey(), JSON.stringify(record));
    } catch {
      showError("브라우저 저장소를 사용할 수 없습니다. 시크릿 모드를 확인해 주세요.");
      return;
    }

    const resultUrl = form.dataset.resultUrl;
    if (resultUrl) window.location.assign(resultUrl);
  });

  refreshSelectionUI();
})();
