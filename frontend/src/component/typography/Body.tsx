import classNames from 'classnames';
import { HTMLAttributes } from 'react';

export type Props = HTMLAttributes<HTMLDivElement> & {
  size?: 'l' | 'm' | 's';
};

const Body = ({ size = 'm', className, ...props }: Props) => (
  <div
    className={classNames(className, {
      'text-base': size === 'l',
      'text-[14px] leading-[21px]': size === 'm',
      'text-[12px] leading-[18px]': size === 's',
    })}
    {...props}
  />
);

export default Body;
