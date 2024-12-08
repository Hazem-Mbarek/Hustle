import { useEffect, useState } from 'react';
import styles from './ToxicityAlert.module.css';

interface ToxicityAlertProps {
  isVisible: boolean;
  onClose: () => void;
}

const ToxicityAlert = ({ isVisible, onClose }: ToxicityAlertProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(onClose, 300); // Wait for exit animation
      }, 4700); // Start exit animation before 5s
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={styles.alertContainer}>
      <div className={`${styles.alert} ${isExiting ? styles.exit : ''}`}>
        <div className={styles.icon}>⚠️</div>
        <div className={styles.content}>
          <h4>Message Blocked</h4>
          <p>Please keep the conversation respectful and friendly.</p>
        </div>
        <button 
          onClick={() => {
            setIsExiting(true);
            setTimeout(onClose, 300);
          }} 
          className={styles.closeButton}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ToxicityAlert; 