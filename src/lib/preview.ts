/**
 * Mod „preview” (Lovable / dev local).
 * Cât timp backendul FastAPI nu rulează sau nu ești logat, paginile de admin
 * rămân vizibile ca să poți inspecta interfața din preview.
 */
export function isPreviewEnv(): boolean {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h.endsWith(".lovable.app") ||
    h.endsWith(".lovableproject.com")
  );
}
