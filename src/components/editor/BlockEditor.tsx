"use client";

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
  const { blocks, addBlock, updateBlockContent, removeBlock } =
    useBlocks(pageId);

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
