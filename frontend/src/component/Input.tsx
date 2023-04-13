import classNames from 'classnames';
import { ChangeEvent, forwardRef, InputHTMLAttributes, useState } from 'react';

export type Props = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean | string;
  regex?: RegExp;
};

const Input = forwardRef<HTMLInputElement, Props>(
  ({ error, disabled, className, regex, defaultValue, onChange, ...props }, ref) => {
    const [value, setValue] = useState<string>((defaultValue as string) ?? '');

    const onInput = (v: ChangeEvent<HTMLInputElement>) => {
      const input = v.target.value;
      if (regex !== undefined && regex.test(input) === false) return;
      setValue(input);
      onChange && onChange({ ...v, target: { ...v.target, value: input } });
    };

    return (
      <input
        className={classNames(
          'rounded-lg outline-none p-[10px] h-[44px] border-solid border-[1px] focus:border-black',
          className,
          {
            'border-red': !!error,
            'border-grey-400': !error,
            'text-grey-400': !!disabled,
          },
        )}
        ref={ref}
        disabled={disabled}
        autoComplete="off"
        value={value}
        onChange={onInput}
        {...props}
      />
    );
  },
);

export default Input;
