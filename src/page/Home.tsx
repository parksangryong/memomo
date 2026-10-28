import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import { themes, findTheme } from "../data/themes";
import type { CardPair, ModeId } from "../data/themes";
import { readyPairIds } from "../data/readyPairs";
import { selectPairs } from "../lib/game";
import SeoSummary from "../SeoSummary";
import { getPageMeta } from "../config/pageMeta";
import { SITE_URL } from "../config/site";

type CustomImage = { id: string; name: string; image: string };
const customMode = { id: "custom" as const, name: "커스텀 모드", detail: "내 사진으로 직접 만들기", description: "가족, 친구, 수업 사진으로 나만의 게임을 만들어요.", kind: "custom", cover: "/concepts/custom.webp", accent: "#eaf8f4" };
const modes = [...themes, customMode];

const resizeImage = (file: File): Promise<Omit<CustomImage, "id">> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("이미지를 읽을 수 없습니다."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("지원하지 않는 이미지입니다."));
      image.onload = () => {
        const scale = Math.min(1, 640 / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        if (!context) return reject(new Error("이미지 처리를 지원하지 않는 브라우저입니다."));
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve({ name: file.name.replace(/\.[^.]+$/, ""), image: canvas.toDataURL("image/webp", 0.82) });
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });

export default function Home({ modeId }: { modeId?: ModeId }) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const processingRef = useRef(false);
  const theme = findTheme(modeId || "");
  const current = modeId === "custom" ? customMode : theme;
  useEffect(() => {
    const path = modeId ? "/play/" + modeId : "/";
    const meta = getPageMeta(path);
    document.title = meta.title;
    for (const [selector, value] of [
      ['meta[name="description"]', meta.description],
      ['meta[property="og:title"]', meta.title],
      ['meta[property="og:description"]', meta.description],
      ['meta[property="og:url"]', SITE_URL + (path === "/" ? "/" : path + "/")],
      ['meta[name="robots"]', "index,follow,max-image-preview:large"],
    ]) document.querySelector(selector)?.setAttribute("content", value);
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", SITE_URL + (path === "/" ? "/" : path + "/"));
  }, [modeId]);
  const [pairCount, setPairCount] = useState(theme?.minPairs === 10 ? 10 : 6);
  const [selectionMode, setSelectionMode] = useState<"random" | "choose">("random");
  const [chosen, setChosen] = useState<string[]>([]);
  const [customImages, setCustomImages] = useState<CustomImage[]>([]);
  const [countdownTime, setCountdownTime] = useState(5);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const readyCount = theme ? readyPairIds[theme.id]?.length || 0 : 0;
  const isThemeReady = !theme || readyCount === theme.pairs.length;

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length || processingRef.current) return;
    setError("");
    const remaining = 12 - customImages.length;
    if (remaining <= 0) return setError("이미지는 최대 12장까지 추가할 수 있어요.");
    const accepted = files.filter((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type) && file.size <= 8 * 1024 * 1024).slice(0, remaining);
    if (accepted.length !== files.length) setError("JPG, PNG, WebP 형식의 8MB 이하 이미지만 최대 12장까지 추가돼요.");
    processingRef.current = true;
    setIsProcessing(true);
    try {
      // Decode photos one at a time to avoid a large memory spike on phones.
      const uploaded: CustomImage[] = [];
      for (const file of accepted) {
        try { uploaded.push({ ...await resizeImage(file), id: crypto.randomUUID() }); }
        catch { /* Report failed files together after the remaining images are processed. */ }
      }
      setCustomImages((previous) => [...previous, ...uploaded].slice(0, 12));
      if (uploaded.length < accepted.length) setError("일부 이미지를 읽지 못했어요. 다른 파일로 다시 추가해주세요.");
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  };

  const start = () => {
    setError("");
    let pairs: CardPair[];
    if (modeId === "custom") {
      if (customImages.length < 2) return setError("이미지를 2장 이상 추가해주세요.");
      pairs = customImages.map(({ id, ...face }) => ({ id, left: face, right: face }));
    } else if (theme && isThemeReady) {
      try { pairs = selectPairs(theme.pairs, selectionMode === "choose" ? chosen : [], pairCount); }
      catch (cause) { return setError(cause instanceof Error ? cause.message : "카드 설정을 확인해주세요."); }
    } else return;
    navigate("/card-flip/", { state: { pairs, mode: modeId, title: current?.name, countdownTime } });
  };

  const changeCount = (value: number) => {
    setPairCount(value);
    setChosen((previous) => previous.slice(0, value));
    setError("");
  };

  return <main className="memomo-home">
    <header className="memomo-header">
      <Link to="/" className="memomo-brand" aria-label="메모모 홈"><img src="/MemomoFavicon.svg" alt="" width="28" height="28" /><span>Memomo</span></Link>
      <span>작은 기억이 모이는 시간</span>
    </header>
    {!current ? <>
      <section className="mode-intro">
        <div className="hero-copy"><span className="eyebrow">CHOOSE YOUR PLAY</span><h1>오늘은 어떤 기억을<br /><em>맞춰볼까요?</em></h1><p>다섯 가지 테마와 나만의 커스텀 게임.<br />함께할 이야기를 고르면 기억 놀이가 시작돼요.</p>
          <ul className="hero-chips" aria-label="게임 특징"><li>5가지 테마</li><li>내 사진으로 만들기</li><li>무료 · 설치 없음</li></ul></div>
        <div className="hero-cards" aria-hidden="true">{["animals", "food", "world"].map((name) => <span key={name} className="hero-card"><img src={"/concepts/" + name + ".webp"} alt="" width="120" height="120" decoding="async" /></span>)}</div>
      </section>
      <nav className="mode-grid" aria-label="6가지 게임 모드">
        {modes.map((mode) => <Link className="mode-card" to={"/play/" + mode.id + "/"} key={mode.id} style={{ "--mode-tint": mode.accent } as CSSProperties}>
          <div className="mode-art"><span className="mode-badge">{mode.kind === "same" ? "같은 그림 찾기" : mode.kind === "related" ? "연결되는 짝 찾기" : "이미지 직접 업로드"}</span><img src={mode.cover} alt="" width="170" height="132" decoding="async" /></div>
          <div className="mode-copy"><h2>{mode.name}</h2><span className="mode-detail">{mode.detail}</span><p>{mode.description}</p><span className="mode-cta">{mode.id === "custom" ? "내 게임 만들기" : "이 테마로 시작하기"}<span aria-hidden="true">↗</span></span></div>
        </Link>)}
      </nav>
      <p className="flow-note">테마 선택 → 카드와 암기 시간 설정 → 기억하고 짝 맞추기</p>
      <SeoSummary />
    </> : <>
      <Link to="/" className="back-to-modes">← 다른 테마 고르기</Link>
      <section className="setup-hero" style={{ "--mode-tint": current.accent } as CSSProperties}><img src={current.cover} alt="" width="120" height="120" /><div><span className="eyebrow">MAKE YOUR GAME</span><h1>{current.name}</h1><p>{current.description}</p></div></section>
      <section className="setup-panel" aria-label="게임 설정">
        <div className="setup-row"><div><h2>카드 외우는 시간</h2><p>이미지가 모두 준비된 뒤 시작돼요.</p></div><select aria-label="카드 외우는 시간" value={countdownTime} onChange={(event) => setCountdownTime(Number(event.target.value))}>{[3, 5, 10, 15, 20, 30].map((seconds) => <option key={seconds} value={seconds}>{seconds}초</option>)}</select></div>
        {theme && <>
          <div className="setup-row pair-count"><div><h2>몇 쌍을 맞춰볼까요?</h2><p>{theme.minPairs}~{theme.pairs.length}쌍 · 총 {pairCount * 2}장의 카드</p></div><div className="stepper"><button aria-label="카드 쌍 줄이기" type="button" disabled={pairCount <= theme.minPairs} onClick={() => changeCount(pairCount - 1)}>−</button><output aria-live="polite">{pairCount}<small>쌍</small></output><button aria-label="카드 쌍 늘리기" type="button" disabled={pairCount >= theme.pairs.length} onClick={() => changeCount(pairCount + 1)}>＋</button></div></div>
          <input className="pair-range" type="range" min={theme.minPairs} max={theme.pairs.length} value={pairCount} aria-label="카드 쌍 개수" onChange={(event) => changeCount(Number(event.target.value))} />
          <fieldset className="selection-options"><legend>카드 고르는 방법</legend><div><button type="button" aria-pressed={selectionMode === "random"} onClick={() => setSelectionMode("random")}>모두 랜덤으로</button><button type="button" aria-pressed={selectionMode === "choose"} onClick={() => setSelectionMode("choose")}>직접 골라 담기</button></div></fieldset>
          {selectionMode === "random" ? <p className="selection-hint">총 {theme.pairs.length}쌍 중 {pairCount}쌍을 중복 없이 골라드려요.</p> : <>
            <div className="selection-heading"><p>필수 선택 {chosen.length} / {pairCount}쌍<br /><span>덜 고르면 나머지 {pairCount - chosen.length}쌍은 랜덤으로 채워요.</span></p><button type="button" className="text-button" onClick={() => setChosen([])}>선택 초기화</button></div>
            <div className="pair-picker">{theme.pairs.map((pair) => <label key={pair.id} className={chosen.includes(pair.id) ? "chosen" : ""}><input type="checkbox" checked={chosen.includes(pair.id)} disabled={!chosen.includes(pair.id) && chosen.length >= pairCount} onChange={(event) => setChosen((previous) => event.target.checked ? [...previous, pair.id] : previous.filter((id) => id !== pair.id))} /><span>{theme.kind === "same" ? pair.left.name : pair.left.name + " ↔ " + pair.right.name}</span></label>)}</div>
          </>}
          {!isThemeReady && <p className="setup-warning" role="status">이 테마의 이미지는 준비 중이에요. 현재 {readyCount} / {theme.pairs.length}쌍이 준비됐습니다.</p>}
        </>}
        {modeId === "custom" && <div className="custom-mode">
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFiles} hidden disabled={isProcessing} />
          <button type="button" className="upload-zone" disabled={isProcessing || customImages.length >= 12} onClick={() => inputRef.current?.click()}><span className="upload-icon" aria-hidden="true">＋</span><strong>{isProcessing ? "이미지를 준비하고 있어요" : "내 이미지 추가하기"}</strong><span>2~12장 · JPG, PNG, WebP · 장당 최대 8MB</span></button>
          <p className="privacy-note">사진은 서버로 전송되지 않아요. 이 브라우저의 게임에서만 사용됩니다.</p>
          {customImages.length > 0 && <div className="custom-preview-grid">{customImages.map((item) => <div className="custom-preview" key={item.id}><img src={item.image} alt={item.name} /><button type="button" aria-label={item.name + " 삭제"} disabled={isProcessing} onClick={() => setCustomImages((previous) => previous.filter((image) => image.id !== item.id))}>×</button></div>)}</div>}
          <p className="upload-summary">{customImages.length} / 12장 · 게임 카드 {customImages.length * 2}장</p>
        </div>}
        {error && <p className="upload-error" role="alert">{error}</p>}
        <button className="start-game" type="button" disabled={isProcessing || !isThemeReady} onClick={start}>{isProcessing ? "이미지 준비 중…" : isThemeReady ? "기억 놀이 시작하기 →" : "이미지 준비 중"}</button>
        <p className="start-note">{theme?.kind === "related" ? "서로 연결되는 두 그림을 찾아요." : "같은 그림 두 장을 찾아요."} 이미지를 모두 불러온 뒤 암기 시간이 시작됩니다.</p>
      </section>
    </>}
  </main>;
}
