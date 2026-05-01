"use client";

import { useState } from "react";
import { useBlocks } from "@/hooks/useBlocks";
import { Block, TextContent, CodeContent, ApiContent } from "@/types";
import { BlockWrapper } from "./BlockWrapper";
import { AddBlockMenu } from "./AddBlockMenu";
import { TextBlock } from "./blocks/TextBlock";
import { CodeBlock } from "./blocks/CodeBlock";
import { ApiBlock } from "./blocks/ApiBlock";
import { EmptyState } from "@/components/shared/EmptyState";

interface BlockEditorProps {
  pageId: string;
  isReadOnly: boolean;
}

export function BlockEditor({ pageId, isReadOnly }: BlockEditorProps) {
  const { blocks, addBlock, updateBlockContent, removeBlock, reorderBlocks } =
    useBlocks(pageId);

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (id !== draggedId) {
      setDragOverId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== id) {
      const oldIndex = blocks.findIndex((b) => b.id === draggedId);
      const newIndex = blocks.findIndex((b) => b.id === id);
      
      const newBlocks = [...blocks];
      const [removed] = newBlocks.splice(oldIndex, 1);
      newBlocks.splice(newIndex, 0, removed);
      
      reorderBlocks(newBlocks.map((b) => b.id));
    }
    setDraggedId(null);
    setDragOverId(null);
  };

  const renderBlock = (block: Block) => {
    switch (block.type) {
      case "text":
        return (
          <TextBlock
            key={block.id}
            blockId={block.id}
            content={block.content as TextContent}
            onChange={(html) => updateBlockContent(block.id, { html })}
            isReadOnly={isReadOnly}
          />
        );
      case "code":
        return (
          <CodeBlock
            key={block.id}
            blockId={block.id}
            content={block.content as CodeContent}
            onChange={(content) => updateBlockContent(block.id, content)}
            isReadOnly={isReadOnly}
          />
        );
      case "api":
        return (
          <ApiBlock
            key={block.id}
            blockId={block.id}
            content={block.content as ApiContent}
            onChange={(content) => updateBlockContent(block.id, content)}
            isReadOnly={isReadOnly}
          />
        );
      default:
        return null;
    }
  };

  if (blocks.length === 0 && isReadOnly) {
    return (
      <EmptyState
        title="Nothing here yet"
        description="This page has no content."
      />
    );
  }

  if (blocks.length === 0 && !isReadOnly) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-400 italic">
          This page is empty. Add a block to get started.
        </p>
        <AddBlockMenu onAdd={addBlock} />
      </div>
    );
  }

  return (
    <div className="pr-10">
      <div className="space-y-4">
        {blocks.map((block) => (
          <BlockWrapper
            key={block.id}
            onDelete={() => removeBlock(block.id)}
            isReadOnly={isReadOnly}
            isDragged={draggedId === block.id}
            isDropTarget={dragOverId === block.id}
            onDragStart={(e) => handleDragStart(e, block.id)}
            onDragOver={(e) => handleDragOver(e, block.id)}
            onDragLeave={() => setDragOverId(null)}
            onDrop={(e) => handleDrop(e, block.id)}
            onDragEnd={() => {
              setDraggedId(null);
              setDragOverId(null);
            }}
          >
            {renderBlock(block)}
          </BlockWrapper>
        ))}
      </div>
      {!isReadOnly && (
        <div className="mt-6 border-t border-gray-100 pt-4">
          <AddBlockMenu onAdd={addBlock} />
        </div>
      )}
    </div>
  );
}
