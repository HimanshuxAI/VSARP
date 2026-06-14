import { cn } from '../../utils';

test('cn merges class names correctly', () => {
  const result = cn('p-2', 'p-4', 'text-center', 'text-left');
  // tailwind-merge keeps the last utility for the same property
  expect(result).toBe('p-4 text-left');
});
