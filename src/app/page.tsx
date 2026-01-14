export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-wine-900 to-wine-950">
      <main className="text-center px-4">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
          Le Roi du Pinard
        </h1>
        <p className="text-xl md:text-2xl text-wine-200 mb-8">
          Votre guide pour découvrir les meilleurs vins
        </p>
        <div className="flex gap-4 justify-center">
          <button className="px-6 py-3 bg-white text-wine-900 font-semibold rounded-lg hover:bg-wine-100 transition-colors">
            Explorer
          </button>
          <button className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
            En savoir plus
          </button>
        </div>
      </main>
    </div>
  );
}
