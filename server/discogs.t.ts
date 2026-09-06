type DiscogsArtist = {
  id: number;
  name: string;
  anv?: string;
  join?: string;
};

type DiscogsLabel = {
  id: number;
  name: string;
  catno: string;
};

type DiscogsTrack = {
  position: string;
  type_: string;
  title: string;
  duration: string;
  artists?: DiscogsArtist[];
  sub_tracks?: DiscogsTrack[];
};

type DiscogsVideo = {
  uri: string;
  title: string;
  duration?: number;
  description?: string;
  embed?: boolean;
};

export type DiscogsRelease = {
  id: number;
  title: string;
  artists: DiscogsArtist[];
  labels: DiscogsLabel[];
  year?: number;
  country?: string;
  genres?: string[];
  styles?: string[];
  tracklist: DiscogsTrack[];
  videos?: DiscogsVideo[];
};          

export type DiscogsCollectionItem = {
  id: number;
  instance_id: number;
  basic_information: {
    id: number;
    title: string;
  };
};

export type DiscogsCollectionPage = {
  pagination: {
    page: number;
    pages: number;
    per_page: number;
    items: number;
  };
  releases: DiscogsCollectionItem[];
};