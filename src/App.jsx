import { useMemo, useState } from "react";
import "./App.css";
import { CARDS } from "./data/cards";
import { ATTRIBUTES, STATE_CODES } from "./data/meta";
import { GUIDE } from "./data/guide";
import { observeCards, shuffleDeck } from "./utils/shuffle";
import logo from "./assets/logo.png";

const ADMIN_PASSWORD = "change-me"; // 実公開前に必ず変更してください。

function useUsageCount() {
  const [count, setCount] = useState(() => Number(localStorage.getItem("mapSelfCheckUsage") || 0));

  function increment() {
    const next = count + 1;
    localStorage.setItem("mapSelfCheckUsage", String(next));
    setCount(next);
    return next;
  }

  return { count, increment };
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [theme, setTheme] = useState("cool");
  const [mode, setMode] = useState(3);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminInput, setAdminInput] = useState("");
  const [deck, setDeck] = useState(null);
  const [shuffleCount, setShuffleCount] = useState(0);
  const [resultCards, setResultCards] = useState([]);
  const [flash, setFlash] = useState(false);
  const { count: usageCount, increment } = useUsageCount();

  const selectedTheme = theme === "cool" ? "ブルー × ゴールド" : "シルバー × ピンク";

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
    window.setTimeout(() => setFlash(false), 420);
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
    <main className={`app theme-${theme}`}>
      <BrowserFrame>
        {screen === "home" && (
          <HomeScreen
            theme={theme}
            setTheme={setTheme}
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
            selectedTheme={selectedTheme}
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

        {screen === "guide" && <GuideScreen onBack={() => setScreen("home")} />}
      </BrowserFrame>
    </main>
  );
}

function BrowserFrame({ children }) {
  return (
    <section className="browser-frame">
      <div className="browser-bar">
        <span className="dot red" />
        <span className="dot yellow" />
        <span className="dot green" />
        <div className="address">map-self-check.local</div>
      </div>
      {children}
    </section>
  );
}

function Brand({ compact = false }) {
  return (
    <div className={`brand ${compact ? "brand-compact" : ""}`}>
      <img src={logo} alt="Mind Log" />
      <span>Mind Log</span>
    </div>
  );
}

function HomeScreen({ theme, setTheme, mode, selectMode, adminUnlocked, adminInput, setAdminInput, unlockAdmin, usageCount, enterObservation, openGuide }) {
  return (
    <div className="screen home-screen">
      <div className="top-actions">
        <Brand />
        <button className="ghost-button" onClick={openGuide}>説明書</button>
      </div>

      <header className="hero">
        <h1>MAP Self Check</h1>
        <p>今の自分を静かに見つめる</p>
      </header>

      <SelectionBlock title="デザインを選択" note="見た目のデザインのみが変更されます。">
        <OptionCard selected={theme === "cool"} onClick={() => setTheme("cool")} title="エネルギーライン" subtitle="ブルー × ゴールド" />
        <OptionCard selected={theme === "gentle"} onClick={() => setTheme("gentle")} title="エネルギーライン" subtitle="シルバー × ピンク" />
      </SelectionBlock>

      <SelectionBlock title="観測モードを選択">
        <OptionCard selected={mode === 3} onClick={() => selectMode(3)} title="3枚観測" subtitle="クイックチェック" />
        <OptionCard selected={mode === 9} locked={!adminUnlocked} onClick={() => selectMode(9)} title="9枚観測" subtitle={adminUnlocked ? "ディープチェック" : "ロック中"} />
      </SelectionBlock>

      <details className="admin-box">
        <summary>管理者モード</summary>
        <div className="admin-row">
          <input value={adminInput} onChange={(e) => setAdminInput(e.target.value)} type="password" placeholder="管理者パスワード" />
          <button onClick={unlockAdmin}>解除</button>
        </div>
      </details>

      <button className="primary-button" onClick={enterObservation}>観測画面へ進む</button>
      <p className="usage">ご利用回数：<strong>{usageCount}</strong>回</p>
    </div>
  );
}

function ObserveScreen({ selectedTheme, mode, shuffleCount, flash, onShuffle, onOpenResult, onHome, openGuide }) {
  return (
    <div className="screen observe-screen">
      <div className="top-actions">
        <Brand compact />
        <div className="button-row">
          <button className="ghost-button" onClick={onHome}>TOP</button>
          <button className="ghost-button" onClick={openGuide}>説明書</button>
        </div>
      </div>
      <header className="page-head">
        <h2>観測の準備</h2>
        <p>納得できるまでシャッフルしてから、観測結果を開いてください。</p>
      </header>

      <div className="status-pill">{selectedTheme} / {mode}枚観測</div>

      <button className={`shuffle-button ${flash ? "flash" : ""}`} onClick={onShuffle}>
        <span className="shuffle-icon">⇄</span>
        <span>シャッフルする</span>
      </button>

      <p className="shuffle-count">シャッフル回数：<strong>{shuffleCount}</strong>回</p>

      <button className="secondary-button" onClick={onOpenResult} disabled={shuffleCount < 1}>
        観測結果を開く
      </button>

      {shuffleCount < 1 && <p className="hint">まずシャッフルしてください。</p>}
    </div>
  );
}

