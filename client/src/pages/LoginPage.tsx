import { BASE_URL } from '../services/api'

export default function LoginPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="bg-white border-2 border-purple-300 rounded-xl shadow-md p-12 flex flex-col items-center gap-6 max-w-sm w-full mx-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center rounded-xl">
          <span className="text-white font-bold text-2xl">TQ</span>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">TaskQuest</h1>
          <p className="text-gray-500 mt-2">Complete tasks, earn points, unlock avatars.</p>
        </div>
        <a
          href={`${BASE_URL}/auth/github`}
          className="flex items-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors w-full justify-center"
        >
          Sign in with GitHub
        </a>
      </div>
    </div>
  )
}
