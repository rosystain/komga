import {AuthorDto} from "@/types/komga-books";

export interface SeriesDto {
  id: string,
  libraryId: string,
  name: string,
  url: string,
  lastModified: string,
  booksCount: number,
  booksReadCount: number,
  booksUnreadCount: number,
  booksInProgressCount: number,
  metadata: SeriesMetadataDto,
  booksMetadata: SeriesBooksMetadataDto,
}

export interface SeriesMetadataDto {
  status: string,
  statusLock: boolean,
  created: string,
  lastModified: string,
  title: string,
  titleLock: boolean,
  titleSort: string,
  titleSortLock: boolean,
  summary: string,
  summaryLock: boolean,
  readingDirection: string,
  readingDirectionLock: boolean,
  publisher: string,
  publisherLock: boolean,
  ageRating: number,
  ageRatingLock: boolean,
  language: string,
  languageLock: boolean,
  genres: string[],
  genresLock: boolean,
  tags: String[],
  tagsLock: boolean
}

export interface SeriesBooksMetadataDto {
  created: string,
  lastModified: string
  authors: AuthorDto[],
  releaseDate: string,
  summary: string,
  summaryNumber: string,
}

export interface SeriesMetadataUpdateDto {
  status?: string,
  statusLock?: boolean,
  title?: string,
  titleLock?: boolean,
  titleSort?: string,
  titleSortLock?: boolean,
  summary?: string,
  summaryLock?: boolean,
  readingDirection?: string,
  readingDirectionLock?: boolean,
  publisher?: string,
  publisherLock?: boolean,
  ageRating?: number,
  ageRatingLock?: boolean,
  language?: string,
  languageLock?: boolean,
  genres?: string[],
  genresLock?: boolean,
  tags?: String[],
  tagsLock?: boolean
}
