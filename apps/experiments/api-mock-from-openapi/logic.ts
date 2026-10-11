export const MAX_OPENAPI_CHARS = 20_000;
export const MAX_ROUTES = 12;

export type MockRoute = {
  method: string;
  path: string;
  handlerFilename: string;
  stubSource: string;
};

export type MockBundle = {
  summary: string;
  routes: MockRoute[];
  downloadText: string;
};

export function truncateText(text: string, max = MAX_OPENAPI_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function clampBundle(bundle: MockBundle): MockBundle {
  const routes = bundle.routes.slice(0, MAX_ROUTES).map((r) => ({
    method: r.method.trim().toUpperCase(),
    path: r.path.trim(),
    handlerFilename: r.handlerFilename.trim(),
    stubSource: r.stubSource.trim(),
  }));
  const downloadText =
    bundle.downloadText.trim() ||
    routes
      .map((r) => `// ${r.method} ${r.path}\n// → ${r.handlerFilename}\n${r.stubSource}\n`)
      .join('\n');
  return {
    summary: bundle.summary.trim(),
    routes,
    downloadText,
  };
}

export function downloadText(filename: string, content: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const SAMPLE_OPENAPI = `openapi: 3.0.3
info:
  title: Products API
  version: 1.0.0
paths:
  /api/products:
    get:
      summary: List products
      responses:
        '200':
          description: OK
    post:
      summary: Create product
      responses:
        '201':
          description: Created
  /api/products/{id}:
    get:
      summary: Get product
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: OK
        '404':
          description: Not found`;
