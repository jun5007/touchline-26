import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DecisionScoreContext } from "@/components/common/DecisionScoreContext";

describe("DecisionScoreContext", () => {
  it("explains range, rank, ties, and comparison population", () => {
    render(
      <DecisionScoreContext
        context={{
          minScore: 39,
          maxScore: 63,
          combinationCount: 12_345,
          percentile: 91,
          topPercent: 10,
        }}
      />,
    );

    expect(screen.getByText("39–63점")).toBeInTheDocument();
    expect(screen.getByText("91백분위")).toBeInTheDocument();
    expect(screen.getByText("상위 10% 이내")).toBeInTheDocument();
    expect(screen.getByText(/12,345개 기준/)).toBeInTheDocument();
    expect(screen.getByText(/같은 점수의 선택을 모두 포함/)).toBeInTheDocument();
  });
});
