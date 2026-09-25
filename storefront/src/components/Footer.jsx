const FOOTER_COLUMNS = [
  {
    title: 'Shop',
    links: ['Best Sellers', 'New In', 'Bundles', 'Categories'],
  },
  {
    title: 'Support',
    links: ['Contact Us', 'Shipping & Returns', 'FAQs', 'Track Order'],
  },
  {
    title: 'Company',
    links: ['About Us', 'Blog', 'Careers', 'Terms & Privacy'],
  },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <p className="text-xl font-black text-white tracking-tight mb-3">PIAARYA</p>
          <p className="text-sm text-gray-400 mb-4">Get 10% off your first order and updates on new drops.</p>
          <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 min-w-0 bg-gray-800 text-sm text-white placeholder-gray-500 rounded-md px-3 py-2 border border-gray-700"
            />
            <button type="submit" className="bg-white text-gray-900 text-sm font-semibold px-4 py-2 rounded-md">
              Join
            </button>
          </form>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title}>
            <p className="text-sm font-semibold text-white mb-4">{column.title}</p>
            <ul className="space-y-2">
              {column.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-gray-400 hover:text-white">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 text-xs text-gray-500 flex justify-between">
          <span>© {new Date().getFullYear()} Piaarya. All rights reserved.</span>
          <span>Made with Piaarya Admin</span>
        </div>
      </div>
    </footer>
  );
}
