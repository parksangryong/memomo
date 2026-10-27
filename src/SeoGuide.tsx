import "./seo-guide.css";
import { SITE_URL } from "./config/site";
const faqs = [
  { q: "어떤 게임 모드를 고를 수 있나요?", a: "동물 친구들, 맛있는 짝꿍, 국기와 랜드마크, 그때와 지금, 직업과 도구, 커스텀 모드까지 총 6가지입니다. 동물·음식·커스텀은 같은 그림을, 나머지 테마는 의미가 연결되는 두 그림을 맞춥니다." },
  { q: "동물과 음식은 몇 종류인가요?", a: "각각 30종이며 게임마다 10~30쌍으로 설정할 수 있습니다. 카드를 직접 고르거나 전체를 랜덤으로 구성할 수 있습니다." },
  { q: "직접 선택한 카드가 설정한 쌍 수보다 적으면 어떻게 되나요?", a: "선택한 카드는 반드시 포함하고, 부족한 수만큼 같은 테마에서 중복 없이 랜덤으로 채웁니다. 예를 들어 10쌍 게임에서 4쌍만 고르면 나머지 6쌍을 채워드립니다." },
  { q: "이미지가 늦게 떠서 외우는 시간이 부족하지 않나요?", a: "선택한 모든 카드 이미지의 로딩과 디코딩이 끝난 뒤 암기 시간이 시작됩니다. 불러오기에 실패하면 시간이 시작되지 않으며 다시 시도할 수 있습니다. 다른 탭을 보는 동안에는 암기 시간이 일시정지됩니다." },
  { q: "내 사진으로 게임을 만들 수 있나요?", a: "커스텀 모드에서 8MB 이하 JPG, PNG, WebP 사진을 2~12장 추가하세요. 같은 사진 두 장이 한 쌍이 됩니다. 이미지는 서버로 전송되지 않고 브라우저에서만 처리됩니다." },
  { q: "게임을 다시 하거나 다른 테마로 바꿀 수 있나요?", a: "완료 화면에서 같은 카드로 다시 하면 배치와 기록을 초기화합니다. 새 게임 만들기에서 설정을 바꿀 수도 있습니다. 새로고침하면 현재 진행 기록은 초기화됩니다." },
];
export default function SeoGuide() {
  const schema = [
    { "@context": "https://schema.org", "@type": "WebApplication", name: "Memomo", url: SITE_URL, applicationCategory: "GameApplication", operatingSystem: "Any", inLanguage: "ko-KR", description: "6가지 모드로 즐기는 무료 그림·연결 카드 짝 맞추기 게임", offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" } },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
  ];
  return <><section className="seo-guide"><p className="seo-kicker">MEMORY GAME GUIDE</p><h1>Memomo 게임 가이드</h1><p>같은 그림을 기억하거나, 서로 연결되는 의미를 찾아보세요.</p><div className="seo-grid"><article><h2>사용 방법</h2><ol><li>6개 모드 중 원하는 테마를 고릅니다.</li><li>카드 쌍 수와 암기 시간을 설정합니다.</li><li>랜덤 또는 직접 선택으로 게임을 만듭니다.</li><li>카드가 모두 준비되면 위치를 외우고 짝을 찾습니다.</li></ol></article><article><h2>테마별 규칙</h2><ul><li>동물 친구들 · 동물 30종 중 같은 동물 찾기</li><li>맛있는 짝꿍 · 과일·음식 30종 중 같은 그림 찾기</li><li>국기와 랜드마크 · 국가와 대표 명소 연결</li><li>그때와 지금 · 옛 물건과 현대 물건 15쌍 연결</li><li>직업과 도구 · 직업에 맞는 도구 15쌍 연결</li><li>커스텀 · 직접 올린 사진으로 같은 그림 찾기</li></ul></article><article><h2>이렇게 활용해요</h2><ul><li>아이들과 동물·음식 이름 익히기</li><li>수업에서 나라와 직업 이야기 나누기</li><li>가족 사진으로 모임 게임 만들기</li><li>신구 물품으로 생활의 변화 알아보기</li></ul></article></div><div className="seo-faq"><h2>자주 묻는 질문</h2>{faqs.map((faq) => <details key={faq.q}><summary>{faq.q}</summary><p>{faq.a}</p></details>)}</div></section><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /></>;
}
