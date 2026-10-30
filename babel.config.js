module.exports = (api) => {
  const isTest = api.env("test");

  return {
    presets: [
      ["@babel/preset-env", { modules: isTest ? false : "commonjs" }],
      "@babel/preset-typescript",
    ],
    plugins: ["@babel/plugin-transform-runtime"],
    sourceMap: true,
  };
};