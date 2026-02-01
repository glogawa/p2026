import React from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'success' | 'error';
}

interface NotificationPopupProps {
  notification: Notification | null;
  onClose: () => void;
}

export const NotificationPopup: React.FC<NotificationPopupProps> = ({ notification, onClose }) => {
  if (!notification) return null;

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FFC107';
      default:
        return '#2196F3';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        backdropFilter: 'blur(5px)',
        animation: 'fadeIn 0.3s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          border: `2px solid ${getBorderColor()}`,
          padding: '24px',
          maxWidth: '400px',
          minWidth: '300px',
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px ${getBorderColor()}40`,
          animation: 'slideUp 0.3s ease-out',
          backdropFilter: 'blur(10px)',
        }}
      >
        <h2
          style={{
            margin: '0 0 12px 0',
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#000000',
          }}
        >
          {notification.title}
        </h2>
        <p
          style={{
            margin: '0 0 20px 0',
            fontSize: '14px',
            color: '#000000',
            lineHeight: '1.5',
          }}
        >
          {notification.message}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            style={{
              height: '36px',
              padding: '0 16px',
              fontSize: '14px',
              fontWeight: '600',
              backgroundColor: getBorderColor(),
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Close
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationPopup;
