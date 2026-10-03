import { useRef, type KeyboardEvent } from 'react';

export interface RadioOption<T extends string> {
  value: T;
  label: string;
}

/** Roving-tabindex keyboard handling shared by single-select groups (WAI-ARIA radio group). */
export function useRadioGroup<T extends string>(
  options: readonly RadioOption<T>[],
  value: T,
  onChange: (value: T) => void,
) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = options.length - 1;
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = index === last ? 0 : index + 1;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = index === 0 ? last : index - 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = last;
        break;
      default:
        return;
    }
    event.preventDefault();
    const option = options[next];
    if (!option) return;
    onChange(option.value);
    refs.current[next]?.focus();
  };

  const hasValue = options.some((option) => option.value === value);
  const itemProps = (option: RadioOption<T>, index: number) => ({
    ref: (element: HTMLButtonElement | null) => {
      refs.current[index] = element;
    },
    type: 'button' as const,
    role: 'radio' as const,
    'aria-checked': option.value === value,
    // With nothing chosen yet, the first option takes the focus (WAI-ARIA radio group).
    tabIndex: option.value === value || (index === 0 && !hasValue) ? 0 : -1,
    onClick: () => onChange(option.value),
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => onKeyDown(event, index),
  });

  return { itemProps };
}
