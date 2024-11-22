'use client';

interface BadgeProps {
  type: 'topPerformer';
  count?: number;
}

export const Badge = ({ type, count }: BadgeProps) => {
  const getBadgeContent = () => {
    switch (type) {
      case 'topPerformer':
        return {
          icon: '⭐',
          text: 'Top Performer',
          tooltip: `Received 5 stars from ${count} employers`
        };
      default:
        return null;
    }
  };

  const content = getBadgeContent();
  if (!content) return null;

  return (
    <div 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        backgroundColor: '#ffc107', // Yellow background
        color: '#000',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: 'bold',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      title={content.tooltip}
    >
      <span>{content.icon}</span>
      <span>{content.text}</span>
    </div>
  );
};