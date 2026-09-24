export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="loading-spinner" style={{ flexDirection: 'column', gap: 16 }}>
      <div className="spinner" />
      <span style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{message}</span>
    </div>
  );
}
