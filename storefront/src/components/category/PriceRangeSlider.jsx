export default function PriceRangeSlider({ min, max, valueMin, valueMax, onChange }) {
  const range = Math.max(max - min, 1);
  const minPct = ((valueMin - min) / range) * 100;
  const maxPct = ((valueMax - min) / range) * 100;

  function handleMinChange(e) {
    const next = Math.min(Number(e.target.value), valueMax);
    onChange(next, valueMax);
  }

  function handleMaxChange(e) {
    const next = Math.max(Number(e.target.value), valueMin);
    onChange(valueMin, next);
  }

  return (
    <div>
      <div className="flex justify-between text-sm text-gray-700 mb-3">
        <span>₹{valueMin}</span>
        <span>₹{valueMax}</span>
      </div>
      <div className="relative h-6">
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full" />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1 bg-gray-900 rounded-full"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={valueMin}
          onChange={handleMinChange}
          className="range-thumb absolute w-full top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={valueMax}
          onChange={handleMaxChange}
          className="range-thumb absolute w-full top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none"
        />
      </div>
    </div>
  );
}
