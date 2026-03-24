const React = require('react');

const mockComponent = ({ children }) => {
  return React.createElement(React.Fragment, null, children);
};

// Proxy to handle any named export (e.g., import { motion, AnimatePresence } from 'framer-motion')
module.exports = new Proxy({}, {
  get: (target, prop) => {
    if (prop === '__esModule') return true;
    if (prop === 'default') return { motion: new Proxy({}, { get: () => mockComponent }) };
    if (prop === 'motion') return new Proxy({}, { get: () => mockComponent });
    return mockComponent;
  }
});
