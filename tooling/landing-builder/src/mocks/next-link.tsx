import React from 'react';

const Link = ({ href, children, className, ...props }) => {
  return (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  );
};

export default Link;
