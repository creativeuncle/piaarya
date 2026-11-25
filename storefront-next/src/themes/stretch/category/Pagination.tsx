'use client';

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-2 text-sm border border-[#3A2E1D]/30 text-[#3A2E1D] rounded-full disabled:opacity-30"
      >
        Prev
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-9 h-9 text-sm rounded-full ${
            p === page ? 'bg-[#3A2E1D] text-white font-semibold' : 'border border-[#3A2E1D]/30 text-[#3A2E1D]'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-2 text-sm border border-[#3A2E1D]/30 text-[#3A2E1D] rounded-full disabled:opacity-30"
      >
        Next
      </button>
    </div>
  );
}
