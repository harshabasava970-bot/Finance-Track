import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

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
      <button onClick={() => onPageChange(0)} disabled={currentPage === 0} title="First"><ChevronsLeft size={14} /></button>
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0} title="Prev"><ChevronLeft size={14} /></button>
      {start > 0 && <span style={{ color: 'var(--cream-400)', fontSize: '0.8rem', padding: '0 4px' }}>…</span>}
      {pages.map(p => (
        <button key={p} className={p === currentPage ? 'active' : ''} onClick={() => onPageChange(p)}>{p + 1}</button>
      ))}
      {end < totalPages - 1 && <span style={{ color: 'var(--cream-400)', fontSize: '0.8rem', padding: '0 4px' }}>…</span>}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1} title="Next"><ChevronRight size={14} /></button>
      <button onClick={() => onPageChange(totalPages - 1)} disabled={currentPage >= totalPages - 1} title="Last"><ChevronsRight size={14} /></button>
      <span style={{ fontSize: '0.75rem', color: 'var(--cream-400)', marginLeft: 6 }}>Page {currentPage + 1} of {totalPages}</span>
    </div>
  );
}
