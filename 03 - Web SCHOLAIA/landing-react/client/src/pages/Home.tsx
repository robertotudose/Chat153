/**
 * SCHOLAIA / Archivo nocturno
 * Dirección: editorial nocturna, textura mineral, liquid glass de alto contraste
 * y composición asimétrica con el monograma como firma arquitectónica.
 */
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  LockKeyhole,
  MessagesSquare,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

const assets = {
  hero: "/manus-storage/scholaia-mineral-hero_a1d825c9.jpg",
  studio: "/manus-storage/scholaia-studio-atmosphere_7dd19ecb.jpg",
  signal: "/manus-storage/scholaia-glass-signal_ce0bfb96.jpg",
  contact: "/manus-storage/scholaia-contact-atmosphere_c622645f.jpg",
  mark: "/manus-storage/scholaia-mark_4a43d296.png",
};

type AssistantMode = "Core" | "Lite";

const capabilities = [
  {
    number: "01",
    icon: MessagesSquare,
    title: "Responde con contexto",
    text: "Convierte las preguntas habituales de familias en respuestas claras, coherentes y adaptadas a la información de tu centro.",
  },
  {
    number: "02",
    icon: CalendarDays,
    title: "Ordena los trámites",
    text: "Guía solicitudes, visitas y citas con flujos sencillos que evitan correos incompletos y llamadas repetitivas.",
  },
  {
    number: "03",
    icon: ShieldCheck,
    title: "Cuida cada interacción",
    text: "Una capa de atención diseñada para ofrecer información del centro con privacidad, límites claros y criterio institucional.",
  },
];

const messages: Record<AssistantMode, string> = {
  Core: "Claro. Puedo orientarte sobre horarios, admisiones, comedor, visitas y solicitudes del centro.",
  Lite: "Elige una categoría y te llevaré paso a paso a la información que necesitas.",
};

