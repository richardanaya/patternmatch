var assert = require('assert');
var patternmatch = require("../patternmatch");
var match = patternmatch.match;
var pattern = patternmatch.pattern;
var PatternBuilder = patternmatch.PatternBuilder;
var __ = patternmatch.__;
var _$_ = patternmatch._$_;
var _REST_ = patternmatch._REST_;
var _$REST_ = patternmatch._$REST_;
var _NUMBER_ = patternmatch._NUMBER_;
var _$NUMBER_ = patternmatch._$NUMBER_;
var _STRING_ = patternmatch._STRING_;
var _$STRING_ = patternmatch._$STRING_;
var _BOOL_ = patternmatch._BOOL_;
var _$BOOL_ = patternmatch._$BOOL_;
var ARRAY = patternmatch.ARRAY;
var $ARRAY = patternmatch.$ARRAY;
var ALL = patternmatch.ALL;
var extractor = patternmatch.extractor;

describe('match', function() {
  it('should throw if used empty', function () {
    var m = match();
    assert.throws(function() { m(); }, Error);
  });
  it('should test match and execute function when matches true', function () {
    var mockPattern = function(){
      return {
        matches:true
      }
    }
    var m = match(
      mockPattern,function(){return "life"}
    );
    assert.equal("life", m());
  });
  it('should test match and execute function when matches false', function () {
    var mockPattern = function(){
      return {
        matches:false
      }
    }
    var m = match(
      mockPattern,function(){return "life"}
    );
    assert.throws(function() { m(); }, Error);
  });
  it('should pass along variables function when matches true', function () {
    var mockPattern = function(){
      return {
        matches:true,
        variables:["Hello World"]
      }
    }
    var m = match(
      mockPattern,function(x){return x;}
    );
    assert.equal("Hello World", m());
  });
  it('should handle multiple patterns', function () {
    var mockPattern = function(){
      return {
        matches:false,
        variables:["Foo"]
      }
    }
    var mockPattern2 = function(){
      return {
        matches:true,
        variables:["Bar"]
      }
    }
    var m = match(
      mockPattern,function(x){return x;},
      mockPattern2,function(x){return x;}
    );
    assert.equal("Bar", m());
  });
  it('should fail multiple patterns', function () {
    var mockPattern = function(){
      return {
        matches:false,
        variables:["Foo"]
      }
    }
    var mockPattern2 = function(){
      return {
        matches:false,
        variables:["Bar"]
      }
    }
    var m = match(
      mockPattern,function(x){return x;},
      mockPattern2,function(x){return x;}
    );
    assert.throws(function() { m(); }, Error);
  });
})

