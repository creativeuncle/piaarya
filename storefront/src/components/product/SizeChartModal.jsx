const ROWS = [
  { size: 'S', chest: '36', length: '27', shoulder: '17' },
  { size: 'M', chest: '38', length: '28', shoulder: '18' },
  { size: 'L', chest: '40', length: '29', shoulder: '19' },
  { size: 'XL', chest: '42', length: '30', shoulder: '20' },
];

export default function SizeChartModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Size Chart</h2>
        <p className="text-xs text-gray-400 mb-4">All measurements in inches. Generic guide — will vary per product once real data is added.</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-2">Size</th>
              <th className="py-2">Chest</th>
              <th className="py-2">Length</th>
              <th className="py-2">Shoulder</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ROWS.map((row) => (
              <tr key={row.size}>
                <td className="py-2 font-medium text-gray-900">{row.size}</td>
                <td className="py-2">{row.chest}"</td>
                <td className="py-2">{row.length}"</td>
                <td className="py-2">{row.shoulder}"</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={onClose} className="mt-5 w-full bg-gray-900 text-white text-sm py-2 rounded-md">
          Close
        </button>
      </div>
    </div>
  );
}
