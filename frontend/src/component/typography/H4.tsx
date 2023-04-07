import classNames from 'classnames';
import { HTMLAttributes } from 'react';

type Props = HTMLAttributes<HTMLHeadingElement>;

const H4 = ({ className, ...props }: Props) => (
  <h4 className={classNames('font-bold text-base m-0', className)} {...props} />
);

export default H4;
