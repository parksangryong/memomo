# Memomo

동물·음식 그림 맞추기, 의미가 연결되는 짝 찾기, 내 사진으로 만드는 커스텀 게임입니다.
주소: https://memomo.dailbit.com

## 모드
| 모드 | 준비된 카드 | 게임 설정 |
| --- | --- | --- |
| 동물 친구들 | 동물 30종 | 10~30쌍 · 동일 그림 |
| 맛있는 짝꿍 | 과일·음식 30종 | 10~30쌍 · 동일 그림 |
| 국기와 랜드마크 | 15개 국가와 대표 명소 | 3~15쌍 · 연결 그림 |
| 그때와 지금 | 기존 신구 물품 15쌍, 새 일러스트 | 3~15쌍 · 연결 그림 |
| 직업과 도구 | 직업·도구 15쌍 | 3~15쌍 · 연결 그림 |
| 커스텀 | 내 이미지 2~12장 | 동일 그림 · 로컬 처리 |

직접 고른 카드가 설정한 쌍 수보다 적으면 나머지를 중복 없이 랜덤으로 채웁니다.
암기 시간은 3·5·10·15·20·30초이며 **모든 이미지가 로딩·디코딩된 뒤** 시작됩니다.
다른 탭으로 이동하면 암기 시간이 일시정지됩니다.
게임은 키보드 Tab과 Enter/Space로도 조작할 수 있습니다.

## 실행
Node.js 22 기준입니다. 배포 빌드에도 같은 버전을 쓰도록 `.node-version`을 포함합니다.

- 설치: `npm ci`
- 개발: `npm run dev`
- 테스트: `npm test`
- 정적 빌드: `npm run build`
- 미리보기: `npm run preview`
- 모든 내부 카드 자산 확인: `npm run verify:assets`

React + TypeScript + Vite 기반입니다. 서버를 운영하지 않고 빌드 시 HTML을 미리 렌더링하는 SSG입니다.
배포 출력 폴더는 `dist`입니다. 홈, 모드별 6개 설정 페이지, 가이드, 개인정보처리방침은 정적 HTML로 생성됩니다.
게임 진행 페이지는 개인별 상태가 필요하므로 검색 색인에서 제외됩니다.

## 이미지
- 테마·카드 이름·짝 구성의 단일 원본: `assets/theme-catalog.json`
- 실제 게임 이미지: `public/cards/{animals,food,world,timeline,jobs,flags}`
- 모드 진입 이미지: `public/concepts`
- AI 제작 계획과 최종 프롬프트: `assets/card-plan.json`
- 고해상도 내부 카드 원본: `assets/cards` (로컬 보관, Git 제외)
- 승인용 시안: `assets/concept-preview`, `assets/entry-preview`

일러스트는 built-in image_gen으로 개별 생성한 투명 배경 PNG를 WebP로 최적화합니다.
이미지 1장은 웹에서 320×320px로 통일하고, 배경과 불필요한 장식을 넣지 않습니다.
국기는 flag-icons 패키지의 SVG를 사용합니다. 라이선스는 `public/cards/flags/LICENSE.txt`에 포함됩니다.
`scripts/prepare-assets.mjs`는 국기를 복사하고 원본이 있으면 WebP를 준비하며, 실제 존재하는 카드 쌍만 가용 목록에 반영합니다.
미완성 테마는 깨진 그림으로 시작되지 않도록 준비 상태를 표시하고 시작 버튼을 비활성화합니다.
개발 중에는 이 준비 상태로 확인할 수 있지만, 배포 빌드는 모든 카드의 존재·규격·투명 배경을 검사하여 누락이 있으면 중단합니다.

## 광고·검색
기존 `src/config/ads.ts`의 게시자 ID와 footer 슬롯 구성을 유지합니다.
광고는 게임 카드 밖 하단 영역에만 표시하며, 빈 슬롯 ID는 노출하지 않습니다.
페이지별 title, description, canonical, Open Graph, sitemap, robots 및 가이드 FAQ 구조화 데이터를 생성합니다.
메타데이터: `src/config/pageMeta.ts`.

## 개인정보
커스텀 이미지는 브라우저에서 크기를 줄여 사용하며 서버로 업로드하지 않습니다.
현재 게임 진행 기록은 새로고침 시 초기화됩니다.
