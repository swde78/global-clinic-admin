// src/test-setup.js
const originalCss = require.extensions['.css'];
require.extensions['.css'] = () => {};
afterAll(() => {
  if (originalCss) {
    require.extensions['.css'] = originalCss;
  } else {
    delete require.extensions['.css'];
  }
});
