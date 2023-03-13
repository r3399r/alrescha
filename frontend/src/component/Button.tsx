import classNames from 'classnames';
import { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  appearance?: 'primary' | 'secondary';
};

const Button = ({ appearance = 'primary', className, ...props }: Props) => (
  <button
    className={classNames(
      'rounded-lg px-[30px] py-[10px] outline-none border-2 border-black',
      className,
      {
        'bg-white active:bg-grey-300 disabled:border-grey-400 disabled:text-grey-400':
          appearance === 'primary',
        'bg-black text-white active:border-grey-600 active:bg-grey-600 disabled:bg-grey-400 disabled:border-grey-400':
          appearance === 'secondary',
      },
    )}
    {...props}
  />
);

export default Button;
