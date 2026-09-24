export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(0, currentPage - 2);
  let end = Math.min(totalPages - 1, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(0, end - maxVisible + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="pagination">
      <button onClick={() => onPageChange(0)} disabled={currentPage === 0}>«</button>
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0}>‹</button>
      {pages.map(p => (
        <button key={p} className={p === currentPage ? 'active' : ''} onClick={() => onPageChange(p)}>
          {p + 1}
        </button>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1}>›</button>
      <button onClick={() => onPageChange(totalPages - 1)} disabled={currentPage >= totalPages - 1}>»</button>
    </div>
  );
}
