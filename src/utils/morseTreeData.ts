import { TreeNode } from '../types';

export const MORSE_MAP: Record<string, string> = {
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..',
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.',
  '0': '-----',
  '?': '..--..',
  '/': '-..-.',
  '.': '.-.-.-',
  ',': '--..--',
  '=': '-...-',
  SOS: '...---...',
};

export const CODE_TO_CHAR: Record<string, string> = Object.entries(MORSE_MAP).reduce(
  (acc, [char, code]) => {
    acc[code] = char;
    return acc;
  },
  {} as Record<string, string>
);

// Dichotomous Binary Tree Nodes with computed grid/SVG percentage positions
// Level 0: 1 node (START)
// Level 1: 2 nodes (E, T)
// Level 2: 4 nodes (I, A, N, M)
// Level 3: 8 nodes (S, U, R, W, D, K, G, O)
// Level 4: 16 nodes (H, V, F, Ü, L, Ä, P, J, B, X, C, Y, Z, Q, Ö, CH)
export const MORSE_TREE_NODES: TreeNode[] = [
  // Root
  {
    id: 'START',
    char: 'START',
    code: '',
    level: 0,
    dotChildId: 'E',
    dashChildId: 'T',
    xPercent: 50,
    yPercent: 7,
  },
  // Level 1
  {
    id: 'E',
    char: 'E',
    code: '.',
    level: 1,
    dotChildId: 'I',
    dashChildId: 'A',
    xPercent: 27,
    yPercent: 22,
  },
  {
    id: 'T',
    char: 'T',
    code: '-',
    level: 1,
    dotChildId: 'N',
    dashChildId: 'M',
    xPercent: 73,
    yPercent: 22,
  },
  // Level 2
  {
    id: 'I',
    char: 'I',
    code: '..',
    level: 2,
    dotChildId: 'S',
    dashChildId: 'U',
    xPercent: 15.5,
    yPercent: 39,
  },
  {
    id: 'A',
    char: 'A',
    code: '.-',
    level: 2,
    dotChildId: 'R',
    dashChildId: 'W',
    xPercent: 38.5,
    yPercent: 39,
  },
  {
    id: 'N',
    char: 'N',
    code: '-.',
    level: 2,
    dotChildId: 'D',
    dashChildId: 'K',
    xPercent: 61.5,
    yPercent: 39,
  },
  {
    id: 'M',
    char: 'M',
    code: '--',
    level: 2,
    dotChildId: 'G',
    dashChildId: 'O',
    xPercent: 84.5,
    yPercent: 39,
  },
  // Level 3
  {
    id: 'S',
    char: 'S',
    code: '...',
    level: 3,
    dotChildId: 'H',
    dashChildId: 'V',
    xPercent: 9.8,
    yPercent: 57,
  },
  {
    id: 'U',
    char: 'U',
    code: '..-',
    level: 3,
    dotChildId: 'F',
    dashChildId: 'U_DASH',
    xPercent: 21.2,
    yPercent: 57,
  },
  {
    id: 'R',
    char: 'R',
    code: '.-.',
    level: 3,
    dotChildId: 'L',
    dashChildId: 'R_DASH',
    xPercent: 32.8,
    yPercent: 57,
  },
  {
    id: 'W',
    char: 'W',
    code: '.--',
    level: 3,
    dotChildId: 'P',
    dashChildId: 'J',
    xPercent: 44.2,
    yPercent: 57,
  },
  {
    id: 'D',
    char: 'D',
    code: '-..',
    level: 3,
    dotChildId: 'B',
    dashChildId: 'X',
    xPercent: 55.8,
    yPercent: 57,
  },
  {
    id: 'K',
    char: 'K',
    code: '-.-',
    level: 3,
    dotChildId: 'C',
    dashChildId: 'Y',
    xPercent: 67.2,
    yPercent: 57,
  },
  {
    id: 'G',
    char: 'G',
    code: '--.',
    level: 3,
    dotChildId: 'Z',
    dashChildId: 'Q',
    xPercent: 78.8,
    yPercent: 57,
  },
  {
    id: 'O',
    char: 'O',
    code: '---',
    level: 3,
    dotChildId: 'O_DOT',
    dashChildId: 'CH',
    xPercent: 90.2,
    yPercent: 57,
  },
  // Level 4
  {
    id: 'H',
    char: 'H',
    code: '....',
    level: 4,
    xPercent: 6.8,
    yPercent: 75,
  },
  {
    id: 'V',
    char: 'V',
    code: '...-',
    level: 4,
    xPercent: 12.8,
    yPercent: 75,
  },
  {
    id: 'F',
    char: 'F',
    code: '..-.',
    level: 4,
    xPercent: 18.4,
    yPercent: 75,
  },
  {
    id: 'U_DASH',
    char: 'Ü',
    code: '..--',
    level: 4,
    xPercent: 24.0,
    yPercent: 75,
  },
  {
    id: 'L',
    char: 'L',
    code: '.-..',
    level: 4,
    xPercent: 29.8,
    yPercent: 75,
  },
  {
    id: 'R_DASH',
    char: 'Ä',
    code: '.-.-',
    level: 4,
    xPercent: 35.8,
    yPercent: 75,
  },
  {
    id: 'P',
    char: 'P',
    code: '.--.',
    level: 4,
    xPercent: 41.4,
    yPercent: 75,
  },
  {
    id: 'J',
    char: 'J',
    code: '.---',
    level: 4,
    xPercent: 47.0,
    yPercent: 75,
  },
  {
    id: 'B',
    char: 'B',
    code: '-...',
    level: 4,
    xPercent: 53.0,
    yPercent: 75,
  },
  {
    id: 'X',
    char: 'X',
    code: '-..-',
    level: 4,
    xPercent: 58.6,
    yPercent: 75,
  },
  {
    id: 'C',
    char: 'C',
    code: '-.-.',
    level: 4,
    xPercent: 64.2,
    yPercent: 75,
  },
  {
    id: 'Y',
    char: 'Y',
    code: '-.--',
    level: 4,
    xPercent: 70.2,
    yPercent: 75,
  },
  {
    id: 'Z',
    char: 'Z',
    code: '--..',
    level: 4,
    xPercent: 76.0,
    yPercent: 75,
  },
  {
    id: 'Q',
    char: 'Q',
    code: '--.-',
    level: 4,
    xPercent: 81.6,
    yPercent: 75,
  },
  {
    id: 'O_DOT',
    char: 'Ö',
    code: '---.',
    level: 4,
    xPercent: 87.2,
    yPercent: 75,
  },
  {
    id: 'CH',
    char: 'CH',
    code: '----',
    level: 4,
    xPercent: 93.2,
    yPercent: 75,
  },
];

