import { Tender } from '../types';
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000' });

const statusLabel: Record<string, Tender['status']> = {
  draft: 'Draft',
  open: 'Open',
  under_evaluation: 'Under Evaluation',
  awarded: 'Awarded',
  cancelled: 'Cancelled',
  closed: 'Closed',
};

function mapTender(tender: Tender): Tender {
  return { ...tender, status: statusLabel[tender.status] ?? tender.status };
}

export async function getTenders(): Promise<Tender[]> {
  return (await api.get<Tender[]>('/api/tenders')).data.map(mapTender);
}

export async function getTenderById(id: string): Promise<Tender | null> {
  try {
    return mapTender((await api.get<Tender>(`/api/tenders/${id}`)).data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
}
