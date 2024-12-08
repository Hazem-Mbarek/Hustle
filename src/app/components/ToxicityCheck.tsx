import styles from './ToxicityCheck.module.css';

interface ToxicityCheckProps {
  isChecking: boolean;
}

const ToxicityCheck = ({ isChecking }: ToxicityCheckProps) => {
  if (!isChecking) return null;

  return (
    <div className={styles.checkContainer}>
      <div className={styles.content}>
        <div className={styles.scanner}></div>
        <p>Checking message...</p>
      </div>
    </div>
  );
};

export default ToxicityCheck; 