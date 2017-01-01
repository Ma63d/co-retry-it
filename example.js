var retry = require('./index')
var co = require('co')
var time = 0

//// simulate a function that returns a promise which may success or fail
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

// function that returns an array of promises, each may success or fail
function generateArray () {
    return [generatePromise(0.3), generatePromise(0.4)]
}

co(function* () {
    var result = yield retry(generateArray, {times:5})
    console.log(result)
})
//
//
//function* generatorFunction () {
//    try {
//        let data = yield generatePromise(0.01)
//    } catch (err) {
//        console.log(err.message)
//        return yield generatePromise(0.02)
//    }
//}
//co(function* () {
//    var result = yield retry(generatorFunction, {times:5})
//    if(!result.success){
//        console.log('result is still too big')
//    }
//})


//function getData () {
//    return new Promise(function (resolve, reject) {
//        var data = Math.random()
//        if (data < 0.45) {
//            reject(new Error('data is too small'))
//        } else if (data > 0.55) {
//            reject(new Error('data is too big'))
//        } else {
//            resolve(data)
//        }
//    })
//}
//
//co(function* () {
//
//    var result = yield retry(getData, {
//        times: function (err) {
//            // retry only when data is too small
//            return err.message === 'data is too small'
//        }
//    })
//    if(!result.success){
//        console.log('result is too big')
//    }
//})

// simulate a crowded network
// and need to seed data with an exponential backoff algorithm

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