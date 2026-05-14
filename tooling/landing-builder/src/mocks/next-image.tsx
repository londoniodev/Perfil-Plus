import React from 'react';

const Image = (props: any) => {
  const { 
    src, 
    alt, 
    className, 
    fill, 
    priority, 
    quality, 
    sizes, 
    unoptimized,
    placeholder,
    blurDataURL,
    loading: nextLoading,
    ...rest 
  } = props;

  // Filter out Next.js specific props that would break a standard <img> tag
  return (
    <img 
      src={src} 
      alt={alt || ''} 
      className={className} 
      loading="lazy" 
      decoding="async" 
      {...rest}
      style={{
        ...(fill ? { width: '100%', height: '100%', objectFit: 'cover' } : {}),
        ...rest.style
      }}
    />
  );
};

export default Image;
