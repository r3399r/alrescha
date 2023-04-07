import MuiModal, { ModalProps } from '@mui/material/Modal';
import classNames from 'classnames';

type Props = ModalProps & {
  handleClose: () => void;
  disableBackdropClick?: boolean;
};

const Modal = ({ open, handleClose, children, disableBackdropClick = false, ...props }: Props) => {
  const onMuiModalClose = (event: object, reason: string) => {
    if (!disableBackdropClick || reason !== 'backdropClick') handleClose();
  };

  return (
    <MuiModal open={open} onClose={onMuiModalClose} closeAfterTransition {...props}>
      <div
        className={classNames(
          'w-[calc(100%-30px)] sm:w-[610px] bg-white rounded-[20px] outline-none absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 p-6 max-h-[calc(100vh-188px)] overflow-y-auto',
        )}
      >
        {children}
      </div>
    </MuiModal>
  );
};

export default Modal;
