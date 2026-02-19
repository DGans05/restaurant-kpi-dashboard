export const dynamic = "force-static";

export default function StyleGuidePage() {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1f1f1f 0%, #00272b 100%)",
        minHeight: "100vh",
        padding: "48px 40px",
        fontFamily: "var(--font-body, 'Inria Sans', sans-serif)",
        color: "#fff6e9",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "64px" }}>
        <div
          style={{
            fontFamily: "var(--font-display, 'Arvo', serif)",
            fontWeight: 700,
            fontSize: "50px",
            color: "#fff6e9",
            letterSpacing: "-1px",
            lineHeight: 1,
          }}
        >
          NYP KPI
        </div>
        <div style={{ color: "rgba(255,246,233,0.5)", fontSize: "14px", marginTop: "8px", fontWeight: 400 }}>
          Design System — Style Guide
        </div>
      </div>

      {/* ── Section 1: Color Palette ── */}
      <Section title="Color Palette">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "16px" }}>
          {[
            { name: "Background", value: "#1F1F1F", role: "Canvas" },
            { name: "Background Alt", value: "#00272B", role: "Gradient target" },
            { name: "Card", value: "#FFF6E9", role: "Card / panel" },
            { name: "Sidebar", value: "#FFF6E9", role: "Sidebar surface" },
            { name: "Foreground", value: "#1D2532", role: "Body text" },
            { name: "FG on Dark", value: "#FFF6E9", role: "Text on dark", border: "1px solid rgba(255,246,233,0.2)" },
            { name: "Primary", value: "#009A44", role: "Brand / topbar" },
            { name: "Highlight", value: "#00311F", role: "Active nav" },
            { name: "Input", value: "#EDE8DF", role: "Input fill" },
            { name: "Muted FG", value: "#6B6B6B", role: "Placeholders" },
            { name: "NYP Red", value: "#F3001D", role: "Alerts / negative" },
            { name: "NYP Yellow", value: "#FFDA28", role: "Plan lines" },
            { name: "NYP Orange", value: "#FFA51D", role: "Labour / cost" },
            { name: "NYP Blue", value: "#006DEC", role: "Info indicators" },
          ].map((swatch) => (
            <div key={swatch.name}>
              <div
                style={{
                  height: "64px",
                  borderRadius: "8px",
                  backgroundColor: swatch.value,
                  border: swatch.border ?? "1px solid rgba(255,246,233,0.1)",
                  marginBottom: "8px",
                }}
              />
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#fff6e9" }}>{swatch.name}</div>
              <div style={{ fontSize: "11px", color: "rgba(255,246,233,0.5)", fontFamily: "monospace" }}>{swatch.value}</div>
              <div style={{ fontSize: "11px", color: "rgba(255,246,233,0.4)" }}>{swatch.role}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Section 2: Typography ── */}
      <Section title="Typography">
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <TypeRow
              label="Logo — Arvo Bold 700 / 50px"
              style={{ fontFamily: "var(--font-display, 'Arvo', serif)", fontWeight: 700, fontSize: "50px", lineHeight: 1, color: "#1d2532" }}
            >
              NYP KPI
            </TypeRow>
            <TypeRow
              label="H1 — Inria Sans Bold 700 / 40px / -0.02em"
              style={{ fontFamily: "var(--font-body, 'Inria Sans', sans-serif)", fontWeight: 700, fontSize: "40px", letterSpacing: "-0.02em", color: "#1d2532" }}
            >
              Dashboard Overzicht
            </TypeRow>
            <TypeRow
              label="H2 — Inria Sans Bold 700 / 28px"
              style={{ fontFamily: "var(--font-body, 'Inria Sans', sans-serif)", fontWeight: 700, fontSize: "28px", color: "#1d2532" }}
            >
              Bezorg Service
            </TypeRow>
            <TypeRow
              label="H3 — Inria Sans Bold 700 / 20px"
              style={{ fontFamily: "var(--font-body, 'Inria Sans', sans-serif)", fontWeight: 700, fontSize: "20px", color: "#1d2532" }}
            >
              KPI Overzicht
            </TypeRow>
            <TypeRow
              label="Body — Inria Sans Regular 400 / 16px"
              style={{ fontFamily: "var(--font-body, 'Inria Sans', sans-serif)", fontWeight: 400, fontSize: "16px", color: "#1d2532" }}
            >
              Wekelijks overzicht van alle KPI metrics voor uw restaurant.
            </TypeRow>
            <TypeRow
              label="Label — Inria Sans Bold 700 / 14px"
              style={{ fontFamily: "var(--font-body, 'Inria Sans', sans-serif)", fontWeight: 700, fontSize: "14px", color: "#1d2532" }}
            >
              Omzet Week 07
            </TypeRow>
            <TypeRow
              label="Caption — Inria Sans Regular 400 / 12px"
              style={{ fontFamily: "var(--font-body, 'Inria Sans', sans-serif)", fontWeight: 400, fontSize: "12px", color: "#6b6b6b" }}
            >
              Vergeleken met vorige week
            </TypeRow>
            <TypeRow
              label="Metric Value — Inria Sans Bold / 40px / tabular-nums"
              style={{ fontFamily: "var(--font-body, 'Inria Sans', sans-serif)", fontWeight: 700, fontSize: "40px", fontVariantNumeric: "tabular-nums", color: "#1d2532" }}
            >
              €24.830
            </TypeRow>
          </div>
        </Card>
      </Section>

      {/* ── Section 3: Spacing & Radius ── */}
      <Section title="Spacing & Radius">
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "flex-end" }}>
          {[
            { label: "--radius", value: "20px", px: 20 },
            { label: "--radius-sm", value: "8px", px: 8 },
            { label: "--radius-xs", value: "5px", px: 5 },
          ].map((r) => (
            <div key={r.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "#FFF6E9",
                  borderRadius: `${r.px}px`,
                  border: "2px solid #009A44",
                  marginBottom: "8px",
                }}
              />
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#fff6e9" }}>{r.label}</div>
              <div style={{ fontSize: "11px", color: "rgba(255,246,233,0.5)", fontFamily: "monospace" }}>{r.value}</div>
            </div>
          ))}
          <div style={{ marginLeft: "32px" }}>
            <div style={{ color: "rgba(255,246,233,0.6)", fontSize: "13px", marginBottom: "8px", fontWeight: 700 }}>Base Grid: 8px</div>
            <div style={{ display: "flex", gap: "4px", alignItems: "flex-end" }}>
              {[1,2,3,4,6,8].map((n) => (
                <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <div style={{ width: "24px", height: `${n * 8}px`, backgroundColor: "#009A44", borderRadius: "3px" }} />
                  <span style={{ fontSize: "10px", color: "rgba(255,246,233,0.5)" }}>{n * 8}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Section 4: Buttons ── */}
      <Section title="Buttons">
        <Card>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
            <button style={{ ...btnBase, backgroundColor: "#1D2532", color: "#FFF6E9", border: "none" }}>
              Primary Button
            </button>
            <button style={{ ...btnBase, backgroundColor: "#009A44", color: "#FFF6E9", border: "none" }}>
              Accent Button
            </button>
            <button style={{ ...btnBase, backgroundColor: "transparent", color: "#1D2532", border: "1.5px solid #1D2532" }}>
              Ghost Button
            </button>
            <button style={{ ...btnBase, backgroundColor: "#1D2532", color: "#FFF6E9", border: "none", opacity: 0.4, cursor: "not-allowed" }} disabled>
              Disabled
            </button>
          </div>
          <div style={{ marginTop: "16px", fontSize: "12px", color: "#6b6b6b" }}>
            Inria Sans Bold 14px · border-radius: 8px · padding: 10px 20px
          </div>
        </Card>
      </Section>

      {/* ── Section 5: Nav Items ── */}
      <Section title="Navigation">
        <div
          style={{
            backgroundColor: "#FFF6E9",
            borderRadius: "20px",
            padding: "16px",
            width: "220px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {[
            { label: "Dashboard", active: true },
            { label: "Restaurants", active: false },
            { label: "Rapporten", active: false },
            { label: "KPI Invoer", active: false },
            { label: "Bezorg Service", active: false },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                padding: "10px 14px",
                borderRadius: "5px",
                backgroundColor: item.active ? "#00311F" : "transparent",
                color: item.active ? "#FFF6E9" : "#1D2532",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {item.label}
            </div>
          ))}
        </div>
      </Section>

      {/* ── Section 6: Inputs ── */}
      <Section title="Inputs">
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "320px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#1d2532", marginBottom: "6px" }}>
                Default
              </label>
              <input
                readOnly
                value=""
                placeholder="Zoeken naar restaurant..."
                style={{ ...inputBase }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#1d2532", marginBottom: "6px" }}>
                With Value
              </label>
              <input
                readOnly
                value="Hinthammerstraat"
                style={{ ...inputBase, outline: "2px solid #009A44", outlineOffset: "2px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#f3001d", marginBottom: "6px" }}>
                Error State
              </label>
              <input
                readOnly
                value="ongeldig@"
                style={{ ...inputBase, outline: "2px solid #f3001d", outlineOffset: "2px" }}
              />
              <div style={{ fontSize: "12px", color: "#f3001d", marginTop: "4px" }}>Ongeldig e-mailadres</div>
            </div>
          </div>
        </Card>
      </Section>

      {/* ── Section 7: Cards ── */}
      <Section title="Cards">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" }}>
          {/* KPI Card */}
          <div style={cardStyleObj}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#6b6b6b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
              Omzet
            </div>
            <div style={{ fontSize: "40px", fontWeight: 700, color: "#1d2532", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
              €24.830
            </div>
            <div style={{ fontSize: "13px", color: "#009A44", fontWeight: 700, marginTop: "8px" }}>
              +12% vs vorige week
            </div>
          </div>

          {/* Labour Card */}
          <div style={cardStyleObj}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#6b6b6b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
              Loonkosten
            </div>
            <div style={{ fontSize: "40px", fontWeight: 700, color: "#1d2532", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
              28,4%
            </div>
            <div style={{ fontSize: "13px", color: "#ffa51d", fontWeight: 700, marginTop: "8px" }}>
              Waarschuwingszone
            </div>
          </div>

          {/* Orders Card */}
          <div style={cardStyleObj}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#6b6b6b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
              Bestellingen
            </div>
            <div style={{ fontSize: "40px", fontWeight: 700, color: "#1d2532", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
              1.247
            </div>
            <div style={{ fontSize: "13px", color: "#006dec", fontWeight: 700, marginTop: "8px" }}>
              Weekoverzicht
            </div>
          </div>

          {/* Wide chart card */}
          <div style={{ ...cardStyleObj, gridColumn: "1 / -1" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#6b6b6b", marginBottom: "16px" }}>
              Omzet vs Plan — Week 07
            </div>
            <div style={{ height: "80px", background: "linear-gradient(90deg, rgba(0,154,68,0.15) 0%, rgba(0,154,68,0.3) 100%)", borderRadius: "8px", display: "flex", alignItems: "flex-end", padding: "0 8px 8px", gap: "4px" }}>
              {[65,72,58,88,95,80,70].map((h, i) => (
                <div
                  key={i}
                  style={{ flex: 1, height: `${h}%`, backgroundColor: "#009A44", borderRadius: "4px 4px 0 0", opacity: 0.8 + i * 0.02 }}
                />
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Section 8: Logo Lockup ── */}
      <Section title="Logo Lockup">
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>

          {/* Light */}
          <LogoButton bg="#FFF6E9" textColor="#1D2532" subtitleColor="#6b6b6b" border="1px solid rgba(29,37,50,0.12)" />

          {/* Dark */}
          <LogoButton bg="#1D2532" textColor="#FFF6E9" subtitleColor="rgba(255,246,233,0.5)" border="1px solid rgba(255,246,233,0.1)" dark />

          {/* Green */}
          <LogoButton bg="#009A44" textColor="#FFF6E9" subtitleColor="rgba(255,246,233,0.75)" border="none" dark />

        </div>
      </Section>

      {/* ── Section 9: Full Layout Preview ── */}
      <Section title="Full Layout Preview">
        <div
          style={{
            borderRadius: "20px",
            overflow: "hidden",
            border: "1px solid rgba(255,246,233,0.1)",
            display: "flex",
            height: "500px",
          }}
        >
          {/* Sidebar */}
          <div
            style={{
              width: "220px",
              backgroundColor: "#FFF6E9",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              padding: "24px 16px",
              gap: "4px",
            }}
          >
            <div style={{ fontFamily: "var(--font-display, 'Arvo', serif)", fontWeight: 700, fontSize: "24px", color: "#1D2532", marginBottom: "24px", paddingLeft: "8px" }}>
              NYP KPI
            </div>
            {[
              { label: "Dashboard", active: true },
              { label: "Restaurants", active: false },
              { label: "Rapporten", active: false },
              { label: "KPI Invoer", active: false },
              { label: "Bezorg", active: false },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: "10px 14px",
                  borderRadius: "5px",
                  backgroundColor: item.active ? "#00311F" : "transparent",
                  color: item.active ? "#FFF6E9" : "#1D2532",
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              >
                {item.label}
              </div>
            ))}
            <div style={{ marginTop: "auto" }}>
              <div style={{ padding: "10px 14px", borderRadius: "5px", color: "#1D2532", fontSize: "14px", fontWeight: 700 }}>
                Uitloggen
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Topbar */}
            <div
              style={{
                height: "112px",
                backgroundColor: "#009A44",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 32px",
                flexShrink: 0,
              }}
            >
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#FFF6E9", letterSpacing: "0.05em" }}>DASHBOARD</div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "180px", height: "36px", borderRadius: "8px", backgroundColor: "rgba(255,246,233,0.15)", display: "flex", alignItems: "center", padding: "0 12px" }}>
                  <span style={{ color: "rgba(255,246,233,0.5)", fontSize: "13px" }}>Zoeken...</span>
                </div>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#00272B", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF6E9", fontSize: "12px", fontWeight: 700 }}>
                  DA
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div
              style={{
                flex: 1,
                background: "linear-gradient(135deg, #1f1f1f 0%, #00272b 100%)",
                padding: "24px",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "16px",
                alignContent: "start",
                overflow: "hidden",
              }}
            >
              {[
                { label: "Omzet", value: "€24.830", trend: "+12%", trendColor: "#009A44" },
                { label: "Loonkosten", value: "28,4%", trend: "Hoog", trendColor: "#ffa51d" },
                { label: "Bestellingen", value: "1.247", trend: "Week 07", trendColor: "#006dec" },
              ].map((card) => (
                <div key={card.label} style={{ ...cardStyleObj, padding: "16px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#6b6b6b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>{card.label}</div>
                  <div style={{ fontSize: "26px", fontWeight: 700, color: "#1d2532", fontVariantNumeric: "tabular-nums" }}>{card.value}</div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: card.trendColor, marginTop: "4px" }}>{card.trend}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Footer note */}
      <div style={{ marginTop: "64px", textAlign: "center", color: "rgba(255,246,233,0.3)", fontSize: "12px" }}>
        NYP KPI Design System · Generated {new Date().toISOString().split("T")[0]}
      </div>
    </div>
  );
}

/* ── Logo Button ── */

function LogoButton({ bg, textColor, subtitleColor, border, dark }: {
  bg: string; textColor: string; subtitleColor: string; border: string; dark?: boolean;
}) {
  return (
    <div style={{
      backgroundColor: bg,
      borderRadius: "20px",
      padding: "20px 24px",
      border,
      display: "flex",
      alignItems: "center",
      gap: "16px",
      minWidth: "200px",
    }}>
      {/* Text */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{
          fontFamily: "var(--font-display, 'Arvo', serif)",
          fontWeight: 700,
          fontSize: "42px",
          color: textColor,
          letterSpacing: "-1px",
          lineHeight: 0.95,
        }}>
          NYP<br />KPI
        </div>
        <div style={{
          fontSize: "10px",
          fontWeight: 400,
          color: subtitleColor,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          fontFamily: "var(--font-body, 'Inria Sans', sans-serif)",
        }}>
          Restaurant Dashboard
        </div>
      </div>

      {/* Pizza slice image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/pizza-slice.svg"
        alt="pizza slice"
        width={80}
        height={80}
        style={{
          objectFit: "contain",
          ...(dark ? { filter: "invert(1)" } : {}),
        }}
      />
    </div>
  );
}

/* ── Helpers ── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "56px" }}>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#009A44",
          marginBottom: "20px",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: "#FFF6E9",
        borderRadius: "20px",
        padding: "24px",
        border: "1px solid rgba(29,37,50,0.12)",
      }}
    >
      {children}
    </div>
  );
}

function TypeRow({ label, style, children }: { label: string; style: React.CSSProperties; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <div style={{ fontSize: "11px", color: "#6b6b6b", fontFamily: "monospace" }}>{label}</div>
      <div style={style}>{children}</div>
    </div>
  );
}

const btnBase: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: 700,
  fontFamily: "var(--font-body, 'Inria Sans', sans-serif)",
  cursor: "pointer",
  transition: "opacity 0.2s",
};

const inputBase: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1px solid rgba(29,37,50,0.15)",
  backgroundColor: "#EDE8DF",
  fontSize: "14px",
  fontFamily: "var(--font-body, 'Inria Sans', sans-serif)",
  color: "#1d2532",
  outline: "none",
  boxSizing: "border-box",
};

const cardStyleObj: React.CSSProperties = {
  backgroundColor: "#FFF6E9",
  borderRadius: "20px",
  padding: "24px",
  border: "1px solid rgba(29,37,50,0.12)",
};
