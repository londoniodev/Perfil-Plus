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
          // Whitelist de paquetes que SÍ queremos bundlear
          if (request && request.startsWith('@alvarosky/shared')) {
            return callback();
          }
          // El resto (incluyendo database) los dejamos como externos
          return external(data, callback);
        };
      }),
      { 
        sharp: 'commonjs sharp',
        '@prisma/client': 'commonjs @prisma/client',
        '@alvarosky/database': 'commonjs @alvarosky/database'
      },
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
