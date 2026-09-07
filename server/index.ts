import express from 'express';
import { getAllCollectionItems, getRelease, getReleasesIds, getReleaseDetails } from './discogs.ts';
import { DiscogsRelease } from './discogs.t.ts';

const app = express();
const port = 3000;

app.use(express.json());

app.post('/api/jobs', async(req, res) => {
  const token = req.body?.token;
  const discogsUrl = req.body?.discogsUrl;

  if (typeof token !== 'string' || !token.trim()) {
    res.status(400).json({
      error: 'Вкажи Discogs token.',
    });
    return;
  }

  if (typeof discogsUrl !== 'string') {
    res.status(400).json({
      error: 'Вкажи посилання на Discogs.',
    });
    return;
  }

  let url: URL;

  try {
    url = new URL(discogsUrl.trim());
  } catch {
    res.status(400).json({
      error: 'Посилання має некоректний формат.',
    });
    return;
  }

  const isDiscogs =
    url.hostname === 'www.discogs.com' ||
    url.hostname === 'discogs.com';

  if (
    url.protocol !== 'https:' ||
    !isDiscogs
  ) {
    res.status(400).json({
      error: 'Потрібне HTTPS-посилання на discogs.com.',
    });
    return;
  }

  // Поки підтримуємо два конкретні формати адрес.
  const collectionMatch = url.pathname.match(
    /^\/user\/([^/]+)\/collection\/?$/,
  );

  const shopMatch = url.pathname.match(
    /^\/seller\/([^/]+)\/profile\/?$/,
  );

  if (!collectionMatch && !shopMatch) {
    res.status(400).json({
      error:
        'Використай адресу /user/username/collection ' +
        'або /seller/username/profile.',
    });
    return;
  }

try {
const userName = decodeURIComponent(getUserName(url.pathname));
const collection = await getAllCollectionItems(userName, token.trim());

const firstItem = collection.items[0];

if (!firstItem) {
  res.json({
    message: 'Колекція порожня.',
    releases: [],
    pagination: collection.pagination,
    releaseDetails: null,
  });
  return;
}

const releaseIds = getReleasesIds(collection.items);

const result = await getReleaseDetails(
  releaseIds.slice(0, 3),
  token.trim(),
);

res.json({
  message: `Отримано ${result.releases.length} релізів. Помилок: ${result.errors.length}.`,
  releases: result.releases,
  errors: result.errors,
});

} catch (error) {
  res.status(502).json({
    error:
      error instanceof Error
        ? error.message
        : 'Не вдалося отримати колекцію.',
  });
}
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(port, '127.0.0.1', () => {
  console.log(`Server: http://127.0.0.1:${port}`);
});

function getUserName(url:string):string{
    const separator:string = url.indexOf('/seller/')>=0 ? '/seller/' : '/user/';
    const userName = url.split(separator)[1]?.split('/')[0];

    if(!userName) throw new Error('Invalid URL was provided');

    return userName;
}