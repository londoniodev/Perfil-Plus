const webpack = require('webpack');

module.exports = function (options) {
  const originalExternals = Array.isArray(options.externals)
    ? options.externals
    : [options.externals].filter(Boolean);

  return {
    ...options,
    externals: [
      ...originalExternals.map((external) => {
        if (typeof external !== 'function') return external;
        return (data, callback) => {
          const request = data.request;
          if (request && request.startsWith('@alvarosky/')) {
            return callback();
          }
          return external(data, callback);
        };
      }),
      { sharp: 'commonjs sharp' },
    ],
    plugins: [
      ...options.plugins,
      new webpack.IgnorePlugin({
        checkResource(resource) {
          const lazyImports = [
            '@fastify/static',
            '@nestjs/microservices',
            '@nestjs/websockets',
            'cache-manager',
            'class-transformer/storage',
          ];
          if (!lazyImports.includes(resource)) {
            return false;
          }
          try {
            require.resolve(resource);
          } catch (err) {
            return true;
          }
          return false;
        },
      }),
    ],
  };
};
