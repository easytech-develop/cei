import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createUser() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 12);

    const user = await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@cei.com',
        passwordHash: hashedPassword,
        status: 'ACTIVE',
      },
    });

    console.log('Usuário criado com sucesso:', user);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
