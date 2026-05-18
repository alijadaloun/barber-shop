import { useEffect, useState } from "react";
import {
  fetchBarbers,
  fetchServices,
  type Barber,
  type Service,
} from "../lib/api";

export function useCatalog() {
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [svc, bar] = await Promise.all([
          fetchServices(),
          fetchBarbers(),
        ]);
        if (!cancelled) {
          setServices(svc);
          setBarbers(bar);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load catalog"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { services, barbers, loading, error };
}
