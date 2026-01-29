import PublicNav from '@/components/PublicNav'

export default function ReflectionPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <PublicNav />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-extrabold mb-12 text-center tracking-tight">Reflection</h1>

        {/* Section 1 */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 md:p-8">
            <h2 className="text-2xl font-semibold mb-4 border-l-4 border-blue-500 pl-3">1. What Challenged You Most</h2>
            <ul className="list-disc pl-8 text-gray-800 space-y-1 mb-6">
              <li>Technical complexity</li>
              <li>Feature prioritization</li>
              <li>Data modeling</li>
              <li>AI integration</li>
            </ul>
            {/* Space for answers removed for cleaner look */}
          </div>
        </section>

        {/* Section 2 */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 md:p-8">
            <h2 className="text-2xl font-semibold mb-4 border-l-4 border-green-500 pl-3">2. What You’d Change or Add</h2>
            <ul className="list-disc pl-8 text-gray-800 space-y-1">
              <li>Advanced analytics</li>
              <li>Mobile support</li>
              <li>Automation tools</li>
              <li>Integrations (email, payments)</li>
            </ul>
          </div>
        </section>

        {/* Section 3 */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 md:p-8">
            <h2 className="text-2xl font-semibold mb-4 border-l-4 border-yellow-500 pl-3">3. What You Learned</h2>
            <ul className="list-disc pl-8 text-gray-800 space-y-1">
              <li>Product thinking</li>
              <li>User-centered design</li>
              <li>MVP building</li>
              <li>Real-world constraints</li>
            </ul>
          </div>
        </section>

        {/* Section 4 */}
        <section>
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 md:p-8">
            <h2 className="text-2xl font-semibold mb-4 border-l-4 border-purple-500 pl-3">4. How AI Helped (or Didn’t)</h2>
            <ul className="list-disc pl-8 text-gray-800 space-y-1">
              <li>Ideation support</li>
              <li>Data structuring</li>
              <li>Development speed</li>
              <li>Limitations in accuracy</li>
              <li>Need for human validation</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  )
}
