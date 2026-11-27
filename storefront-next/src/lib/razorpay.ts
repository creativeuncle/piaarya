declare global {
  interface Window {
    Razorpay: any;
  }
}

let loadPromise = null;

// Lazily injects Razorpay's Checkout widget script — only loaded when a
// customer actually picks "Pay Online" with Razorpay active, not on every
// page load.
export function loadRazorpayScript() {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
  return loadPromise;
}
