import Link from "next/link";
import { FaBolt, FaBullseye, FaUsers, FaSignInAlt } from "react-icons/fa";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#181c2b] via-[#23243a] to-[#1a1a2e] relative">
      <div className="w-full max-w-md mx-auto text-center px-4 py-8">
        <h1 className="text-5xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg">GRIND</h1>
        <p className="text-xl font-semibold text-orange-500 mb-2">Transforme ta passion en puissance <span role="img" aria-label="flamme">🔥</span></p>
        <div className="mb-4">
          <span className="text-2xl text-white font-bold">Performance &bull; Discipline &bull; Communauté</span>
        </div>
        <p className="text-base text-gray-200 mb-8">L'app complète pour transformer ton quotidien et atteindre tes objectifs</p>
        <div className="flex justify-center gap-6 mb-8">
          <div className="flex flex-col items-center">
            <span className="bg-orange-600/20 rounded-xl p-3 mb-1"><FaBolt className="text-orange-400 text-2xl" /></span>
            <span className="text-sm text-gray-200">Training</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="bg-blue-600/20 rounded-xl p-3 mb-1"><FaBullseye className="text-blue-400 text-2xl" /></span>
            <span className="text-sm text-gray-200">Mental</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="bg-green-600/20 rounded-xl p-3 mb-1"><FaUsers className="text-green-400 text-2xl" /></span>
            <span className="text-sm text-gray-200">Social</span>
          </div>
        </div>
        <Link href="/signup" className="block w-full bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-bold py-3 rounded-xl text-lg mb-4 shadow-lg transition-all">Commencer maintenant</Link>
        <Link href="#" className="block w-full border border-gray-400/30 bg-white/5 text-white font-semibold py-3 rounded-xl text-lg mb-2 shadow-md hover:bg-white/10 transition-all">Découvrir GRIND</Link>
        <p className="text-xs text-gray-400 mt-6">Rejoins ceux qui partagent les mêmes valeurs</p>
      </div>
      {/* Icône login en bas à droite */}
      <Link href="/login" className="fixed bottom-6 right-6 bg-gradient-to-br from-orange-500 to-orange-400 text-white rounded-full p-4 shadow-lg hover:scale-110 transition-transform z-50" title="Se connecter">
        <FaSignInAlt className="text-2xl" />
      </Link>
    </main>
  );
}
