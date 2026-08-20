/**
 * Thin compatibility layer so the original pages/components can keep using the
 * familiar router API (Link, NavLink, Navigate, useNavigate, useLocation)
 * while the app runs on this project's router.
 */
import {
  Link as RouterLink,
  useNavigate as useRouterNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";
import type { AnchorHTMLAttributes, ComponentType, ReactNode } from "react";

type BaseLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className"> & {
  to: string;
  replace?: boolean;
  state?: unknown;
  children?: ReactNode;
  className?: string;
};

const AnyLink = RouterLink as unknown as ComponentType<Record<string, unknown>>;

export function Link({ to, replace, state, children, ...rest }: BaseLinkProps) {
  return (
    <AnyLink to={to} replace={replace} state={state} {...rest}>
      {children}
    </AnyLink>
  );
}

type NavLinkProps = Omit<BaseLinkProps, "className"> & {
  end?: boolean;
  className?: string | ((props: { isActive: boolean }) => string);
  style?: AnchorHTMLAttributes<HTMLAnchorElement>["style"];
};

export function NavLink({ to, end, className, children, ...rest }: NavLinkProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = end ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);
  const resolved = typeof className === "function" ? className({ isActive }) : className;

  return (
    <Link to={to} className={resolved} data-status={isActive ? "active" : undefined} {...rest}>
      {children}
    </Link>
  );
}

type NavigateOptions = {
  replace?: boolean;
  state?: unknown;
};

export function useNavigate() {
  const navigate = useRouterNavigate();

  return (to: string | number, options?: NavigateOptions) => {
    if (typeof to === "number") {
      if (typeof window !== "undefined") window.history.go(to);
      return;
    }
    void (navigate as unknown as (opts: Record<string, unknown>) => Promise<void>)({
      to,
      replace: options?.replace,
      state: options?.state,
    });
  };
}

export function useLocation() {
  return useRouterState({ select: (s) => s.location }) as unknown as {
    pathname: string;
    search: unknown;
    hash: string;
    state: unknown;
  };
}

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to, { replace });
  }, [to, replace, navigate]);
  return null;
}
