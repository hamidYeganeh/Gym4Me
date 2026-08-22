import { LocationKind } from '../../common/enums';
import { IRAN_FLAG_SVG } from '../seed/iran-flag';

export type LocationDefaultNode = {
  kind: LocationKind;
  name: string;
  slug: string;
  icon?: string;
  flagSvg?: string;
  center?: { lng: number; lat: number };
  order?: number;
  children?: LocationDefaultNode[];
};

/** Iran sample tree for admin Import defaults / CLI seed. */
export const DEFAULT_LOCATION_TREE: LocationDefaultNode[] = [
  {
    kind: LocationKind.COUNTRY,
    name: 'ایران',
    slug: 'iran',
    flagSvg: IRAN_FLAG_SVG,
    center: { lng: 53.688, lat: 32.4279 },
    order: 0,
    children: [
      {
        kind: LocationKind.PROVINCE,
        name: 'تهران',
        slug: 'tehran',
        center: { lng: 51.389, lat: 35.6892 },
        order: 0,
        children: [
          {
            kind: LocationKind.CITY,
            name: 'تهران',
            slug: 'tehran-city',
            center: { lng: 51.389, lat: 35.6892 },
            order: 0,
            children: [
              {
                kind: LocationKind.DISTRICT,
                name: 'ونک',
                slug: 'vanak',
                order: 0,
              },
              {
                kind: LocationKind.DISTRICT,
                name: 'سعادت‌آباد',
                slug: 'saadat-abad',
                order: 1,
              },
              {
                kind: LocationKind.DISTRICT,
                name: 'تجریش',
                slug: 'tajrish',
                order: 2,
              },
            ],
          },
        ],
      },
      {
        kind: LocationKind.PROVINCE,
        name: 'اصفهان',
        slug: 'isfahan',
        center: { lng: 51.6746, lat: 32.6546 },
        order: 1,
        children: [
          {
            kind: LocationKind.CITY,
            name: 'اصفهان',
            slug: 'isfahan-city',
            center: { lng: 51.6746, lat: 32.6546 },
            order: 0,
          },
        ],
      },
    ],
  },
];
