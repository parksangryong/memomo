import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { cards } from "../data/cardData";
import { FaHome } from "react-icons/fa";

interface Card {
  name: string;
  image: string;
  id: number;
  isFlipped: boolean;
  isMatched: boolean;
  pairId: number;
}

interface CustomImage { name: string; image: string; }

const CardFlip = () => {
  const location = useLocation();
  const selectedCardIndices = useMemo(
    () => location.state?.selectedCards || [],
    [location.state?.selectedCards]
  );
  const customImages = useMemo<CustomImage[]>(() => location.state?.customImages || [], [location.state?.customImages]);
  const mode = location.state?.mode || "default";
  const [gameCards, setGameCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [countdown, setCountdown] = useState(
    location.state?.countdownTime || 3
  );
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [moves, setMoves] = useState(0);

  // 게임 초기화
  useEffect(() => {
    const selectedCards: Card[] = mode === "custom"
      ? customImages.flatMap((item, index) => [
          { ...item, id: index * 2, pairId: index, isFlipped: true, isMatched: false },
          { ...item, id: index * 2 + 1, pairId: index, isFlipped: true, isMatched: false },
        ])
      : selectedCardIndices.flatMap((index: number) => [
          { ...cards[index][0], id: index * 2, pairId: index, isFlipped: true, isMatched: false },
          { ...cards[index][1], id: index * 2 + 1, pairId: index, isFlipped: true, isMatched: false },
        ]);

    // 카드 섞기
    const shuffledCards = [...selectedCards].sort(() => Math.random() - 0.5);
    setGameCards(shuffledCards);
  }, [customImages, mode, selectedCardIndices]);

  // 카운트다운
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsGameStarted(true);
      setGameCards((prev) =>
        prev.map((card) => ({ ...card, isFlipped: false }))
      );
    }
  }, [countdown]);

  const handleCardClick = (index: number) => {
    if (
      !isGameStarted ||
      gameCards[index].isMatched ||
      gameCards[index].isFlipped ||
      isChecking
    )
      return;

    const newFlippedCards = [...flippedCards, index];
    setFlippedCards(newFlippedCards);

    const newGameCards = [...gameCards];
    newGameCards[index].isFlipped = true;
    setGameCards(newGameCards);

    if (newFlippedCards.length === 2) {
      setMoves((current) => current + 1);
      setIsChecking(true);
      const [firstIndex, secondIndex] = newFlippedCards;
      const firstCard = newGameCards[firstIndex];
      const secondCard = newGameCards[secondIndex];

      if (firstCard.pairId === secondCard.pairId) {
        // 짝이 맞는 경우
        newGameCards[firstIndex].isMatched = true;
        newGameCards[secondIndex].isMatched = true;
        newGameCards[firstIndex].isFlipped = true;
        newGameCards[secondIndex].isFlipped = true;
        setGameCards(newGameCards);
        setIsChecking(false);
      } else {
        // 짝이 맞지 않는 경우
        setTimeout(() => {
          if (!newGameCards[firstIndex].isMatched) {
            newGameCards[firstIndex].isFlipped = false;
          }
          if (!newGameCards[secondIndex].isMatched) {
            newGameCards[secondIndex].isFlipped = false;
          }
          setGameCards(newGameCards);
          setIsChecking(false);
        }, 1000);
      }
      setFlippedCards([]);
    }
  };

  const isComplete = gameCards.length > 0 && gameCards.every((card) => card.isMatched);

  return (
    <div className="card-flip-container">
      <Link to="/" className="float-button">
        <FaHome />
      </Link>
      <h1 className="card-flip-title">
        {countdown > 0
          ? `카드 위치를 외우세요! ${countdown}초`
          : "카드 뒤집기 게임"}
      </h1>
      {gameCards.length === 0 && <div className="empty-game"><strong>선택된 카드가 없어요.</strong><Link to="/">카드 선택하러 가기</Link></div>}
      {isGameStarted && gameCards.length > 0 && <div className="game-status"><span>시도 <strong>{moves}</strong>회</span><span>완성 <strong>{gameCards.filter((card) => card.isMatched).length / 2}</strong> / {gameCards.length / 2}</span></div>}
      <div className="card-grid">
        {gameCards.map((card, index) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(index)}
            onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); handleCardClick(index); } }}
            role="button"
            tabIndex={card.isMatched ? -1 : 0}
            aria-label={`${index + 1}번 카드${card.isFlipped ? `, ${card.name}` : ""}`}
            className={`card ${card.isFlipped ? "flipped" : ""} ${
              card.isMatched ? "matched" : ""
            }`}
          >
            <div className="card-inner">
              <div className="card-front">
                <img
                  src={card.image}
                  alt={card.name}
                  className={`card-image `}
                />
              </div>
              <div className="card-back">{index + 1}</div>
            </div>
          </div>
        ))}
      </div>
      {isComplete && <div className="complete-panel" role="status"><span aria-hidden="true">🎉</span><strong>모든 짝을 찾았어요!</strong><p>{moves}번 만에 완성했습니다.</p><Link to="/">새 게임 만들기</Link></div>}
    </div>
  );
};

export default CardFlip;
