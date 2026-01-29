
import PublicNav from '@/components/PublicNav'

export default function AiPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Bar */}
      <PublicNav />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-10 px-4">
        <div className="w-full max-w-3xl space-y-10">
          {/* 1. AI Feature Description */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-blue-800 mb-3">AI Feature Description</h2>
            <p className="text-gray-700 text-lg">
              AI is used to generate donor insights, relationship summaries, and engagement recommendations inside DonorConnect.
            </p>
          </section>

          {/* 2. Responsible AI Use */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-blue-800 mb-3">Responsible AI Use</h2>
            <ul className="list-disc pl-6 text-gray-700 text-lg space-y-1">
              <li>No automated decisions without human review</li>
              <li>No selling of user data</li>
              <li>No model training on nonprofit data</li>
              <li>Human-in-the-loop design</li>
              <li>Transparent AI usage</li>
            </ul>
          </section>

          {/* 3. AI APIs and Models */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-blue-800 mb-3">AI APIs and Models</h2>
            <ul className="list-disc pl-6 text-gray-700 text-lg space-y-1">
              <li>API: OpenAI API</li>
              <li>Model: GPT-based language model</li>
            </ul>
          </section>

          {/* 4. Responsible Use Explanation */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-blue-800 mb-3">Responsible Use Explanation</h2>
            <p className="text-gray-700 text-lg">
              AI is used as a support tool, not a replacement for human decision-making. All AI outputs are suggestions, not actions.
            </p>
          </section>

          {/* 5. Prompt Engineering */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-blue-800 mb-3">Prompt Engineering</h2>
            <ul className="list-disc pl-6 text-gray-700 text-lg space-y-1">
              <li>Structured prompts</li>
              <li>Context-based inputs</li>
              <li>Clear role definitions</li>
              <li>Output formatting rules</li>
              <li>Bias-reduction techniques</li>
            </ul>
          </section>

          {/* 6. How AI Improves the Solution */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-blue-800 mb-3">How AI Improves the Solution</h2>
            <ul className="list-disc pl-6 text-gray-700 text-lg space-y-1">
              <li>Saves time</li>
              <li>Improves donor understanding</li>
              <li>Better engagement planning</li>
              <li>Scalable nonprofit operations</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  )
}
