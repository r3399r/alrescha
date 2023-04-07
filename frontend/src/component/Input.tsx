import classNames from 'classnames';
import { forwardRef, InputHTMLAttributes } from 'react';

export type Props = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean | string;
};

const Input = forwardRef<HTMLInputElement, Props>(
  ({ error, disabled, className, ...props }, ref) => (
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
      {...props}
    />
  ),
);

export default Input;
