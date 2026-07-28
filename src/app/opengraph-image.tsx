import { ImageResponse } from "next/og";

export const alt =
  "TOUCHLINE 26 - World Cup Group A, 4 teams, 6 matches, 13 decisions";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background:
            "radial-gradient(circle at 76% 18%, rgba(52,211,153,.26), transparent 34%), linear-gradient(135deg, #020711 0%, #071927 58%, #063425 100%)",
          color: "#f8fafc",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Arial, sans-serif",
          height: "100%",
          justifyContent: "space-between",
          padding: "68px 72px",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            border: "1px solid rgba(255,255,255,.14)",
            inset: "34px",
            position: "absolute",
          }}
        />
        <div
          style={{
            color: "#6ee7b7",
            display: "flex",
            fontSize: 23,
            fontWeight: 700,
            letterSpacing: 7,
          }}
        >
          WORLD CUP GROUP A · MANAGER SIMULATION
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 104,
              fontWeight: 900,
              letterSpacing: -5,
              lineHeight: 1,
            }}
          >
            TOUCHLINE&nbsp;
            <span style={{ color: "#f4b860", display: "flex" }}>26</span>
          </div>
          <div
            style={{
              color: "#dbe7ef",
              display: "flex",
              fontSize: 36,
              fontWeight: 700,
              marginTop: 27,
            }}
          >
            MAKE THE CALL. REVIEW THE JOURNEY.
          </div>
        </div>
        <div style={{ display: "flex", gap: 18 }}>
          {[
            ["04", "TEAMS"],
            ["06", "MATCHES"],
            ["13", "DECISIONS"],
          ].map(([value, label]) => (
            <div
              key={label}
              style={{
                alignItems: "baseline",
                background: "rgba(4,14,24,.66)",
                border: "1px solid rgba(110,231,183,.34)",
                display: "flex",
                gap: 12,
                padding: "18px 24px",
              }}
            >
              <span
                style={{
                  color: "#f4b860",
                  display: "flex",
                  fontSize: 35,
                  fontWeight: 900,
                }}
              >
                {value}
              </span>
              <span
                style={{
                  color: "#a9bdc9",
                  display: "flex",
                  fontSize: 17,
                  fontWeight: 700,
                  letterSpacing: 2,
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
