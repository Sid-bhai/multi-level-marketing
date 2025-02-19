import type { Member, TreeNode, User } from "@shared/schema";

export async function buildTree(members: Member[], fetchUser: (id: number) => Promise<User>): Promise<TreeNode | null> {
  if (!members.length) return null;

  // Find root node (member with no parent)
  const root = members.find(m => !m.parentId);
  if (!root) return null;

  async function buildNode(member: Member): Promise<TreeNode> {
    const user = await fetchUser(member.userId);
    const children = members.filter(m => m.parentId === member.id);

    return {
      ...member,
      user,
      children: {
        left: children.find(c => c.position === "left")
          ? await buildNode(children.find(c => c.position === "left")!)
          : undefined,
        right: children.find(c => c.position === "right")
          ? await buildNode(children.find(c => c.position === "right")!)
          : undefined
      }
    };
  }

  return await buildNode(root);
}