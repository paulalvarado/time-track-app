import { createRoute } from "@tanstack/react-router";
import { Route as publicLayout } from "../layouts/public-layout";

export const Route = createRoute({
  getParentRoute: () => publicLayout,
  path: "/design-system",
  component: SystemDesignView,
});

/* ─── Helpers ─── */

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-6">
    <div className="border-b border-border pb-2">
      <h2 className="text-[24px] font-semibold leading-[32px] tracking-[-0.96px] text-text-primary">
        {title}
      </h2>
    </div>
    {children}
  </section>
);

const TokenLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="font-mono text-[12px] leading-[16px] text-text-muted">{children}</span>
);

/* ─── Color Swatch ─── */

function ColorSwatch({ name, hex, textColor = "#ffffff" }: { name: string; hex: string; textColor?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="h-16 w-full rounded-[6px] border border-border flex items-end p-2"
        style={{ backgroundColor: hex }}
      >
        <span className="font-mono text-[12px] leading-[16px]" style={{ color: textColor }}>
          {hex}
        </span>
      </div>
      <TokenLabel>{name}</TokenLabel>
    </div>
  );
}

/* ─── Type Sample ─── */

function TypeSample({
  token,
  size,
  weight,
  lineHeight,
  letterSpacing = "0",
  children,
}: {
  token: string;
  size: string;
  weight: number;
  lineHeight: string;
  letterSpacing?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-6 py-2 border-b border-border last:border-0">
      <div className="w-28 shrink-0">
        <TokenLabel>{token}</TokenLabel>
        <span className="block font-mono text-[11px] text-[#a1a1a1]">
          {size}/{weight}
        </span>
      </div>
      <p
        className="text-text-primary"
        style={{
          fontSize: size,
          fontWeight: weight,
          lineHeight,
          letterSpacing,
          fontFamily: token.includes("mono") || token === "code"
            ? "ui-monospace, SFMono-Regular, Menlo, Monaco, monospace"
            : "Inter, system-ui, -apple-system, sans-serif",
        }}
      >
        {children}
      </p>
    </div>
  );
}

/* ─── Spacing Sample ─── */

function SpacingSample({ token, px }: { token: string; px: number }) {
  return (
    <div className="flex items-center gap-3">
      <TokenLabel>{token}</TokenLabel>
      <span className="font-mono text-[12px] text-[#a1a1a1] w-10">{px}px</span>
      <div className="bg-accent rounded-[2px]" style={{ width: px, height: 16 }} />
    </div>
  );
}

/* ─── Elevation Sample ─── */

function ElevationSample({ level, style }: { level: string; style: React.CSSProperties }) {
  return (
    <div
      className="w-full rounded-[8px] bg-card px-5 py-8 text-center"
      style={style}
    >
      <span className="font-mono text-[13px] text-text-muted">{level}</span>
    </div>
  );
}

/* ─── Radius Sample ─── */

function RadiusSample({ token, px, value }: { token: string; px: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <TokenLabel>{token}</TokenLabel>
      <span className="font-mono text-[12px] text-[#a1a1a1] w-14">{px}</span>
      <div
        className="h-10 w-20 bg-surface border border-border"
        style={{ borderRadius: value }}
      />
    </div>
  );
}

/* ─── Main Component ─── */

