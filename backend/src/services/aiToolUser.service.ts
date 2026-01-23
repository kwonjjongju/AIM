import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AIToolUserData {
  id?: number;
  division: string;
  team: string;
  name: string;
  email: string;
  tools: {
    skywork: boolean;
    gemini: boolean;
    chatgpt: boolean;
    cursor: boolean;
    claude: boolean;
  };
}

export const aiToolUserService = {
  // 모든 AI 툴 사용자 조회
  async getAll() {
    const users = await prisma.aIToolUser.findMany({
      orderBy: { id: 'asc' },
    });

    return users.map(user => ({
      id: user.id,
      division: user.division,
      team: user.team,
      name: user.name,
      email: user.email,
      tools: {
        skywork: user.skywork,
        gemini: user.gemini,
        chatgpt: user.chatgpt,
        cursor: user.cursor,
        claude: user.claude,
      },
    }));
  },

  // 전체 데이터 저장 (기존 데이터 삭제 후 새로 저장)
  async saveAll(users: AIToolUserData[]) {
    // 트랜잭션으로 처리
    await prisma.$transaction(async (tx) => {
      // 기존 데이터 모두 삭제
      await tx.aIToolUser.deleteMany();

      // 새 데이터 삽입
      for (const user of users) {
        await tx.aIToolUser.create({
          data: {
            id: user.id,
            division: user.division,
            team: user.team,
            name: user.name,
            email: user.email,
            skywork: user.tools.skywork,
            gemini: user.tools.gemini,
            chatgpt: user.tools.chatgpt,
            cursor: user.tools.cursor,
            claude: user.tools.claude,
          },
        });
      }
    });

    return this.getAll();
  },
};
