"use client";

import { PlagiarismMatch } from "@/lib/gemini-client";

interface HighlightedTextProps {
  text: string;
  matches: PlagiarismMatch[];
  className?: string;
}

export function HighlightedText({
  text,
  matches,
  className = "",
}: HighlightedTextProps) {
  const segments: { text: string; isMatch: boolean; similarity?: number }[] =
    [];
  let lastIndex = 0;

  // Ordenar matches por startIndex
  const sortedMatches = [...matches].sort(
    (a, b) => a.startIndex - b.startIndex
  );

  sortedMatches.forEach((match) => {
    // Añadir texto antes del match
    if (match.startIndex > lastIndex) {
      segments.push({
        text: text.substring(lastIndex, match.startIndex),
        isMatch: false,
      });
    }

    // Añadir el texto del match
    segments.push({
      text: text.substring(match.startIndex, match.endIndex),
      isMatch: true,
      similarity: match.similarity,
    });

    lastIndex = match.endIndex;
  });

  // Añadir texto restante
  if (lastIndex < text.length) {
    segments.push({
      text: text.substring(lastIndex),
      isMatch: false,
    });
  }

  const getMatchColor = (similarity: number) => {
    if (similarity >= 90) return "bg-red-200 text-red-900 border-red-300";
    if (similarity >= 70)
      return "bg-orange-200 text-orange-900 border-orange-300";
    return "bg-yellow-200 text-yellow-900 border-yellow-300";
  };

  return (
    <div className={`whitespace-pre-wrap ${className}`}>
      {segments.map((segment, i) =>
        segment.isMatch ? (
          <mark
            key={i}
            className={`px-1 rounded border ${getMatchColor(
              segment.similarity || 0
            )}`}
            title={`${segment.similarity}% de similitud`}
          >
            {segment.text}
          </mark>
        ) : (
          <span key={i}>{segment.text}</span>
        )
      )}
    </div>
  );
}
