import { useState, useEffect } from 'react';
import { auth, loginWithGoogle, logout, getUserData, updateUserScore, getLeaderboard, getUserHistory, puedeJugarHoy, marcarBienvenidaVista } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Icons = {
  Trophy: () => <span className="text-3xl">🏆</span>,
  Zap: () => <span className="text-3xl">⚡</span>,
  Target: () => <span className="text-3xl">🎯</span>,
  Flame: () => <span className="text-3xl">🔥</span>,
  Award: () => <span className="text-3xl">🏅</span>,
  Clock: () => <span className="text-2xl">⏰</span>,
  ChevronRight: () => <span className="text-xl">→</span>,
  Google: () => <span className="text-2xl">🔐</span>
};

const preguntasPorDia = {
  1: [
    {
      id: 1,
      tipo: 'noticia',
      titulo: '📰 Dólar vs Moneda Local',
      pregunta: 'Tu moneda local se devaluó 20% en un mes. ¿Qué significa esto para tus ahorros?',
      opciones: [
        { texto: 'Mis ahorros valen lo mismo', correcto: false },
        { texto: 'Perdí 20% de poder adquisitivo en dólares', correcto: true },
        { texto: 'Gané poder adquisitivo', correcto: false },
        { texto: 'No me afecta si no tengo dólares', correcto: false }
      ],
      puntos: 15,
      explicacion: 'Si tu moneda se devalúa 20% vs USD, tus ahorros locales ahora compran 20% menos en términos internacionales. Por eso diversificar en monedas duras es clave.'
    },
    {
      id: 2,
      tipo: 'trivia',
      titulo: '💰 ¿Qué es la inflación?',
      pregunta: 'Tu sueldo sigue igual, pero tus gastos mensuales aumentaron 15%. Esto es:',
      opciones: [
        { texto: 'Mala suerte', correcto: false },
        { texto: 'Inflación', correcto: true },
        { texto: 'Los comercios abusan', correcto: false },
        { texto: 'Crisis temporal', correcto: false }
      ],
      puntos: 10,
      explicacion: 'Inflación es la pérdida de poder adquisitivo del dinero. Cuando los precios suben sin que tu ingreso lo haga, estás perdiendo valor real.'
    },
    {
      id: 3,
      tipo: 'calculo',
      titulo: '🧮 Tasa real vs nominal',
      pregunta: 'Inversión paga 10% anual. Inflación es 8%. ¿Cuál es tu retorno REAL?',
      opciones: [
        { texto: '10%', correcto: false },
        { texto: '2%', correcto: true },
        { texto: '18%', correcto: false },
        { texto: '8%', correcto: false }
      ],
      puntos: 20,
      explicacion: 'Retorno real = Retorno nominal - Inflación. 10% - 8% = 2%. Siempre medí en términos reales para saber si realmente estás ganando.'
    },
    {
      id: 4,
      tipo: 'decision',
      titulo: '🎯 ¿Dónde guardar ahorros?',
      pregunta: 'Tenés 10.000 en moneda local. Inflación proyectada: 5% mensual. ¿Qué hacés?',
      opciones: [
        { texto: 'Lo dejo en efectivo', correcto: false },
        { texto: 'Cambio a moneda dura (USD/EUR)', correcto: true },
        { texto: 'Plazo fijo en moneda local', correcto: false },
        { texto: 'Lo gasto todo', correcto: false }
      ],
      puntos: 10,
      explicacion: 'Con inflación alta, mantener efectivo en moneda débil es perder valor. Cambiar a moneda dura protege tu capital. El plazo fijo solo funciona si la tasa supera la inflación.'
    },
    {
      id: 5,
      tipo: 'realidad',
      titulo: '🔥 Bitcoin vs Oro',
      pregunta: 'Querés diversificar fuera del sistema bancario. ¿Qué elegís?',
      opciones: [
        { texto: 'Solo Bitcoin', correcto: false },
        { texto: 'Solo Oro', correcto: false },
        { texto: 'Mezcla de ambos (70% oro, 30% BTC)', correcto: true },
        { texto: 'Ninguno, son muy riesgosos', correcto: false }
      ],
      puntos: 25,
      explicacion: 'Oro: 5000 años de historia, baja volatilidad, preserva valor. Bitcoin: digital, portátil, pero volátil. Una mezcla te da lo mejor de ambos: seguridad del oro + potencial del BTC.'
    }
  ],
  2: [
    {
      id: 6,
      tipo: 'calculo',
      titulo: '🧮 Interés compuesto',
      pregunta: 'Invertís 1000 al 8% anual. Lo reinvertís. Al segundo año, ¿cuánto tenés?',
      opciones: [
        { texto: '1160', correcto: false },
        { texto: '1166', correcto: true },
        { texto: '1180', correcto: false },
        { texto: '1200', correcto: false }
      ],
      puntos: 20,
      explicacion: 'Año 1: 1000 × 1.08 = 1080. Año 2: 1080 × 1.08 = 1166.4. Ganaste interés sobre el interés. Esos 6.4 extra son la magia del interés compuesto.'
    },
    {
      id: 7,
      tipo: 'noticia',
      titulo: '📰 Banco Central sube tasas',
      pregunta: 'El banco central subió la tasa de interés al 12% anual. ¿Por qué lo hace?',
      opciones: [
        { texto: 'Para ayudar a los ahorristas', correcto: false },
        { texto: 'Para controlar la inflación', correcto: true },
        { texto: 'Para debilitar la moneda', correcto: false },
        { texto: 'Sin razón aparente', correcto: false }
      ],
      puntos: 15,
      explicacion: 'Subir tasas encarece el crédito y reduce el consumo, frenando la inflación. Es una herramienta del banco central, aunque muchas veces llega tarde.'
    },
    {
      id: 8,
      tipo: 'trivia',
      titulo: '💰 Renta fija vs variable',
      pregunta: '¿Cuál es la diferencia principal?',
      opciones: [
        { texto: 'Una tiene más riesgo', correcto: false },
        { texto: 'Renta fija paga retornos predecibles, variable no', correcto: true },
        { texto: 'Una es ilegal', correcto: false },
        { texto: 'No hay diferencia', correcto: false }
      ],
      puntos: 10,
      explicacion: 'Renta fija: bonos, depósitos, retornos conocidos. Renta variable: acciones, criptos, retornos impredecibles. Mayor riesgo = mayor potencial de ganancia (o pérdida).'
    },
    {
      id: 9,
      tipo: 'decision',
      titulo: '🎯 Emergencia financiera',
      pregunta: 'Perdiste tu trabajo. ¿Cuántos meses de gastos deberías tener ahorrados?',
      opciones: [
        { texto: '1 mes', correcto: false },
        { texto: '3-6 meses', correcto: true },
        { texto: '12 meses', correcto: false },
        { texto: 'No hace falta', correcto: false }
      ],
      puntos: 10,
      explicacion: '3-6 meses de gastos en activos líquidos (moneda dura, cuenta disponible) es el estándar. Te da tiempo para buscar trabajo sin desesperarte.'
    },
    {
      id: 10,
      tipo: 'realidad',
      titulo: '🔥 Diversificación',
      pregunta: 'Tenés 10.000 para invertir. ¿Cómo lo distribuís?',
      opciones: [
        { texto: 'Todo en una sola cosa', correcto: false },
        { texto: '40% bonos, 40% acciones, 20% oro/BTC', correcto: true },
        { texto: '100% en moneda local', correcto: false },
        { texto: '100% en criptos', correcto: false }
      ],
      puntos: 25,
      explicacion: 'Nunca pongas todos los huevos en la misma canasta. Una cartera balanceada reduce riesgo. Si algo colapsa, no perdés todo.'
    }
  ]
};

