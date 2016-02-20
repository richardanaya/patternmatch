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
          if(o.matches){
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
    var processors = patternParams.map(function(x){
      if(x.___PROCESSOR___){
        return x;
      }
      else {
        return new PatternBuilder().equals(x)
      }
    })

    var restIndex = -1;
    for(var i=0;i<processors.length;i++){
      if(processors[i].target==PatternBuilder.REST){
        restIndex = i;
        break;
      }
    }

    if(patternParams.length==0){throw Error("Pattern requires definition!")}
    return function(){
      var callParams = Array.prototype.slice.call(arguments);
      if(restIndex==-1&&callParams.length!=processors.length){
        return {matches:false};
      }
      var finalResult = {matches:true,variables:[]}

      var argumentsBeforeRest = arguments.length;
      var argumentsAfterRest = 0;
      if(restIndex != -1){
        argumentsBeforeRest = restIndex;
        argumentsAfterRest = patternParams.length-1-restIndex;
        if(arguments.length<argumentsBeforeRest+argumentsAfterRest){return {matches: false}}
      }

      for(var i=0;i<argumentsBeforeRest;i++){
        var processor = processors[i];
        var result = processor.process(callParams[i]);
        //if we fail a match, stop early
        if(result.matches==false){
          return {matches:false}
        }
        else {
          //combine variables into final result
          if(result.variables){
            for(var j=0;j<result.variables.length;j++){
              finalResult.variables.push(result.variables[j])
            }
          }
        }
      }
      if(restIndex != -1){
        //Gather Rest
        var restParams = [];
        for(var i=argumentsBeforeRest;i<callParams.length-argumentsAfterRest;i++){
          restParams.push(callParams[i])
        }
        //Process Rest
        var result = processors[argumentsBeforeRest].process(restParams)
        //if we fail a match, stop early
        if(result.matches==false){
          return {matches:false}
        }
        else {
          //combine variables into final result
          if(result.variables){
            for(var j=0;j<result.variables.length;j++){
              finalResult.variables.push(result.variables[j])
            }
          }
        }

        //After Rest
        for(var i=0;i<argumentsAfterRest;i++){
          var processor = processors[processors.length-argumentsAfterRest+i];
          var result = processor.process(callParams[callParams.length-argumentsAfterRest+i]);
          //if we fail a match, stop early
          if(result.matches==false){
            return {matches:false}
          }
          else {
            //combine variables into final result
            if(result.variables){
              for(var j=0;j<result.variables.length;j++){
                finalResult.variables.push(result.variables[j])
              }
            }
          }
        }
      }

      return finalResult;
    }
  }

  var PatternBuilder = function(){
    this.___PROCESSOR___ = true
    this.processors = [];
    this.matches = false;
    this.target = PatternBuilder.SINGLE;
  }
  PatternBuilder.SINGLE = 0;
  PatternBuilder.REST = 1;
  PatternBuilder.prototype.process = function(x){
    for(var i=0;i<this.processors.length;i++){
      this.processors[i].call(this,x)
    }
    return this;
  }
  PatternBuilder.prototype.equals = function(x){
    this.processors.push(function(val){
      this.matches = val==x;
    })
    return this;
  }
  PatternBuilder.prototype.any = function(){
    this.processors.push(function(){
      this.matches = true;
    })
    return this;
  }
  PatternBuilder.prototype.rest = function(){
    this.target = PatternBuilder.REST;
    this.matches = true;
    return this;
  }
  PatternBuilder.prototype.var = function(){
    this.processors.push(function(x){
      this.variables = [x]
    })
    return this;
  }
  PatternBuilder.prototype.isType = function(type){
    this.processors.push(function(x){
      this.matches = typeof(x)==type;
    })
    return this;
  }
  PatternBuilder.prototype.array = function(){
    var arrayParams = arguments;
    this.processors.push(function(a){
      if(!Array.isArray(a)){
          return this.matches = false;
      }
      else if(arrayParams.length == 0){
        if(a.length==0){
          this.matches = true;
        }
        else {
          this.matches = false;
        }
      }
      else {
        var result = pattern.apply(this,arrayParams).apply(this,a);
        this.matches = result.matches;
        this.variables = result.variables;
      }
    })
    return this;
  }  

  window.patternmatch = module.exports = {
    pattern  : pattern,
    match    : match,
    PatternBuilder : PatternBuilder,
    __ : new PatternBuilder().any(),
    _$_ : new PatternBuilder().any().var(),
    _REST_ : new PatternBuilder().rest(),
    _$REST_ : new PatternBuilder().rest().var(),
    _NUMBER_ :  new PatternBuilder().isType("number"),
    _$NUMBER_ :  new PatternBuilder().isType("number").var(),
    _STRING_ :  new PatternBuilder().isType("string"),
    _$STRING_ :  new PatternBuilder().isType("string").var(),
    ARRAY :  function(){
      var args = Array.prototype.slice.call(arguments);
      var pb = new PatternBuilder()
      return pb.array.apply(pb,args);
    },
    $ARRAY :  function(){
      var args = Array.prototype.slice.call(arguments);
      var pb = new PatternBuilder()
      return pb.array.apply(pb,args).var();
    }
  };
})(
  typeof window !== "undefined" ? window : {},
  typeof module !== "undefined" ? module : {}
);
