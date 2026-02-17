import Database from 'better-sqlite3';

const db = new Database('/home/user/shared-emfrontier.db');

try {
  // business_years 컬럼 추가 (업력: 사업 연수)
  db.prepare(`
    ALTER TABLE clients 
    ADD COLUMN business_years INTEGER DEFAULT 0
  `).run();

  console.log('✅ business_years 컬럼이 추가되었습니다.');
  
  // 기존 데이터에 대한 기본값 설정 (예: 3년으로 설정)
  db.prepare(`
    UPDATE clients 
    SET business_years = 3 
    WHERE business_years = 0 OR business_years IS NULL
  `).run();
  
  console.log('✅ 기존 클라이언트의 업력을 3년으로 설정했습니다.');
  
} catch (error: any) {
  if (error.message.includes('duplicate column name')) {
    console.log('ℹ️  business_years 컬럼이 이미 존재합니다.');
  } else {
    console.error('❌ 오류 발생:', error.message);
  }
} finally {
  db.close();
}
