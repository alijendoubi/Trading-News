import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Trading Intelligence Platform
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Your complete platform for economic calendar analysis, live market data, financial news, and professional trading tools.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/calendar" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition">
            Economic Calendar
          </Link>
          <Link href="/markets" className="bg-gray-200 text-gray-900 px-8 py-3 rounded-lg hover:bg-gray-300 transition">
            Live Markets
          </Link>
          <Link href="/news" className="bg-gray-200 text-gray-900 px-8 py-3 rounded-lg hover:bg-gray-300 transition">
            News Feed
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 py-20">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-2xl font-bold mb-2">📅 Economic Calendar</h3>
          <p className="text-gray-600">Track upcoming economic events and their market impact in real-time.</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-2xl font-bold mb-2">📊 Live Markets</h3>
          <p className="text-gray-600">Monitor forex, crypto, commodities, and indices with real-time pricing.</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-2xl font-bold mb-2">📰 Financial News</h3>
          <p className="text-gray-600">Stay informed with aggregated news from leading financial sources.</p>
        </div>
      </div>
    </div>
  );
}


