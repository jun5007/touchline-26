import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FootballPitch } from "@/components/tactics/FootballPitch";

describe("FootballPitch", () => {
  it("uses one formation-neutral caption for every team and unverified formation", () => {
    render(
      <FootballPitch
        lineup={[]}
        players={[]}
        selectedOutId={null}
        selectedIn={null}
        onSelectOut={vi.fn()}
      />,
    );

    expect(
      screen.getByText(
        "공식 선발 명단과 포지션군을 바탕으로 한 분석적 위치 도식",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/3-4-3/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/대한민국|한국|KOR/),
    ).not.toBeInTheDocument();
  });
});
