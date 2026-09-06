import { setTimeout as delay } from 'node:timers/promises';
import { DiscogsRelease, DiscogsCollectionPage, DiscogsCollectionItem } from "./discogs.t";

export async function getCollectionPage(userName: string, token: string, page: number):Promise<DiscogsCollectionPage> {
  const url = new URL(
    `https://api.discogs.com/users/${encodeURIComponent(userName)}/collection/folders/0/releases`,
  );

  url.searchParams.set('page', '1');
  url.searchParams.set('per_page', '100');

  return discogsRequest(url, token);
}

export async function getAllCollectionItems(userName: string, token: string){
    let pages = 1;
    let currentPage = 1;
    let pagination;
    const allCollectionItems:DiscogsCollectionItem[] = [];

    do{
        const pageContent = await getCollectionPage(userName, token, currentPage);
        const pageContentReleases = pageContent.releases;
        allCollectionItems.push(...pageContentReleases);
        if(currentPage === 1) pagination = pageContent.pagination;
        pages = pageContent.pagination.pages;
        currentPage++;
    } while (currentPage<=pages)

    return {items:allCollectionItems, pagination};
}

export async function getRelease(releaseId: number, token: string):Promise<DiscogsRelease> {
  const url = new URL(
    `https://api.discogs.com/releases/${releaseId}`,
  );

  return discogsRequest(url, token);
}

async function discogsRequest(url: URL, token: string){
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

export function getReleasesIds(items:DiscogsCollectionItem[]):number[]{
    const ids = [...new Set(
        items.map(item => item.basic_information.id)
    )]
    return ids;
}