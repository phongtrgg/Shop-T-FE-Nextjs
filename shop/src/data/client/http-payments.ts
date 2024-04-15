import type { SearchParamOptions } from '@/types';
import axios from 'axios';
import Router from 'next/router';
import { getAuthToken, removeAuthToken } from './token.utils';
import crypto from 'crypto';
const key = '12345678901234567890123456789012';
const iv = '1234567890123456';
let dataAes: any;
function encryptData(data: any, keyString: string, ivString: any) {
  const key = Buffer.from(keyString, 'utf-8');
  const iv = Buffer.from(ivString, 'utf-8');
  const jsonData = JSON.stringify(data);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encryptedData = cipher.update(jsonData, 'utf-8', 'base64');
  encryptedData += cipher.final('base64');
  dataAes = encryptedData;
}

encryptData(458875, key, iv);
// TODO: Due to windows timeout was set to 15000
const Axios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PAYMENT_URL,
  timeout: 150000000,
  headers: {
    'Content-Type': 'application/json',
  },
});
// Change request data/error here
Axios.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    console.log('check token', token);
    //@ts-ignore
    config.headers = {
      ...config.headers,
      clientId: dataAes,
      domain: 'shop.tomiru.com',
      Authorization: `Bearer ${token ? token : ''}`,
    };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

Axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      (error.response && error.response.status === 401) ||
      (error.response && error.response.status === 403) ||
      (error.response &&
        error.response.data.message === 'TOMIRU_ERROR.NOT_AUTHORIZED')
    ) {
      removeAuthToken();
      Router.reload();
    }
    return Promise.reject(error);
  },
);

export class HttpClientPayment {
  static async get<T>(url: string, params?: unknown) {
    const response = await Axios.get<T>(url, { params });
    return response.data;
  }

  static async post<T>(url: string, data: unknown, options?: any) {
    const response = await Axios.post<T>(url, data, options);

    return response.data;
  }

  static async put<T>(url: string, data: unknown) {
    const response = await Axios.put<T>(url, data);
    return response.data;
  }

  static async delete<T>(url: string) {
    const response = await Axios.delete<T>(url);
    return response.data;
  }

  static formatSearchParams(params: Partial<SearchParamOptions>) {
    return Object.entries(params)
      .filter(([, value]) => Boolean(value))
      .map(([k, v]) =>
        ['type', 'categories', 'tags', 'author', 'manufacturer'].includes(k)
          ? `${k}.slug:${v}`
          : `${k}:${v}`,
      )
      .join(';');
  }
}
