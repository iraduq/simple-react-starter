/**
 * Router unic al aplicației: react-router-dom.
 * Toate paginile/componentele importă din acest modul.
 */
import type { ReactNode } from "react";

export {
  Link,
  NavLink,
  Navigate,
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";

/** SPA pur — copiii se randează întotdeauna. */
export function ClientOnly({ children }: { children: ReactNode; fallback?: ReactNode }) {
  return <>{children}</>;
}
