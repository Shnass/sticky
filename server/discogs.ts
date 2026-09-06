export async function getCollection(userName: string, token: string) {
  const url = new URL(
    `https://api.discogs.com/users/${encodeURIComponent(userName)}/collection/folders/0/releases`,
  );

  url.searchParams.set('page', '1');
  url.searchParams.set('per_page', '20');

  return discogsRequest(url, token);
}

export async function getRelease(releaseId: number, token: string) {
  const url = new URL(
    `https://api.discogs.com/releases/${releaseId}`,
  );

  return discogsRequest(url, token);
}

async function discogsRequest(url: URL, token: string) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Discogs token=${token}`,
      'User-Agent': 'STICKYICKY/0.1',
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(
      `Помилка Discogs API: ${response.status} (${url.pathname}).`,
    );
  }

  return response.json();
}