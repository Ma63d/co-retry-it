# co-retry-it

Execute function which returns a yieldable object with retry mechanism when error happens.

When using [co](https://github.com/tj/co)/[koa](https://github.com/koajs/koa), if your asynchronous function sometimes fail, wrap it with `co-retry-it`, which will retry it in the way you customized.

## install

```bash
npm i co-retry-it
```

## example

```javascript
var retry = require('co-retry-it')
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

// execute the function with 2 times retry at most
co(function* () {
    var result = yield retry(generatePromise.bind(null, 0.2), {times:2})
    console.log(result)
})
```


