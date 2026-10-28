import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#0a0a1a] py-16">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2 text-white font-semibold text-xl mb-4">
              <span className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg"></span>
              <span>KALKII</span>
            </Link>
            <p className="text-white/70 leading-relaxed">
              Powering the future of wealth. A next-generation platform built
              for those who believe growth is a discipline, not a promise.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about-us" className="text-white/70 hover:text-indigo-500 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="text-white/70 hover:text-indigo-500 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-white/70 hover:text-indigo-500 transition-colors">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-white/70 hover:text-indigo-500 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy-policy" className="text-white/70 hover:text-indigo-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="text-white/70 hover:text-indigo-500 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Account</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/delete-account" className="text-white/70 hover:text-indigo-500 transition-colors">
                  Delete Account
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 text-white/50">
          <div>© 2026 Kalkii. All rights reserved.</div>
          <div className="tracking-widest text-xs mt-4 md:mt-0">
            POWERING · THE · FUTURE · OF · WEALTH
          </div>
        </div>
      </div>
    </footer>
  );
}
