const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  context: path.join(__dirname, 'src'),
  entry: './bootstrapper',
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'wowser-[hash].js'
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  resolveLoader: {
    root: path.join(__dirname, 'node_modules')
  },
  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.(png|jpg)$/,
        loader: 'url-loader?limit=100000'
      },
      {
        test: /\.styl$/,
        loader: 'style-loader!css-loader!stylus-loader?resolve url',
        exclude: /node_modules/
      },
      {
        test: /\.(frag|vert|glsl)$/,
        loader: 'raw-loader!glslify-loader?transform[]=glslify-import',
        exclude: /node_modules/
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules|blizzardry/
      },
      {
        test: /\.jsx?$/,
        loader: 'eslint-loader',
        exclude: /node_modules|blizzardry/
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      inject: true,
      template: 'index.html'
    })
  ],
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    proxy: {
      '/pipeline/*': {
        target: 'http://localhost:3000',
        secure: false
      }
    }
  }
};
