// patternmatch.js
// repo    : https://github.com/richardanaya/patternmatch
// license : MIT

(function (window, module) {
  "use strict";

  function match(){
    var matchArguments = arguments;

    function createResultant(result){
      return function(){
        return result;
      }
    }

    function createErrResultant(err){
      return function(){
        throw err;
      }
    }

    for(var i = 0 ; i < matchArguments.length; i+=2){
      var patternEvaluator = matchArguments[i];
      var resultEvaluator = matchArguments[i+1];
      //convert [] shorthand into pattern call
      if(Array.isArray(patternEvaluator)){
        matchArguments[i]=  pattern.apply(this,patternEvaluator);
      }
      //convert non-function resultants into functions that return result
      if(!isFunction(resultEvaluator)){
        if(resultEvaluator instanceof Error){
          matchArguments[i+1] = createErrResultant(resultEvaluator);
        }
        else {
          matchArguments[i+1] = createResultant(resultEvaluator);
        }
      }
    }
    return function(){
        for(var i = 0 ; i < matchArguments.length; i+=2){
          var patternEvaluator = matchArguments[i];
          var resultEvaluator = matchArguments[i+1];
          var o = patternEvaluator.apply(this,arguments);
          if(o.matches){
            return resultEvaluator.apply(this,o.variables);
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
    if(patternParams[0]!=null && patternParams[0]!=undefined && patternParams[0]._______ALL_______){
      return function(){return {matches:true}}
    }
    var processors = patternParams.map(function(x){
      if(x!=null && x!=undefined && x.___PROCESSOR___){
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
    this.value = x;
    for(var i=0;i<this.processors.length;i++){
      this.processors[i].call(this,this.value)
      if(this.matches == false){
        return this;
      }
    }
    return this;
  }
  PatternBuilder.prototype.equals = function(x){
    this.processors.push(function(val){
      this.matches = val===x;
    })
    return this;
  }
  PatternBuilder.prototype.transform = function(fn){
    this.processors.push(function(x){
      this.matches = true;
      this.value = fn(x);
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
  PatternBuilder.prototype.when = function(fn){
    this.processors.push(function(x){
      this.matches = fn(x);
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

  var ARRAY = function(){
    var args = Array.prototype.slice.call(arguments);
    var pb = new PatternBuilder()
    return pb.array.apply(pb,args);
  }

  var $ARRAY = function(){
    var args = Array.prototype.slice.call(arguments);
    var pb = new PatternBuilder()
    return pb.array.apply(pb,args).var();
  }

  var extractor = function(extract){
    return function(){
      var args = Array.prototype.slice.call(arguments);
      var pb = new PatternBuilder()
      return pb.transform(extract).array.apply(pb,args).var();
    }
  }

  var patternmatch = function(){
    return match.apply(this,arguments)
  }

  patternmatch.pattern  = pattern
  patternmatch.match    = match
  patternmatch.PatternBuilder = PatternBuilder
  patternmatch.__ = new PatternBuilder().any()
  patternmatch._$_ = new PatternBuilder().any().var()
  patternmatch._REST_ = new PatternBuilder().rest()
  patternmatch._$REST_ = new PatternBuilder().rest().var()
  patternmatch._NUMBER_ =  new PatternBuilder().isType("number")
  patternmatch._$NUMBER_ =  new PatternBuilder().isType("number").var()
  patternmatch._STRING_ =  new PatternBuilder().isType("string")
  patternmatch._$STRING_ =  new PatternBuilder().isType("string").var()
  patternmatch._BOOL_ =  new PatternBuilder().isType("boolean");
  patternmatch._$BOOL_ =  new PatternBuilder().isType("boolean").var()
  patternmatch.ARRAY =  ARRAY
  patternmatch.$ARRAY = $ARRAY
  patternmatch.extractor= extractor
  patternmatch.ALL= {_______ALL_______:true}


  window.patternmatch = module.exports = patternmatch;
})(
  typeof window !== "undefined" ? window : {},
  typeof module !== "undefined" ? module : {}
);
