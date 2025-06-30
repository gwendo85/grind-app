"use client";

const motivationalQuotes = [
  {
    text: "La discipline est le pont entre les objectifs et l'accomplissement.",
    author: "Jim Rohn"
  },
  {
    text: "Le succès n'est pas final, l'échec n'est pas fatal : c'est le courage de continuer qui compte.",
    author: "Winston Churchill"
  },
  {
    text: "La force ne vient pas de la capacité physique. Elle vient d'une volonté indomptable.",
    author: "Mahatma Gandhi"
  },
  {
    text: "Chaque séance d'entraînement est un pas vers une version meilleure de toi-même.",
    author: "GRIND"
  },
  {
    text: "La persévérance est la mère de toutes les réussites.",
    author: "Proverbe"
  },
  {
    text: "Ton corps peut tout. C'est ton cerveau qu'il faut convaincre.",
    author: "GRIND"
  },
  {
    text: "La motivation te fait commencer, l'habitude te fait continuer.",
    author: "Jim Ryun"
  },
  {
    text: "Plus tu transpires à l'entraînement, moins tu saignes au combat.",
    author: "Proverbe militaire"
  },
  {
    text: "La différence entre l'impossible et le possible réside dans la détermination.",
    author: "Tommy Lasorda"
  },
  {
    text: "Chaque jour est une nouvelle opportunité d'être plus fort qu'hier.",
    author: "GRIND"
  },
  {
    text: "La vraie force vient de l'intérieur. Débloque ton potentiel.",
    author: "GRIND"
  },
  {
    text: "L'excellence n'est pas un acte, mais une habitude.",
    author: "Aristote"
  },
  {
    text: "Ton futur toi te remerciera pour les efforts d'aujourd'hui.",
    author: "GRIND"
  },
  {
    text: "La seule personne que tu dois surpasser, c'est celle que tu étais hier.",
    author: "GRIND"
  },
  {
    text: "Le muscle se construit un jour à la fois. La patience est ta meilleure alliée.",
    author: "GRIND"
  }
];

export default function MotivationalQuote() {
  // Générer une citation basée sur la date du jour
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const quoteIndex = dayOfYear % motivationalQuotes.length;
  const quote = motivationalQuotes[quoteIndex];

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-md p-6 border border-purple-100">
      <div className="flex items-start gap-3">
        <div className="text-2xl mt-1">💬</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Citation du jour
          </h3>
          <blockquote className="text-gray-700 italic mb-3">
            &ldquo;{quote.text}&rdquo;
          </blockquote>
          <footer className="text-sm text-gray-600 font-medium">
            — {quote.author}
          </footer>
        </div>
      </div>
      
      {/* Indicateur de rafraîchissement quotidien */}
      <div className="mt-4 pt-3 border-t border-purple-200">
        <p className="text-xs text-gray-500">
          🔄 Nouvelle citation demain • {today.toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
    </div>
  );
} 