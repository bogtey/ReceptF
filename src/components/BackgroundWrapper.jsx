import React from 'react';
import backgroundImage from '../image/7HHU.gif'; // Замените на путь к вашему изображению

const BackgroundWrapper = ({ children }) => {
  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </div>
  );
};

export default BackgroundWrapper;