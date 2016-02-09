// patternmatch.js
// repo    : https://github.com/richardanaya/patternmatch
// license : MIT

(function (window, module) {
  "use strict";
  function pattern(){
    var patternArguments = arguments;
    return function(){
        for(var i = 0 ; i < patternArguments.length; i+=2){
          var matcher = patternArguments[i];
          var evaluator = patternArguments[i+1];
          var o = matcher.apply(this,arguments);
          if(o.result){
            return evaluator.apply(this,o.variables);
          }
        }
        throw Error("Pattern did not match!")
    }
  }

  function isFunction(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  };

  var match = function(){
    var matchParams = arguments;
    if(matchParams.length==0){throw Error("match requires definition")}
    return function(){
      if(matchParams[0].______MATCH_ALL_____==true){return {result:true}}
      if(arguments.length!=matchParams.length){return {result: false}}
      var results = []
      for(var i=0;i<arguments.length;i++){
        if(isFunction(matchParams[i])){
          results.push(matchParams[i](arguments[i]))
        }
        else if(arguments[i]!=matchParams[i]){
          results.push({result:false})
        }
      }

      var variables = []
      for(var j=0;j<results.length;j++){
        if(results[j].result==false){
          return {result:false};
        }
        if(results[j].variables){
          variables = variables.concat(results[j].variables)
        }
      }
      return {result:true, variables:variables};
    }
  }
  match.any = function(){return function(){return {result:true}}}
  match.var = function(){return function(){return {result:true,variables:arguments[0]}}}
  match.all = function(){return {______MATCH_ALL_____:true}}
  match.array = function(){
    var arrayParams = arguments;
    if(arrayParams.length == 0){
      return function(a){
        if(a.length==0){
          return {result:true}
        }
        return {result:false}
      }
    }
    else {
      return function(){
        return match.apply(this,arrayParams).apply(this,arguments[0])
      }
    }
  }

  window.patternmatch = module.exports = {
    pattern  : pattern,
    match    : match
  };
})(
  typeof window !== "undefined" ? window : {},
  typeof module !== "undefined" ? module : {}
);
