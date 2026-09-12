import type { ReactNode } from 'react';

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="state-center">
      <div className="spinner" />
      <span className="state-desc">{message}</span>
    </div>
  );
}

export function EmptyState({ title, description, action }: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="state-center">
      <div className="state-icon">📋</div>
      <div className="state-title">{title}</div>
      {description && <div className="state-desc">{description}</div>}
      {action}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="state-center">
      <div className="state-icon">⚠️</div>
      <div className="state-title">Something went wrong</div>
      <div className="state-desc">{message}</div>
    </div>
  );
}
