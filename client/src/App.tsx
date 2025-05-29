// import { useState } from 'react'
import './App.css'

function App() {
  // const [count, setCount] = useState(0) 
  
  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-3xl font-bold text-red-600 mb-8">YouTube Party</h1>
                <button className="w-full bg-red-600 text-white rounded-lg px-4 py-2 hover:bg-red-700 transition-colors">
                  Create Party
                </button>
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Enter Party Code"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  />
                  <button className="w-full mt-2 bg-gray-600 text-white rounded-lg px-4 py-2 hover:bg-gray-700 transition-colors">
                    Join Party
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App