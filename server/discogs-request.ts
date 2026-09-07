import { setTimeout as delay } from 'node:timers/promises';
let nextRequestAt = 0;

export async function discogsRequest (url: URL, token: string) {
  const maxRetries = 3;

  for (let attempt = 0; ; attempt++) {
    const waitMs = nextRequestAt - Date.now();

    if (waitMs > 0) {
      await delay(waitMs);
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Discogs token=${token}`,
        'User-Agent': 'STICKYICKY/0.1',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (response.status === 429) {
      const retryAfterMs = getRetryAfterMs(
        response.headers.get('Retry-After'),
      );

      nextRequestAt = Math.max(nextRequestAt, Date.now() + retryAfterMs);
      await response.body?.cancel();

      if (attempt >= maxRetries) {
        throw new Error('Ліміт запитів Discogs вичерпано після 3 повторів. Спробуй пізніше.');
      }

      continue;
    }

    const rawRemaining = response.headers.get(
      'X-Discogs-Ratelimit-Remaining',
    );

    const remaining =
      rawRemaining === null ? null : Number(rawRemaining);

    if (
      remaining !== null &&
      Number.isFinite(remaining) &&
      remaining <= 2
    ) {
      nextRequestAt = Math.max(nextRequestAt, Date.now() + 60_000);
    }

    if (!response.ok) {
      await response.body?.cancel();
      throw new Error(`Помилка Discogs API: ${response.status}`);
    }

    return response.json();
  }
}

function getRetryAfterMs(value: string | null): number {
  const fallbackMs = 60_000;

  if (value === null || value.trim() === '') {
    return fallbackMs;
  }

  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.max(1000, seconds * 1000);
  }

  return fallbackMs;
}
