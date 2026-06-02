import { useState } from "react";
import "./App.css";
import { CARDS } from "./data/cards";
import { ATTRIBUTES, STATE_CODES } from "./data/meta";
import { GUIDE } from "./data/guide";
import { observeCards, shuffleDeck } from "./utils/shuffle";

const ADMIN_PASSWORD = "LoveLog";

function useUsageCount() {
  const [count, setCount] = useState(() => Number(localStorage.getItem("mapSelfCheckUsage") || 0));

  function increment() {
    const next = count + 1;
    localStorage.setItem("mapSelfCheckUsage", String(next));
    setCount(next);
  }

  return { count, increment };
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [mode, setMode] = useState(3);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminInput, setAdminInput] = useState("");
  const [deck, setDeck] = useState(null);
  const [shuffleCount, setShuffleCount] = useState(0);
  const [resultCards, setResultCards] = useState([]);
  const [flash, setFlash] = useState(false);
  const { count: usageCount, increment } = useUsageCount();

  function selectMode(nextMode) {
    if (nextMode === 9 && !adminUnlocked) return;
    setMode(nextMode);
  }

  function unlockAdmin() {
    if (adminInput === ADMIN_PASSWORD) {
      setAdminUnlocked(true);
      setMode(9);
      setAdminInput("");
    }
  }

  function enterObservation() {
    setScreen("observe");
    setDeck(null);
    setShuffleCount(0);
    setResultCards([]);
  }

  function handleShuffle() {
    const nextDeck = shuffleDeck(CARDS);
    setDeck(nextDeck);
    setShuffleCount((prev) => prev + 1);
    setResultCards([]);
    setFlash(true);
    window.setTimeout(() => setFlash(false), 480);
  }

  function openResult() {
    if (!deck || shuffleCount < 1) return;
    setResultCards(observeCards(deck, mode));
    increment();
    setScreen("result");
  }

  function resetObservation() {
    setDeck(null);
    setShuffleCount(0);
    setResultCards([]);
    setScreen("observe");
  }

  return (
    <main className="app">
      <div className="ambient ambient-top" />
      <div className="ambient ambient-bottom" />

      {screen === "home" && (
        <HomeScreen
          mode={mode}
          selectMode={selectMode}
          adminUnlocked={adminUnlocked}
          adminInput={adminInput}
          setAdminInput={setAdminInput}
          unlockAdmin={unlockAdmin}
          usageCount={usageCount}
          enterObservation={enterObservation}
          openGuide={() => setScreen("guide")}
        />
      )}

      {screen === "observe" && (
        <ObserveScreen
          mode={mode}
          shuffleCount={shuffleCount}
          flash={flash}
          onShuffle={handleShuffle}
          onOpenResult={openResult}
          onHome={() => setScreen("home")}
          openGuide={() => setScreen("guide")}
        />
      )}

      {screen === "result" && (
        <ResultScreen
          mode={mode}
          resultCards={resultCards}
          onBack={resetObservation}
          onHome={() => setScreen("home")}
          openGuide={() => setScreen("guide")}
        />
      )}

      {screen === "guide" && (
        <GuideScreen onBack={() => setScreen("home")} />
      )}
    </main>
  );
}

function LogoMark() {
  return (
    <svg className="logo-mark" viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="lg1" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#0A63FF" />
          <stop offset="100%" stopColor="#A9D9FF" />
        </linearGradient>
        <linearGradient id="lg2" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#0068FF" />
          <stop offset="100%" stopColor="#DFF2FF" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="white" stroke="#0C70FF" strokeWidth="4" />
      <path d="M50 14 C58 26 67 43 70 58 C61 47 55 43 50 43 C45 43 39 47 30 58 C33 43 42 26 50 14Z" fill="url(#lg1)" opacity=".95" />
      <path d="M14 66 C28 57 39 57 50 66 C61 75 74 75 88 66 L88 86 L14 86Z" fill="url(#lg2)" opacity=".95" />
      <path d="M14 75 C28 66 39 66 50 75 C61 84 74 84 88 75" fill="none" stroke="#FFFFFF" strokeWidth="4" opacity=".7" />
    </svg>
  );
}

function Brand({ compact = false }) {
  return (
    <div className={`brand ${compact ? "brand-compact" : ""}`}>
      <LogoMark />
      <span>Mind Log</span>
    </div>
  );
}