export const DIGITS_AND_PUNCT: { char: string; code: string }[] = [
  { char: '1', code: '.----' },
  { char: '2', code: '..---' },
  { char: '3', code: '...--' },
  { char: '4', code: '....-' },
  { char: '5', code: '.....' },
  { char: '6', code: '-....' },
  { char: '7', code: '--...' },
  { char: '8', code: '---..' },
  { char: '9', code: '----.' },
  { char: '0', code: '-----' },
  { char: '?', code: '..--..' },
  { char: '/', code: '-..-.' },
  { char: '.', code: '.-.-.-' },
  { char: ',', code: '--..--' },
  { char: '=', code: '-...-' },
];

export const TREE_NODE_BY_ID = new Map<string, TreeNode>(
  MORSE_TREE_NODES.map((n) => [n.id, n])
);

export const TREE_NODE_BY_CODE = new Map<string, TreeNode>(
  MORSE_TREE_NODES.map((n) => [n.code, n])
);

// Resolves path of node IDs from START down to the current code
export function getActivePathNodeIds(currentCode: string): string[] {
  const path: string[] = ['START'];
  let currentAccum = '';
  for (const sym of currentCode) {
    currentAccum += sym;
    const node = TREE_NODE_BY_CODE.get(currentAccum);
    if (node) {
      path.push(node.id);
    }
  }
  return path;
}

// Check which node corresponds to current code
export function getNodeForCode(code: string): TreeNode | undefined {
  return TREE_NODE_BY_CODE.get(code);
}

// Structured learning challenges (Koch method progression and rhythm drills)
export const CHALLENGE_LEVELS = [
  {
    id: 'level_1',
    title: '第一课：基础单音 (E, T)',
    description: '单点与单划的基本节奏，建立肌肉记忆',
    chars: ['E', 'T', 'E', 'E', 'T', 'T', 'E', 'T'],
  },
  {
    id: 'level_2',
    title: '第二课：双音组合 (A, M, N, I)',
    description: '练习点划交替：A (.-), N (-.), I (..), M (--)',
    chars: ['A', 'N', 'I', 'M', 'A', 'I', 'N', 'M'],
  },
  {
    id: 'level_3',
    title: '第三课：三音进阶 (S, O, R, W, K, D)',
    description: '练习三码字符，包含经典 SOS 核心音',
    chars: ['S', 'O', 'S', 'R', 'W', 'K', 'D', 'O'],
  },
  {
    id: 'level_4',
    title: '第四课：常见词汇与缩写',
    description: '实战报务缩写拍发训练',
    chars: ['C', 'Q', '7', '3', 'H', 'I', 'O', 'K'],
  },
  {
    id: 'level_5',
    title: '第五课：全字母随机挑战',
    description: '测试26个英文字母的盲打与快速反应',
    chars: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
  },
];
