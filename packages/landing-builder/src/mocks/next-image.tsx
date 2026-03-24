import React from 'react';

const Image = ({ src, alt, className, ...props }) => {
  return (
    <img 
      src={src} 
      alt={alt || ''} 
      className={className} 
      loading="lazy" 
      decoding="async" 
      {...props}
    />
  );
};

export default Image;
