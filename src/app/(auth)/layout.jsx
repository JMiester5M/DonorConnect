// Auth layout for login and register pages
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* App branding/logo */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">DonorConnect</h1>
            <p className="mt-2 text-sm text-gray-600">
              Donor retention platform for nonprofits
            </p>
          </div>

          {children}
        </div>
      </div>

      {/* Right side - Brand image/info */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-blue-800 items-center justify-center p-12">
        <div className="text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Welcome!</h2>
          <p className="text-lg text-blue-100 mb-8">
            Increase donor retention and convert first-time donors into lifelong supporters.
          </p>
          <div className="space-y-4 text-left max-w-sm mx-auto">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-500">
                  <span className="text-white font-bold">✓</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Smart Donor Insights</h3>
                <p className="text-sm text-blue-100">Identify at-risk donors and personalize outreach</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-500">
                  <span className="text-white font-bold">✓</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Retention Tracking</h3>
                <p className="text-sm text-blue-100">Monitor second gift conversion and donor lifecycles</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-500">
                  <span className="text-white font-bold">✓</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Automated Workflows</h3>
                <p className="text-sm text-blue-100">Launch targeted campaigns and follow-ups automatically</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}