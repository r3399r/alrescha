import classNames from 'classnames';

type Props = { className?: string };

const Divider = ({ className }: Props) => (
  <div className={classNames(className, 'h-px bg-grey-300')} />
);

export default Divider;
