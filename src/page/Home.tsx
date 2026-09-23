import { ChangeEvent, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cards } from "../data/cardData";
import SeoGuide from "../SeoGuide";

type GameMode = "default" | "custom";
type CustomImage = { name: string; image: string };

const resizeImage = (file: File): Promise<CustomImage> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("이미지를 읽을 수 없습니다."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("지원하지 않는 이미지입니다."));
      image.onload = () => {
        const maxSize = 640;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve({ name: file.name.replace(/\.[^.]+$/, ""), image: canvas.toDataURL("image/webp", 0.82) });
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });

const Home = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<GameMode>("default");
  const [selectedCards, setSelectedCards] = useState<boolean[]>(Array(cards.length).fill(true));
  const [customImages, setCustomImages] = useState<CustomImage[]>([]);
  const [countdownTime, setCountdownTime] = useState(3);
  const [uploadError, setUploadError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckboxChange = (index: number) => {
    const next = [...selectedCards];
    next[index] = !next[index];
    setSelectedCards(next);
  };

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    setUploadError("");
    if (!files.length) return;
    const remaining = 12 - customImages.length;
    if (remaining <= 0) return setUploadError("이미지는 최대 12장까지 추가할 수 있어요.");
    const accepted = files.filter((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type) && file.size <= 8 * 1024 * 1024).slice(0, remaining);
    if (accepted.length !== files.length) setUploadError("JPG, PNG, WebP 형식의 8MB 이하 이미지만 최대 12장까지 추가돼요.");
    setIsProcessing(true);
    try {
      const resized = await Promise.all(accepted.map(resizeImage));
      setCustomImages((current) => [...current, ...resized]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "이미지 처리 중 문제가 발생했어요.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStart = () => {
    if (mode === "custom") {
      if (customImages.length < 2) return setUploadError("게임을 시작하려면 이미지를 2장 이상 추가해주세요.");
      navigate("/card-flip", { state: { mode, customImages, countdownTime } });
      return;
    }
    const indices = selectedCards.map((selected, index) => selected ? index : -1).filter((index) => index !== -1);
    if (indices.length < 3) return alert("최소 3개의 카드를 선택해주세요.");
    navigate("/card-flip", { state: { mode, selectedCards: indices, countdownTime } });
  };

  return (
    <main className="home-container">
      <img src="/MemomoLogo.png" alt="Memomo" className="home-logo" />
      <h1 className="home-heading">기억하고, 뒤집고, 같은 그림을 찾아보세요</h1>
      <div className="mode-tabs" role="tablist" aria-label="게임 모드">
        <button type="button" role="tab" aria-selected={mode === "default"} className={mode === "default" ? "active" : ""} onClick={() => setMode("default")}>기본 모드</button>
        <button type="button" role="tab" aria-selected={mode === "custom"} className={mode === "custom" ? "active" : ""} onClick={() => setMode("custom")}>커스텀 모드</button>
      </div>
      <div className="countdown-selector">
        <label htmlFor="countdown">카드 외우는 시간</label>
        <select id="countdown" value={countdownTime} onChange={(e) => setCountdownTime(Number(e.target.value))} className="countdown-select">
          {[3, 5, 10, 15].map((seconds) => <option key={seconds} value={seconds}>{seconds}초</option>)}
        </select>
      </div>

      {mode === "default" ? (
        <section aria-label="기본 카드 선택">
          <p className="home-description">함께 맞출 카드 쌍을 3개 이상 선택해주세요.</p>
          <div className="home-grid">
            {selectedCards.map((selected, index) => (
              <div key={index} className="home-item">
                <label className="custom-checkbox"><input type="checkbox" checked={selected} onChange={() => handleCheckboxChange(index)} className="home-checkbox" /><span className="checkmark" /><span className="label-text">{cards[index][0].name} / {cards[index][1].name}</span></label>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="custom-mode" aria-label="커스텀 이미지 선택">
          <div className="upload-zone" onClick={() => inputRef.current?.click()}>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFiles} hidden />
            <span className="upload-icon" aria-hidden="true">＋</span>
            <strong>{isProcessing ? "이미지를 준비하고 있어요" : "이미지 선택하기"}</strong>
            <p>2~12장 · JPG, PNG, WebP · 장당 최대 8MB</p>
          </div>
          <p className="privacy-note">이미지는 서버로 전송되지 않고 이 게임에서만 사용돼요.</p>
          {uploadError && <p className="upload-error" role="alert">{uploadError}</p>}
          {customImages.length > 0 && <div className="custom-preview-grid">{customImages.map((item, index) => <div className="custom-preview" key={`${item.name}-${index}`}><img src={item.image} alt={`${item.name} 미리보기`} /><button type="button" aria-label={`${item.name} 삭제`} onClick={() => setCustomImages((current) => current.filter((_, i) => i !== index))}>×</button><span>{index + 1}</span></div>)}</div>}
          <div className="upload-summary"><strong>{customImages.length}</strong><span>/ 12장 선택</span></div>
        </section>
      )}
      <button onClick={handleStart} className="home-button" disabled={isProcessing}>{isProcessing ? "준비 중…" : "게임 시작하기"}</button>
      <SeoGuide />
    </main>
  );
};

export default Home;
