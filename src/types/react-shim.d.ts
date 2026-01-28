declare module "react" {
  export type ReactNode = unknown;
  export interface FC<P = {}> {
    (props: P): JSX.Element | null;
  }
  export interface StrictModeProps {
    children?: ReactNode;
  }
  export const StrictMode: (props: StrictModeProps) => JSX.Element;
  export const Fragment: (props: { children?: ReactNode }) => JSX.Element;

  export function useState<S>(initial: S | (() => S)): [S, (value: S) => void];
  export function useEffect(effect: () => void | (() => void), deps?: unknown[]): void;
  export function useMemo<T>(factory: () => T, deps?: unknown[]): T;
  export function useRef<T>(initial: T | null): { current: T | null };
  export interface Context<T> {
    Provider: (props: { value: T; children?: ReactNode }) => JSX.Element;
  }
  export function createContext<T>(defaultValue: T): Context<T>;
  export function useContext<T>(context: Context<T>): T;

  export type ChangeEvent<T = HTMLInputElement> = { target: T };
  export type FormEvent<T = Element> = { currentTarget: T; preventDefault: () => void };
  export type MouseEvent<T = Element> = { currentTarget: T };
}

declare module "react/jsx-runtime" {
  export const jsx: unknown;
  export const jsxs: unknown;
  export const Fragment: unknown;
}

declare module "react-dom/client" {
  import type { ReactNode } from "react";
  interface Root {
    render(children: ReactNode): void;
  }
  export function createRoot(container: Element | DocumentFragment): Root;
}

declare namespace JSX {
  interface Element {}
  interface IntrinsicElements {
    [elemName: string]: unknown;
  }
}

declare namespace React {
  type ReactNode = unknown;
  type ChangeEvent<T = HTMLInputElement> = { target: T };
  type FormEvent<T = Element> = { currentTarget: T; preventDefault: () => void };
  type MouseEvent<T = Element> = { currentTarget: T };
}