function TopButtons({ onHome, openGuide, showHome = true }) {
  return (
    <div className="top-buttons">
      {showHome && (
        <button className="mini-nav" onClick={onHome} type="button">
          <span className="mini-icon home-icon" />
          <span>TOP</span>
        </button>
      )}
      <button className="mini-nav" onClick={openGuide} type="button">
        <span className="mini-icon book-icon" />
        <span>説明書</span>
      </button>
    </div>
  );
}

function HomeScreen({ mode, selectMode, adminUnlocked, adminInput, setAdminInput, unlockAdmin, usageCount, enterObservation, openGuide }) {
  return (
    <section className="phone-panel home-panel">
      <div className="header-row">
        <Brand />
        <TopButtons openGuide={openGuide} showHome={false} />
      </div>

      <section className="home-hero">
        <h1>MAP Self Check</h1>
        <p>今の自分を静かに見つめる</p>
      </section>

      <EnergyWave />

      <div className="section-divider">
        <span>観測モードを選択</span>
      </div>

      <div className="mode-list">
        <ModeCard
          selected={mode === 3}
          onClick={() => selectMode(3)}
          title="3枚観測"
          subtitle="クイックチェック"
          icon="cards"
        />
        <ModeCard
          selected={mode === 9}
          locked={!adminUnlocked}
          onClick={() => selectMode(9)}
          title="9枚観測"
          subtitle="ディープチェック"
          icon="lock"
          lockedText="ロック中"
        />
      </div>

      <details className="admin-box">
        <summary>管理者モード</summary>
        <div className="admin-row">
          <input value={adminInput} onChange={(e) => setAdminInput(e.target.value)} type="password" placeholder="管理者パスワード" />
          <button onClick={unlockAdmin} type="button">解除</button>
        </div>
      </details>

      <button className="primary-button" onClick={enterObservation} type="button">
        <span>観測画面へ進む</span>
        <span className="button-arrow">→</span>
      </button>

      <p className="usage">利用回数 <strong>{usageCount}</strong></p>
    </section>
  );
}

function ModeCard({ selected, locked, onClick, title, subtitle, icon, lockedText }) {
  return (
    <button className={`mode-card ${selected ? "selected" : ""} ${locked ? "locked" : ""}`} onClick={onClick} type="button">
      <span className="radio-dot" aria-hidden="true" />
      <span className="mode-copy">
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </span>
      <span className={`mode-visual ${icon === "cards" ? "cards-icon" : "lock-area"}`}>
        {icon === "lock" ? (
          <>
            <span className="lock-icon" />
            <em>{lockedText}</em>
          </>
        ) : (
          <>
            <i /><i /><i />
          </>
        )}
      </span>
    </button>
  );
}

function ObserveScreen({ mode, shuffleCount, flash, onShuffle, onOpenResult, onHome, openGuide }) {
  return (
    <section className="phone-panel observe-panel">
      <div className="header-row">
        <Brand compact />
        <TopButtons onHome={onHome} openGuide={openGuide} />
      </div>

      <section className="page-title">
        <h2>観測の準備</h2>
        <span className="title-line" />
        <p>納得できるまでシャッフルしてから、<br />観測結果を開いてください。</p>
      </section>

      <div className="mode-pill"><span />{mode}枚観測</div>

      <button className={`shuffle-circle ${flash ? "flash" : ""}`} onClick={onShuffle} type="button">
        <span className="shuffle-symbol">⇄</span>
        <strong>シャッフルする</strong>
      </button>

      <p className="shuffle-count">シャッフル回数：<strong>{shuffleCount}</strong>回</p>

      <button className="outline-button" onClick={onOpenResult} disabled={shuffleCount < 1} type="button">
        <span className="open-icon">↗</span>
        観測結果を開く
      </button>
    </section>
  );
}

function ResultScreen({ mode, resultCards, onBack, onHome, openGuide }) {
  return (
    <section className="phone-panel result-panel">
      <div className="header-row">
        <Brand compact />
        <TopButtons onHome={onHome} openGuide={openGuide} />
      </div>

      <section className="page-title result-title">
        <h2>観測結果</h2>
        <span className="title-line" />
      </section>

      <EnergyWave compact />

      <div className={`cards-grid grid-${mode}`}>
        {resultCards.map((card, index) => (
          <ObservationCard key={`${card.id}-${index}`} card={card} index={index} mode={mode} />
        ))}
      </div>

      <button className="outline-button back-button" onClick={onBack} type="button">
        <span>←</span>
        観測準備へ戻る
      </button>
    </section>
  );
}

