module.exports = {
  transform: {
    "^.+.svelte$": [
      "svelte-jester",
      {
        preprocess: true,
      },
    ],
    "^.+\\.js$": "babel-jest",
  },
  moduleFileExtensions: ["ts", "js", "svelte"],
  setupFilesAfterEnv: [
    "@testing-library/jest-dom/extend-expect",
    "./jest.setup.js",
  ],
};
