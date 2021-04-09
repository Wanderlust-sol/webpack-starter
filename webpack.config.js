const path = require("path");
const webpack = require("webpack");
const childProcess = require("child_process"); // 터미널 명령어를 실행할수있게해줌.
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssertsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const apiMocker = require("connect-api-mocker");

const mode = process.env.NODE_ENV || "development";

module.exports = {
  mode,
  entry: {
    main: "./src/app.js"
  },
  output: {
    path: path.resolve("./dist"), // resolve 함수는 절대경로를 지정해주는 함수이다.
    filename: "[name].js"
  },
  devServer: {
    overlay: true,
    stats: "errors-only",
    before: app => {
      app.use(apiMocker("/api", "mocks/api"));
    },
    hot: true
  },
  optimization: {
    minimizer:
      mode === "production"
        ? [
            new OptimizeCSSAssertsPlugin(),
            new TerserPlugin({
              terserOptions: {
                compress: {
                  drop_console: true // 콘솔로그 제거
                }
              }
            })
          ]
        : [],
    splitChunks: {
      chunks: "all"
    }
  },
  externals: {
    axios: "axios"
  },
  module: {
    rules: [
      {
        test: /\.css$/, // 로더가 처리해야될 파일들의 패턴을 입력한다.
        use: [
          // 뒤에부터 처리함...!
          //   path.resolve("./my-webpack-loader.js") // test에 해당하는 모든 파일에 대하여 use가 실행되어 처리해준다.
          process.env.NODE_ENV === "production"
            ? MiniCssExtractPlugin.loader
            : "style-loader",
          "css-loader"
        ]
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: "url-loader",
        options: {
          // publicPath: "./dist/", // 파일로더가 처리하는 파일을 모듈로 사용했을때 경로앞에 추가되는 문자열!
          name: "[name].[ext]?[hash]", // 파일로더가 파일을 아웃풋에 복사할때 사용하는 이름
          limit: 20000 // 2KB
        }
      },
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: `
        Build Date: ${new Date().toLocaleString()}
        `
      // Commit Version: ${childProcess.execSync("git rev-parse --short HEAD")}
    }),
    new webpack.DefinePlugin({
      TWO: "1+1",
      "api.domain": JSON.stringify("http://dev.api.domian.com")
    }),
    new HtmlWebpackPlugin({
      template: "./index.html", // template 경로 전달,
      templateParameters: {
        env: process.env.NODE_ENV === "development" ? "(개발용)" : ""
      },
      minify:
        process.env.NODE_ENV === "production"
          ? {
              collapseWhitespace: true, // 빈칸을 다 지워줌
              removeComments: true // 주석을 다 지워줌
            }
          : false
    }),
    new CleanWebpackPlugin(),

    ...(process.env.NODE_ENV === "production"
      ? [
          new MiniCssExtractPlugin({
            filename: "[name].css"
          })
        ]
      : []),
    new CopyPlugin({
      patterns: [
        {
          from: "./node_modules/axios/dist/axios.min.js",
          to: "./axios.min.js"
        }
      ]
    })
  ]
};
