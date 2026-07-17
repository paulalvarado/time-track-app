import { createRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Route as publicLayout } from "../layouts/public-layout";
import {
  Button,
  Input,
  Textarea,
  Badge,
  Checkbox,
  Tag,
  MultiSelect,
  Dropdown,
  DropdownItem,
  DropdownDivider,
  DropdownHeader,
  Label,
  Card,
  CardLabel,
} from "../components/ui";

export const Route = createRoute({
  getParentRoute: () => publicLayout,
  path: "/forms",
  component: FormsView,
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

const SvgSearch = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const SvgEmail = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
  </svg>
);

const SvgEyeOff = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

const SvgClear = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const SvgChevronDown = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

const SvgDatabase = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
  </svg>
);

/* ─── Main Component ─── */

function FormsView() {
  const [frameworks, setFrameworks] = useState(["react", "typescript"]);
  const frameworkOptions = [
    { value: "react", label: "React" },
    { value: "typescript", label: "TypeScript" },
    { value: "tailwind", label: "Tailwind CSS" },
    { value: "nextjs", label: "Next.js" },
    { value: "vue", label: "Vue" },
    { value: "angular", label: "Angular" },
    { value: "svelte", label: "Svelte" },
    { value: "node", label: "Node.js" },
    { value: "python", label: "Python" },
  ];

  return (
    <main className="min-h-screen bg-page">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-[1200px] px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[32px] font-semibold leading-[40px] tracking-[-1.28px] text-text-primary">
                Formularios.
              </h1>
              <p className="mt-1 text-[14px] leading-[20px] text-text-secondary">
                Componentes reutilizables — importables desde <code className="font-mono text-[13px] text-text-primary">components/ui</code>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-[6px] border border-border bg-page p-0.5">
                <Link to="/design-system" className="inline-flex h-[28px] items-center rounded-[4px] px-3 text-[13px] font-medium leading-[20px] text-text-secondary no-underline hover:text-text-primary">
                  Tokens
                </Link>
                <Link to="/forms" className="inline-flex h-[28px] items-center rounded-[4px] bg-card px-3 text-[13px] font-medium leading-[20px] text-text-primary no-underline border border-border">
                  Formularios
                </Link>
                <Link to="/dialogs" className="inline-flex h-[28px] items-center rounded-[4px] px-3 text-[13px] font-medium leading-[20px] text-text-secondary no-underline hover:text-text-primary">
                  Dialogs
                </Link>
              </div>
              <Link to="/" className="inline-flex h-[28px] items-center rounded-[6px] bg-text-primary px-2 text-[14px] font-medium leading-[20px] text-white no-underline">
                Volver
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-6 py-10 space-y-16">
        {/* ─── 1. INPUTS ─── */}
        <Section title="Inputs">
          {/* Sizes */}
          <div>
            <h3 className="mb-3 text-[14px] font-medium leading-[20px] text-text-secondary">Tamaños</h3>
            <div className="space-y-3">
              <div>
                <Label>Input sm (32px)</Label>
                <Input size="sm" placeholder="Search projects..." wrapperClassName="max-w-xs" />
              </div>
              <div>
                <Label>Input md (40px) — por defecto</Label>
                <Input placeholder="hello@example.com" wrapperClassName="max-w-sm" />
              </div>
              <div>
                <Label>Input lg (48px)</Label>
                <Input size="lg" placeholder="Enter your email" wrapperClassName="max-w-sm" />
              </div>
            </div>
          </div>

          {/* With Icons */}
          <div>
            <h3 className="mb-3 text-[14px] font-medium leading-[20px] text-text-secondary">Con Iconos</h3>
            <div className="space-y-3">
              <div>
                <Label>Leading icon — Search</Label>
                <Input leadingIcon={<SvgSearch />} placeholder="Search projects..." wrapperClassName="max-w-sm" />
              </div>
              <div>
                <Label>Leading icon — Email</Label>
                <Input leadingIcon={<SvgEmail />} type="email" placeholder="hello@example.com" wrapperClassName="max-w-sm" />
              </div>
              <div>
                <Label>Trailing icon — Password</Label>
                <Input type="password" placeholder="Enter your password" trailingIcon={<SvgEyeOff />} wrapperClassName="max-w-sm" />
              </div>
              <div>
                <Label>Leading + Trailing — Clearable</Label>
                <Input leadingIcon={<SvgSearch />} trailingIcon={<SvgClear />} defaultValue="React Router Dom" wrapperClassName="max-w-sm" />
              </div>
            </div>
          </div>

          {/* Prefix / Suffix */}
          <div>
            <h3 className="mb-3 text-[14px] font-medium leading-[20px] text-text-secondary">Prefijo / Sufijo</h3>
            <div className="space-y-3">
              <div>
                <Label>Prefijo — Moneda</Label>
                <div className="relative max-w-[200px]">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-[14px] leading-[20px] text-text-muted font-medium">$</span>
                  </div>
                  <input
                    type="text"
                    placeholder="0.00"
                    className="h-10 w-full rounded-[6px] border border-border bg-card pl-7 pr-3 text-[14px] leading-[20px] text-text-primary placeholder:text-text-muted outline-none transition-all duration-150 focus:border-text-primary focus:ring-[3px] focus:ring-text-primary/10"
                  />
                </div>
              </div>
              <div>
                <Label>Sufijo — Unidad</Label>
                <div className="relative max-w-[200px]">
                  <input
                    type="text"
                    defaultValue="1000"
                    className="h-10 w-full rounded-[6px] border border-border bg-card pl-3 pr-8 text-[14px] leading-[20px] text-text-primary placeholder:text-text-muted outline-none transition-all duration-150 focus:border-text-primary focus:ring-[3px] focus:ring-text-primary/10"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-[14px] leading-[20px] text-text-muted">credits</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* States */}
          <div>
            <h3 className="mb-3 text-[14px] font-medium leading-[20px] text-text-secondary">Estados</h3>
            <div className="space-y-4">
              <div>
                <Label>Helper text</Label>
                <Input placeholder="your-project-name" helperText="Usa letras minúsculas y guiones. Ej: my-first-project." wrapperClassName="max-w-sm" />
              </div>
              <div>
                <Label>Error state</Label>
                <Input defaultValue="invalid-email@" error="Dirección de email inválida." wrapperClassName="max-w-sm" />
              </div>
              <div>
                <Label>Disabled</Label>
                <Input defaultValue="app-123456" disabled wrapperClassName="max-w-sm" />
              </div>
              <div>
                <Label>Read-only</Label>
                <Input defaultValue="plan-hobby-v1" readOnly wrapperClassName="max-w-sm" />
              </div>
            </div>
          </div>

          {/* Textarea */}
          <div>
            <h3 className="mb-3 text-[14px] font-medium leading-[20px] text-text-secondary">Textarea</h3>
            <div className="space-y-3">
              <div>
                <Label>Textarea con contador</Label>
                <Textarea placeholder="Describe your project..." rows={4} showCount maxLength={500} wrapperClassName="max-w-lg" />
              </div>
              <div>
                <Label>Textarea código (mono)</Label>
                <Textarea placeholder={`$ vercel deploy\n> Deploying...`} rows={4} mono wrapperClassName="max-w-lg" />
              </div>
            </div>
          </div>

          {/* Composed: Input + Button */}
          <div>
            <h3 className="mb-3 text-[14px] font-medium leading-[20px] text-text-secondary">Input + Botón</h3>
            <div className="space-y-3">
              <div>
                <Label>Inline button</Label>
                <div className="flex max-w-md">
                  <input
                    type="text"
                    placeholder="your-project.vercel.app"
                    className="-mr-[1px] h-10 flex-1 rounded-l-[6px] rounded-r-none border border-border bg-card px-3 text-[14px] leading-[20px] text-text-primary placeholder:text-text-muted outline-none transition-all duration-150 focus:border-text-primary focus:ring-[3px] focus:ring-text-primary/10"
                  />
                  <Button className="rounded-l-none! rounded-r-[6px]!">Deploy</Button>
                </div>
              </div>
              <div>
                <Label>Spaced button</Label>
                <div className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    placeholder="Enter invite email"
                    className="h-10 flex-1 rounded-[6px] border border-border bg-card px-3 text-[14px] leading-[20px] text-text-primary placeholder:text-text-muted outline-none transition-all duration-150 focus:border-text-primary focus:ring-[3px] focus:ring-text-primary/10"
                  />
                  <Button>Invite</Button>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ─── 2. SELECTORES & DROPDOWNS ─── */}
        <Section title="Selectores y Dropdowns">
          {/* Multi-Select */}
          <div>
            <h3 className="mb-3 text-[14px] font-medium leading-[20px] text-text-secondary">Selectores Múltiples</h3>
            <div className="space-y-3">
              <div>
                <Label>Multi-select con dropdown</Label>
                <MultiSelect
                  options={frameworkOptions}
                  selected={frameworks}
                  onChange={setFrameworks}
                  placeholder="Select frameworks..."
                  wrapperClassName="max-w-md"
                />
              </div>
              <div>
                <Label>Checkbox group</Label>
                <div className="w-full max-w-xs space-y-1 rounded-[6px] border border-border bg-card p-3">
                  <Checkbox label="Dashboard" />
                  <Checkbox label="Projects" />
                  <Checkbox label="Deployments" />
                  <Checkbox label="Settings" />
                </div>
              </div>
            </div>
          </div>

          {/* Dropdown Menu */}
          <div>
            <h3 className="mb-3 text-[14px] font-medium leading-[20px] text-text-secondary">Menú Dropdown</h3>
            <div className="space-y-3">
              <div>
                <Label>Dropdown menú de acciones</Label>
                <Dropdown
                  trigger={
                    <Button variant="secondary" size="md">
                      Options
                      <SvgChevronDown />
                    </Button>
                  }
                >
                  <DropdownItem icon={<SvgSearch />}>View details</DropdownItem>
                  <DropdownItem icon={<SvgEmail />}>Duplicate</DropdownItem>
                  <DropdownItem icon={<SvgClear />}>Rename</DropdownItem>
                  <DropdownDivider />
                  <DropdownItem variant="danger" icon={<SvgEyeOff />}>Delete</DropdownItem>
                </Dropdown>
              </div>
              <div>
                <Label>Dropdown con avatar</Label>
                <Dropdown
                  align="end"
                  trigger={
                    <Button variant="secondary" size="md">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface text-[11px] font-medium text-text-secondary">JD</div>
                      <div className="flex flex-col items-start">
                        <span className="text-[13px] leading-[16px] font-medium text-text-primary">John Doe</span>
                        <span className="text-[11px] leading-[14px] text-text-muted">john@example.com</span>
                      </div>
                      <SvgChevronDown />
                    </Button>
                  }
                >
                  <DropdownHeader>
                    <p className="text-[13px] font-medium leading-[18px] text-text-primary">john@example.com</p>
                    <p className="text-[11px] leading-[14px] text-text-muted">Pro plan</p>
                  </DropdownHeader>
                  <DropdownItem>Account</DropdownItem>
                  <DropdownItem>Billing</DropdownItem>
                  <DropdownItem>Team</DropdownItem>
                  <DropdownDivider />
                  <DropdownItem variant="danger">Sign out</DropdownItem>
                </Dropdown>
              </div>
            </div>
          </div>

          {/* Buttons & Split Buttons */}
          <div>
            <h3 className="mb-3 text-[14px] font-medium leading-[20px] text-text-secondary">Botones</h3>
            <div className="space-y-4">
              <div>
                <Label>Variantes</Label>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="danger">Danger</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>
              </div>
              <div>
                <Label>Tamaños</Label>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm" variant="primary">Small</Button>
                  <Button size="md" variant="primary">Medium</Button>
                  <Button size="lg" variant="primary">Large</Button>
                </div>
              </div>
              <div>
                <Label>Pill (CTA marketing)</Label>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary" pill>Start Deploying</Button>
                  <Button variant="secondary" pill>Learn More</Button>
                </div>
              </div>
              <div>
                <Label>Split button</Label>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex">
                    <Button className="rounded-r-none! border-r border-r-[#ffffff]/20">Deploy</Button>
                    <Button className="rounded-l-none! border-l border-l-[#ffffff]/20 px-3!">
                      <SvgChevronDown />
                    </Button>
                  </div>
                  <div className="inline-flex">
                    <Button variant="secondary" className="rounded-r-none!">Save as Draft</Button>
                    <Button variant="secondary" className="rounded-l-none! border-l-0 px-3!">
                      <SvgChevronDown />
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <Label>Kebab menu (tres puntos)</Label>
                <Dropdown
                  align="end"
                  trigger={
                    <Button variant="secondary" size="sm" className="px-2!">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                      </svg>
                    </Button>
                  }
                >
                  <DropdownItem>Edit</DropdownItem>
                  <DropdownItem>Duplicate</DropdownItem>
                  <DropdownItem>Move to...</DropdownItem>
                  <DropdownItem>Archive</DropdownItem>
                  <DropdownDivider />
                  <DropdownItem variant="danger">Delete</DropdownItem>
                </Dropdown>
              </div>
            </div>
          </div>
        </Section>

        {/* ─── 3. BADGES ─── */}
        <Section title="Badges">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="default">badge-secondary</Badge>
            <Badge variant="info">New</Badge>
            <Badge variant="warning">Beta</Badge>
            <Badge variant="error">Deprecated</Badge>
            <Badge variant="success">Live</Badge>
          </div>
        </Section>

        {/* ─── 4. CARDS DEMO ─── */}
        <Section title="Uso de Cards">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card variant="default">
              <CardLabel>card-marketing</CardLabel>
              <h3 className="mt-2 text-[20px] font-semibold leading-[28px] tracking-[-0.6px] text-text-primary">Web Apps</h3>
              <p className="mt-1 text-[14px] leading-[20px] text-text-secondary">Build dynamic web applications.</p>
            </Card>
            <Card variant="pricing-featured">
              <CardLabel className="text-text-muted!">pricing-card-featured</CardLabel>
              <p className="mt-4 text-[14px] font-medium leading-[20px] text-[#a1a1a1]">Pro</p>
              <p className="text-[48px] font-semibold leading-[48px] tracking-[-2.4px] text-[#ffffff]">$20</p>
              <ul className="mt-4 space-y-2 text-[14px] leading-[20px] text-[#a1a1a1]">
                <li>✓ Unlimited projects</li>
                <li>✓ Unlimited deployments</li>
              </ul>
              <Button variant="secondary" size="md" className="mt-6 w-full">Subscribe</Button>
            </Card>
            <Card variant="soft">
              <CardLabel>card-soft</CardLabel>
              <h3 className="mt-2 text-[20px] font-semibold leading-[28px] tracking-[-0.6px] text-text-primary">Analytics</h3>
              <p className="mt-1 text-[14px] leading-[20px] text-text-secondary">Real-time insights for your deployments.</p>
            </Card>
          </div>
        </Section>

        {/* ─── FOOTER NOTE ─── */}
        <div className="border-t border-border pt-6 pb-10 text-center">
          <p className="text-[12px] leading-[16px] text-text-muted">
            Importa los componentes desde <code className="font-mono text-[13px] text-text-primary">components/ui</code>
          </p>
        </div>
      </div>
    </main>
  );
}
