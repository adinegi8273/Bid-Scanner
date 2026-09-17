import axios from 'axios';
import { Company } from '../types';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000' });

export async function getCompanyById(id: string): Promise<Company | null> {
  try {
    return (await api.get<Company>(`/api/companies/${id}`)).data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
}

export async function getCompaniesByIds(ids: string[]): Promise<Company[]> {
  const responses = await Promise.all(ids.map((id) => api.get<Company>(`/api/companies/${id}`)));
  return responses.map((response) => response.data);
}

export async function getCompaniesForTender(tenderId: string): Promise<Company[]> {
  return (await api.get<Company[]>(`/api/tenders/${tenderId}/companies`)).data;
}
