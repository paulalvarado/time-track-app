import { createRoute, Link } from "@tanstack/react-router";
import { Button } from "../components/ui";
import { Route as publicLayout } from "../layouts/public-layout";

export const Route = createRoute({
  getParentRoute: () => publicLayout,
  path: "/terms",
  component: TermsPage,
});

function TermsPage() {
  return (
    <main className="min-h-screen bg-page">
      <div className="mx-auto max-w-[640px] px-6 py-12 space-y-8">
        <div>
          <h1 className="text-[32px] font-semibold leading-[40px] tracking-[-1.28px] text-text-primary">
            Términos de Servicio.
          </h1>
          <p className="mt-2 text-[14px] leading-[20px] text-text-muted">Última actualización: 4 de julio de 2026</p>
        </div>

        <div className="space-y-6 text-[14px] leading-[24px] text-text-secondary">
          <section className="space-y-2">
            <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary">1. Aceptación de los Términos</h2>
            <p>Al acceder o usar Time Track ("el Servicio"), aceptas quedar vinculado por estos Términos de Servicio. Si no estás de acuerdo, no puedes usar el Servicio.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary">2. Descripción del Servicio</h2>
            <p>Time Track proporciona funcionalidad de registro de tiempo con integración a Odoo. El Servicio permite a los usuarios registrar, gestionar y reportar entradas de tiempo asociadas a proyectos.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary">3. Responsabilidades del Usuario</h2>
            <p>Eres responsable de mantener la confidencialidad de tus credenciales de cuenta. Aceptas proporcionar información precisa y mantenerla actualizada. No debes usar el Servicio para ningún propósito ilícito.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary">4. Privacidad de los Datos</h2>
            <p>Tu uso del Servicio se rige por nuestra Política de Privacidad. Implementamos medidas de seguridad razonables para proteger tus datos, pero ningún método de transmisión por Internet es completamente seguro.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary">5. Limitación de Responsabilidad</h2>
            <p>Time Track se proporciona "tal cual" sin garantías de ningún tipo. No seremos responsables por daños derivados del uso del Servicio.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary">6. Cambios en los Términos</h2>
            <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán efectivos inmediatamente después de su publicación. El uso continuado del Servicio después de los cambios constituye la aceptación de los mismos.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary">7. Contacto</h2>
            <p>Si tienes preguntas sobre estos términos, contacta a support@timetrack.app.</p>
          </section>
        </div>

        <div className="border-t border-border pt-6 flex gap-3">
          <Link to="/register">
            <Button size="md">Volver a registrarse</Button>
          </Link>
          <Link to="/privacy">
            <Button variant="secondary" size="md">Política de Privacidad</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
