declare module "node:test" {
  type TestCallback = () => void | Promise<void>;
  const test: (name: string, fn: TestCallback) => void;
  export default test;
}

declare module "node:assert/strict" {
  interface ThrowsOptions {
    message?: string | RegExp;
  }

  const assert: {
    ok: (value: unknown, message?: string) => void;
    equal: (actual: unknown, expected: unknown, message?: string) => void;
    throws: (fn: () => unknown, options?: ThrowsOptions) => void;
  };

  export default assert;
}

declare module "react-dom/server" {
  export const renderToStaticMarkup: (element: unknown) => string;
}
