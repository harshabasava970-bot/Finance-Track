export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="loading-spinner">
      <div className="spinner" />
      <span style={{ color: 'var(--gray-400)', fontSize: '0.8rem', fontWeight: 500 }}>{message}</span>
    </div>
  );
}