function SystemDesignView() {
  return (
    <main className="min-h-screen bg-page">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-[1200px] px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[32px] font-semibold leading-[40px] tracking-[-1.28px] text-text-primary">
                Design System.
              </h1>
              <p className="mt-1 text-[14px] leading-[20px] text-text-secondary">
                Sistema de diseño inspirado en Vercel — tokens, componentes y guías de estilo.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-[6px] border border-border bg-page p-0.5">
                <a
                  href="/design-system"
                  className="inline-flex h-[28px] items-center rounded-[4px] bg-card px-3 text-[13px] font-medium leading-[20px] text-text-primary no-underline border border-border"
                >
                  Tokens
                </a>
                <a
                  href="/forms"
                  className="inline-flex h-[28px] items-center rounded-[4px] px-3 text-[13px] font-medium leading-[20px] text-text-secondary no-underline hover:text-text-primary"
                >
                  Formularios
                </a>
                <a
                  href="/dialogs"
                  className="inline-flex h-[28px] items-center rounded-[4px] px-3 text-[13px] font-medium leading-[20px] text-text-secondary no-underline hover:text-text-primary"
                >
                  Dialogs
                </a>
              </div>
              <a
                href="/"
                className="inline-flex h-[28px] items-center rounded-[6px] bg-text-primary px-2 text-[14px] font-medium leading-[20px] text-white no-underline"
              >
                Volver
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-6 py-10 space-y-16">
        {/* ─── 1. COLORS ─── */}
        <Section title="Colores">
          {/* Brand & Accent */}
          <div>
            <h3 className="mb-3 text-[14px] font-medium leading-[20px] text-text-secondary">
              Marca y Acento
            </h3>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3">
              <ColorSwatch name="primary" hex="#171717" />
              <ColorSwatch name="on-primary" hex="#ffffff" textColor="#171717" />
              <ColorSwatch name="link" hex="#0070f3" />
              <ColorSwatch name="violet" hex="#7928ca" />
              <ColorSwatch name="cyan" hex="#50e3c2" textColor="#171717" />
              <ColorSwatch name="highlight-pink" hex="#ff0080" />
            </div>
          </div>
          {/* Surface */}
          <div>
            <h3 className="mb-3 text-[14px] font-medium leading-[20px] text-text-secondary">
              Superficies
            </h3>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3">
              <ColorSwatch name="canvas" hex="#ffffff" textColor="#171717" />
              <ColorSwatch name="canvas-soft" hex="#fafafa" textColor="#171717" />
              <ColorSwatch name="canvas-soft-2" hex="#f5f5f5" textColor="#171717" />
              <ColorSwatch name="hairline" hex="#ebebeb" textColor="#171717" />
              <ColorSwatch name="hairline-strong" hex="#a1a1a1" />
            </div>
          </div>
          {/* Text */}
          <div>
            <h3 className="mb-3 text-[14px] font-medium leading-[20px] text-text-secondary">
              Texto
            </h3>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3">
              <ColorSwatch name="ink" hex="#171717" />
              <ColorSwatch name="body" hex="#4d4d4d" />
              <ColorSwatch name="mute" hex="#888888" />
            </div>
          </div>
          {/* Semantic */}
          <div>
            <h3 className="mb-3 text-[14px] font-medium leading-[20px] text-text-secondary">
              Semánticos
            </h3>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3">
              <ColorSwatch name="success" hex="#0070f3" />
              <ColorSwatch name="error" hex="#ee0000" />
              <ColorSwatch name="error-soft" hex="#f7d4d6" textColor="#171717" />
              <ColorSwatch name="warning" hex="#f5a623" />
              <ColorSwatch name="warning-soft" hex="#ffefcf" textColor="#171717" />
            </div>
          </div>
          {/* Brand Gradient Preview */}
          <div>
            <h3 className="mb-3 text-[14px] font-medium leading-[20px] text-text-secondary">
              Mesh Gradient (hero scale)
            </h3>
            <div className="h-32 w-full rounded-[8px] border border-border" style={{
              background: "linear-gradient(135deg, #007cf0 0%, #00dfd8 33%, #7928ca 50%, #ff0080 66%, #ff4d4d 83%, #f9cb28 100%)",
            }} />
          </div>
        </Section>

        {/* ─── 2. TYPOGRAPHY ─── */}
        <Section title="Tipografía">
          <p className="text-[14px] leading-[20px] text-text-secondary mb-4">
            Familia base: <strong className="text-text-primary">Inter</strong> (sans) · <strong className="text-text-primary">JetBrains Mono</strong> (mono)
          </p>
          <div className="bg-card rounded-[8px] border border-border p-5">
            <TypeSample token="display-xl" size="48px" weight={600} lineHeight="48px" letterSpacing="-2.4px">
              Build and deploy on the AI Cloud.
            </TypeSample>
            <TypeSample token="display-lg" size="32px" weight={600} lineHeight="40px" letterSpacing="-1.28px">
              Your frontend, delivered.
            </TypeSample>
            <TypeSample token="display-md" size="24px" weight={600} lineHeight="32px" letterSpacing="-0.96px">
              Enterprise-grade infrastructure.
            </TypeSample>
            <TypeSample token="display-sm" size="20px" weight={600} lineHeight="28px" letterSpacing="-0.6px">
              Edge Functions.
            </TypeSample>
            <TypeSample token="body-lg" size="18px" weight={400} lineHeight="28px">
              Deploy your projects with zero configuration. Our platform handles the rest.
            </TypeSample>
            <TypeSample token="body-md" size="16px" weight={400} lineHeight="24px">
              Deploy your projects with zero configuration.
            </TypeSample>
            <TypeSample token="body-sm" size="14px" weight={400} lineHeight="20px" letterSpacing="-0.28px">
              Deploy your projects with zero configuration.
            </TypeSample>
            <TypeSample token="caption" size="12px" weight={400} lineHeight="16px">
              Deploy your projects with zero configuration.
            </TypeSample>
            <TypeSample token="caption-mono" size="12px" weight={400} lineHeight="16px">
              $ vercel deploy --prod
            </TypeSample>
            <TypeSample token="code" size="13px" weight={400} lineHeight="20px">
              const app = new VercelApp();
            </TypeSample>
            <TypeSample token="button-lg" size="16px" weight={500} lineHeight="24px">
              Start Deploying
            </TypeSample>
            <TypeSample token="button-md" size="14px" weight={500} lineHeight="20px">
              Sign Up
            </TypeSample>
          </div>
        </Section>

        {/* ─── 3. SPACING ─── */}
        <Section title="Spacing">
          <p className="text-[14px] leading-[20px] text-text-secondary mb-4">
            Base unitaria: <strong className="text-text-primary">4px</strong>. Todos los valores son múltiplos de 4.
          </p>
          <div className="bg-card rounded-[8px] border border-border p-5 space-y-2">
            {[
              { token: "xxs", px: 4 },
              { token: "xs", px: 8 },
              { token: "sm", px: 12 },
              { token: "md", px: 16 },
              { token: "lg", px: 24 },
              { token: "xl", px: 32 },
              { token: "2xl", px: 40 },
              { token: "3xl", px: 48 },
              { token: "4xl", px: 64 },
              { token: "5xl", px: 96 },
              { token: "section", px: 192 },
            ].map((s) => (
              <SpacingSample key={s.token} token={s.token} px={s.px} />
            ))}
          </div>
        </Section>

        {/* ─── 4. BORDER RADIUS ─── */}
        <Section title="Border Radius">
          <div className="bg-card rounded-[8px] border border-border p-5 space-y-3">
            <RadiusSample token="none" px="0px" value="0" />
            <RadiusSample token="xs" px="4px" value="4px" />
            <RadiusSample token="sm" px="6px" value="6px" />
            <RadiusSample token="md" px="8px" value="8px" />
            <RadiusSample token="lg" px="12px" value="12px" />
            <RadiusSample token="xl" px="16px" value="16px" />
            <RadiusSample token="pill-sm" px="64px" value="64px" />
            <RadiusSample token="pill" px="100px" value="100px" />
            <RadiusSample token="full" px="9999px" value="9999px" />
          </div>
        </Section>

        {/* ─── 5. ELEVATION ─── */}
        <Section title="Elevación (Sombras)">
          <p className="text-[14px] leading-[20px] text-text-secondary mb-4">
            Sombras apiladas con múltiples offsets + inset hairline. Nunca usar drop-shadow simple.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ElevationSample
              level="Level 1 — Inset Hairline"
              style={{ boxShadow: "0 0 0 1px #00000014 inset" }}
            />
            <ElevationSample
              level="Level 2 — Subtle Drop"
              style={{ boxShadow: "0px 1px 1px #00000005, 0px 2px 2px #0000000a, 0 0 0 1px #00000014 inset" }}
            />
            <ElevationSample
              level="Level 3 — Soft Stack"
              style={{ boxShadow: "0px 2px 2px #0000000a, 0px 8px 8px -8px #0000000a, 0 0 0 1px #00000014 inset" }}
            />
            <ElevationSample
              level="Level 4 — Float Stack"
              style={{ boxShadow: "0px 2px 2px #0000000a, 0px 8px 16px -4px #0000000a, 0 0 0 1px #00000014 inset" }}
            />
            <ElevationSample
              level="Level 5 — Modal"
              style={{ boxShadow: "0px 1px 1px #00000005, 0px 8px 16px -4px #0000000a, 0px 24px 32px -8px #0000000f, 0 0 0 1px #00000014 inset" }}
            />
          </div>
        </Section>

        {/* ─── 6. BUTTONS ─── */}
        <Section title="Botones">
          <div className="space-y-6">
            {/* Marketing Scale */}
            <div>
              <h3 className="mb-3 text-[14px] font-medium leading-[20px] text-text-secondary">
                Marketing Scale
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <button className="rounded-[100px] bg-text-primary px-3 py-0 text-[16px] font-medium leading-[48px] text-white">
                  Start Deploying
                </button>
                <button className="rounded-[100px] bg-card px-3 py-0 text-[16px] font-medium leading-[48px] text-text-primary shadow-[0_0_0_1px_#ebebeb]">
                  Learn More
                </button>
              </div>
            </div>
            {/* In-app / Nav Scale */}
            <div>
              <h3 className="mb-3 text-[14px] font-medium leading-[20px] text-text-secondary">
                In-app / Nav Scale
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <button className="rounded-[6px] bg-text-primary px-2 py-0 text-[14px] font-medium leading-[28px] text-white">
                  Sign Up
                </button>
                <button className="rounded-[6px] bg-card px-2 py-0 text-[14px] font-medium leading-[28px] text-text-primary shadow-[0_0_0_1px_#ebebeb]">
                  Log In
                </button>
                <button className="rounded-[6px] bg-card px-2 py-0 text-[14px] font-medium leading-[28px] text-text-primary shadow-[0_0_0_1px_#ebebeb]">
                  Ask AI
                </button>
                <button className="rounded-[100px] bg-text-primary px-3 py-0 text-[14px] font-medium leading-[32px] text-white">
                  Upgrade
                </button>
                <button className="rounded-[100px] bg-card px-3 py-0 text-[14px] font-medium leading-[32px] text-text-primary shadow-[0_0_0_1px_#ebebeb]">
                  Cancel
                </button>
              </div>
            </div>
            {/* Tab / Icon */}
            <div>
              <h3 className="mb-3 text-[14px] font-medium leading-[20px] text-text-secondary">
                Tabs e Icon Buttons
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <button className="rounded-[64px] bg-card px-4 py-0 text-[14px] leading-[20px] text-text-primary shadow-[0_0_0_1px_#ebebeb] h-9">
                  AI Apps
                </button>
                <button className="rounded-[64px] bg-card px-4 py-0 text-[14px] leading-[20px] text-text-primary h-9">
                  Web Apps
                </button>
                <button className="rounded-[64px] bg-card px-4 py-0 text-[14px] leading-[20px] text-text-primary h-9">
                  Ecommerce
                </button>
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-text-primary shadow-[0_0_0_1px_#ebebeb]">
                  ?
                </button>
              </div>
            </div>
          </div>
        </Section>

        {/* ─── 7. CARDS ─── */}
        <Section title="Cards">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-[8px] bg-card p-6 shadow-[0px_2px_2px_#0000000a,0px_8px_8px_-8px_#0000000a,0_0_0_1px_#00000014_inset]">
              <span className="font-mono text-[12px] leading-[16px] text-text-muted">card-marketing</span>
              <h3 className="mt-2 text-[20px] font-semibold leading-[28px] tracking-[-0.6px] text-text-primary">
                Web Apps
              </h3>
              <p className="mt-1 text-[14px] leading-[20px] text-text-secondary">
                Build dynamic web applications with zero configuration.
              </p>
            </div>
            <div className="rounded-[12px] bg-card p-8 shadow-[0px_2px_2px_#0000000a,0px_8px_16px_-4px_#0000000a,0_0_0_1px_#00000014_inset]">
              <span className="font-mono text-[12px] leading-[16px] text-text-muted">card-marketing-large</span>
              <h3 className="mt-2 text-[20px] font-semibold leading-[28px] tracking-[-0.6px] text-text-primary">
                AI Gateway
              </h3>
              <p className="mt-1 text-[14px] leading-[20px] text-text-secondary">
                Deploy AI models at the edge with built-in caching.
              </p>
            </div>
            <div className="rounded-[8px] bg-page p-6">
              <span className="font-mono text-[12px] leading-[16px] text-text-muted">card-soft</span>
              <h3 className="mt-2 text-[20px] font-semibold leading-[28px] tracking-[-0.6px] text-text-primary">
                Analytics
              </h3>
              <p className="mt-1 text-[14px] leading-[20px] text-text-secondary">
                Real-time insights for your deployments.
              </p>
            </div>
            <div className="rounded-[8px] bg-text-primary p-6">
              <span className="font-mono text-[12px] leading-[16px] text-text-muted">code-editor-mockup</span>
              <pre className="mt-2 font-mono text-[13px] leading-[20px] text-white">
                {`$ vercel deploy
> Deploying...
> Done.`}
              </pre>
            </div>
            <div className="rounded-[8px] bg-card p-4 shadow-[0px_1px_1px_#00000005,0px_2px_2px_#0000000a,0_0_0_1px_#00000014_inset]">
              <span className="font-mono text-[12px] leading-[16px] text-text-muted">template-card</span>
              <div className="mt-2 aspect-video rounded-[4px] bg-surface" />
              <p className="mt-2 text-[14px] leading-[20px] text-text-primary">Next.js Starter</p>
            </div>
          </div>
        </Section>

        {/* ─── 8. PRICING CARDS ─── */}
        <Section title="Pricing">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-[12px] bg-card p-8 shadow-[0px_2px_2px_#0000000a,0px_8px_16px_-4px_#0000000a,0_0_0_1px_#00000014_inset]">
              <span className="font-mono text-[12px] leading-[16px] text-text-muted">pricing-card</span>
              <p className="mt-4 text-[14px] font-medium leading-[20px] text-text-secondary">Hobby</p>
              <p className="text-[48px] font-semibold leading-[48px] tracking-[-2.4px] text-text-primary">$0</p>
              <ul className="mt-4 space-y-2 text-[14px] leading-[20px] text-text-secondary">
                <li>✓ 1 project</li>
                <li>✓ 100 deployments</li>
                <li>✓ Community support</li>
              </ul>
              <button className="mt-6 w-full rounded-[100px] bg-text-primary px-3 py-0 text-[14px] font-medium leading-[40px] text-white">
                Get Started
              </button>
            </div>
            <div className="rounded-[12px] bg-text-primary p-8 shadow-[0px_1px_1px_#00000005,0px_8px_16px_-4px_#0000000a,0px_24px_32px_-8px_#0000000f,0_0_0_1px_#00000014_inset]">
              <span className="font-mono text-[12px] leading-[16px] text-text-muted">pricing-card-featured</span>
              <p className="mt-4 text-[14px] font-medium leading-[20px] text-[#a1a1a1]">Pro</p>
              <p className="text-[48px] font-semibold leading-[48px] tracking-[-2.4px] text-white">$20</p>
              <ul className="mt-4 space-y-2 text-[14px] leading-[20px] text-[#a1a1a1]">
                <li>✓ Unlimited projects</li>
                <li>✓ Unlimited deployments</li>
                <li>✓ Priority support</li>
              </ul>
              <button className="mt-6 w-full rounded-[100px] bg-card px-3 py-0 text-[14px] font-medium leading-[40px] text-text-primary">
                Subscribe
              </button>
            </div>
            <div className="rounded-[12px] bg-card p-8 shadow-[0px_2px_2px_#0000000a,0px_8px_16px_-4px_#0000000a,0_0_0_1px_#00000014_inset]">
              <span className="font-mono text-[12px] leading-[16px] text-text-muted">pricing-card</span>
              <p className="mt-4 text-[14px] font-medium leading-[20px] text-text-secondary">Enterprise</p>
              <p className="text-[48px] font-semibold leading-[48px] tracking-[-2.4px] text-text-primary">$99</p>
              <ul className="mt-4 space-y-2 text-[14px] leading-[20px] text-text-secondary">
                <li>✓ Everything in Pro</li>
                <li>✓ Custom contracts</li>
                <li>✓ 24/7 support</li>
              </ul>
              <button className="mt-6 w-full rounded-[100px] bg-text-primary px-3 py-0 text-[14px] font-medium leading-[40px] text-white">
                Contact Us
              </button>
            </div>
          </div>
        </Section>

        {/* ─── 9. BADGES & BANNERS ─── */}
        <Section title="Badges y Banners">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-page px-2 py-0 text-[12px] leading-[16px] text-text-secondary">
              badge-secondary
            </span>
            <span className="inline-flex items-center rounded-full bg-info-bg px-2 py-0 text-[12px] leading-[16px] text-accent">
              New
            </span>
            <span className="inline-flex items-center rounded-full bg-[#ffefcf] px-2 py-0 text-[12px] leading-[16px] text-[#ab570a]">
              Beta
            </span>
            <span className="inline-flex items-center rounded-full bg-danger-bg px-2 py-0 text-[12px] leading-[16px] text-danger-text">
              Deprecated
            </span>
          </div>
          <div className="mt-4">
            <span className="mb-1 block font-mono text-[12px] leading-[16px] text-text-muted">banner-marketing</span>
            <div className="inline-flex items-center rounded-full bg-page px-3 py-1 text-[14px] leading-[20px] text-text-secondary">
              ✨ Introducing Edge Functions — run code at the edge with zero cold starts.
            </div>
          </div>
        </Section>

        {/* ─── 10. EXEMPLAR SURFACES ─── */}
        <Section title="Superficies de Ejemplo">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Auth Form Card */}
            <div className="rounded-[12px] bg-page p-8">
              <span className="font-mono text-[12px] leading-[16px] text-text-muted">ex-auth-form-card</span>
              <h3 className="mt-3 text-[20px] font-semibold leading-[28px] tracking-[-0.6px] text-text-primary">
                Sign In
              </h3>
              <div className="mt-4 space-y-3">
                <input
                  type="email"
                  placeholder="Email"
                  className="h-10 w-full rounded-[6px] border border-border bg-card px-3 text-[14px] leading-[20px] text-text-primary placeholder:text-text-muted outline-none"
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="h-10 w-full rounded-[6px] border border-border bg-card px-3 text-[14px] leading-[20px] text-text-primary placeholder:text-text-muted outline-none"
                />
                <button className="w-full rounded-[6px] bg-text-primary px-3 py-0 text-[14px] font-medium leading-[40px] text-white">
                  Sign In
                </button>
              </div>
            </div>
            {/* Modal Card */}
            <div className="rounded-[12px] bg-card p-8 shadow-[0px_1px_1px_#00000005,0px_8px_16px_-4px_#0000000a,0px_24px_32px_-8px_#0000000f,0_0_0_1px_#00000014_inset]">
              <span className="font-mono text-[12px] leading-[16px] text-text-muted">ex-modal-card</span>
              <h3 className="mt-3 text-[20px] font-semibold leading-[28px] tracking-[-0.6px] text-text-primary">
                Delete project
              </h3>
              <p className="mt-2 text-[14px] leading-[20px] text-text-secondary">
                Are you sure? This action cannot be undone.
              </p>
              <div className="mt-4 flex gap-2">
                <button className="rounded-[6px] bg-card px-3 py-0 text-[14px] font-medium leading-[36px] text-text-primary shadow-[0_0_0_1px_#ebebeb] flex-1">
                  Cancel
                </button>
                <button className="rounded-[6px] bg-[#ee0000] px-3 py-0 text-[14px] font-medium leading-[36px] text-white flex-1">
                  Delete
                </button>
              </div>
            </div>
            {/* Empty State */}
            <div className="rounded-[12px] bg-page p-12 text-center">
              <span className="font-mono text-[12px] leading-[16px] text-text-muted">ex-empty-state-card</span>
              <div className="mt-6 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface">
                <span className="text-[20px]">📦</span>
              </div>
              <h3 className="text-[16px] font-medium leading-[24px] text-text-primary">
                No projects yet
              </h3>
              <p className="mt-1 text-[14px] leading-[20px] text-text-secondary">
                Create your first project to get started.
              </p>
              <button className="mt-4 rounded-[6px] bg-text-primary px-3 py-0 text-[14px] font-medium leading-[36px] text-white">
                Create Project
              </button>
            </div>
            {/* Toast */}
            <div className="rounded-[8px] bg-card p-3 shadow-[0px_2px_2px_#0000000a,0px_8px_16px_-4px_#0000000a,0_0_0_1px_#00000014_inset] flex items-center gap-2">
              <span className="font-mono text-[12px] leading-[16px] text-text-muted">ex-toast</span>
              <span className="text-[14px] leading-[20px] text-text-primary">✓ Deployed successfully</span>
            </div>
            {/* Data Table Preview */}
            <div className="rounded-[8px] bg-card p-4 shadow-[0_0_0_1px_#00000014_inset]">
              <span className="mb-2 block font-mono text-[12px] leading-[16px] text-text-muted">ex-data-table-cell</span>
              <table className="w-full text-left text-[14px] leading-[20px]">
                <thead>
                  <tr className="text-[12px] font-mono leading-[16px] text-text-muted uppercase tracking-wide">
                    <th className="bg-page px-2 py-1">Name</th>
                    <th className="bg-page px-2 py-1">Status</th>
                    <th className="bg-page px-2 py-1">Usage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="px-2 py-2 text-text-primary">my-app</td>
                    <td className="px-2 py-2 text-accent">Active</td>
                    <td className="px-2 py-2 text-text-secondary">45%</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-2 text-text-primary">api-service</td>
                    <td className="px-2 py-2 text-[#f5a623]">Pending</td>
                    <td className="px-2 py-2 text-text-secondary">12%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Sidebar row */}
            <div className="rounded-[6px] bg-card px-3 py-2 flex items-center gap-2 shadow-[0_0_0_1px_#ebebeb]">
              <div className="h-1 w-1 rounded-full bg-text-primary" />
              <span className="text-[14px] leading-[20px] text-text-primary font-medium">ex-app-shell-row — Overview</span>
            </div>
          </div>
        </Section>

        {/* ─── 11. NAV ─── */}
        <Section title="Navegación">
          {/* Nav Bar Preview */}
          <div>
            <span className="mb-2 block font-mono text-[12px] leading-[16px] text-text-muted">nav-bar (64px)</span>
            <div className="flex h-16 items-center justify-between rounded-[8px] border border-border bg-card px-6">
              <div className="flex items-center gap-1">
                <span className="text-[16px] font-semibold text-text-primary">▲</span>
                <span className="text-[14px] font-medium text-text-primary">Vercel</span>
              </div>
              <div className="hidden sm:flex items-center gap-1">
                {["Features", "Docs", "Pricing", "Enterprise"].map((item) => (
                  <a key={item} href="#" className="rounded-full px-3 py-1 text-[14px] leading-[20px] text-text-secondary hover:text-text-primary no-underline">
                    {item}
                  </a>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-[6px] bg-card px-2 py-0 text-[14px] font-medium leading-[28px] text-text-primary shadow-[0_0_0_1px_#ebebeb]">
                  Ask AI
                </button>
                <button className="rounded-[6px] bg-card px-2 py-0 text-[14px] font-medium leading-[28px] text-text-primary">
                  Log In
                </button>
                <button className="rounded-[6px] bg-text-primary px-2 py-0 text-[14px] font-medium leading-[28px] text-white">
                  Sign Up
                </button>
              </div>
            </div>
          </div>

          {/* Footer Preview */}
          <div>
            <span className="mb-2 block font-mono text-[12px] leading-[16px] text-text-muted">footer</span>
            <div className="rounded-[8px] border border-border bg-card px-6 py-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  { title: "PRODUCT", items: ["AI", "Edge", "Docs"] },
                  { title: "RESOURCES", items: ["Blog", "Changelog", "Status"] },
                  { title: "COMPANY", items: ["About", "Careers", "Contact"] },
                  { title: "LEGAL", items: ["Privacy", "Terms", "Security"] },
                ].map((col) => (
                  <div key={col.title}>
                    <p className="mb-2 font-mono text-[12px] leading-[16px] text-text-muted uppercase tracking-wide">{col.title}</p>
                    <ul className="space-y-1">
                      {col.items.map((item) => (
                        <li key={item}>
                          <a href="#" className="text-[14px] leading-[20px] text-text-secondary hover:text-text-primary no-underline">{item}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ─── FOOTER NOTE ─── */}
        <div className="border-t border-border pt-6 pb-10 text-center">
          <p className="text-[12px] leading-[16px] text-text-muted">
            Sistema de diseño inspirado en Vercel · Tokens basados en Geist Design System
          </p>
        </div>
      </div>
    </main>
  );
}
