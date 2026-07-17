import { createRoute, Link } from "@tanstack/react-router";
import { Button } from "../components/ui";
import { Route as publicLayout } from "../layouts/public-layout";

export const Route = createRoute({
  getParentRoute: () => publicLayout,
  path: "/privacy",
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="min-h-screen bg-page">
      <div className="mx-auto max-w-[640px] px-6 py-12 space-y-8">
        <div>
          <h1 className="text-[32px] font-semibold leading-[40px] tracking-[-1.28px] text-text-primary">
            Política de Privacidad.
          </h1>
          <p className="mt-2 text-[14px] leading-[20px] text-text-muted">Última actualización: 4 de julio de 2026</p>
        </div>

        <div className="space-y-6 text-[14px] leading-[24px] text-text-secondary">
          <section className="space-y-2">
            <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary">1. Información que Recopilamos</h2>
            <p>Recopilamos la información que proporcionas al crear una cuenta, incluyendo tu nombre, correo electrónico y credenciales de autenticación. También recopilamos los datos de registro de tiempo que ingresas en el Servicio.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary">2. Cómo Usamos tu Información</h2>
            <p>Usamos tu información para proporcionar, mantener y mejorar el Servicio; para autenticar tu acceso; para comunicarnos contigo sobre tu cuenta; y para cumplir con obligaciones legales.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary">3. Compartir Datos</h2>
            <p>No vendemos tus datos personales. Podemos compartir datos con proveedores de servicios externos (ej. Odoo) según sea necesario para brindar el Servicio, bajo acuerdos contractuales que protegen tus datos.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary">4. Seguridad de los Datos</h2>
            <p>Implementamos medidas de seguridad estándar de la industria, incluyendo cifrado en tránsito (TLS) y en reposo. Las contraseñas se cifran usando bcrypt. Sin embargo, ningún sistema es 100% seguro.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary">5. Tus Derechos</h2>
            <p>Puedes acceder, actualizar o eliminar la información de tu cuenta en cualquier momento. Puedes solicitar la exportación de tus datos o la eliminación de tu cuenta contactándonos.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary">6. Cookies</h2>
            <p>Usamos cookies esenciales para la autenticación y gestión de sesiones. No se utilizan cookies de rastreo con fines publicitarios.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary">7. Contacto</h2>
            <p>Para consultas de privacidad, contacta a privacy@timetrack.app.</p>
          </section>
        </div>

        <div className="border-t border-border pt-6 flex gap-3">
          <Link to="/register">
            <Button size="md">Volver a registrarse</Button>
          </Link>
          <Link to="/terms">
            <Button variant="secondary" size="md">Términos de Servicio</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
