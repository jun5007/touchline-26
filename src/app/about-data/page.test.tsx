import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AboutDataPage, {
  formatUserFacingUsagePermission,
} from "@/app/about-data/page";

describe("AboutDataPage source rights copy", () => {
  it("keeps internal permission codes out of the user-facing source list", () => {
    const { container } = render(<AboutDataPage />);

    expect(container).not.toHaveTextContent(/\brestricted\b/i);
    expect(container).not.toHaveTextContent(/\bunknown\b/i);
    expect(container).not.toHaveTextContent(/\ballowed_factual_use\b/i);
    expect(container).not.toHaveTextContent(/\ballowed_with_attribution\b/i);
    expect(container).not.toHaveTextContent(/\bopen_license\b/i);
    expect(
      screen.getByText(/원문 PDF와 표·그래픽·사진을 재배포하지 않고/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/서비스의 자체 데이터 구조로 재구성/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/FIFA 또는 아래 출처 기관과 제휴하거나 승인을 받은/),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/사실 확인 출처 · 원문 이용조건 적용/).length,
    ).toBeGreaterThan(0);
  });

  it("maps every audit permission to a neutral Korean rights description", () => {
    expect(formatUserFacingUsagePermission("allowed_factual_use")).toBe(
      "공개 사실 확인·인용",
    );
    expect(formatUserFacingUsagePermission("allowed_with_attribution")).toBe(
      "출처 표시 조건 적용",
    );
    expect(formatUserFacingUsagePermission("open_license")).toBe(
      "공개 라이선스 조건 적용",
    );
    expect(formatUserFacingUsagePermission("restricted")).toBe(
      "사실 확인 출처 · 원문 이용조건 적용",
    );
    expect(formatUserFacingUsagePermission("unknown")).toBe(
      "사실 확인 출처 · 권리 조건 확인 필요",
    );
  });
});
