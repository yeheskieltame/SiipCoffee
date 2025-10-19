"use client";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Test Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-amber-100">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent mb-4">
            SiipCoffe Test Page
          </h1>
          <p className="text-gray-600 text-lg">
            If you can see this styled page, Tailwind CSS is working correctly!
          </p>
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button className="bg-gradient-to-r from-amber-600 to-amber-800 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-200">
            Primary Button
          </button>
          <button className="bg-white border-2 border-amber-200 text-amber-700 font-semibold py-3 px-6 rounded-xl hover:bg-amber-50 transition-all duration-200">
            Secondary Button
          </button>
          <button className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-200">
            Blue Button
          </button>
        </div>

        {/* Test Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-white rounded-xl shadow-lg p-6 border border-amber-100 hover:shadow-xl transition-shadow duration-200">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-2xl">☕</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Coffee Item {item}</h3>
              <p className="text-gray-600 mb-4">This is a test card to verify Tailwind CSS styling is working properly.</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-amber-700">Rp 25.000</span>
                <button className="bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium py-2 px-4 rounded-lg transition-colors">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Test Responsive Design */}
        <div className="mt-12 p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white">
          <h2 className="text-2xl font-bold mb-4">Responsive Design Test</h2>
          <p className="mb-4">This should look good on all screen sizes. Try resizing your browser!</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">📱</div>
                <p className="font-medium">Responsive {item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-block bg-gradient-to-r from-amber-600 to-amber-800 text-white font-semibold py-3 px-8 rounded-xl hover:shadow-lg transition-all duration-200"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}