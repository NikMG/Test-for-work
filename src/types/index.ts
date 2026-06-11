export interface User {
  email: string;
  token: string;
  username: string;
  bio: string;
  image: string;
}

export interface Profile {
  username: string;
  bio: string;
  image: string;
  following: boolean;
}

export interface Article {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: string;
  updatedAt: string;
  favorited: boolean;
  favoritesCount: number;
  author: Profile;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ArticlesResponse {
  articles: Article[];
  articlesCount: number;
}

export interface SingleArticleResponse {
  article: Article;
}

export interface UserResponse {
  user: User;
}

export interface ProfileResponse {
  profile: Profile;
}