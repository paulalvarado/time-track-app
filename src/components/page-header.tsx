import { Breadcrumb } from "./breadcrumb";

type Crumb = {
  label: string;
  to?: string;
  params?: Record<string, string>;
};

type PageHeaderProps = {
  title: string;
  description: string;
  breadcrumbs?: Crumb[];
  children?: React.ReactNode;
};

export function PageHeader({ title, description, breadcrumbs, children }: PageHeaderProps) {
  return (
    <>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="py-3">
          <Breadcrumb items={breadcrumbs} />
        </div>
      )}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-[24px] font-semibold leading-[32px] tracking-[-0.96px] text-text-primary">
            {title}
          </h1>
          <p className="mt-1 text-[14px] leading-[20px] text-text-secondary">
            {description}
          </p>
        </div>
        {children && (
          <div className="flex items-center gap-3 shrink-0 pt-1">
            {children}
          </div>
        )}
      </div>
    </>
  );
}