function ObservationCard({ card }) {
  const attribute = ATTRIBUTES[card.group];

  return (
    <article className="observation-card">
      <div className="card-id">{card.id}</div>
      <div className="attribute-letter">{card.group}</div>
      <div className="state-letter">{card.stateCode}</div>
      <img src={attribute.image} alt={attribute.name} />
      <p>{card.text}</p>
    </article>
  );
}

function GuideScreen({ onBack }) {
  return (
    <section className="guide-panel">
      <div className="guide-header">
        <LogoMark />
        <div>
          <h1>{GUIDE.title}</h1>
          <p>{GUIDE.subtitle}</p>
        </div>
        <button className="mini-nav guide-back" onClick={onBack} type="button">
          <span>←</span>
          <span>戻る</span>
        </button>
      </div>

      <div className="guide-grid">
        <GuideBlock number="01." title="MAP Self Checkとは" className="intro-block">
          {GUIDE.intro.map((line) => <p key={line}>{line}</p>)}
          <div className="guide-orbit" />
        </GuideBlock>

        <GuideBlock number="02." title="カードの役割">
          <div className="role-list">
            {GUIDE.roles.map((role) => (
              <div className="role-row" key={role.code}>
                <img src={ATTRIBUTES[role.code].image} alt={role.name} />
                <b>{role.code}｜{role.name}</b>
                <span>{role.description}</span>
              </div>
            ))}
          </div>
        </GuideBlock>

        <GuideBlock number="03." title="3枚の見方">
          <div className="three-guide">
            {GUIDE.threeCards.map((item, index) => {
              const code = ["M", "T", "D"][index];
              return (
                <div className="three-item" key={item.position}>
                  <b>{item.position}</b>
                  <span>{item.description}</span>
                  <img src={ATTRIBUTES[code].image} alt={code} />
                </div>
              );
            })}
          </div>
          <InfoNote>3枚とも別々の時間ではなく、すべて今のMindの中で同時に起きている流れです。</InfoNote>
        </GuideBlock>

        <GuideBlock number="04." title="状態コードについて">
          <div className="state-list">
            {Object.entries(STATE_CODES).map(([code, item]) => (
              <div className="state-row" key={code}>
                <b>{code}</b>
                <strong>{item.name}</strong>
                <span>{item.description}</span>
              </div>
            ))}
          </div>
          <InfoNote>状態コードは、良い・悪いを決めるためのものではありません。今の流れがどのような状態にあるのかを、静かに見るための目印です。</InfoNote>
        </GuideBlock>

        <GuideBlock number="05." title="使い方">
          <ol className="steps">
            {GUIDE.howToUse.map((line, index) => (
              <li key={line}><span>{index + 1}</span>{line}</li>
            ))}
          </ol>
          <InfoNote>シャッフル回数に正解はありません。自分が「今でいい」と思ったところで、観測結果を開いてください。</InfoNote>
        </GuideBlock>

        <GuideBlock number="06." title="結果の受け取り方">
          <div className="receive-list">
            {GUIDE.receive.map((line) => <p key={line}>{line}</p>)}
          </div>
        </GuideBlock>

        <GuideBlock number="07." title="注意事項と最後に" className="wide">
          <div className="notice-columns">
            <div>
              <h3>注意事項：</h3>
              {GUIDE.notice.map((line) => <p key={line}>{line}</p>)}
            </div>
            <div>
              <h3>最後に：</h3>
              <p>急いで答えを出さなくても大丈夫です。</p>
              <p>今の自分が、どんな状態にいて、どんな流れの中にいるのか。まずはそれを静かに確かめてみてください。</p>
              <p>{GUIDE.closing}</p>
            </div>
          </div>
        </GuideBlock>
      </div>
    </section>
  );
}

function GuideBlock({ number, title, className = "", children }) {
  return (
    <section className={`guide-block ${className}`}>
      <header>
        <span>{number}</span>
        <h2>{title}</h2>
      </header>
      {children}
    </section>
  );
}

function InfoNote({ children }) {
  return <div className="info-note">ⓘ {children}</div>;
}

function EnergyWave({ compact = false }) {
  return (
    <div className={`energy-wave ${compact ? "compact" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 900 180" preserveAspectRatio="none">
        <path d="M0,78 C150,130 240,54 370,86 C500,118 610,146 900,58" />
        <path d="M0,95 C160,145 250,78 375,104 C520,136 640,162 900,80" />
        <path d="M0,112 C160,160 290,98 420,122 C560,148 650,168 900,100" />
      </svg>
      <span className="dot d1" /><span className="dot d2" /><span className="dot d3" /><span className="dot d4" />
    </div>
  );
}