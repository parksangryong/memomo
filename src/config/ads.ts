// AdSense 설정. 게시자 ID와 광고 단위(슬롯) ID는 공개값이라 환경변수 없이 상수로 관리한다.
// 승인 후 광고 단위를 만들어 AD_SLOTS에 숫자 ID를 채운다. 빈 문자열이면 해당 위치는 표시하지 않는다.
export const ADSENSE_CLIENT = "ca-pub-9309397372527518";

export const AD_SLOTS = {
  footer: "",
} as const;
