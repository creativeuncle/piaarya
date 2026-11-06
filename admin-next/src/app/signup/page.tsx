'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { checkSlug, signup } from '../../lib/api/signup';

const CATEGORIES = [
  'Fashion & Apparel',
  'Electronics',
  'Beauty & Personal Care',
  'Home & Living',
  'Food & Beverages',
  'Jewellery & Accessories',
  'Sports & Fitness',
  'Other',
];

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const PLANS = [
  { id: 'basic', name: 'Basic', price: '₹999/mo', blurb: 'Everything you need to start selling online.' },
  { id: 'super', name: 'Super', price: '₹2,499/mo', blurb: 'Advanced features for growing stores.' },
];

const BUILD_STEPS = ['Creating your store…', 'Setting up your theme…', 'Preparing your dashboard…'];

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function SignupPage() {
  const router = useRouter();
  const { setSession, isAuthenticated, hydrated } = useAdminAuth();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [buildStepIndex, setBuildStepIndex] = useState(0);

  const [owner, setOwner] = useState({ name: '', email: '', password: '', phone: '', line: '', city: '', state: '', pincode: '' });
  const [store, setStore] = useState({ name: '', slug: '', category: CATEGORIES[0], slugEdited: false });
  const [plan, setPlan] = useState('basic');

  const [slugStatus, setSlugStatus] = useState(null); // null | 'checking' | 'available' | 'taken'
  const slugCheckTimer = useRef(null);

  useEffect(() => {
    if (hydrated && isAuthenticated) router.replace('/');
  }, [hydrated, isAuthenticated, router]);

  useEffect(() => {
    if (!store.slug) {
      setSlugStatus(null);
      return;
    }
    setSlugStatus('checking');
    if (slugCheckTimer.current) clearTimeout(slugCheckTimer.current);
    slugCheckTimer.current = setTimeout(async () => {
      try {
        const { available } = await checkSlug(store.slug);
        setSlugStatus(available ? 'available' : 'taken');
      } catch {
        setSlugStatus(null);
      }
    }, 400);
    return () => clearTimeout(slugCheckTimer.current);
  }, [store.slug]);

  if (hydrated && isAuthenticated) return null;

  function updateOwner(field, value) {
    setOwner((prev) => ({ ...prev, [field]: value }));
  }

  function updateStoreName(name) {
    setStore((prev) => ({ ...prev, name, slug: prev.slugEdited ? prev.slug : slugify(name) }));
  }

  function validateStep1() {
    if (!owner.name.trim()) return 'Please enter your name';
    if (!owner.email.trim()) return 'Please enter your email';
    if (owner.password.length < 6) return 'Password must be at least 6 characters';
    if (!owner.line.trim() || !owner.city.trim() || !owner.state.trim() || !owner.pincode.trim()) {
      return 'Please complete your address, including state, city and pincode';
    }
    return '';
  }

  function validateStep2() {
    if (!store.name.trim()) return 'Please enter your store name';
    if (!store.slug.trim()) return 'Please choose a store URL';
    if (slugStatus === 'taken') return 'That store URL is already taken';
    return '';
  }

  function goNext() {
    const err = step === 1 ? validateStep1() : step === 2 ? validateStep2() : '';
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setStep((s) => s + 1);
  }

  function goBack() {
    setError('');
    setStep((s) => s - 1);
  }

  async function handleCreateStore() {
    setError('');
    setSubmitting(true);
    setStep(4);
    setBuildStepIndex(0);

    const progressTimer = setInterval(() => {
      setBuildStepIndex((i) => Math.min(i + 1, BUILD_STEPS.length - 1));
    }, 900);

    try {
      const payload = {
        owner: {
          name: owner.name,
          email: owner.email,
          password: owner.password,
          phone: owner.phone,
          address: { line: owner.line, city: owner.city, state: owner.state, pincode: owner.pincode },
        },
        store: { name: store.name, slug: store.slug, category: store.category },
        plan,
      };
      const data = await signup(payload);
      // Let the build animation play for a moment so it doesn't flash by.
      await new Promise((resolve) => setTimeout(resolve, BUILD_STEPS.length * 900));
      clearInterval(progressTimer);
      setSession(data);
      router.replace('/');
    } catch (err) {
      clearInterval(progressTimer);
      setError(err?.response?.data?.message || 'Could not create your store');
      setStep(3);
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Create your Piaarya store</h1>
          <p className="text-sm text-gray-500 mt-1">Step {Math.min(step, 4)} of 4</p>
          <div className="flex gap-1.5 mt-3 justify-center">
            {[1, 2, 3, 4].map((s) => (
              <span key={s} className={`h-1.5 w-10 rounded-full ${s <= step ? 'bg-gray-900' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-gray-900">Your details</h2>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Full name</label>
                <input className="input" value={owner.name} onChange={(e) => updateOwner('name', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Email</label>
                  <input type="email" className="input" value={owner.email} onChange={(e) => updateOwner('email', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Phone</label>
                  <input className="input" value={owner.phone} onChange={(e) => updateOwner('phone', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Password</label>
                <input type="password" className="input" value={owner.password} onChange={(e) => updateOwner('password', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Address</label>
                <input className="input" placeholder="House no., street, area" value={owner.line} onChange={(e) => updateOwner('line', e.target.value)} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-sm text-gray-700 mb-1">State</label>
                  <select className="input" value={owner.state} onChange={(e) => updateOwner('state', e.target.value)}>
                    <option value="">Select</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">City</label>
                  <input className="input" value={owner.city} onChange={(e) => updateOwner('city', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Pincode</label>
                  <input className="input" value={owner.pincode} onChange={(e) => updateOwner('pincode', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-gray-900">Store details</h2>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Store name</label>
                <input className="input" value={store.name} onChange={(e) => updateStoreName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Store URL</label>
                <div className="flex items-center">
                  <input
                    className="input rounded-r-none"
                    value={store.slug}
                    onChange={(e) => setStore((prev) => ({ ...prev, slug: slugify(e.target.value), slugEdited: true }))}
                  />
                  <span className="text-sm text-gray-500 bg-gray-50 border border-l-0 border-gray-200 rounded-r-md px-3 py-2 whitespace-nowrap">
                    .piaarya.com
                  </span>
                </div>
                {slugStatus === 'checking' && <p className="text-xs text-gray-400 mt-1">Checking availability…</p>}
                {slugStatus === 'available' && <p className="text-xs text-green-600 mt-1">Available</p>}
                {slugStatus === 'taken' && <p className="text-xs text-red-600 mt-1">Already taken</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Category</label>
                <select className="input" value={store.category} onChange={(e) => setStore((prev) => ({ ...prev, category: e.target.value }))}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-gray-900">Choose your plan</h2>
              <div className="grid grid-cols-2 gap-3">
                {PLANS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlan(p.id)}
                    className={`text-left border rounded-lg p-4 ${plan === p.id ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">{p.price}</p>
                    <p className="text-xs text-gray-500 mt-2">{p.blurb}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="py-6 text-center">
              <div className="mx-auto w-10 h-10 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-5" />
              <p className="text-sm font-medium text-gray-900">{BUILD_STEPS[buildStepIndex]}</p>
              <div className="mt-4 space-y-1.5 max-w-[220px] mx-auto">
                {BUILD_STEPS.map((label, i) => (
                  <div key={label} className="flex items-center gap-2 text-xs">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${i < buildStepIndex ? 'bg-gray-900 text-white' : i === buildStepIndex ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400'}`}>
                      {i < buildStepIndex ? '✓' : ''}
                    </span>
                    <span className={i <= buildStepIndex ? 'text-gray-700' : 'text-gray-400'}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step < 4 && (
            <div className="flex items-center justify-between mt-6">
              {step > 1 ? (
                <button type="button" onClick={goBack} className="btn-secondary">Back</button>
              ) : (
                <span />
              )}
              {step < 3 ? (
                <button type="button" onClick={goNext} className="btn-secondary bg-gray-900 text-white border-gray-900 hover:bg-gray-800">
                  Continue
                </button>
              ) : (
                <button type="button" disabled={submitting} onClick={handleCreateStore} className="btn-secondary bg-gray-900 text-white border-gray-900 hover:bg-gray-800 disabled:opacity-50">
                  Create store
                </button>
              )}
            </div>
          )}
        </div>

        {step < 4 && (
          <p className="text-sm text-gray-500 text-center mt-4">
            Already have a store?{' '}
            <a href="/login" className="text-gray-900 font-medium hover:underline">Sign in</a>
          </p>
        )}
      </div>
    </div>
  );
}
