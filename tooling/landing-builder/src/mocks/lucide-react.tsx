const React = require('react');

const LucideIconMock = (props) => {
  const { size = 24, className = '', ...rest } = props;
  return React.createElement('span', {
    className: `lucide-icon-mock ${className}`,
    style: { width: size, height: size, display: 'inline-block' },
    ...rest
  });
};

// Proxy to handle any named export (e.g., import { ArrowRight } from 'lucide-react')
module.exports = new Proxy({}, {
  get: (target, prop) => {
    if (prop === '__esModule') return true;
    if (prop === 'default') return LucideIconMock;
    return LucideIconMock;
  }
});
