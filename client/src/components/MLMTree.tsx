import { useState } from "react";
import { TreeNode } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";
import MemberCard from "./MemberCard";

interface MLMTreeProps {
  tree: TreeNode;
  onNodeClick: (node: TreeNode) => void;
}

export default function MLMTree({ tree, onNodeClick }: MLMTreeProps) {
  const [zoom, setZoom] = useState(1);
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  const toggleCollapse = (id: number) => {
    const newCollapsed = new Set(collapsed);
    if (collapsed.has(id)) {
      newCollapsed.delete(id);
    } else {
      newCollapsed.add(id);
    }
    setCollapsed(newCollapsed);
  };

  const renderNode = (node: TreeNode | undefined) => {
    if (!node) return null;

    const isCollapsed = collapsed.has(node.id);

    return (
      <div className="flex flex-col items-center">
        <MemberCard 
          member={node} 
          onClick={() => onNodeClick(node)}
          onCollapse={() => toggleCollapse(node.id)}
          isCollapsed={isCollapsed}
        />
        {!isCollapsed && (
          <div className="flex gap-24 mt-12">
            <div className="relative">
              {node.children.left && (
                <>
                  <div className="absolute top-[-2rem] left-32 w-px h-8 bg-primary" />
                  <div className="absolute top-[-2rem] left-32 w-[6rem] h-px bg-primary" />
                </>
              )}
              {renderNode(node.children.left)}
            </div>
            <div className="relative">
              {node.children.right && (
                <>
                  <div className="absolute top-[-2rem] right-32 w-px h-8 bg-primary" />
                  <div className="absolute top-[-2rem] right-32 w-[6rem] h-px bg-primary" />
                </>
              )}
              {renderNode(node.children.right)}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full overflow-auto">
      <div className="fixed bottom-4 right-4 flex gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setZoom(z => Math.min(2, z + 0.1))}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>
      <div 
        style={{ transform: `scale(${zoom})` }}
        className="min-w-fit p-8 transition-transform origin-top"
      >
        {renderNode(tree)}
      </div>
    </div>
  );
}