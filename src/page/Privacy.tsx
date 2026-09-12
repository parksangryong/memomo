import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <main style={{maxWidth:760,margin:"0 auto",padding:"120px 24px 72px",lineHeight:1.75,color:"inherit"}}>
      <p style={{fontSize:13,fontWeight:800,color:"#64748b"}}>PRIVACY POLICY</p>
      <h1 style={{fontSize:"clamp(2rem,6vw,3rem)",letterSpacing:"-0.05em"}}>개인정보처리방침</h1>
      <p>본 방침은 이 서비스 이용 과정에서 처리될 수 있는 정보와 이용자의 선택권을 안내하기 위한 것입니다.</p>
      <h2>서비스가 직접 요청하는 정보</h2>
      <p>서비스는 회원가입, 결제 또는 문의 양식을 운영하지 않으며 이름·전화번호·주소·개인 이메일과 같은 정보를 필수로 요구하지 않습니다. 입력하거나 선택한 일부 내용은 기능 제공을 위해 이용자의 브라우저 저장소에서만 처리될 수 있습니다.</p>
      <p>공유 기능을 이용하면 이용자가 선택한 내용이 공유 링크 또는 화면에 포함될 수 있습니다. 주민등록번호, 연락처, 건강정보 등 민감하거나 타인을 식별할 수 있는 정보는 입력하지 마세요.</p>
      <h2>자동으로 처리될 수 있는 기술정보</h2>
      <p>웹사이트 제공, 보안, 오류 확인, 이용 통계 및 광고 제공 과정에서 호스팅·분석·광고 사업자가 IP 주소, 접속 시각, 방문 페이지, 브라우저·기기 정보, 쿠키 또는 유사 식별자를 처리할 수 있습니다. 서비스는 이러한 정보를 이용해 이용자의 실제 신원을 확인하려고 하지 않습니다.</p>
      <h2>Google Analytics 및 Google AdSense</h2>
      <p>서비스는 이용 통계와 광고 제공을 위해 Google 서비스를 사용할 수 있습니다. Google을 포함한 제3자는 쿠키를 설정하거나 읽고, 웹 비콘 또는 IP 주소 등의 정보를 이용해 광고 측정 및 맞춤·비맞춤 광고를 제공할 수 있습니다.</p>
      <p>이용자는 <a href="https://adssettings.google.com/" target="_blank" rel="noreferrer" style={{color:"#2563eb"}}>Google 광고 설정</a>에서 맞춤 광고를 관리할 수 있습니다. Google의 정보 처리 방식은 <a href="https://policies.google.com/technologies/partner-sites?hl=ko" target="_blank" rel="noreferrer" style={{color:"#2563eb"}}>Google 파트너 사이트의 데이터 사용 안내</a>와 <a href="https://policies.google.com/privacy?hl=ko" target="_blank" rel="noreferrer" style={{color:"#2563eb"}}>Google 개인정보처리방침</a>에서 확인할 수 있습니다.</p>
      <h2>보관과 삭제</h2>
      <p>브라우저 저장 정보는 이용자가 브라우저 설정에서 직접 삭제할 수 있습니다. 호스팅·분석·광고 사업자가 처리하는 정보의 보관기간과 삭제 절차는 각 사업자의 정책 및 이용자 설정을 따릅니다.</p>
      <h2>이용자의 선택권</h2>
      <p>브라우저에서 쿠키와 로컬 저장소를 삭제하거나 차단할 수 있습니다. 다만 일부 기능이나 광고가 정상적으로 표시되지 않을 수 있습니다. 광고 관련 선택은 Google 광고 설정 및 브라우저의 개인정보 보호 설정에서 변경할 수 있습니다.</p>
      <h2>제3자 제공 및 국외 처리</h2>
      <p>서비스 운영 목적과 무관하게 이용자 정보를 판매하지 않습니다. 다만 위 기능을 제공하는 글로벌 호스팅·분석·광고 사업자가 해당 사업자의 정책과 적용 법령에 따라 정보를 국외에서 처리할 수 있습니다.</p>
      <h2>방침 변경</h2>
      <p>서비스 기능이나 적용되는 정책이 변경되면 본 방침도 필요한 범위에서 수정하며, 최신 내용은 이 페이지에 공개합니다.</p>
      <p><strong>시행일: 2026년 9월 12일</strong></p>
      <Link to="/" style={{display:"inline-block",marginTop:24,color:"#2563eb",fontWeight:800}}>서비스로 돌아가기</Link>
    </main>
  );
}

