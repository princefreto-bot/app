import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { UploadPage } from './pages/UploadPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { ReportsPage } from './pages/ReportsPage';
import { useEffect, useState, useRef } from 'react';

// ========================================
// CONFIGURATION DES VIDÉOS BACKGROUND
// ========================================
// Ajoutez vos vidéos dans le dossier public/
// et listez-les ici dans l'ordre de lecture
const BACKGROUND_VIDEOS = [
  '/video1.mp4',
  '/video2.mp4',
  '/video3.mp4',
  // Ajoutez autant de vidéos que vous voulez
  // Si un fichier n'existe pas, il sera ignoré
];

// Vidéo unique par défaut si vous n'avez qu'une seule vidéo
const SINGLE_VIDEO = '/background.mp4';

// ========================================
// COMPOSANT VIDÉO BACKGROUND
// ========================================
function VideoBackground() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoErrorCount, setVideoErrorCount] = useState(0);

  // Liste combinée de toutes les vidéos possibles
  const allVideos = [SINGLE_VIDEO, ...BACKGROUND_VIDEOS];
  const currentVideo = allVideos[currentVideoIndex];

  // Passer à la vidéo suivante
  const nextVideo = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % allVideos.length);
  };

  const handleVideoError = () => {
    console.log(`Erreur de chargement pour ${currentVideo}, essai du suivant...`);
    // Si on a essayé toutes les vidéos sans succès, on arrête pour éviter une boucle infinie rapide
    if (videoErrorCount < allVideos.length * 2) {
      setVideoErrorCount(prev => prev + 1);
      nextVideo();
    }
  };

  const handleVideoSuccess = () => {
    // La vidéo fonctionne, on reset le compteur d'erreurs
    setVideoErrorCount(0);
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden -z-10 bg-slate-900">
      <video
        key={currentVideo}
        autoPlay
        muted
        playsInline
        // Si c'est la seule vidéo qui marche, on boucle
        loop={false} 
        onEnded={nextVideo}
        onError={handleVideoError}
        onCanPlay={handleVideoSuccess}
        className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover opacity-60"
      >
        <source src={currentVideo} type="video/mp4" />
        {/* Fallback simple */}
      </video>
      
      {/* Overlay sombre pour lisibilité */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px]" />
      
      {/* Gradient subtil */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50" />
    </div>
  );
}

function Particles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 15,
    size: 2 + Math.random() * 4,
  }));

  return (
    <div className="particles">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// Composant vidéo d'introduction
function IntroVideo({ onComplete }: { onComplete: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEnding, setIsEnding] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Fonction pour démarrer la vidéo
    const startVideo = async () => {
      try {
        await video.play();
        setVideoLoaded(true);
        console.log('Vidéo lancée automatiquement');
      } catch (err) {
        console.log('Autoplay bloqué, affichage du bouton play');
        setShowPlayButton(true);
        setVideoLoaded(true);
      }
    };

    // Quand la vidéo est prête
    const handleCanPlay = () => {
      console.log('Vidéo prête à être jouée');
      startVideo();
    };

    // Si la vidéo a des données
    const handleLoadedData = () => {
      console.log('Données vidéo chargées');
      setVideoLoaded(true);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleLoadedData);

    // Forcer le chargement
    video.load();

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, []);

  const handleVideoEnd = () => {
    setIsEnding(true);
    // Animation de sortie
    if (containerRef.current) {
      containerRef.current.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      containerRef.current.style.opacity = '0';
      containerRef.current.style.transform = 'scale(1.1)';
    }
    setTimeout(onComplete, 800);
  };

  const handleSkip = () => {
    handleVideoEnd();
  };

  const handleVideoError = () => {
    console.log('Erreur vidéo - passage au chargement');
    onComplete();
  };

  const handlePlayClick = async () => {
    const video = videoRef.current;
    if (video) {
      try {
        await video.play();
        setShowPlayButton(false);
      } catch (err) {
        console.error('Impossible de lancer la vidéo', err);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
    >
      {/* Video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={handleVideoEnd}
        onError={handleVideoError}
        className="w-full h-full object-cover"
        style={{ background: '#000' }}
      >
        {/* Essayer plusieurs formats */}
        <source src="/intro.mp4" type="video/mp4" />
        <source src="/intro.webm" type="video/webm" />
        <source src="/intro.mov" type="video/quicktime" />
      </video>

      {/* Overlay avec logo */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />

      {/* Bouton Play si autoplay bloqué */}
      {showPlayButton && !isEnding && (
        <button
          onClick={handlePlayClick}
          className="absolute inset-0 flex items-center justify-center z-20 bg-black/30"
        >
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110">
            <svg className="w-12 h-12 text-white ml-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <p className="absolute bottom-1/3 text-white text-lg">Cliquez pour lancer la vidéo</p>
        </button>
      )}
      
      {/* Logo en bas */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="text-white text-2xl font-bold">EduAnalytics Pro</span>
        </div>
        <p className="text-white/60 text-sm">Plateforme d'Analyse Scolaire Intelligente</p>
      </div>

      {/* Bouton Skip */}
      {!isEnding && (
        <button
          onClick={handleSkip}
          className="absolute top-6 right-6 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-sm font-medium hover:bg-white/20 transition-all border border-white/20 z-30"
        >
          Passer ↵
        </button>
      )}

      {/* Indicateur de chargement vidéo */}
      {!videoLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Chargement de la vidéo...</p>
          </div>
        </div>
      )}

      {/* Barre de progression */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-20">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
          style={{
            animation: 'progressBar 10s linear forwards'
          }}
        />
      </div>

      <style>{`
        @keyframes progressBar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center gradient-bg">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/30 animate-ping" />
          <div className="absolute inset-2 rounded-full border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-4 rounded-full border-4 border-purple-500/30" />
          <div className="absolute inset-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <h2 className="text-white text-xl font-semibold mb-2 glow-text">EduAnalytics Pro</h2>
        <p className="text-white/50 text-sm">Chargement de l'application...</p>
      </div>
    </div>
  );
}

function AppContent() {
  const { currentPage } = useApp();

  const renderPage = () => {
    switch (currentPage) {
      case 'upload':
        return <UploadPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'students':
        return <StudentsPage />;
      case 'reports':
        return <ReportsPage />;
      default:
        return <UploadPage />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Vidéo en arrière-plan - tourne en boucle */}
      <VideoBackground />
      
      {/* Fallback gradient si pas de vidéo */}
      <div className="fixed inset-0 gradient-bg -z-20" />
      
      {/* Particules animées par-dessus la vidéo */}
      <Particles />
      
      {/* Contenu de l'application */}
      <Sidebar />
      <main className="main-content ml-64 min-h-screen relative z-10">
        {renderPage()}
      </main>
    </div>
  );
}

export function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleIntroComplete = () => {
    setShowIntro(false);
    setIsLoading(true);
    
    // Afficher le loading screen pendant 1.5s après la vidéo
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  if (showIntro) {
    return <IntroVideo onComplete={handleIntroComplete} />;
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
