# co-retry-it

![](https://travis-ci.org/Ma63d/co-retry-it.svg?branch=master) [![npm package](https://img.shields.io/npm/v/co-retry-it.svg)](https://www.npmjs.com/package/co-retry-it)

Execute function which returns a yieldable object with retry mechanism when error happens.

When using [co](https://github.com/tj/co)/[koa](https://github.com/koajs/koa), if your asynchronous function sometimes fail, wrap it with `co-retry-it`, which will retry it in the way you customized.

## install

```bash
npm i co-retry-it
```
## example


```javascript
var retry = require('co-retry-it')
var co = require('co')

function* failGenerator () {
    throw new Error(new Error('something wrong'))
}

co(function* () {
    var result = yield retry(failGenerator, {times:5})
    console.log(result)
})

function generatePromise (num) {
    return new Promise(function (resolve, reject) {
        setTimeout(function(){
            var result = Math.random()
            if (result > num){
                reject(new Error('result is too big'))
            } else {
                resolve(result)
            }
        }, 100)
    })
}

co(function* () {
    var result = yield retry(generatePromise.bind(null, 0.2))
    console.log(result)
})



```
## parameter
`retry(func, options)`
`func`, function that returns a yieldable object.
`options`, an object including extra options.

## options
### times `Number or Function`
the number of times the function will retry at most when error happens to yiedable object or a function that receives an argument 'error' and returns boolean showing whether need retry

default value is `3`

example:

```javascript
function getData () {
    return new Promise(function (resolve, reject) {
        var data = Math.random()
        if (data < 0.45) {
            reject(new Error('data is too small'))
        } else if (data > 0.55) {
            reject(new Error('data is too big'))
        } else {
            resolve(data)
        }
    })
}

co(function* () {
    var result = yield retry(getData, {
        times: function (err) {
            // retry only when data is too small
            return err.message === 'data is too small'
        }
    })
    console.log(result)
})
```

### arguments `Function`
a function generates an arguments array for execution and that receives an argument 'error' which is the last error(would be undefined in first execution)


```javascript
 //simulate a crowded network
 //and need to seed data with an exponential backoff algorithm

function sendData (waitTime) {
    console.log('try to send data')
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            if (waitTime < 512) {
                console.log('after ' + waitTime* 10 + ' milliseconds, failed')
                reject(new Error('network error'))
            }  else {
                console.log('after ' + waitTime* 10 + ' milliseconds, success')
                resolve('success')
            }
        }, waitTime* 10)

    })
}

co(function* () {
    var waitTime
    var result = yield retry(sendData, {
        times: 30,
        arguments: function(err) {
            // err would be undefined when first execution
            // if the err is not network error we can reset the waitTime
            if (err === undefined || err.message !== 'network error') {
                waitTime = 1
            }
            var wt = waitTime
            waitTime *= 2
            // do not forget the return value should be an array!
            return [wt]
        }
    })
    console.log(result)
})
```

