const API_BASE_URL = '';

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * 流式 SSE 请求，返回 ReadableStream
 * 用于对接 AI 对话接口
 */
export function streamChat(
  messages: { role: string; content: string }[]
): { stream: ReadableStream<Uint8Array>; cancel: () => void } {
  const controller = new AbortController();

  const fetchPromise = fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
    signal: controller.signal,
  });

  const stream = new ReadableStream<Uint8Array>({
    start: async (controller) => {
      try {
        const response = await fetchPromise;
        if (!response.ok || !response.body) {
          controller.error(new Error(`API Error: ${response.status}`));
          return;
        }
        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
        controller.close();
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          controller.error(err);
        }
      }
    },
    cancel: () => {
      controller.abort();
    },
  });

  return {
    stream,
    cancel: () => controller.abort(),
  };
}
