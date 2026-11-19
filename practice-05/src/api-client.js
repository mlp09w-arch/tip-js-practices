export class ApiError extends Error {
  constructor(message, {
    kind,
    status = null,
    code = null,
    details = null,
    url = null,
    cause,
  } = {}) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.code = code;
    this.details = details;
    this.url = url;
  }
}

function parseBase(baseUrl) {
  const url = new URL(baseUrl);
  if (!["http:", "https:"].includes(url.protocol) || url.search || url.hash || url.username || url.password) {
    throw new TypeError("baseUrl должен быть HTTP(S)-адресом без параметров и учётных данных.");
  }
  return url;
}

export function buildUrl(baseUrl, path, query = {}) {
  if (typeof path !== "string" || !path || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(path)) {
    throw new TypeError("Ожидается относительный путь API.");
  }
  const url = parseBase(baseUrl);
  url.pathname = `${url.pathname.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
  for (const [key, value] of Object.entries(query)) {
    if (value !== "" && value !== undefined && value !== null) url.searchParams.set(key, value);
  }
  return url.href;
}

function validateTimeout(value) {
  if (!Number.isSafeInteger(value) || value < 1 || value > 2147483647) {
    throw new TypeError("Тайм-аут должен быть положительным целым числом.");
  }
}

function hasJson(response) {
  const contentType = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  return contentType === "application/json" || Boolean(contentType?.endsWith("+json"));
}

export function createApiClient({ baseUrl, fetchFn = globalThis.fetch, timeoutMs = 2000 } = {}) {
  const base = parseBase(baseUrl).href;
  if (typeof fetchFn !== "function") throw new TypeError("fetchFn должен быть функцией.");
  validateTimeout(timeoutMs);

  async function requestJson(path, { query, signal, timeoutMs: timeout = timeoutMs } = {}) {
    validateTimeout(timeout);
    const url = buildUrl(base, path, query);
    const controller = new AbortController();
    const timeoutReason = new Error("Превышено время ожидания ответа.");
    const combined = signal ? AbortSignal.any([controller.signal, signal]) : controller.signal;
    const timer = setTimeout(() => controller.abort(timeoutReason), timeout);

    try {
      combined.throwIfAborted();
      const response = await fetchFn(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: combined,
      });
      if (!(response instanceof Response)) {
        throw new ApiError("Получен неожиданный ответ.", { kind: "invalid-response", url });
      }
      if (!response.ok) {
        let payload;
        if (hasJson(response)) {
          try {
            payload = await response.json();
          } catch {
            combined.throwIfAborted();
          }
        }
        const { message, code, details } = payload?.error ?? {};
        throw new ApiError(message ?? `Ошибка HTTP ${response.status}.`, {
          kind: "http", status: response.status, code, details, url,
        });
      }
      if (response.status === 204) return null;
      if (!hasJson(response)) {
        throw new ApiError("Сервер вернул ответ без JSON.", { kind: "invalid-response", url });
      }
      try {
        return await response.json();
      } catch (cause) {
        throw new ApiError("Не удалось разобрать JSON.", { kind: "invalid-response", url, cause });
      }
    } catch (cause) {
      if (combined.aborted) {
        const timedOut = combined.reason === timeoutReason;
        throw new ApiError(timedOut ? timeoutReason.message : "Запрос отменён.", {
          kind: timedOut ? "timeout" : "aborted", url, cause,
        });
      }
      if (cause instanceof ApiError) throw cause;
      throw new ApiError("Не удалось соединиться с сервером.", { kind: "network", url, cause });
    } finally {
      clearTimeout(timer);
    }
  }
  return { requestJson };
}
