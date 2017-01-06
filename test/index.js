'use strict'

const expect = require('chai').expect
require('co-mocha')

const retry = require('../index')

describe('retry mechanism', function () {
    it('expect to run totally 4 times with 3 attempts by defualt', function* () {
        let times = 0
        function increase () {
            times++
            return Promise.reject(new Error)
        }
        yield retry(increase)
        expect(times).to.equal(4)
    })

    it('expect to return the last error in the key \'error\'  of return object', function* () {
        let times = 0
        function increase () {
            times++
            return  times <  4
                ? Promise.reject(new Error('Known Error'))
                : Promise.reject(new Error('Unknown Error'))
        }
        let result = yield retry(increase)
        expect(result).to.eql({
            success: false,
            error: new Error('Unknown Error')
        })
    })

    it('expect to return the result in the key \'data\'  of return object when success', function* () {
        let times = 0
        function increase () {
            times++
            return  times >  2
                ? Promise.resolve(times)
                : Promise.reject(new Error('Unknown Error'))
        }
        let result = yield retry(increase)
        expect(result).to.eql({
            success: true,
            data: times
        })
    })

    describe('control retry execution', function () {
        it('expect to stop retry when then function `options.times` return false', function* () {
            let times = 0
            let continueBool
            function alwaysFail () {
                times++
                return (times <  5)
                    ? Promise.reject(new Error('too small'))
                    : Promise.reject(new Error('too big'))
            }
            yield retry(alwaysFail, {
                times: function (err) {
                    continueBool = err.message === 'too small'
                    return continueBool
                }
            })
            expect(continueBool).to.equal(false)
            expect(times).to.equal(5)
        })
    })

    describe('retry with specified arguments', function () {
        it('expect to retry with specified arguments returned by the function `options.arguments`', function* () {
            let num = 1;
            function failWhenNumTooSmall (num) {
                return (num <=  1024)
                    ? Promise.reject(new Error('num is too small'))
                    : Promise.resolve(num)
            }
            let result = yield retry(failWhenNumTooSmall, {
                arguments: function (err) {
                    if(!err) return [num]
                    num *= 2
                    return [num]
                },
                times () {
                    //never stop retry
                    return true
                }
            })
            expect(result).to.eql({
                success: true,
                data: num
            })
            expect(num).to.equal(2048)
        })
    })
})

