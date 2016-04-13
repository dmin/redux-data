(TODO: need to update to npm install, and pre-publish step)
(in locus directory, should already be done):
1. npm link

(TODO: need to update to npm install)
(in project directory where you want to use locus):
1. npm link @locus/locus

(TODO put peer dependencies in package.json)
1. install peer dependencies
 - react
 - TODO does not really depend on react-dom so remove that from package.json
 - redux
 - redux-thunk
 - react-redux

1. Create a schema
(TODO need instructions on how to do this)
(TODO need web based setup tool)

1. Require dependencies (some of this might already be included if you're already using redux)
```javascript
// see code in index.js
```

1. Add reducers to combineReducers
(TODO can a store enhancer be used to eliminate this step?)

1. Setup components to use locus (see usage documentation)
