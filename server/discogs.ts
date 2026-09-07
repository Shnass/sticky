import { DiscogsRelease, DiscogsCollectionPage, DiscogsCollectionItem } from "./discogs.t";
import { discogsRequest } from "./discogs-request";


export async function getCollectionPage(userName: string, token: string, page: number):Promise<DiscogsCollectionPage> {
  const url = new URL(
    `https://api.discogs.com/users/${encodeURIComponent(userName)}/collection/folders/0/releases`,
  );

  url.searchParams.set('page', String(page));
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

export function getReleasesIds(items:DiscogsCollectionItem[]):number[]{
    const ids = [...new Set(
        items.map(item => item.basic_information.id)
    )]
    return ids;
}

export async function getReleaseDetails(
  releaseIds: number[],
  token: string,
) {
  const releases: DiscogsRelease[] = [];
  const errors: { releaseId: number; message: string }[] = [];

  for (const releaseId of releaseIds) {
    try {
      const release = await getRelease(releaseId, token);
      releases.push(release);
    } catch (error) {
      errors.push({
        releaseId,
        message:
          error instanceof Error
            ? error.message
            : 'Не вдалося отримати реліз.',
      });
    }
  }

  return { releases, errors };
}