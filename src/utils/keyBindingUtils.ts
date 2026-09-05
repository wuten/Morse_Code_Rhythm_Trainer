import { KeyBinding } from '../types';

export const DEFAULT_KEY_BINDING: KeyBinding = {
  code: 'Space',
  key: ' ',
  displayLabel: '空格键 (Space)',
};

export const COMMON_KEY_PRESETS: KeyBinding[] = [
  { code: 'Space', key: ' ', displayLabel: '空格键 (Space)' },
  { code: 'KeyJ', key: 'j', displayLabel: 'J 键 (右手食指)' },
  { code: 'KeyK', key: 'k', displayLabel: 'K 键 (右手中指)' },
  { code: 'KeyF', key: 'f', displayLabel: 'F 键 (左手食指)' },
  { code: 'KeyD', key: 'd', displayLabel: 'D 键 (左手中指)' },
  { code: 'Enter', key: 'Enter', displayLabel: '回车键 (Enter)' },
  { code: 'ControlLeft', key: 'Control', displayLabel: '左 Ctrl 键' },
];

/**
 * Format any KeyboardEvent code and key into a readable label
 */
export function formatKeyLabel(code: string, key: string): string {
  if (code === 'Space' || key === ' ') return '空格键 (Space)';
  if (code === 'Enter') return '回车键 (Enter)';
  if (code === 'Backspace') return '退格键 (Backspace)';
  if (code === 'Tab') return 'Tab 键';
  if (code === 'Escape') return 'Esc 键';
  if (code === 'ControlLeft') return '左 Ctrl 键';
  if (code === 'ControlRight') return '右 Ctrl 键';
  if (code === 'ShiftLeft') return '左 Shift 键';
  if (code === 'ShiftRight') return '右 Shift 键';
  if (code === 'AltLeft') return '左 Alt 键';
  if (code === 'AltRight') return '右 Alt 键';

  // Letter keys (e.g. KeyJ -> J 键)
  if (code.startsWith('Key')) {
    const letter = code.replace('Key', '').toUpperCase();
    return `${letter} 键`;
  }

  // Digit keys (e.g. Digit1 -> 数字 1)
  if (code.startsWith('Digit')) {
    const digit = code.replace('Digit', '');
    return `数字 ${digit} 键`;
  }

  // Numpad keys
  if (code.startsWith('Numpad')) {
    const num = code.replace('Numpad', '');
    return `小键盘 ${num} 键`;
  }

  if (key && key.length === 1) {
    return `${key.toUpperCase()} 键`;
  }

  return code || key || '未指定按键';
}

/**
 * Check whether a KeyboardEvent matches the configured KeyBinding
 */
export function isEventMatchingKey(e: KeyboardEvent, binding: KeyBinding): boolean {
  if (!binding) return e.code === 'Space' || e.key === ' ';

  if (binding.code && e.code === binding.code) return true;
  if (binding.key && e.key.toLowerCase() === binding.key.toLowerCase()) return true;

  return false;
}
