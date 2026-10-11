export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    hint?: string;
  };
};

export function jsonError(
  status: number,
  code: string,
  message: string,
  hint?: string,
): Response {
  const body: ApiErrorBody = {
    error: {
      code,
      message,
      ...(hint ? { hint } : {}),
    },
  };

  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

export function methodNotAllowed(allowed: string[]): Response {
  return jsonError(
    405,
    'method_not_allowed',
    `Method not allowed. Allowed: ${allowed.join(', ')}.`,
    'Retry with one of the allowed HTTP methods.',
  );
}