describe('pattern', function() {
  it('should have definition', function () {
    assert.throws(function() { pattern(); }, Error);
  });
  it('should match single', function () {
    var p = pattern(42);
    assert.equal(true, p(42).matches);
  });
  it('should fail a match', function () {
    var p = pattern(42);
    assert.equal(false, p(43).matches);
  });
  it('should fail a match that is fuzzy equals', function () {
    var p = pattern(42);
    assert.equal(false, p("42").matches);
  });
  it('should match multiple', function () {
    var p = pattern(1,2);
    assert.equal(true, p(1,2).matches);
  });
  it('should fail match multiple', function () {
    var p = pattern(1,2);
    assert.equal(false, p(1,3).matches);
  });
  it('should fail non matching lengths', function () {
    var p = pattern(1,2);
    assert.equal(false, p(1,2,3).matches);
  });
  it('should match single custom equal processor', function () {
    var b = new PatternBuilder().equals(42)
    var p = pattern(b);
    assert.equal(true, p(42).matches);
  });
  it('should match any processor', function () {
    var b = new PatternBuilder().any()
    var p = pattern(b);
    assert.equal(true, p(42).matches);
    assert.equal(true, p("").matches);
  });
  it('should match var processor', function () {
    var b = new PatternBuilder().var()
    var p = pattern(b);
    assert.equal(false, p().matches);
    var b = new PatternBuilder().equals(42).var()
    var p = pattern(b);
    assert.equal(true, p(42).matches);
    assert.equal(42, p(42).variables[0]);
    var b1 = new PatternBuilder().equals(1).var()
    var b2 = new PatternBuilder().any().var()
    var b3 = new PatternBuilder().equals(3).var()
    var p = pattern(b1,b2,b3);
    assert.equal(true, p(1,2,3).matches);
    assert.equal(1, p(1,2,3).variables[0]);
    assert.equal(2, p(1,2,3).variables[1]);
    assert.equal(4, p(1,4,3).variables[1]);
    assert.equal(3, p(1,2,3).variables[2]);
  });
  it('should match __ as any()', function () {
    var p = pattern(__);
    assert.equal(true, p(42).matches);
    assert.equal(true, p("").matches);
  });
  it('should match _$_ as any().var()', function () {
    var p = pattern(_$_);
    assert.equal(true, p(42).matches);
    assert.equal(42, p(42).variables[0]);
  });
  it('should match rest', function () {
    var b = new PatternBuilder().rest();
    var p = pattern(b);
    assert.equal(true, p(1).matches);
    assert.equal(true, p(1,2,3).matches);
    assert.equal(true, p(0).matches);
  });
  it('should match _REST_ as rest()', function () {
    var p = pattern(_REST_);
    assert.equal(true, p(1).matches);
    assert.equal(true, p(1,2,3).matches);
    assert.equal(true, p(0).matches);
  });
  it('should match rest at end', function () {
    var p = pattern(1,_REST_);
    assert.equal(true, p(1).matches);
    assert.equal(true, p(1,2,3).matches);
    assert.equal(false, p(0).matches);
  });
  it('should match rest at beginning', function () {
    var p = pattern(_REST_,1);
    assert.equal(true, p(1).matches);
    assert.equal(true, p(2,3,1).matches);
    assert.equal(false, p(0).matches);
    assert.equal(false, p(2,3,2).matches);
  });
  it('should match rest at middle', function () {
    var p = pattern(1,_REST_,3);
    assert.equal(false, p(1).matches);
    assert.equal(false, p(1,2).matches);
    assert.equal(true, p(1,3).matches);
    assert.equal(true, p(1,2,3).matches);
    assert.equal(true, p(1,2,2,2,3).matches);
    assert.equal(false, p(1,2,2,2,2).matches);
  });
  it('should match rest().var() at end', function () {
    var p = pattern(1,_$REST_);
    assert.equal(true, p(1).matches);
    assert.equal(1, p(1).variables.length);
    assert.equal(0, p(1).variables[0].length);
    assert.equal(true, p(1,2).matches);
    assert.equal(1, p(1,2).variables.length);
    assert.equal(1, p(1,2).variables[0].length);
    assert.equal(true, p(1,2,3).matches);
    assert.equal(1, p(1,2,3).variables.length);
    assert.equal(2, p(1,2,3).variables[0].length);
  });
  it('should match on type', function () {
    var b = new PatternBuilder().isType("number")
    var p = pattern(b);
    assert.equal(true, p(1).matches);
    assert.equal(false, p("hey").matches);
    var b = new PatternBuilder().isType("string")
    var p = pattern(b);
    assert.equal(false, p(1).matches);
    assert.equal(true, p("hey").matches);
  });
  it('should match with _NUMBER_ as isType("number")', function () {
    var p = pattern(_NUMBER_);
    assert.equal(true, p(1).matches);
    assert.equal(false, p("hey").matches);
  });
  it('should match with _$NUMBER_ as isType("number").var()', function () {
    var p = pattern(_$NUMBER_);
    assert.equal(true, p(1).matches);
    assert.equal(1, p(1).variables[0]);
    assert.equal(false, p("hey").matches);
  });
  it('should match with _STRING_ as isType("string")', function () {
    var p = pattern(_STRING_);
    assert.equal(false, p(1).matches);
    assert.equal(true, p("hey").matches);
  });
  it('should match with _$STRING_ as isType("string").var()', function () {
    var p = pattern(_$STRING_);
    assert.equal(false, p(1).matches);
    assert.equal(true, p("hey").matches);
    assert.equal("hey", p("hey").variables[0]);
  });
  it('should match with _BOOL_ as isType("boolean")', function () {
    var p = pattern(_BOOL_);
    assert.equal(false, p(1).matches);
    assert.equal(true, p(true).matches);
    assert.equal(true, p(false).matches);
  });
  it('should match with _$BOOL_ as isType("boolean").var()', function () {
    var p = pattern(_$BOOL_);
    assert.equal(false, p(1).matches);
    assert.equal(true, p(true).matches);
    assert.equal(true, p(true).variables[0]);
    assert.equal(false, p(false).variables[0]);
  });
  it('should match not have fuzzy type match', function () {
    var p = pattern(_$BOOL_);
    assert.equal(false, p(1).matches);
    assert.equal(true, p(true).matches);
    assert.equal(true, p(true).variables[0]);
    assert.equal(false, p(false).variables[0]);
  });
  it('should match empty array', function () {
    var b = new PatternBuilder().array();
    var p = pattern(b);
    assert.equal(true, p([]).matches);
  });
  it('should not match non-array with array()', function () {
    var b = new PatternBuilder().array();
    var p = pattern(b);
    assert.equal(false, p(1).matches);
  });
  it('should non-empty array with array()', function () {
    var b = new PatternBuilder().array(1,2,3);
    var p = pattern(b);
    assert.equal(true, p([1,2,3]).matches);
    assert.equal(false, p([1,2,4]).matches);
  });
  it('should use ARRAY as shortcut for array()', function () {
    var p = pattern(ARRAY(1,2,3));
    assert.equal(true, p([1,2,3]).matches);
    assert.equal(false, p([1,2,4]).matches);
  });
  it('should use $ARRAY as shortcut for array().var()', function () {
    var p = pattern($ARRAY(1,2,3));
    assert.equal(true, p([1,2,3]).matches);
    assert.equal(false, p([1,2,4]).matches);
    assert.equal(1, p([1,2,3]).variables.length);
    assert.equal(3, p([1,2,3]).variables[0].length);
    assert.equal(1, p([1,2,3]).variables[0][0]);
    assert.equal(2, p([1,2,3]).variables[0][1]);
    assert.equal(3, p([1,2,3]).variables[0][2]);
  });
  it('should match null', function () {
    var p = pattern(null);
    assert.equal(true, p(null).matches);
    assert.equal(false, p(1).matches);
  });
  it('should match undefined', function () {
    var p = pattern(undefined);
    assert.equal(true, p(undefined).matches);
    assert.equal(false, p(1).matches);
  });
  it('should match when condition', function () {
    var p = pattern(_NUMBER_.when(function(x){return x>3}));
    assert.equal(true, p(5).matches);
    assert.equal(false, p(1).matches);
    var p = pattern(ARRAY(1,_REST_).when(function(x){return x.length>3}));
    assert.equal(true, p([1,2,3,4]).matches);
    assert.equal(false, p([1]).matches);
  });
  it('should match when condition', function () {
    var p = pattern(_NUMBER_.when(function(x){return x>3}));
    assert.equal(true, p(5).matches);
    assert.equal(false, p(1).matches);
    var p = pattern(ARRAY(1,_REST_).when(function(x){return x.length>3}));
    assert.equal(true, p([1,2,3,4]).matches);
    assert.equal(false, p([1]).matches);
  });
  it('should fail match condition immediately', function () {
    var p = pattern(_NUMBER_.when(function(x){return true}));
    assert.equal(false, p("Hello").matches);
  });
  it('should create an extractor that can handle normal pattern format', function () {
    var POINT = extractor(function(pt){
      return [pt.x,pt.y];
    });
    var pt = {x:1,y:2}
    var pt2 = {x:2,y:2}
    var p = pattern(POINT(1,2));
    assert.equal(true, p(pt).matches);
    assert.equal(false, p(pt2).matches);
  });
  it('should match all with everything', function () {
    var p = pattern(ALL);
    assert.equal(true, p("Hello").matches);
    assert.equal(true, p(1).matches);
    assert.equal(true, p().matches);
    assert.equal(true, p(null).matches);
    assert.equal(true, p(false).matches);
  });
})
