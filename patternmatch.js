// patternmatch.js
// repo    : https://github.com/richardanaya/patternmatch
// license : MIT

(function (window, module) {
  "use strict";
  function match(){
    var matchArguments = arguments;
    return function(){
        for(var i = 0 ; i < matchArguments.length; i+=2){
          var pattern = matchArguments[i];
          var evaluator = matchArguments[i+1];
          var o = pattern.apply(this,arguments);
          if(o.result){
            return evaluator.apply(this,o.variables);
          }
        }
        throw Error("Did not match any pattern!")
    }
  }

  function isFunction(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  };

  var pattern = function(){
    var patternParams = Array.prototype.slice.call(arguments);
    if(patternParams.length==0){throw Error("Pattern requires definition!")}
    return function(){
      var firstMatchParam = patternParams[0];
      if(firstMatchParam!==null &&firstMatchParam!==undefined &&
        firstMatchParam.______MATCH_ALL_____==true){return {result:true}}
      var restIndex = patternParams.indexOf(pattern.rest)
      if(restIndex==-1&&arguments.length!=patternParams.length){return {result: false}}

      var results = []
      var argumentsBeforeRest = arguments.length;
      var argumentsAfterRest = 0;
      if(restIndex != -1){
        argumentsBeforeRest = restIndex;
        argumentsAfterRest = patternParams.length-1-restIndex;
        if(arguments.length<argumentsBeforeRest+argumentsAfterRest){return {result: false}}
      }

      for(var i=0;i<argumentsBeforeRest;i++){
        if(isFunction(patternParams[i])){
          results.push(patternParams[i](arguments[i]))
        }
        else if(arguments[i]!==patternParams[i]){
          results.push({result:false})
        }
      }
      for(var i=0;i<argumentsAfterRest;i++){
        if(isFunction(patternParams[patternParams.length-argumentsAfterRest+i])){
          results.push(patternParams[patternParams.length-argumentsAfterRest+i](arguments[arguments.length-argumentsAfterRest+i]))
        }
        else if(arguments[arguments.length-argumentsAfterRest+i]!==patternParams[patternParams.length-argumentsAfterRest+i]){
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
  pattern.any = function(){return {result:true}}
  pattern.var = function(){return {result:true,variables:arguments[0]}}
  pattern.all = {______MATCH_ALL_____:true}
  pattern.rest = {______REST_____:true}
  pattern.array = function(){
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
        return pattern.apply(this,arrayParams).apply(this,arguments[0])
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
