import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Link, useLocation } from "react-router-dom";
import type { CardPair, ModeId } from "../data/themes";
import { findTheme } from "../data/themes";
import { buildDeck, getBoardLayout } from "../lib/game";
import { SITE_URL } from "../config/site";
import type { PlayingCard } from "../lib/game";

type Phase = "loading" | "memorize" | "playing" | "complete";
type Payload = { pairs?: CardPair[]; mode?: ModeId; title?: string; countdownTime?: number };
const isFace = (face: unknown): face is CardPair["left"] => {
  if (!face || typeof face !== "object") return false;
  const item = face as CardPair["left"];
  return typeof item.name === "string" && typeof item.image === "string" && (item.image.startsWith("/cards/") || item.image.startsWith("data:image/"));
};

export default function CardFlip() {
  const location = useLocation();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const payload = (hydrated ? location.state : null) as Payload | null;
  const pairs = useMemo(() => {
    if (!Array.isArray(payload?.pairs) || payload.pairs.length < 2 || payload.pairs.length > 30) return [];
    if (!payload.pairs.every((pair) => pair && typeof pair === "object" && typeof pair.id === "string" && isFace(pair.left) && isFace(pair.right))) return [];
    if (new Set(payload.pairs.map((pair) => pair.id)).size !== payload.pairs.length) return [];
    return payload.pairs;
  }, [payload?.pairs]);
  const theme = findTheme(payload?.mode || "");
  const title = theme?.name || (payload?.mode === "custom" ? "커스텀 모드" : "기억 놀이");
  useEffect(() => {
    document.title = title + " · 카드 게임 | Memomo";
    document.querySelector('meta[name="robots"]')?.setAttribute("content", "noindex,follow");
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", SITE_URL + "/card-flip/");
  }, [title]);
  const memorizingTime = [3, 5, 10, 15, 20, 30].includes(payload?.countdownTime || 0) ? payload!.countdownTime! : 5;
  const [deck, setDeck] = useState<PlayingCard[]>([]);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>("loading");
  const [loaded, setLoaded] = useState<Set<string>>(() => new Set());
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [seconds, setSeconds] = useState(memorizingTime);
  const [opened, setOpened] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(() => new Set());
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [visible, setVisible] = useState(true);
  const versionRef = useRef(0);
  const attemptRef = useRef(0);
  const mismatchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playingSince = useRef(0);
  const openingRef = useRef<string[]>([]);
  const inputLocked = useRef(false);

  useEffect(() => {
    const sessionVersion = ++versionRef.current;
    attemptRef.current = 0;
    openingRef.current = [];
    inputLocked.current = true;
    if (mismatchTimer.current) clearTimeout(mismatchTimer.current);
    setDeck(buildDeck(pairs));
    setPhase("loading");
    setLoaded(new Set());
    setLoadError(false);
    setLoadAttempt(0);
    setSeconds(memorizingTime);
    setOpened([]);
    setMatched(new Set());
    setMoves(0);
    setElapsed(0);
    return () => { versionRef.current = sessionVersion + 1; if (mismatchTimer.current) clearTimeout(mismatchTimer.current); };
  }, [pairs, memorizingTime, round]);

  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  const imageLoaded = async (image: HTMLImageElement, id: string, version: number, attempt: number) => {
    try {
      await image.decode();
      if (version !== versionRef.current || attempt !== attemptRef.current) return;
      setLoaded((previous) => new Set(previous).add(id));
    } catch {
      if (version === versionRef.current && attempt === attemptRef.current) setLoadError(true);
    }
  };

  useEffect(() => {
    if (phase !== "loading" || !deck.length || loaded.size !== deck.length || loadError) return;
    let nextFrame = 0;
    const frame = requestAnimationFrame(() => { nextFrame = requestAnimationFrame(() => setPhase("memorize")); });
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(nextFrame); };
  }, [phase, deck.length, loaded.size, loadError]);

  useEffect(() => {
    if (phase !== "loading" || !deck.length || loadError) return;
    const timer = setTimeout(() => setLoadError(true), 30000);
    return () => clearTimeout(timer);
  }, [phase, deck.length, loadError, loadAttempt]);

  useEffect(() => {
    if (phase !== "memorize" || !visible) return;
    if (seconds === 0) {
      playingSince.current = Date.now();
      inputLocked.current = false;
      setPhase("playing");
      return;
    }
    const timer = setTimeout(() => setSeconds((previous) => previous - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, seconds, visible]);

  useEffect(() => {
    if (phase !== "playing") return;
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - playingSince.current) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [phase]);

  const choose = (card: PlayingCard) => {
    if (phase !== "playing" || inputLocked.current || matched.has(card.pairId) || openingRef.current.includes(card.id)) return;
    const next = [...openingRef.current, card.id];
    openingRef.current = next;
    setOpened(next);
    if (next.length !== 2) return;
    inputLocked.current = true;
    setMoves((previous) => previous + 1);
    const first = deck.find((item) => item.id === next[0])!;
    if (first.pairId === card.pairId) {
      const newMatched = new Set(matched).add(card.pairId);
      setMatched(newMatched);
      openingRef.current = [];
      setOpened([]);
      if (newMatched.size === pairs.length) {
        setElapsed(Math.floor((Date.now() - playingSince.current) / 1000));
        setPhase("complete");
      } else inputLocked.current = false;
    } else {
      const version = versionRef.current;
      mismatchTimer.current = setTimeout(() => {
        if (version !== versionRef.current) return;
        openingRef.current = [];
        setOpened([]);
        inputLocked.current = false;
      }, 850);
    }
  };

  const retry = () => {
    attemptRef.current++;
    setLoadAttempt(attemptRef.current);
    setLoaded(new Set());
    setLoadError(false);
  };
  const setupUrl = payload?.mode && (theme || payload.mode === "custom") ? "/play/" + payload.mode + "/" : "/";
  const percentage = deck.length ? Math.round(loaded.size / deck.length * 100) : 0;
  const version = versionRef.current;
  const layout = getBoardLayout(deck.length || pairs.length * 2);
  const boardStyle = {
    "--desktop-columns": layout.desktopColumns,
    "--desktop-rows": layout.desktopRows,
    "--mobile-columns": layout.mobileColumns,
    "--mobile-rows": layout.mobileRows,
  } as CSSProperties;

  return <main className="memory-game">
    <header className="game-topbar"><Link to={setupUrl}>← 설정으로</Link><span>{title}</span><Link to="/" aria-label="테마 선택 홈">⌂</Link></header>
    {!hydrated ? <section className="image-loading" role="status" aria-busy="true"><h1>게임을 준비하고 있어요</h1><p>카드 설정을 확인하고 있습니다.</p></section> : !pairs.length ? <section className="empty-game"><span aria-hidden="true">✦</span><h1>먼저 게임을 만들어주세요</h1><p>테마와 카드 쌍을 선택하면 기억 놀이를 시작할 수 있어요.</p><Link to="/">테마 고르기</Link></section> : <>
      <section className="game-heading" aria-live="polite"><span className="eyebrow">{phase === "loading" ? "GETTING READY" : phase === "memorize" ? "REMEMBER THE CARDS" : phase === "complete" ? "WELL DONE!" : "FIND YOUR PAIRS"}</span><h1>{phase === "loading" ? "카드 이미지를 준비하고 있어요" : phase === "memorize" ? "카드 위치를 기억해주세요" : phase === "complete" ? "모든 짝을 찾았어요!" : "기억한 짝을 찾아볼까요?"}</h1><p>{phase === "memorize" ? "이미지를 충분히 보고 위치를 기억해요." : theme?.kind === "related" ? "서로 연결되는 그림 두 장을 찾아요." : "같은 그림 두 장을 찾아요."}</p></section>
      {phase === "loading" && <section className="image-loading" role="status" aria-live="polite">{loadError ? <><strong>이미지를 불러오지 못했어요.</strong><p>암기 시간은 아직 시작되지 않았어요. 연결을 확인한 뒤 다시 시도해주세요.</p><button type="button" onClick={retry}>다시 불러오기</button></> : <><div className="load-dots" aria-hidden="true"><i /><i /><i /></div><p>{loaded.size} / {deck.length || pairs.length * 2}장 준비 중</p><progress value={percentage} max="100" aria-label="이미지 준비 진행률" /><small>모든 이미지가 준비된 뒤 암기 시간이 시작됩니다.</small></>}</section>}
      {phase === "memorize" && <div className="memorize-status"><strong aria-live="off">{seconds}<small>초</small></strong><span>{visible ? "지금은 카드를 외우는 시간이에요" : "다른 탭을 보는 동안 암기 시간이 일시정지돼요"}</span><div className="memorize-track"><i style={{ width: (seconds / memorizingTime * 100) + "%" }} /></div></div>}
      {(phase === "playing" || phase === "complete") && <div className="game-status" aria-label="게임 현황"><span>찾은 짝 <strong>{matched.size}<small> / {pairs.length}</small></strong></span><span>시도 <strong>{moves}<small>회</small></strong></span><span>시간 <strong>{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}</strong></span></div>}
      <div className={"memory-grid" + (phase === "loading" ? " is-loading" : "") + (deck.length <= 12 ? " compact" : deck.length > 40 ? " dense" : "")} style={boardStyle} aria-hidden={phase === "loading"} aria-busy={phase === "loading"}>
        {deck.map((card, index) => {
          const isMatched = matched.has(card.pairId);
          const revealed = phase === "memorize" || phase === "loading" || isMatched || opened.includes(card.id);
          return <button className={"memory-card" + (isMatched ? " is-matched" : "")} key={card.id} type="button" data-revealed={revealed} disabled={phase !== "playing" || isMatched} aria-label={(index + 1) + "번 카드" + (revealed ? ", " + card.name : "") + (isMatched ? ", 짝 맞춤" : "")} aria-pressed={revealed} onClick={() => choose(card)}><span className="memory-card-inner"><span className="memory-card-back"><span className="card-back-mark" aria-hidden="true">✦</span><span>{index + 1}</span></span><span className="memory-card-front"><img key={version + "-" + loadAttempt + "-" + card.id} src={card.image} alt="" loading="eager" decoding="async" width="320" height="320" onLoad={(event) => { void imageLoaded(event.currentTarget, card.id, version, loadAttempt); }} onError={() => { if (version === versionRef.current && loadAttempt === attemptRef.current) setLoadError(true); }} />{isMatched && <span className="match-check" aria-hidden="true">✓</span>}</span></span></button>;
        })}
      </div>
      {phase === "complete" && <section className="complete-panel" role="status"><span aria-hidden="true">✦</span><h2>멋진 기억력이에요!</h2><p>{pairs.length}쌍을 {moves}번 만에 완성했어요.</p><div><button type="button" onClick={() => setRound((previous) => previous + 1)}>같은 카드로 다시 하기</button><Link to={setupUrl}>새 게임 만들기</Link></div></section>}
    </>}
  </main>;
}
