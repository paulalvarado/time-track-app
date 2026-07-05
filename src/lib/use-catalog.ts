import { useState, useEffect } from "react";

export type CatalogItem = {
  key: string;
  value: string;
  extra?: Record<string, any> | null;
};

export function useCatalog(name: string) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/odoo/catalogs/${name}`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error(`Catalog '${name}' not available. Run sync-catalogs first.`);
          throw new Error("Failed to fetch catalog");
        }
        const data = await res.json();
        if (!cancelled) {
          setItems(data.catalog.items || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [name]);

  return { items, loading, error };
}
