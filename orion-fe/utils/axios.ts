import axios from 'axios';
import { AXIOS_BASE_URL, AXIOS_BASE_URL_AUTH, AXIOS_TIMEOUT } from './CONSTANT';

interface ISetupAxios {
  baseURL?: 'api' | 'auth' | 'modul' | 'nilai' | 'dashboard';
  accessToken?: string;
  refreshToken?: string;
  isClientSide?: boolean;
}

const APIBase = {
  api: AXIOS_BASE_URL,
  auth: AXIOS_BASE_URL_AUTH,
};

const setupAxios = ({ baseURL = 'api', accessToken }: ISetupAxios) => {
  const API = axios.create({
    baseURL: APIBase[baseURL as keyof typeof APIBase],
    timeout: AXIOS_TIMEOUT,
    headers: {
      Authorization: accessToken?.length ? `Bearer ${accessToken}` : null,
    },
  });

  API.interceptors.request.use(
    async (config: any) => {
      if (accessToken?.length)
        config.headers.Authorization = `Bearer ${accessToken}`;
      return config;
    },
    (error: Error) => {
      console.log(
        'Maaf, terjadi kesalahan yang tidak diketahui. Silakan coba lagi.'
      );
      console.log(error);
    }
  );
  return API;
};

export default setupAxios;
