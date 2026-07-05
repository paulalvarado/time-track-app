import { createRoute, Link } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import { Button } from "../components/ui";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terms",
  component: TermsPage,
});

function TermsPage() {
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
            Terms of Service.
          </h1>
          <p className="mt-2 text-[14px] leading-[20px] text-text-muted">Last updated: July 4, 2026</p>
        </div>

        <div className="space-y-6 text-[14px] leading-[24px] text-text-secondary">
          <section className="space-y-2">
            <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary">1. Acceptance of Terms</h2>
            <p>By accessing or using Time Track ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, you may not use the Service.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary">2. Description of Service</h2>
            <p>Time Track provides time tracking functionality with Odoo integration. The Service allows users to log, manage, and report time entries associated with projects.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary">3. User Responsibilities</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information and keep it updated. You must not use the Service for any unlawful purpose.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary">4. Data Privacy</h2>
            <p>Your use of the Service is governed by our Privacy Policy. We implement reasonable security measures to protect your data, but no method of transmission over the Internet is completely secure.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary">5. Limitation of Liability</h2>
            <p>Time Track is provided "as is" without warranties of any kind. We shall not be liable for any damages arising from your use of the Service.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary">6. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Continued use of the Service after changes constitutes acceptance.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary">7. Contact</h2>
            <p>For questions about these terms, please contact support@timetrack.app.</p>
          </section>
        </div>

        <div className="border-t border-border pt-6 flex gap-3">
          <Link to="/register">
            <Button size="md">Back to sign up</Button>
          </Link>
          <Link to="/privacy">
            <Button variant="secondary" size="md">Privacy Policy</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
