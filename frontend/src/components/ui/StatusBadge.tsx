import { ComplianceStatus, CriterionStatus, TenderStatus, AnalysisStatus, OfficerDecisionType } from '../../types';

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral';

function variantClass(v: BadgeVariant) {
  return `badge badge-${v}`;
}

export function TenderStatusBadge({ status }: { status: TenderStatus }) {
  const map: Record<TenderStatus, BadgeVariant> = {
    'Active':         'success',
    'Completed':      'info',
    'Pending Review': 'warning',
    'Expired':        'neutral',
    'Draft':           'neutral',
    'Open':            'success',
    'Under Evaluation':'warning',
    'Awarded':         'info',
    'Cancelled':       'error',
    'Closed':          'neutral',
  };
  return <span className={variantClass(map[status])}>{status}</span>;
}

export function AnalysisStatusBadge({ status }: { status: AnalysisStatus }) {
  const map: Record<AnalysisStatus, BadgeVariant> = {
    'Analyzed':    'success',
    'In Progress': 'warning',
    'Pending':     'neutral',
  };
  return <span className={variantClass(map[status])}>{status}</span>;
}

export function ComplianceStatusBadge({ status }: { status: ComplianceStatus }) {
  const map: Record<ComplianceStatus, BadgeVariant> = {
    'Highly Compliant': 'success',
    'Compliant':        'info',
    'Needs Review':     'warning',
    'Non-Compliant':    'error',
  };
  return <span className={variantClass(map[status])}>{status}</span>;
}

export function CriterionStatusBadge({ status }: { status: CriterionStatus }) {
  const map: Record<CriterionStatus, BadgeVariant> = {
    'Passed':       'success',
    'Failed':       'error',
    'Warning':      'warning',
    'Not Verified': 'neutral',
  };
  return <span className={variantClass(map[status])}>{status}</span>;
}

export function DecisionBadge({ decision }: { decision: OfficerDecisionType | null }) {
  if (!decision) return <span className="badge badge-neutral">Pending</span>;
  const map: Record<OfficerDecisionType, BadgeVariant> = {
    'Qualify':              'success',
    'Disqualify':           'error',
    'Needs Further Review': 'warning',
  };
  return <span className={variantClass(map[decision])}>{decision}</span>;
}
