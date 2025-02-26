// components/Toast.jsx
import { useEffect, useState } from 'react';
import styles from './Toast.module.css';
import { RiMessage2Fill } from "react-icons/ri";
import { MdError } from "react-icons/md";
import { IoIosWarning, IoMdInformationCircleOutline } from "react-icons/io";
import { GrStatusGood } from "react-icons/gr";





const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <GrStatusGood />;
      case 'message':
        return <RiMessage2Fill />;
      case 'error':
        return <MdError />;
      case 'warning':
        return <IoIosWarning />;
      default:
        return <IoMdInformationCircleOutline />;
    }
  };

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.icon}>{getIcon()}</div>
      <div className={styles.content}>
        <p className={styles.message}>{message}</p>
      </div>
      <button className={styles.closeButton} onClick={() => setVisible(false)}>
        &times;
      </button>
    </div>
  );
};

export default Toast;