function ResultScreen({ mode, resultCards, onBack, onHome, openGuide }) {
  return (
    <div className="screen result-screen">
      <div className="top-actions">
        <Brand compact />
        <div className="button-row">
          <button className="ghost-button" onClick={onHome}>TOP</button>
          <button className="ghost-button" onClick={openGuide}>説明書</button>
        </div>
      </div>
      <header className="page-head">
        <h2>観測結果</h2>
        <p>{mode === 3 ? "3枚を横並びで表示しています。" : "9枚を3列×3段で表示しています。"}</p>
      </header>

      <div className={`cards-grid grid-${mode}`}>
        {resultCards.map((card, index) => (
          <ObservationCard key={`${card.id}-${index}`} card={card} index={index} mode={mode} />
        ))}
      </div>

      <button className="secondary-button" onClick={onBack}>観測準備へ戻る</button>
    </div>
  );
}

function ObservationCard({ card, index, mode }) {
  const attribute = ATTRIBUTES[card.group];
  const positionLabel = mode === 3
    ? ["左のカード", "中央のカード", "右のカード"][index]
    : `${index + 1}枚目`;

  return (
    <article className="observation-card">
      <div className="card-topline">
        <span>{positionLabel}</span>
        <span>Card {card.id}</span>
      </div>
      <img src={attribute.image} alt={attribute.name} />
      <div className="card-meta">
        <span className="attribute-code">{card.code}</span>
        <span className="state-code">{card.stateCode}</span>
      </div>
      <p className="card-text">{card.text}</p>
    </article>
  );
}

function SelectionBlock({ title, note, children }) {
  return (
    <section className="selection-block">
      <div className="section-title">
        <h3>{title}</h3>
        {note && <span>{note}</span>}
      </div>
      <div className="option-grid">{children}</div>
    </section>
  );
}

function OptionCard({ selected, locked, title, subtitle, onClick }) {
  return (
    <button className={`option-card ${selected ? "selected" : ""} ${locked ? "locked" : ""}`} onClick={onClick} type="button">
      <span className="check">{selected ? "●" : locked ? "🔒" : "○"}</span>
      <strong>{title}</strong>
      <small>{subtitle}</small>
    </button>
  );
}

function GuideScreen({ onBack }) {
  return (
    <div className="screen guide-screen">
      <div className="top-actions">
        <Brand compact />
        <button className="ghost-button" onClick={onBack}>戻る</button>
      </div>
      <header className="page-head">
        <h2>{GUIDE.title}</h2>
        <p>{GUIDE.subtitle}</p>
      </header>

      <GuideSection title="MAP Self Checkとは">
        {GUIDE.intro.map((line) => <p key={line}>{line}</p>)}
      </GuideSection>

      <GuideSection title="カードの役割">
        <div className="guide-list">
          {GUIDE.roles.map((role) => (
            <div key={role.code}><b>{role.code}｜{role.name}</b><span>{role.description}</span></div>
          ))}
        </div>
      </GuideSection>

      <GuideSection title="3枚の見方">
        <div className="guide-list">
          {GUIDE.threeCards.map((item) => <div key={item.position}><b>{item.position}</b><span>{item.description}</span></div>)}
        </div>
      </GuideSection>

      <GuideSection title="状態コードについて">
        <div className="state-list">
          {GUIDE.stateCodes.map((item) => <div key={item.code}><b>{item.code}｜{item.name}</b><span>{item.description}</span></div>)}
        </div>
      </GuideSection>

      <GuideSection title="使い方">
        <ol>{GUIDE.howToUse.map((line) => <li key={line}>{line}</li>)}</ol>
      </GuideSection>

      <GuideSection title="結果の受け取り方">
        {GUIDE.receive.map((line) => <p key={line}>{line}</p>)}
      </GuideSection>

      <GuideSection title="注意事項">
        {GUIDE.notice.map((line) => <p key={line}>{line}</p>)}
      </GuideSection>
      <p className="closing">{GUIDE.closing}</p>
    </div>
  );
}

function GuideSection({ title, children }) {
  return (
    <section className="guide-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}
