import { createRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Route as publicLayout } from "../layouts/public-layout";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  useDialog,
  Input,
  SelectMenu,
  Label,
} from "../components/ui";

export const Route = createRoute({
  getParentRoute: () => publicLayout,
  path: "/dialogs",
  component: DialogsView,
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

/* ─── Demo dialogs ─── */

function ConfirmDeleteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader
        title="Delete project"
        description="This action cannot be undone. All data will be permanently removed."
        onClose={onClose}
      />
      <DialogBody>
        <div className="rounded-[8px] bg-danger-bg border border-danger/20 p-3 text-[13px] leading-[18px] text-danger-text">
          ⚠️ This will delete all deployments, logs, and analytics associated with this project.
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={onClose}>Delete project</Button>
      </DialogFooter>
    </Dialog>
  );
}

function NewProjectDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [framework, setFramework] = useState("next");
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader title="New Project" description="Create a new project from scratch." onClose={onClose} />
      <DialogBody className="space-y-4">
        <div>
          <Label>Project name</Label>
          <Input placeholder="my-awesome-project" wrapperClassName="max-w-full" />
        </div>
        <div>
          <Label>Framework</Label>
          <SelectMenu
            options={[
              { value: "next", label: "Next.js" },
              { value: "react", label: "React" },
              { value: "vue", label: "Vue" },
              { value: "node", label: "Node.js" },
            ]}
            value={framework}
            onChange={setFramework}
            wrapperClassName="max-w-full"
          />
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={onClose}>Create</Button>
      </DialogFooter>
    </Dialog>
  );
}

function SuccessDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <div className="text-center py-4">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-info-bg">
          <svg className="h-7 w-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-[20px] font-semibold leading-[28px] tracking-[-0.6px] text-text-primary">Deployed!</h2>
        <p className="mt-1 text-[14px] leading-[20px] text-text-secondary">Your project was deployed successfully.</p>
        <div className="mt-4 rounded-[6px] bg-page border border-border p-3 font-mono text-[13px] leading-[20px] text-text-secondary text-left">
          <div className="text-accent">$ vercel deploy --prod</div>
          <div>✓ Production deployment created.</div>
          <div className="text-text-muted">https://my-app.vercel.app</div>
        </div>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button onClick={onClose}>Visit Dashboard</Button>
        </div>
      </div>
    </Dialog>
  );
}

/* ─── Main Component ─── */

function DialogsView() {
  const confirmDelete = useDialog();
  const newProject = useDialog();
  const success = useDialog();
  const [toasts, setToasts] = useState<{ id: number; message: string; type: "success" | "error" | "info" }[]>([]);
  const toastId = useState(0);

  const addToast = (type: "success" | "error" | "info", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const toastStyles = {
    success: "bg-card text-text-primary border-l-[3px] border-l-accent",
    error: "bg-card text-text-primary border-l-[3px] border-l-danger",
    info: "bg-card text-text-primary border-l-[3px] border-l-[#171717]",
  };

  return (
    <main className="min-h-screen bg-page">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-[1200px] px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[32px] font-semibold leading-[40px] tracking-[-1.28px] text-text-primary">
                Dialogs.
              </h1>
              <p className="mt-1 text-[14px] leading-[20px] text-text-secondary">
                Modales, diálogos, toasts y componentes de superposición.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-[6px] border border-border bg-page p-0.5">
                <Link to="/design-system" className="inline-flex h-[28px] items-center rounded-[4px] px-3 text-[13px] font-medium leading-[20px] text-text-secondary no-underline hover:text-text-primary">
                  Tokens
                </Link>
                <Link to="/forms" className="inline-flex h-[28px] items-center rounded-[4px] px-3 text-[13px] font-medium leading-[20px] text-text-secondary no-underline hover:text-text-primary">
                  Formularios
                </Link>
                <Link to="/dialogs" className="inline-flex h-[28px] items-center rounded-[4px] bg-card px-3 text-[13px] font-medium leading-[20px] text-text-primary no-underline border border-border">
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
        {/* ─── 1. MODALS ─── */}
        <Section title="Modales">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-[8px] border border-border bg-card p-6 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-danger-bg">
                <svg className="h-5 w-5 text-[#ee0000]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </div>
              <h3 className="text-[16px] font-medium leading-[24px] text-text-primary">Confirm Delete</h3>
              <p className="mt-1 text-[13px] leading-[18px] text-text-secondary">With warning banner and destructive action.</p>
              <Button variant="danger" size="sm" className="mt-4" onClick={confirmDelete.show}>Open dialog</Button>
            </div>

            <div className="rounded-[8px] border border-border bg-card p-6 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface">
                <svg className="h-5 w-5 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <h3 className="text-[16px] font-medium leading-[24px] text-text-primary">New Project</h3>
              <p className="mt-1 text-[13px] leading-[18px] text-text-secondary">Form inside a modal with inputs and select.</p>
              <Button variant="primary" size="sm" className="mt-4" onClick={newProject.show}>Open dialog</Button>
            </div>

            <div className="rounded-[8px] border border-border bg-card p-6 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-info-bg">
                <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-[16px] font-medium leading-[24px] text-text-primary">Success</h3>
              <p className="mt-1 text-[13px] leading-[18px] text-text-secondary">Success state with code preview.</p>
              <Button variant="primary" size="sm" className="mt-4" onClick={success.show}>Open dialog</Button>
            </div>
          </div>

          {/* Live dialog renders */}
          <ConfirmDeleteDialog open={confirmDelete.open} onClose={confirmDelete.close} />
          <NewProjectDialog open={newProject.open} onClose={newProject.close} />
          <SuccessDialog open={success.open} onClose={success.close} />
        </Section>

        {/* ─── 2. TOASTS ─── */}
        <Section title="Toasts">
          <p className="text-[14px] leading-[20px] text-text-secondary mb-4">
            Notificaciones temporales que aparecen en la esquina inferior derecha.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" size="sm" onClick={() => addToast("success", "Project deployed successfully.")}>
              Success toast
            </Button>
            <Button variant="danger" size="sm" onClick={() => addToast("error", "Deployment failed. Check your config.")}>
              Error toast
            </Button>
            <Button variant="secondary" size="sm" onClick={() => addToast("info", "Build completed in 12s.")}>
              Info toast
            </Button>
          </div>
        </Section>

        {/* ─── FOOTER NOTE ─── */}
        <div className="border-t border-border pt-6 pb-10 text-center">
          <p className="text-[12px] leading-[16px] text-text-muted">
            Componentes importables desde <code className="font-mono text-[13px] text-text-primary">components/ui</code>
          </p>
        </div>
      </div>

      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 rounded-[8px] px-4 py-3 shadow-[0px_2px_2px_#0000000a,0px_8px_16px_-4px_#0000000a,0_0_0_1px_#00000014_inset] animate-[slideInRight_0.3s_ease-out] ${toastStyles[t.type]}`}
          >
            {t.type === "success" && (
              <svg className="h-4 w-4 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            )}
            {t.type === "error" && (
              <svg className="h-4 w-4 shrink-0 text-[#ee0000]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            )}
            {t.type === "info" && (
              <svg className="h-4 w-4 shrink-0 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
            )}
            <span className="flex-1 text-[14px] leading-[20px] text-text-primary">{t.message}</span>
            <button
              type="button"
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
