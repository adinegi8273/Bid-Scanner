import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DecisionProvider } from './context/DecisionContext';
import { Dashboard } from './pages/Dashboard';
import { MyTenders } from './pages/MyTenders';
import { TenderDetail } from './pages/TenderDetail';
import { CompanyAnalysisPage } from './pages/CompanyAnalysis';
import { OfficerProfile } from './pages/OfficerProfile';

export default function App() {
  return (
    <BrowserRouter>
      <DecisionProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tenders" element={<MyTenders />} />
          <Route path="/tenders/:tenderId" element={<TenderDetail />} />
          <Route path="/tenders/:tenderId/companies/:companyId" element={<CompanyAnalysisPage />} />
          <Route path="/profile" element={<OfficerProfile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DecisionProvider>
    </BrowserRouter>
  );
}
