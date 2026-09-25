import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Location01Icon, TruckIcon } from '@hugeicons/core-free-icons';

export default function PincodeChecker() {
  const [pincode, setPincode] = useState('');
  const [result, setResult] = useState(null);

  function handleCheck(e) {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      setResult({ ok: false, message: 'Enter a valid 6-digit pincode' });
      return;
    }
    setResult({ ok: true, message: 'Delivery in 3-5 business days' });
  }

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        <HugeiconsIcon icon={Location01Icon} size={16} strokeWidth={1.5} />
        Check delivery availability
      </p>
      <form onSubmit={handleCheck} className="flex gap-2">
        <input
          type="text"
          maxLength={6}
          placeholder="Enter pincode"
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-40"
        />
        <button type="submit" className="border border-gray-900 text-gray-900 text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-900 hover:text-white">
          Check
        </button>
      </form>
      {result && (
        <p className={`text-sm mt-2 flex items-center gap-2 ${result.ok ? 'text-green-600' : 'text-red-600'}`}>
          {result.ok && <HugeiconsIcon icon={TruckIcon} size={16} strokeWidth={1.5} />}
          {result.message}
        </p>
      )}
      <p className="text-xs text-gray-400 mt-1">Estimate only — connecting to a real courier API is a later integration step.</p>
    </div>
  );
}
