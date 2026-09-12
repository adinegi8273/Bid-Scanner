export function ReportExport(_props: { company: { name: string }; tender: { id: string } }) {
  return (
    <button className="btn btn-primary no-print" onClick={() => window.print()}>
      🖨️ Export / Print Report
    </button>
  );
}
