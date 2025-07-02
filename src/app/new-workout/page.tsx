import Navigation from "@/components/Navigation";

export default function NewWorkoutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-white">
      <Navigation />
      <div className="flex flex-col items-center justify-center px-2 py-8 sm:py-12">
        <div className="w-full max-w-2xl mx-auto mt-6 sm:mt-10 px-2 py-6 sm:px-6 sm:py-8 rounded-3xl shadow-2xl backdrop-blur-md bg-white/70 border border-white/30" style={{boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.18)'}}>
          <h1 className="text-2xl font-bold">🏋️ Nouvelle Séance</h1>
          <p>Page fonctionnelle de création de séance GRIND.</p>
        </div>
      </div>
    </div>
  );
} 