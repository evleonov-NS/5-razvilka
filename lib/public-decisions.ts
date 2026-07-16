import { prisma } from "@/lib/prisma";

export type PublicDecisionSort = "popular" | "recent";

export type PublicDecisionItem = {
  id: string;
  title: string;
  context: string;
  horizon: string;
  type: string;
  status: string;
  createdAt: Date;
  likesCount: number;
  likedByMe: boolean;
  author: {
    name: string | null;
    image: string | null;
  };
};

/** ID публичных решений, которые лайкнул пользователь. */
export async function getLikedDecisionIds(
  userId: string,
  decisionIds: string[],
): Promise<Set<string>> {
  if (decisionIds.length === 0) return new Set();

  const likes = await prisma.decisionLike.findMany({
    where: { userId, decisionId: { in: decisionIds } },
    select: { decisionId: true },
  });

  return new Set(likes.map((like) => like.decisionId));
}

/** Публичная лента разборов с сортировкой и признаком likedByMe. */
export async function listPublicDecisions(
  sort: PublicDecisionSort = "recent",
  currentUserId?: string | null,
): Promise<PublicDecisionItem[]> {
  const decisions = await prisma.decision.findMany({
    where: { isPublic: true },
    orderBy:
      sort === "popular"
        ? { likes: { _count: "desc" } }
        : { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      context: true,
      horizon: true,
      type: true,
      status: true,
      createdAt: true,
      user: {
        select: { name: true, image: true },
      },
      _count: { select: { likes: true } },
    },
  });

  const likedIds = currentUserId
    ? await getLikedDecisionIds(
        currentUserId,
        decisions.map((d) => d.id),
      )
    : new Set<string>();

  return decisions.map((decision) => ({
    id: decision.id,
    title: decision.title,
    context: decision.context,
    horizon: decision.horizon,
    type: decision.type,
    status: decision.status,
    createdAt: decision.createdAt,
    likesCount: decision._count.likes,
    likedByMe: likedIds.has(decision.id),
    author: decision.user,
  }));
}

/** Одно публичное решение для страницы /explore/[id]. */
export async function getPublicDecision(
  id: string,
  currentUserId?: string | null,
): Promise<PublicDecisionItem | null> {
  const decision = await prisma.decision.findFirst({
    where: { id, isPublic: true },
    select: {
      id: true,
      title: true,
      context: true,
      horizon: true,
      type: true,
      status: true,
      createdAt: true,
      user: { select: { name: true, image: true } },
      _count: { select: { likes: true } },
    },
  });

  if (!decision) return null;

  let likedByMe = false;
  if (currentUserId) {
    const like = await prisma.decisionLike.findUnique({
      where: {
        userId_decisionId: { userId: currentUserId, decisionId: id },
      },
      select: { id: true },
    });
    likedByMe = Boolean(like);
  }

  return {
    id: decision.id,
    title: decision.title,
    context: decision.context,
    horizon: decision.horizon,
    type: decision.type,
    status: decision.status,
    createdAt: decision.createdAt,
    likesCount: decision._count.likes,
    likedByMe,
    author: decision.user,
  };
}
