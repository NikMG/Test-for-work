import api from './client';
import { ArticlesResponse, SingleArticleResponse } from '../types';

export interface GetArticlesParams {
  tag?: string;
  author?: string;
  favorited?: string;
  limit?: number;
  offset?: number;
}

export interface CreateArticleData {
  title: string;
  description: string;
  body: string;
  tagList?: string[];
}

export interface UpdateArticleData {
  title?: string;
  description?: string;
  body?: string;
}

export const articlesApi = {
  getAll: (params?: GetArticlesParams) => {
    return api.get<ArticlesResponse>('/articles', { params });
   },

  getBySlug: (slug: string) => {
    return api.get<SingleArticleResponse>(`/articles/${slug}`);
   },

  favorite: (slug: string) => {
    return api.post<SingleArticleResponse>(`/articles/${slug}/favorite`);
   },

  unfavorite: (slug: string) => {
    return api.delete<SingleArticleResponse>(`/articles/${slug}/favorite`);
   },

   //TODO implement rest of functions for this api habdler
};