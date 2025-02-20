import type { Member, ReferralNode, User } from "@shared/schema";

export async function buildTree(members: Member[], fetchUser: (id: number) => Promise<User>): Promise<ReferralNode | null> {
  if (!members.length) return null;

  // Find root node (member who wasn't referred by anyone)
  const root = members.find(m => !m.referredId);
  if (!root) return null;

  async function buildNode(member: Member): Promise<ReferralNode> {
    const user = await fetchUser(member.referrerId);
    const referrals = members.filter(m => m.referrerId === member.id);

    return {
      user,
      referrals: await Promise.all(referrals.map(buildNode))
    };
  }

  return await buildNode(root);
}