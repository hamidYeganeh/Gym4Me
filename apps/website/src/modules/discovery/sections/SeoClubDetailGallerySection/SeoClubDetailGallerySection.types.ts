export type SeoClubDetailGalleryItem = {
  url: string;
  title?: string;
  description?: string;
};

export type SeoClubDetailGallerySectionProps = {
  items: SeoClubDetailGalleryItem[];
  clubName: string;
};
