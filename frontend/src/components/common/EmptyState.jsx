export default function EmptyState({ icon = '📭', title, message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title || 'No data found'}</h3>
      <p>{message || 'Nothing to show here yet.'}</p>
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </div>
  );
}
