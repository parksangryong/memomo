import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { cards } from "../data/cardData";

const Home = () => {
  const navigate = useNavigate();
  const [selectedCards, setSelectedCards] = useState<boolean[]>(
    Array(cards.length).fill(true)
  );
  const [countdownTime, setCountdownTime] = useState(3);

  const handleCheckboxChange = (index: number) => {
    const newSelectedCards = [...selectedCards];
    newSelectedCards[index] = !newSelectedCards[index];
    setSelectedCards(newSelectedCards);
  };

  const handleStart = () => {
    const selectedCardIndices = selectedCards
      .map((selected, index) => (selected ? index : -1))
      .filter((index) => index !== -1);

    if (selectedCardIndices.length === 0) {
      alert("카드를 선택해주세요.");
      return;
    }

    if (selectedCardIndices.length < 3) {
      alert("최소 3개의 카드를 선택해주세요.");
      return;
    }

    navigate("/card-flip", {
      state: { selectedCards: selectedCardIndices, countdownTime },
    });
  };

  return (
    <div className="home-container">
      <img src="/MemomoLogo.png" alt="Memomo" className="home-logo" />
      <span className="home-description">
        * 카드를 선택하고 시작하기 버튼을 눌러 게임을 시작해주세요 *
      </span>
      <div className="countdown-selector">
        <label htmlFor="countdown">카드 외우는 시간 (초):</label>
        <select
          id="countdown"
          value={countdownTime}
          onChange={(e) => setCountdownTime(Number(e.target.value))}
          className="countdown-select"
        >
          <option value="3">3초</option>
          <option value="5">5초</option>
          <option value="10">10초</option>
          <option value="15">15초</option>
        </select>
      </div>
      <div className="home-grid">
        {selectedCards.map((selected, index) => (
          <div key={index} className="home-item">
            <label className="custom-checkbox">
              <input
                type="checkbox"
                id={`card-${index}`}
                checked={selected}
                onChange={() => handleCheckboxChange(index)}
                className="home-checkbox"
              />
              <span className="checkmark"></span>
              <span className="label-text">
                {cards[index][0].name} / {cards[index][1].name}
              </span>
            </label>
          </div>
        ))}
      </div>
      <button onClick={handleStart} className="home-button">
        시작하기
      </button>
    </div>
  );
};

export default Home;
