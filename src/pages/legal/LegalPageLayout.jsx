import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

export default function LegalPageLayout({ title, lastUpdated, children }) {
  return (
    <div className="min-h-screen">
      <div className="bg-dark-800/60 border-b border-white/5 py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-orange-400 mb-4 transition-colors">
            <FiArrowLeft /> Back to Home
          </Link>
          <p className="section-label">Legal</p>
          <h1 className="section-title">{title}</h1>
          {lastUpdated && <p className="text-sm text-gray-500 mt-2">Last updated: {lastUpdated}</p>}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-gray-300 text-sm leading-relaxed space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Section({ heading, children }) {
  return (
    <section>
      {heading && <h2 className="text-lg font-display font-bold text-white mb-3">{heading}</h2>}
      <div className="space-y-3 text-gray-300">{children}</div>
    </section>
  );
}