// Copiar días para tener contenido
preguntasPorDia[0] = preguntasPorDia[1];
preguntasPorDia[3] = preguntasPorDia[1];
preguntasPorDia[4] = preguntasPorDia[2];
preguntasPorDia[5] = preguntasPorDia[1];
preguntasPorDia[6] = preguntasPorDia[2];

export default function App() {
  const [pantalla, setPantalla] = useState('loading');
  const [user, setUser] = useState(null);
  const [desafioActual, setDesafioActual] = useState(0);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null);
  const [mostrarExplicacion, setMostrarExplicacion] = useState(false);
  const [puntosHoy, setPuntosHoy] = useState(0);
  const [racha, setRacha] = useState(1);
  const [puntosAcumulados, setPuntosAcumulados] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [historial, setHistorial] = useState(null);
  const [puedeJugar, setPuedeJugar] = useState(true);
  
  // FIX: Usar getDate() para día del mes, no getDay() que es día de la semana
  const diaActual = new Date().getDate() % 7; // Rotar entre 0-6
  const desafiosDiarios = preguntasPorDia[diaActual] || preguntasPorDia[1];

  // Escuchar cambios de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await cargarDatosUsuario(currentUser.uid);
      } else {
        setUser(null);
        setPantalla('login');
      }
    });

    return () => unsubscribe();
  }, []);

  const cargarDatosUsuario = async (userId) => {
    try {
      // Verificar si puede jugar hoy
      const estadoJuego = await puedeJugarHoy(userId);
      setPuedeJugar(estadoJuego.puedeJugar);
      
      // Cargar datos del usuario
      const userData = await getUserHistory(userId);
      if (userData) {
        setPuntosAcumulados(userData.puntosAcumulados);
        setRacha(userData.racha);
        setHistorial(userData);
        
        // Si es primera vez Y no vio la bienvenida, mostrarla
        if (estadoJuego.esNuevo || (!userData.bienvenidaVista && userData.partidasJugadas === 0)) {
          setPantalla('bienvenida');
        } else {
          setPantalla('home');
        }
      } else {
        // Usuario totalmente nuevo
        setPantalla('bienvenida');
      }
      
      const leaderboardData = await getLeaderboard(10);
      setLeaderboard(leaderboardData);
      
      return userData;
    } catch (error) {
      console.error('Error cargando datos:', error);
      setPantalla('home');
      return null;
    }
  };

  const handleLoginGoogle = async () => {
    setCargando(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Error en login:', error);
      alert('Error al iniciar sesión. Intenta de nuevo.');
    }
    setCargando(false);
  };

  const handleLogout = async () => {
    await logout();
    setPantalla('login');
  };

  const manejarRespuesta = (opcion, index) => {
    setRespuestaSeleccionada(index);
    setMostrarExplicacion(true);
    
    if (opcion.correcto) {
      const puntosGanados = desafiosDiarios[desafioActual].puntos;
      setPuntosHoy(prev => prev + puntosGanados);
    }
  };

  const siguienteDesafio = () => {
    if (desafioActual < desafiosDiarios.length - 1) {
      setDesafioActual(prev => prev + 1);
      setRespuestaSeleccionada(null);
      setMostrarExplicacion(false);
    } else {
      guardarPartida();
      setPantalla('resultado');
    }
  };

  const guardarPartida = async () => {
    if (!user) return;
    
    try {
      const userData = await updateUserScore(
        user.uid,
        user.displayName || 'Usuario',
        puntosHoy
      );
      setPuntosAcumulados(userData.puntosAcumulados);
      setRacha(userData.racha);
      
      // Después de guardar, marcar que ya no puede jugar hoy
      setPuedeJugar(false);
      
      const leaderboardData = await getLeaderboard(10);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error guardando partida:', error);
    }
  };

  const iniciarDesafio = () => {
    if (!puedeJugar) {
      return; // No permitir jugar si ya jugó hoy
    }
    setPantalla('juego');
    setDesafioActual(0);
    setRespuestaSeleccionada(null);
    setMostrarExplicacion(false);
    setPuntosHoy(0);
  };
  
  const irAHome = async () => {
    if (user) {
      await marcarBienvenidaVista(user.uid);
    }
    setPantalla('home');
  };

  if (pantalla === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-2xl">Cargando...</div>
      </div>
    );
  }

  if (pantalla === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-block bg-yellow-400 rounded-full p-6 mb-4 shadow-2xl">
              <span className="text-6xl">🤓</span>
            </div>
            <h1 className="text-5xl font-black text-white mb-2">La Trivia de Don Roi</h1>
            <p className="text-purple-200 text-lg">Tu snack financiero diario 🚀</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-purple-900 mb-2">¡Bienvenido!</h2>
            <p className="text-gray-600 mb-6">Iniciá sesión para competir en el ranking</p>
            
            <button
              onClick={handleLoginGoogle}
              disabled={cargando}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 font-bold py-4 px-6 rounded-xl shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
            >
              <Icons.Google />
              <span>{cargando ? 'Iniciando sesión...' : 'Continuar con Google'}</span>
            </button>

            <p className="text-gray-500 text-sm text-center mt-6">
              3 minutos al día • 5 preguntas • Ranking global
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (pantalla === 'bienvenida') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="inline-block bg-purple-100 rounded-full p-4 mb-4">
                <span className="text-6xl">🤓</span>
              </div>
              <h2 className="text-3xl font-black text-purple-900 mb-2">
                Conocé a Don Roi
              </h2>
              <p className="text-gray-600 text-lg">
                El inversor más obsesivo del mundo
              </p>
            </div>

            <div className="space-y-4 text-gray-700 leading-relaxed mb-8">
              <p className="text-lg">
                Don Roi es ese personaje que <strong className="text-purple-900">NUNCA gasta</strong>, invierte hasta el último centavo, y te mira feo si comprás algo innecesario 😂
              </p>

              <div className="bg-purple-50 rounded-xl p-4 border-l-4 border-purple-500">
                <p className="font-semibold text-purple-900 mb-2">🎯 Su filosofía (extrema):</p>
                <ul className="space-y-2 text-sm">
                  <li>💎 <strong>Patrimonio &gt; Todo</strong> (incluso tu cumpleaños)</li>
                  <li>🚫 Gastos sin necesidad = pecado mortal</li>
                  <li>📈 Si no genera retorno, no existe</li>
                  <li>🏃 Lujos = "pasivos que te empobrecen"</li>
                </ul>
              </div>

              <p>
                <strong className="text-purple-900">¿Tenés que ser así?</strong> No. Pero este juego te muestra cómo piensa alguien obsesionado con la libertad financiera.
              </p>

              <p className="text-sm">
                Tomalo como un <strong>experimento mental</strong>. Después vos decidís qué tanto aplicás. Podés ser 80% Don Roi y 20% persona normal. O al revés 😂
              </p>

              <div className="bg-yellow-50 rounded-xl p-4 border-l-4 border-yellow-500">
                <p className="text-sm">
                  <strong className="text-yellow-900">💡 Disclaimer:</strong> Don Roi es una caricatura. En la vida real, balance &gt; extremismo. Pero conocer este mindset te ayuda a tomar mejores decisiones.
                </p>
              </div>
            </div>

            <button
              onClick={irAHome}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl shadow-lg hover:scale-105 transition-transform"
            >
              Entendido, ¡vamos! 🚀
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (pantalla === 'home') {
    const posicion = leaderboard.findIndex(u => u.id === user?.uid) + 1;
    const miNivel = puntosAcumulados < 100 ? 'Principiante' : 
                    puntosAcumulados < 300 ? 'Ahorrador' : 
                    puntosAcumulados < 600 ? 'Ahorrador Pro' : 'Inversor';

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="max-w-md mx-auto p-6">
          {/* Header con logout */}
          <div className="flex justify-between items-center mb-6 pt-8">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-400 rounded-full p-2">
                <span className="text-3xl">🤓</span>
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">Don Roi</h1>
                <p className="text-purple-200 text-sm">Hola {user?.displayName?.split(' ')[0]}! 👋</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-purple-200 hover:text-white text-sm underline"
            >
              Salir
            </button>
          </div>

          {/* Botón Conocé a Don Roi */}
          <button
            onClick={() => setPantalla('bienvenida')}
            className="w-full bg-white/10 backdrop-blur-lg rounded-2xl p-3 mb-6 border border-white/20 hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-2xl">🤓</span>
            <span className="text-white font-semibold text-sm">Conocé a Don Roi</span>
          </button>

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-6 border border-white/20">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Icons.Flame />
                  <span className="text-2xl font-bold text-white">{racha}</span>
                </div>
                <p className="text-xs text-purple-200">días seguidos</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Icons.Trophy />
                  <span className="text-2xl font-bold text-white">{puntosAcumulados}</span>
                </div>
                <p className="text-xs text-purple-200">puntos totales</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Icons.Award />
                  <span className="text-2xl font-bold text-white">{historial?.partidasJugadas || 0}</span>
                </div>
                <p className="text-xs text-purple-200">partidas</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-3">
              <p className="text-white text-sm font-semibold">🎯 Nivel: {miNivel}</p>
              <div className="bg-white/20 rounded-full h-2 mt-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{width: `${(puntosAcumulados % 100)}%`}}
                />
              </div>
              <p className="text-white/80 text-xs mt-1">
                {100 - (puntosAcumulados % 100)} puntos para subir de nivel
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-6 mb-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white rounded-full p-2">
                <Icons.Target />
              </div>
              <div>
                <h2 className="text-white font-bold text-xl">Desafío Diario</h2>
                <p className="text-orange-100 text-sm">Respondé como Don Roi pensaría 🧠</p>
              </div>
            </div>

            {puedeJugar ? (
              <>
                <div className="bg-white/20 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icons.Clock />
                    <span className="text-white text-sm font-semibold">Temas de hoy:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-white/30 text-white text-xs px-3 py-1 rounded-full">Monedas</span>
                    <span className="bg-white/30 text-white text-xs px-3 py-1 rounded-full">Inflación</span>
                    <span className="bg-white/30 text-white text-xs px-3 py-1 rounded-full">Inversión</span>
                  </div>
                </div>

                <button
                  onClick={iniciarDesafio}
                  className="w-full bg-white text-orange-600 font-bold py-4 rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
                >
                  ¡Empezar ahora!
                  <Icons.ChevronRight />
                </button>
              </>
            ) : (
              <>
                <div className="bg-white/20 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white text-2xl">✅</span>
                    <span className="text-white text-sm font-semibold">Completaste el desafío de hoy</span>
                  </div>
                  <p className="text-orange-100 text-sm">
                    Volvé mañana para nuevas preguntas y seguir sumando puntos
                  </p>
                </div>

                <button
                  disabled
                  className="w-full bg-white/30 text-white/60 font-bold py-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Icons.Clock />
                  <span>Volvé mañana</span>
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setPantalla('leaderboard')}
            className="w-full bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icons.Trophy />
                <div className="text-left">
                  <p className="text-white font-bold">Ranking Global</p>
                  <p className="text-purple-200 text-sm">
                    {posicion > 0 ? `Estás en el puesto #${posicion}` : 'Unite al ranking'}
                  </p>
                </div>
              </div>
              <Icons.ChevronRight />
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (pantalla === 'juego') {
    const desafio = desafiosDiarios[desafioActual];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="max-w-md mx-auto p-6">
          <div className="mb-6 pt-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Icons.Zap />
                <span className="text-white font-bold text-lg">{puntosHoy} pts</span>
              </div>
              <span className="text-purple-200 text-sm">
                {desafioActual + 1} de {desafiosDiarios.length}
              </span>
            </div>
            
            <div className="bg-white/20 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full h-3 transition-all duration-500"
                style={{width: `${((desafioActual + 1) / desafiosDiarios.length) * 100}%`}}
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-2xl mb-6">
            <h3 className="text-purple-900 font-bold text-lg mb-4">{desafio.titulo}</h3>
            <p className="text-gray-700 text-lg mb-6 leading-relaxed">{desafio.pregunta}</p>

            <div className="space-y-3">
              {desafio.opciones.map((opcion, index) => (
                <button
                  key={index}
                  onClick={() => !mostrarExplicacion && manejarRespuesta(opcion, index)}
                  disabled={mostrarExplicacion}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    respuestaSeleccionada === index
                      ? opcion.correcto
                        ? 'bg-green-500 text-white border-green-600'
                        : 'bg-red-500 text-white border-red-600'
                      : mostrarExplicacion && opcion.correcto
                      ? 'bg-green-100 border-green-500 text-gray-900 border-2'
                      : 'bg-purple-100 hover:bg-purple-200 border-purple-300 text-gray-900'
                  } border-2 font-medium`}
                >
                  <div className="flex items-center justify-between">
                    <span>{opcion.texto}</span>
                    {mostrarExplicacion && (
                      opcion.correcto ? <span className="text-2xl">✅</span> : respuestaSeleccionada === index ? <span className="text-2xl">❌</span> : null
                    )}
                  </div>
                </button>
              ))}
            </div>

            {!mostrarExplicacion && (
              <div className="mt-4 text-center">
                <span className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-bold">
                  +{desafio.puntos} puntos 🎯
                </span>
              </div>
            )}
          </div>

          {mostrarExplicacion && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
              <h4 className="text-white font-bold mb-2">💡 Don Roi explica:</h4>
              <p className="text-purple-100 leading-relaxed mb-6">{desafio.explicacion}</p>

              <button
                onClick={siguienteDesafio}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-4 rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                {desafioActual < desafiosDiarios.length - 1 ? 'Siguiente desafío' : 'Ver resultados'}
                <Icons.ChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (pantalla === 'resultado') {
    const porcentaje = (puntosHoy / 80) * 100;
    const posicion = leaderboard.findIndex(u => u.id === user?.uid) + 1;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-block bg-yellow-400 rounded-full p-6 mb-4 shadow-2xl">
              <Icons.Trophy />
            </div>
            
            <h1 className="text-5xl font-black text-white mb-2">¡{puntosHoy} puntos!</h1>
            <p className="text-purple-200 text-xl">
              {porcentaje >= 80 ? '¡Don Roi está orgulloso! 🔥' : porcentaje >= 60 ? '¡Muy bien! 💪' : '¡Seguí practicando! 📈'}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-2xl mb-6">
            <h3 className="font-bold text-purple-900 mb-4 text-lg">Tu resumen del día:</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Desafíos completados</span>
                <span className="font-bold text-purple-900">5/5 ✅</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Respuestas correctas</span>
                <span className="font-bold text-purple-900">{Math.round(porcentaje/20)}/5</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Racha</span>
                <span className="font-bold text-orange-500">{racha} días 🔥</span>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Total acumulado</span>
                  <span className="font-bold text-purple-900 text-xl">{puntosAcumulados} pts</span>
                </div>
                <p className="text-sm text-gray-500">
                  {posicion > 0 
                    ? `Estás en el puesto #${posicion} del ranking global 🏆`
                    : 'Te uniste al ranking 🏆'}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setPantalla('leaderboard')}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl shadow-lg hover:scale-105 transition-transform mb-3"
          >
            Ver Ranking Global
          </button>

          <button
            onClick={() => setPantalla('home')}
            className="w-full bg-white/10 backdrop-blur-lg text-white font-bold py-4 rounded-xl border border-white/20"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (pantalla === 'leaderboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="max-w-md mx-auto p-6">
          <div className="text-center mb-8 pt-8">
            <Icons.Trophy />
            <h1 className="text-4xl font-black text-white mb-2">Ranking Global</h1>
            <p className="text-purple-200">Los mejores discípulos de Don Roi 🔥</p>
          </div>

          {leaderboard.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-6 border border-white/20 text-center">
              <p className="text-white text-lg mb-2">Sé el primero en el ranking 🚀</p>
              <p className="text-purple-200 text-sm">Completá el desafío para aparecer aquí</p>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {leaderboard.map((usuario, index) => (
                <div
                  key={usuario.id}
                  className={`rounded-2xl p-5 ${
                    usuario.id === user?.uid
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 border-2 border-yellow-300'
                      : 'bg-white/10 backdrop-blur-lg border border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-black text-white">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-bold text-white">
                        {usuario.nombre}
                        {usuario.id === user?.uid && ' (Vos)'}
                      </p>
                      <p className={`text-sm ${usuario.id === user?.uid ? 'text-orange-100' : 'text-purple-200'}`}>
                        {usuario.nivel}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">{usuario.puntos}</p>
                      <p className={`text-xs ${usuario.id === user?.uid ? 'text-orange-100' : 'text-purple-200'}`}>
                        puntos
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setPantalla('home')}
            className="w-full bg-white/10 backdrop-blur-lg text-white font-bold py-4 rounded-xl border border-white/20"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }
}
