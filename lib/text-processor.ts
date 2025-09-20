export interface TextMatch {
  originalText: string;
  matchedText: string;
  similarity: number;
  startIndex: number;
  endIndex: number;
  sourceDocument: string;
  type?: "EXACTO" | "PARAFRASIS" | "SIMILAR";
}

export class TextProcessor {
  static preprocessText(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  static findExactMatches(textA: string, textB: string, docName: string): TextMatch[] {
    const sentencesA = textA.split(/[.!?]/).filter(s => s.trim().length > 10);
    const sentencesB = textB.split(/[.!?]/).filter(s => s.trim().length > 10);
    
    const matches: TextMatch[] = [];
    
    sentencesA.forEach(sentenceA => {
      const cleanA = this.preprocessText(sentenceA);
      if (cleanA.length < 15) return;
      
      sentencesB.forEach(sentenceB => {
        const cleanB = this.preprocessText(sentenceB);
        if (cleanB.length < 15) return;
        
        if (cleanA === cleanB) {
          const startIndex = textB.indexOf(sentenceB);
          if (startIndex !== -1) {
            matches.push({
              originalText: sentenceA.trim(),
              matchedText: sentenceB.trim(),
              similarity: 100,
              startIndex: startIndex,
              endIndex: startIndex + sentenceB.length,
              sourceDocument: docName,
              type: "EXACTO"
            });
          }
        }
      });
    });
    
    return matches;
  }

  static findSimilarMatches(textA: string, textB: string, docName: string, threshold = 0.7): TextMatch[] {
    const wordsA = new Set(this.preprocessText(textA).split(' ').filter(w => w.length > 3));
    const wordsB = this.preprocessText(textB).split(' ').filter(w => w.length > 3);
    const matches: TextMatch[] = [];
    
    // Buscar secuencias de palabras similares
    for (let i = 0; i <= wordsB.length - 5; i++) {
      const sequence = wordsB.slice(i, i + 5).join(' ');
      const sequenceSet = new Set(sequence.split(' '));
      
      // Calcular similitud de Jaccard
      const intersection = new Set([...wordsA].filter(x => sequenceSet.has(x)));
      const union = new Set([...wordsA, ...sequenceSet]);
      const similarity = intersection.size / union.size;
      
      if (similarity >= threshold) {
        const originalText = this.findOriginalText(sequence, textA);
        if (originalText) {
          const startIndex = this.getPositionInText(sequence, textB);
          if (startIndex !== -1) {
            matches.push({
              originalText: originalText,
              matchedText: sequence,
              similarity: Math.round(similarity * 100),
              startIndex: startIndex,
              endIndex: startIndex + sequence.length,
              sourceDocument: docName,
              type: similarity >= 0.9 ? "EXACTO" : "PARAFRASIS"
            });
          }
        }
      }
    }
    
    return matches;
  }

  private static findOriginalText(sequence: string, fullText: string): string {
    const sentences = fullText.split(/[.!?]/);
    for (const sentence of sentences) {
      if (this.preprocessText(sentence).includes(this.preprocessText(sequence))) {
        return sentence.trim();
      }
    }
    return sequence;
  }

  private static getPositionInText(substring: string, text: string): number {
    return text.toLowerCase().indexOf(substring.toLowerCase());
  }
}