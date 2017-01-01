/**
 * Execute function which returns a yieldable object with retry mechanism.
 *
 * @param {Function} genYieldableObj, function that returns a yieldable object
 * @param {Object} options, which may contain following property:
 * times {Number/Function}, the number of times the function will retry at most when error
 * happens to yiedable object, or a function that receives an argument 'error'
 * and returns boolean showing whether need retry
 * arguments {Function}, a function generates an arguments array for execution
 * and that receives an argument 'error' which is the last error
 * that happened(would be undefined when first execution)
 *
 * @return {Object} if finally fail return {success: false, error:error} (error is the last one that happened),
 * else return {success:true, data:data}
 */
module.exports = function* (genYieldableObj, options){
    options = options || {}

    var retryFunc

    var args = options.arguments

    if (options && (typeof options.times === 'function') ){
        retryFunc = options.times
    }

    var timesToRetry = retryFunc === undefined ? (options.times || 3) : 0
    var haveDone = 0
    var error

    function* next (){
        haveDone++
        try {
            var data = yield genYieldableObj.apply(null, args && args.call(null, error))
            return {
                success: true,
                data: data
            }
        } catch (err) {
            error = err
            if (retryFunc !== undefined && retryFunc(err) || (haveDone <= timesToRetry) ) {
                return yield next
            }  else {
                return {
                    success: false,
                    error:err
                }
            }
        }
    }
    return yield next
}

