import { createRoute, Link } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import { Button } from "../components/ui";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy",
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="min-h-screen bg-page">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-[760px] px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="2" fill="currentColor" />
              <circle cx="14" cy="14" r="2" fill="currentColor" />
              <line x1="14" y1="4" x2="14" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="14" y1="14" x2="20" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="14" y1="14" x2="14" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="text-[16px] font-semibold text-text-primary">Time Track</span>
          </div>
          <Link to="/register" className="inline-flex h-[28px] items-center rounded-[6px] bg-[#171717] px-2 text-[14px] font-medium leading-[20px] text-[#ffffff] no-underline">
            Sign up
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[640px] px-6 py-12 space-y-8">
        <div>
          <h1 className="text-[32px] font-semibold leading-[40px] tracking-[-1.28px] text-text-primary">
            Privacy Policy.
          </h1>
          <p className="mt-2 text-[14px] leading-[20px] text-text-muted">Last updated: July 4, 2026</p>
        </div>

        <div className="space-y-6 text-[14px] leading-[24px] text-text-secondary">
          <section className="space-y-2">
            <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary">1. Information We Collect</h2>
            <p>We collect information you provide when creating an account, including your name, email address, and authentication credentials. We also collect time tracking data you enter into the Service.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary">2. How We Use Your Information</h2>
            <p>We use your information to provide, maintain, and improve the Service; to authenticate your access; to communicate with you about your account; and to comply with legal obligations.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary">3. Data Sharing</h2>
            <p>We do not sell your personal data. We may share data with third-party service providers (e.g., Odoo) as necessary to deliver the Service, under contractual agreements that protect your data.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary">4. Data Security</h2>
            <p>We implement industry-standard security measures including encryption in transit (TLS) and at rest. Passwords are hashed using bcrypt. However, no system is 100% secure.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary">5. Your Rights</h2>
            <p>You may access, update, or delete your account information at any time. You can request data export or account deletion by contacting us.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary">6. Cookies</h2>
            <p>We use essential cookies for authentication and session management. No tracking cookies are used for advertising purposes.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary">7. Contact</h2>
            <p>For privacy inquiries, contact privacy@timetrack.app.</p>
          </section>
        </div>

        <div className="border-t border-border pt-6 flex gap-3">
          <Link to="/register">
            <Button size="md">Back to sign up</Button>
          </Link>
          <Link to="/terms">
            <Button variant="secondary" size="md">Terms of Service</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
