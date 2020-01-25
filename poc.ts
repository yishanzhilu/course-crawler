// On the Web, leave out this line and use the script tag above instead.
const PromisePool = require('es6-promise-pool');

const delayValue = function(value, time) {
  return new Promise(function(resolve) {
    console.log('Resolving ' + value + ' in ' + time + ' ms');
    setTimeout(function() {
      console.log('Resolving: ' + value);
      resolve(value);
    }, time);
  });
};
let count = 0;

const promiseProducer = function() {
  if (count < 5) {
    count++;
    return delayValue(count, 1000);
  } else {
    return null;
  }
};

// The number of promises to process simultaneously.
const concurrency = 3;

// Create a pool.
const pool = new PromisePool(promiseProducer, concurrency);

// Start the pool.
const poolPromise = pool.start();

pool.addEventListener('fulfilled', function(event) {
  // The event contains:
  // - target:    the PromisePool itself
  // - data:
  //   - promise: the Promise that got fulfilled
  //   - result:  the result of that Promise
  console.log('Fulfilled: ' + event.data.result);
});

// Wait for the pool to settle.
poolPromise.then(
  function(res) {
    console.log('All promises fulfilled', res);
  },
  function(error) {
    console.log('Some promise rejected: ' + error.message);
  },
);
