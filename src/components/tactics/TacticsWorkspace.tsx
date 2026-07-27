"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardCode,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/common/Button";
import { BenchPanel } from "@/components/tactics/BenchPanel";
import { FootballPitch } from "@/components/tactics/FootballPitch";
import { ImpactGauges } from "@/components/tactics/ImpactGauges";
import { MatchStatePanel } from "@/components/tactics/MatchStatePanel";
import { PlayerComparison } from "@/components/tactics/PlayerComparison";
import { RoleSelector } from "@/components/tactics/RoleSelector";
import { SubstitutionPreview } from "@/components/tactics/SubstitutionPreview";
import { TeamInstructions } from "@/components/tactics/TeamInstructions";
import type {
  InstructionCategory,
  Match,
  Player,
  Role,
  Scenario,
  TacticalInstructions,
} from "@/data/types";
import {
  evaluateBestRole,
  evaluateDecision,
  toStoredDecision,
  type DecisionEvaluation,
} from "@/lib/decision/evaluateDecision";
import { saveDecision } from "@/lib/decision/storage";

export function TacticsWorkspace({
  match,
  scenario,
  lineupPlayers,
  benchPlayers,
  roles,
  instructions,
}: {
  match: Match;
  scenario: Scenario;
  lineupPlayers: Player[];
  benchPlayers: Player[];
  roles: Role[];
  instructions: InstructionCategory[];
}) {
  const router = useRouter();
  const [selectedOutId, setSelectedOutId] = useState<string | null>(null);
  const [selectedInId, setSelectedInId] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [teamInstructions, setTeamInstructions] = useState<TacticalInstructions>(
    scenario.defaultInstructions,
  );
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState(
    "먼저 필드 선수를 선택한 뒤 벤치 선수를 고르세요.",
  );
  const [storageError, setStorageError] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      keyboardCodes: {
        start: [KeyboardCode.Space],
        cancel: [KeyboardCode.Esc],
        end: [KeyboardCode.Space],
      },
    }),
  );
  const outgoing = lineupPlayers.find((player) => player.id === selectedOutId) ?? null;
  const incoming = benchPlayers.find((player) => player.id === selectedInId) ?? null;
  const allowedRoles = incoming
    ? roles.filter((role) => role.allowedPositionGroups.includes(incoming.positionGroup))
    : [];
  const selectedRole = roles.find((role) => role.roleId === selectedRoleId) ?? null;

  const evaluation: DecisionEvaluation | null = useMemo(() => {
    if (!outgoing || !incoming || !selectedRole) return null;
    return evaluateDecision({
      outgoing,
      incoming,
      role: selectedRole,
      instructions: teamInstructions,
      scenario,
    });
  }, [incoming, outgoing, scenario, selectedRole, teamInstructions]);

  const fitScores = useMemo(() => {
    if (!outgoing) return {};
    return Object.fromEntries(
      benchPlayers.map((player) => {
        const best = evaluateBestRole({
          outgoing,
          incoming: player,
          roles,
          instructions: teamInstructions,
          scenario,
        });
        return [player.id, best?.evaluation.fit.score];
      }),
    );
  }, [benchPlayers, outgoing, roles, scenario, teamInstructions]);

  function selectOut(playerId: string) {
    setSelectedOutId(playerId);
    setStorageError(false);
    const player = lineupPlayers.find((candidate) => candidate.id === playerId);
    setStatusMessage(`${player?.name ?? "필드 선수"} OUT 선택. 이제 벤치 선수를 고르세요.`);
  }

  function selectIn(playerId: string) {
    setSelectedInId(playerId);
    setSelectedRoleId(null);
    setStorageError(false);
    const player = benchPlayers.find((candidate) => candidate.id === playerId);
    setStatusMessage(`${player?.name ?? "벤치 선수"} IN 선택. 투입 역할을 정하세요.`);
  }

  function resetPreview() {
    setSelectedOutId(null);
    setSelectedInId(null);
    setSelectedRoleId(null);
    setStatusMessage("교체 미리보기를 취소했습니다. 다시 선수를 선택하세요.");
  }

  function handleDragStart(event: DragStartEvent) {
    const playerId = event.active.data.current?.playerId;
    if (typeof playerId === "string") setActiveDragId(playerId);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragId(null);
    const incomingId = event.active.data.current?.playerId;
    const outgoingId = event.over?.data.current?.playerId;
    if (typeof incomingId !== "string" || typeof outgoingId !== "string") {
      setStatusMessage("드롭 위치를 인식하지 못했습니다. 클릭 방식으로도 교체할 수 있습니다.");
      return;
    }
    selectOut(outgoingId);
    selectIn(incomingId);
    const inPlayer = benchPlayers.find((player) => player.id === incomingId);
    const outPlayer = lineupPlayers.find((player) => player.id === outgoingId);
    setStatusMessage(`${outPlayer?.name} OUT, ${inPlayer?.name} IN 교체 미리보기입니다.`);
  }

  function updateInstruction(category: keyof TacticalInstructions, value: string) {
    setTeamInstructions((current) => ({ ...current, [category]: value }));
  }

  function confirmDecision() {
    if (!outgoing || !incoming || !selectedRole || !evaluation) {
      setStatusMessage("OUT, IN, 역할을 모두 선택해야 결정을 확정할 수 있습니다.");
      return;
    }
    const stored = toStoredDecision({
      matchId: match.id,
      scenario,
      outgoing,
      incoming,
      role: selectedRole,
      instructions: teamInstructions,
      evaluation,
    });
    if (!saveDecision(stored)) {
      setStorageError(true);
      setStatusMessage("브라우저 저장소를 사용할 수 없어 결과를 안전하게 보관하지 못했습니다.");
      return;
    }
    router.push(`/matches/${match.id}/scenarios/${scenario.id}/result`);
  }

  const activePlayer = benchPlayers.find((player) => player.id === activeDragId);

  return (
    <DndContext
      sensors={sensors}
      accessibility={{
        screenReaderInstructions: {
          draggable:
            "Enter 키는 선수를 바로 선택합니다. 드래그하려면 스페이스바를 누르고 방향키로 이동한 뒤 스페이스바로 놓으세요. 취소는 Escape 키입니다.",
        },
        announcements: {
          onDragStart: () =>
            "벤치 선수 드래그를 시작했습니다. 방향키로 교체할 필드 선수에게 이동하세요.",
          onDragOver: ({ over }) =>
            over
              ? "교체할 필드 선수가 선택되었습니다. 스페이스바로 교체 미리보기를 확정하세요."
              : "현재 놓을 수 있는 필드 선수가 없습니다.",
          onDragEnd: ({ over }) =>
            over
              ? "교체 미리보기가 적용되었습니다."
              : "교체할 필드 선수를 찾지 못해 드래그가 종료되었습니다.",
          onDragCancel: () => "선수 드래그를 취소했습니다.",
        },
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDragId(null)}
    >
      <div className="grid gap-5 xl:grid-cols-[250px_minmax(440px,1fr)_350px]">
        <aside className="contents xl:grid xl:content-start xl:gap-5">
          <div className="order-1 xl:order-none">
            <MatchStatePanel match={match} scenario={scenario} />
          </div>
          <div className="panel order-3 p-5 xl:order-none">
            <BenchPanel
              players={benchPlayers}
              selectedId={selectedInId}
              fitScores={fitScores}
              onSelect={selectIn}
            />
          </div>
        </aside>

        <section
          className="panel relative order-2 overflow-hidden p-3 sm:p-5 xl:order-none"
          aria-labelledby="board-title"
        >
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black tracking-[.13em] text-[#7f8998]">TACTICAL BOARD</p>
              <h1 id="board-title" className="mt-1 text-xl font-black text-white">필드에서 OUT 선수를 선택</h1>
            </div>
            <span className="hidden text-[10px] font-bold text-[#9ba5b2] sm:block">
              벤치 카드를 선수 위로 드롭할 수도 있습니다
            </span>
          </div>
          <FootballPitch
            lineup={scenario.currentLineup}
            players={lineupPlayers}
            selectedOutId={selectedOutId}
            selectedIn={incoming}
            onSelectOut={selectOut}
          />
          <div className="sr-only" aria-live="polite">{statusMessage}</div>
        </section>

        <aside className="order-4 grid content-start gap-4 xl:order-none">
          <div className="panel p-4">
            <PlayerComparison outgoing={outgoing} incoming={incoming} role={selectedRole} />
          </div>
          {incoming && (
            <div className="panel p-4">
              <RoleSelector
                roles={allowedRoles}
                selectedId={selectedRoleId}
                onSelect={(roleId) => {
                  setSelectedRoleId(roleId);
                  const role = roles.find((candidate) => candidate.roleId === roleId);
                  setStatusMessage(`${role?.name ?? "역할"} 선택. 적합도와 영향이 갱신됐습니다.`);
                }}
              />
            </div>
          )}
          <div className="panel p-4">
            <TeamInstructions
              categories={instructions}
              values={teamInstructions}
              onChange={updateInstruction}
            />
          </div>
          <div className="panel p-4">
            <ImpactGauges evaluation={evaluation} />
          </div>
          <SubstitutionPreview
            outgoing={outgoing}
            incoming={incoming}
            role={selectedRole}
            evaluation={evaluation}
            onCancel={resetPreview}
          />
          {evaluation && evaluation.risk.triggered.length > 0 && (
            <div className="rounded-xl border border-[#ff806d]/20 bg-[#ff806d]/7 p-4">
              <p className="text-[10px] font-black tracking-[.12em] text-[#ff9e90]">
                RISK CHECK · −{evaluation.risk.totalPenalty}
              </p>
              <ul className="mt-2 grid gap-1.5 text-xs leading-5 text-[#e3b3ac]">
                {evaluation.risk.triggered.map((finding) => (
                  <li key={finding.id}>• {finding.message}</li>
                ))}
              </ul>
            </div>
          )}
          {storageError && (
            <p role="alert" className="rounded-xl border border-[#ff806d]/20 bg-[#ff806d]/7 p-3 text-xs text-[#ffab9f]">
              브라우저 저장소가 차단되어 있습니다. 사이트 데이터 저장을 허용한 뒤 다시 시도해 주세요.
            </p>
          )}
          <Button
            type="button"
            onClick={confirmDecision}
            disabled={!evaluation}
            className="w-full"
          >
            {evaluation ? `결정 확정 · 적합도 ${evaluation.fit.score}` : "선수와 역할을 선택하세요"}
            {evaluation && <span aria-hidden="true">→</span>}
          </Button>
          <p className="text-center text-[10px] leading-4 text-[#9ba5b2]">
            확정 후에도 결과 화면에서 재도전할 수 있습니다.
          </p>
        </aside>
      </div>
      <DragOverlay>
        {activePlayer ? (
          <div className="w-48 rotate-2 rounded-xl border border-[#f4b860]/55 bg-[#101d2e] p-3 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full border border-[#f4b860] text-xs font-black text-[#f4b860]">
                {activePlayer.shirtNumber}
              </span>
              <div>
                <p className="text-sm font-black text-white">{activePlayer.name}</p>
                <p className="text-[10px] text-[#8f99a8]">{activePlayer.position}</p>
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
