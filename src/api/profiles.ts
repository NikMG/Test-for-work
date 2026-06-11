import api from './client';
import { ProfileResponse } from '../types';

export const profilesApi = {
  get: (username: string) => {
    return api.get<ProfileResponse>(`/profiles/${username}`);
   },

  follow: (username: string) => {
    return api.post<ProfileResponse>(`/profiles/${username}/follow`);
   },

  unfollow: (username: string) => {
    return api.delete<ProfileResponse>(`/profiles/${username}/follow`);
   },
};
