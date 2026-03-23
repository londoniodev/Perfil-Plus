const webpack = require('webpack');

module.exports = function (options) {
  const externals = Array.isArray(options.externals)
    ? options.externals
    : [options.externals].filter(Boolean);

  return {
    ...options,
    externals: [
      ...externals,
      { sharp: 'commonjs sharp' }
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
