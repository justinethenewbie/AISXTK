import React from 'react';
import { WordStyleMathEditor, WordStyleMathEditorProps } from './WordStyleMathEditor';

// Re-export all structures, symbols, categories, and quick XSTK items
export * from '../data/wordEquationData';

export type WordEquationRibbonProps = WordStyleMathEditorProps;

export const WordEquationRibbon: React.FC<WordEquationRibbonProps> = (props) => {
  return <WordStyleMathEditor {...props} />;
};

export default WordEquationRibbon;