export default function Home() {
  const [schoolName, setSchoolName] = useState("Colegio San Gabriel");
  const [initials, setInitials] = useState("SG");
  const [mode, setMode] = useState<AssistantMode>("Core");
  const [question, setQuestion] = useState("¿Cómo solicito una visita al centro?");
  const [reply, setReply] = useState(messages.Core);

  const previewQuestion = (newQuestion: string) => {
    setQuestion(newQuestion);
    setReply(
      mode === "Core"
        ? "Te acompaño a solicitar una visita. Primero escogeremos el día que mejor encaje con tu familia."
        : "Visitas y admisiones · Selecciona la opción que necesitas para continuar.",
    );
  };

  const changeMode = (newMode: AssistantMode) => {
    setMode(newMode);
    setReply(messages[newMode]);
  };

  return (
    <main className="scholaia-shell">
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>

      <header className="site-header">
        <nav className="site-nav" aria-label="Navegación principal">
          <a className="nav-brand" href="#inicio" aria-label="SCHOLAIA, inicio">
            <img className="nav-brand-mark" src={assets.mark} alt="" />
            <span className="nav-brand-architecture" aria-hidden="true"><span>SCHO</span><span>LAIA</span></span>
          </a>
          <div className="nav-links">
            <a href="#capacidad">Capacidades</a>
            <a href="#studio">Studio</a>
            <a href="#confianza">Confianza</a>
          </div>
          <a className="nav-cta" href="#contacto">
            Abrir la conversación <ArrowUpRight size={15} strokeWidth={1.8} />
          </a>
        </nav>
      </header>

      <div id="contenido">
        <section
          className="hero-scene scene-bg"
          id="inicio"
          style={{ backgroundImage: `url(${assets.hero})` }}
        >
          <div className="scene-grain" aria-hidden="true" />
          <div className="hero-orbit orbit-one" aria-hidden="true" />
          <div className="hero-orbit orbit-two" aria-hidden="true" />
          <div className="hero-layout">
            <div className="hero-meta reveal-item">
              <span className="eyebrow">Atención escolar / 24 · 7</span>
              <span className="hero-index">01—05</span>
            </div>

            <div className="hero-monogram" aria-label="SCHOLAIA">
              <span>SCHO</span>
              <span>LAIA</span>
            </div>

            <div className="hero-statement reveal-item">
              <p className="serif-kicker">La atención escolar,</p>
              <h1>reimaginada.</h1>
              <p className="hero-copy">
                La capa de atención que permite a cada centro responder con calma,
                coherencia y disponibilidad continua.
              </p>
              <div className="hero-actions">
                <a className="button-liquid button-liquid--solid" href="#studio">
                  Explorar tu demostración <ArrowRight size={17} />
                </a>
                <a className="button-text" href="#capacidad">
                  Descubrir capacidades <ChevronDown size={16} />
                </a>
              </div>
            </div>

            <div className="hero-footnote reveal-item">
              <span className="signal-dot" />
              <span>Un sistema de atención para centros que prefieren anticiparse.</span>
            </div>
          </div>
        </section>

        <section className="manifesto-section">
          <div className="manifesto-rule" />
          <div className="manifesto-layout">
            <p className="section-caption">El propósito</p>
            <div className="manifesto-copy">
              <p>
                Las preguntas llegan a cualquier hora. <em>La respuesta ya está preparada.</em>
              </p>
              <div className="manifesto-detail">
                <span className="detail-line" />
                <p>
                  SCHOLAIA acompaña a la secretaría del centro: informa a las familias,
                  conduce cada solicitud y deja que el equipo dedique su tiempo a lo que
                  realmente necesita criterio humano.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="capabilities-section" id="capacidad">
          <div className="section-intro section-intro--offset">
            <div>
              <span className="eyebrow">La capa que ordena</span>
              <h2>
                Una recepción digital<br />
                <em>que sabe estar.</em>
              </h2>
            </div>
            <p>
              Cada interacción se piensa como la prolongación discreta y bien informada
              de la atención de tu centro.
            </p>
          </div>

          <div className="capability-list">
            {capabilities.map((capability) => {
              const Icon = capability.icon;
              return (
                <article className="capability-row" key={capability.number}>
                  <span className="capability-number">{capability.number}</span>
                  <div className="capability-icon"><Icon size={21} strokeWidth={1.4} /></div>
                  <h3>{capability.title}</h3>
                  <p>{capability.text}</p>
                  <ArrowUpRight className="capability-arrow" size={19} strokeWidth={1.35} />
                </article>
              );
            })}
          </div>
        </section>

        <section
          className="studio-section scene-bg"
          id="studio"
        >
          <div className="scene-grain" aria-hidden="true" />
          <div className="studio-head">
            <span className="eyebrow">SCHOLAIA Studio / Vista en vivo</span>
            <h2>
              Configuremos una atención<br />
              <em>que se parezca a tu centro.</em>
            </h2>
            <p>
              Personaliza una identidad de ejemplo y observa cómo toma forma la experiencia
              de las familias.
            </p>
          </div>

          <div className="studio-grid">
            <section className="glass-panel configurator-panel" aria-labelledby="identidad-centro">
              <div className="panel-topline">
                <span>01 / Identidad</span>
                <SlidersHorizontal size={17} strokeWidth={1.5} />
              </div>
              <h3 id="identidad-centro">El centro, en primer plano.</h3>
              <p className="panel-description">
                Cambia los elementos esenciales para contextualizar la demostración.
              </p>

              <label className="studio-field">
                <span>Nombre del centro</span>
                <input
                  value={schoolName}
                  onChange={(event) => setSchoolName(event.target.value)}
                  maxLength={42}
                  aria-label="Nombre del centro"
                />
              </label>
              <label className="studio-field studio-field--short">
                <span>Siglas</span>
                <input
                  value={initials}
                  onChange={(event) => setInitials(event.target.value.toUpperCase().slice(0, 4))}
                  maxLength={4}
                  aria-label="Siglas del centro"
                />
              </label>

              <div className="mode-select" aria-label="Selecciona el modelo de asistente">
                <button
                  className={mode === "Core" ? "mode-button is-active" : "mode-button"}
                  type="button"
                  onClick={() => changeMode("Core")}
                >
                  <BrainCircuit size={17} strokeWidth={1.55} />
                  <span><strong>SCHOLAIA Core</strong><small>Conversacional</small></span>
                  {mode === "Core" && <Check size={17} />}
                </button>
                <button
                  className={mode === "Lite" ? "mode-button is-active" : "mode-button"}
                  type="button"
                  onClick={() => changeMode("Lite")}
                >
                  <Sparkles size={17} strokeWidth={1.55} />
                  <span><strong>SCHOLAIA Lite</strong><small>Guiado y directo</small></span>
                  {mode === "Lite" && <Check size={17} />}
                </button>
              </div>

              <div className="panel-signal">
                <span className="signal-dot" /> Cambios aplicados en la vista de la derecha.
              </div>
            </section>

            <section className="assistant-device" aria-label="Demostración del asistente SCHOLAIA">
              <div className="device-shine" aria-hidden="true" />
              <div className="assistant-topbar">
                <div className="school-badge">{initials || "SC"}</div>
                <div>
                  <p>{schoolName || "Tu centro"}</p>
                  <span><span className="signal-dot" /> SCHOLAIA {mode}</span>
                </div>
                <button type="button" aria-label="Información de la demostración">i</button>
              </div>
              <div className="chat-stage">
                <div className="chat-date">HOY · ATENCIÓN DIGITAL</div>
                <div className="chat-bubble bot-bubble">
                  Hola. Soy el asistente de {schoolName || "tu centro"}. ¿En qué te acompaño?
                </div>
                <div className="chat-bubble family-bubble">{question}</div>
                <div className="chat-bubble bot-bubble bot-bubble--answer">{reply}</div>
              </div>
              <div className="chat-shortcuts">
                <button type="button" onClick={() => previewQuestion("Quiero pedir una visita")}>Visitas</button>
                <button type="button" onClick={() => previewQuestion("Tengo una consulta sobre comedor")}>Comedor</button>
                <button type="button" onClick={() => previewQuestion("¿Cuándo abre secretaría?")}>Horarios</button>
              </div>
              <div className="chat-input-preview">
                <span>Escribe una consulta…</span><Send size={17} />
              </div>
            </section>
          </div>
        </section>

        <section className="models-section">
          <div className="models-visual">
            <div className="visual-label">La información encuentra<br />su recorrido.</div>
          </div>
          <div className="models-content">
            <span className="eyebrow">Dos ritmos, una misma atención</span>
            <h2>Elige la forma de responder.</h2>
            <p>
              Desde un recorrido guiado hasta una conversación contextual, SCHOLAIA se
              adapta al nivel de autonomía que desea cada centro.
            </p>
            <div className="model-cards">
              <article className="model-card model-card--core">
                <span>01</span>
                <h3>SCHOLAIA Core</h3>
                <p>Para conversaciones naturales, contexto y orientación sobre las consultas de cada familia.</p>
                <a href="#studio">Ver el ritmo Core <ArrowRight size={15} /></a>
              </article>
              <article className="model-card">
                <span>02</span>
                <h3>SCHOLAIA Lite</h3>
                <p>Para recorridos claros, respuestas verificadas y navegación estructurada por temas.</p>
                <a href="#studio">Ver el ritmo Lite <ArrowRight size={15} /></a>
              </article>
            </div>
          </div>
        </section>

        <section className="contrast-section">
          <div className="contrast-head">
            <span className="eyebrow">Cuando la atención se organiza</span>
            <h2>No se trata de atender más.<br /><em>Se trata de atender mejor.</em></h2>
          </div>
          <div className="contrast-table" role="table" aria-label="Diferencias de atención">
            <div className="contrast-row contrast-row--header" role="row">
              <span role="columnheader">Cada día en el centro</span>
              <span role="columnheader">Con SCHOLAIA</span>
            </div>
            <div className="contrast-row" role="row">
              <p role="cell">Una familia necesita confirmar una información fuera de horario.</p>
              <p role="cell"><Check size={17} /> Encuentra una respuesta clara, cuando la necesita.</p>
            </div>
            <div className="contrast-row" role="row">
              <p role="cell">Una solicitud llega por correo sin todos los datos necesarios.</p>
              <p role="cell"><Check size={17} /> El asistente guía el trámite con el contexto adecuado.</p>
            </div>
            <div className="contrast-row" role="row">
              <p role="cell">Secretaría debe volver a explicar una misma gestión.</p>
              <p role="cell"><Check size={17} /> La información se ofrece de manera consistente y ordenada.</p>
            </div>
          </div>
        </section>

        <section className="trust-section" id="confianza">
          <div className="trust-mark"><LockKeyhole size={25} strokeWidth={1.25} /></div>
          <div>
            <span className="eyebrow">La tecnología, con criterio</span>
            <h2>Una atención que protege la confianza del centro.</h2>
          </div>
          <p>
            SCHOLAIA se plantea como una extensión institucional: con información acotada,
            registro responsable y un diseño que prioriza la privacidad de las familias.
          </p>
          <div className="trust-points">
            <span><ShieldCheck size={16} /> Privacidad por diseño</span>
            <span><Clock3 size={16} /> Disponibilidad continua</span>
          </div>
        </section>

        <section
          className="contact-scene scene-bg"
          id="contacto"
        >
          <div className="scene-grain" aria-hidden="true" />
          <div className="contact-layout">
            <div className="contact-intro">
              <span className="eyebrow">Una conversación para empezar</span>
              <h2>Veamos cómo puede atender SCHOLAIA a tu comunidad.</h2>
              <p>
                Preparamos una demostración con la identidad y los casos habituales de tu centro.
              </p>
            </div>
            <div className="glass-panel contact-panel">
              <span className="panel-topline-text">DEMO / CENTROS EDUCATIVOS</span>
              <p>
                Cuéntanos qué momento de atención quieres mejorar: admisiones, visitas, secretaría,
                comedor o una gestión propia del centro.
              </p>
              <a className="button-liquid button-liquid--solid" href="mailto:hola@scholaia.es?subject=Solicitud%20de%20demostraci%C3%B3n%20SCHOLAIA">
                Empezar una conversación <ArrowUpRight size={17} />
              </a>
              <span className="contact-note">La conversación empieza por entender tu contexto.</span>
            </div>
          </div>
          <div className="closing-monogram" aria-label="SCHOLAIA"><span>SCHO</span><span>LAIA</span></div>
        </section>
      </div>

      <footer className="site-footer">
        <div className="footer-brand">
          <img src={assets.mark} alt="" />
          <span>SCHOLAIA</span>
        </div>
        <p>La atención escolar, reimaginada.</p>
        <a href="#inicio">Volver arriba <ArrowUpRight size={14} /></a>
      </footer>
    </main>
  );
}
