import Link from "next/link";
import { FaBolt, FaBullseye, FaUsers, FaSignInAlt, FaDumbbell } from "react-icons/fa";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-white relative px-2">
      <div className="w-full max-w-md mx-auto text-center px-2 py-6 sm:px-4 sm:py-8 rounded-3xl shadow-xl backdrop-blur-md bg-white/60 border border-white/30" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'}}>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-2 tracking-tight drop-shadow-lg">GRIND</h1>
        <p className="text-lg sm:text-xl font-semibold text-orange-500 mb-2">Transforme ta passion en puissance <span role="img" aria-label="flamme">🔥</span></p>
        <div className="mb-3 sm:mb-4">
          <span className="text-base sm:text-2xl text-gray-900 font-bold">Performance &bull; Discipline &bull; Communauté</span>
        </div>
        <p className="text-sm sm:text-base text-gray-700 mb-6 sm:mb-8">L'app complète pour transformer ton quotidien et atteindre tes objectifs</p>
        <div className="flex justify-center gap-3 sm:gap-6 mb-6 sm:mb-8 flex-wrap">
          <div className="flex flex-col items-center mb-2 sm:mb-0">
            <span className="bg-orange-100 rounded-xl p-2 sm:p-3 mb-1 transition-all duration-200 hover:bg-white/40 hover:backdrop-blur-md hover:shadow-xl hover:scale-105 border border-white/40" style={{boxShadow: '0 2px 8px 0 rgba(255, 165, 0, 0.10)'}}><FaBolt className="text-orange-500 text-xl sm:text-2xl" /></span>
            <span className="text-xs sm:text-sm text-gray-700">Training</span>
          </div>
          <div className="flex flex-col items-center mb-2 sm:mb-0">
            <span className="bg-blue-100 rounded-xl p-2 sm:p-3 mb-1 transition-all duration-200 hover:bg-white/40 hover:backdrop-blur-md hover:shadow-xl hover:scale-105 border border-white/40" style={{boxShadow: '0 2px 8px 0 rgba(30, 144, 255, 0.10)'}}><FaBullseye className="text-blue-500 text-xl sm:text-2xl" /></span>
            <span className="text-xs sm:text-sm text-gray-700">Mental</span>
          </div>
          <div className="flex flex-col items-center mb-2 sm:mb-0">
            <span className="bg-green-100 rounded-xl p-2 sm:p-3 mb-1 transition-all duration-200 hover:bg-white/40 hover:backdrop-blur-md hover:shadow-xl hover:scale-105 border border-white/40" style={{boxShadow: '0 2px 8px 0 rgba(34, 197, 94, 0.10)'}}><FaUsers className="text-green-500 text-xl sm:text-2xl" /></span>
            <span className="text-xs sm:text-sm text-gray-700">Social</span>
          </div>
          <div className="flex flex-col items-center mb-2 sm:mb-0">
            <span className="bg-purple-100 rounded-xl p-2 sm:p-3 mb-1 transition-all duration-200 hover:bg-white/40 hover:backdrop-blur-md hover:shadow-xl hover:scale-105 border border-white/40" style={{boxShadow: '0 2px 8px 0 rgba(168, 85, 247, 0.10)'}}><FaDumbbell className="text-purple-500 text-xl sm:text-2xl" /></span>
            <span className="text-xs sm:text-sm text-gray-700">Fitness</span>
          </div>
        </div>
        <Link href="/signup" className="block w-full bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-bold py-2 sm:py-3 rounded-xl text-base sm:text-lg mb-3 sm:mb-4 shadow-lg transition-all">Commencer maintenant</Link>
        <p className="text-xs text-gray-500 mt-4 sm:mt-6">Rejoins ceux qui partagent les mêmes valeurs</p>
      </div>
      {/* Icône login en bas à droite */}
      <Link href="/login" className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-gradient-to-br from-orange-500 to-orange-400 text-white rounded-full p-3 sm:p-4 shadow-lg hover:scale-110 transition-transform z-50" title="Se connecter">
        <FaSignInAlt className="text-xl sm:text-2xl" />
      </Link>
    </main>
  );
}
