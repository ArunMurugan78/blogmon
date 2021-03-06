export interface BlogPost {
  url: string;
  coverImageUrl: string;
  title: string;
  description: string;
  dateAdded?: Date;
  dateEdited?: Date;
  tags: string[];
}
