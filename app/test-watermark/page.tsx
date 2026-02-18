export default function TestWatermark() {
  return (
    <div style={{ padding: '40px', minHeight: '100vh', position: 'relative', backgroundColor: '#f5f5f5' }}>
      <div className="watermark">
        <img src="/emfrontier-logo.png" alt="EMFRONTIER" />
      </div>
      
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>
        🔍 워터마크 테스트 페이지
      </h1>
      
      <div style={{ 
        padding: '30px', 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        position: 'relative',
        zIndex: 1,
        marginBottom: '30px'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px', color: '#2196f3' }}>
          이 페이지에서 워터마크가 보여야 합니다
        </h2>
        <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '10px' }}>
          페이지 중앙에 반투명한 EMFRONTIER 로고가 표시되어야 합니다.
        </p>
        <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '10px' }}>
          ✅ 투명도: 50% (opacity: 0.5)
        </p>
        <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '10px' }}>
          ✅ 크기: 600px × 600px
        </p>
        
        <div style={{ marginTop: '25px', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>확인 사항:</h3>
          <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
            <li>로고가 페이지 중앙에 있나요?</li>
            <li>로고가 반투명하게 보이나요?</li>
            <li>콘텐츠를 읽을 수 있나요?</li>
            <li>로고가 이 흰색 박스 뒤에 있나요?</li>
          </ol>
        </div>
      </div>
      
      <div style={{ padding: '30px', backgroundColor: '#e3f2fd', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#1976d2' }}>
          📷 로고 이미지 직접 테스트:
        </h3>
        <img 
          src="/emfrontier-logo.png" 
          alt="Direct Logo Test" 
          style={{ width: '200px', height: '200px', border: '3px solid #2196f3', borderRadius: '8px', backgroundColor: 'white' }}
        />
        <p style={{ marginTop: '15px', fontSize: '16px', fontWeight: 'bold', color: '#1976d2' }}>
          ↑ 위에 로고가 보이면 파일은 정상입니다
        </p>
        <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          파일 경로: /emfrontier-logo.png
        </p>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#fff3cd', borderRadius: '12px', border: '2px solid #ffc107' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#856404' }}>
          ⚠️ 워터마크가 안 보인다면:
        </h3>
        <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#856404' }}>
          <li>브라우저 개발자 도구 (F12) 열기</li>
          <li>Console 탭에서 에러 확인</li>
          <li>Elements 탭에서 .watermark 클래스 찾기</li>
          <li>강력 새로고침: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)</li>
        </ul>
      </div>
    </div>
  );
}
