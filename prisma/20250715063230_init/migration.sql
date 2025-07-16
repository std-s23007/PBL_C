// app/_repositories/User.ts
import { prisma } from "../_utils/prismaSingleton";
import { User as PrismaUser } from "@prisma/client";

export type User = PrismaUser;
export namespace UserRepository {
  export async function findMany(): Promise<User[]> {
    return await prisma.user.findMany();
  }

  export async function findUnique(userId: number): Promise<User | null> {
    return await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  }
}
