import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearItems() {
  console.log('DB에서 기존 아이템 삭제 시작...\n');
  
  // 관련 데이터 먼저 삭제
  const statusDeleted = await prisma.statusHistory.deleteMany({});
  console.log(`삭제된 상태 이력: ${statusDeleted.count}개`);
  
  const attachDeleted = await prisma.attachment.deleteMany({});
  console.log(`삭제된 첨부파일: ${attachDeleted.count}개`);
  
  const relDeptDeleted = await prisma.itemRelatedDepartment.deleteMany({});
  console.log(`삭제된 연관 부서: ${relDeptDeleted.count}개`);
  
  // 아이템 삭제
  const itemsDeleted = await prisma.improvementItem.deleteMany({});
  console.log(`삭제된 아이템: ${itemsDeleted.count}개`);
  
  console.log('\n✅ 모든 아이템이 삭제되었습니다!');
  
  await prisma.$disconnect();
}

clearItems().catch(console.error);
