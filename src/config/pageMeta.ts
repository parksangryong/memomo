import { themes } from "../data/themes";
export function getPageMeta(path: string) {
  const clean = path.replace(/\/$/, "") || "/";
  const id = clean.startsWith("/play/") ? clean.slice(6) : "";
  const theme = themes.find((item) => item.id === id);
  if (theme) return { title: theme.name + " 카드 짝 맞추기 | Memomo", description: theme.description + " " + theme.detail + "에서 카드를 고르고 암기 시간을 설정해 무료 기억력 게임을 즐겨보세요.", noindex: false };
  if (id === "custom") return { title: "내 사진으로 만드는 카드 짝 맞추기 | Memomo", description: "사진 2~12장으로 나만의 카드 뒤집기 게임을 만드세요. 업로드한 이미지는 서버로 전송되지 않고 브라우저에서만 사용됩니다.", noindex: false };
  if (clean === "/guide") return { title: "테마별 게임 방법과 자주 묻는 질문 | Memomo", description: "동물, 음식, 국기와 랜드마크, 그때와 지금, 직업과 도구, 커스텀 모드의 사용법을 확인하세요. 카드 선택, 암기 시간, 이미지 업로드 FAQ.", noindex: false };
  if (clean === "/privacy") return { title: "개인정보처리방침 | Memomo", description: "Memomo의 이미지 처리, 개인정보 보호 및 광고 관련 안내입니다.", noindex: false };
  if (clean === "/card-flip") return { title: "카드 뒤집기 게임 | Memomo", description: "준비된 카드를 외우고 짝을 찾아보세요.", noindex: true };
  return { title: "Memomo | 여섯 가지 모드로 즐기는 카드 기억력 게임", description: "동물·음식 같은 그림 찾기부터 국기와 랜드마크, 신구 물품, 직업과 도구 연결까지. 내 사진으로 만드는 커스텀 게임도 무료로 즐겨보세요.", noindex: false };
}
export const getPrerenderPaths = () => ["/", ...themes.map((theme) => "/play/" + theme.id), "/play/custom", "/card-flip", "/privacy", "/guide"];

