module.exports = {
    // Automatically clear mock calls and instances between every test
    clearMocks: true,
  
    // The directory where Jest should output its coverage files
    coverageDirectory: "coverage",
  
    // An array of glob patterns indicating a set of files for which coverage information should be collected
    coveragePathIgnorePatterns: [
      "/node_modules/"
    ],
  
    // The test environment that will be used for testing
    testEnvironment: "node",
  
    // An array of regexp pattern strings that are matched against all test paths, tests are skipped if they match any of the patterns
    testPathIgnorePatterns: [
      "/node_modules/",
      "/dist/"
    ],
  
    // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
    transformIgnorePatterns: [
      "/node_modules/"
    ],
  
    // Indicates whether each individual test should be reported during the run
    verbose: true,
  };
  