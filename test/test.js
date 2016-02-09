var assert = require('assert');
var patternmatch = require("../patternmatch");
var pattern = patternmatch.pattern;
var match = patternmatch.match;

describe('match', function() {
  describe('#()', function () {
    var matcher = match(42);
    it('should return true when value is same', function () {
      assert.equal(true, matcher(42).result);
    });
    it('should return false when value is not same', function () {
      assert.equal(false, matcher(43).result);
    });
    it('should throw exception with no definition', function () {
      assert.throws(function() { match() }, Error);
    });
  });
  describe('#.any()', function () {
    var matcher = match.any();
    it('returns true', function () {
      assert.equal(true, matcher().result);
    });
  });
  describe('#.array()', function () {
    var matcher = match.array();
    it('returns true for empty array', function () {
      assert.equal(true, matcher([]).result);
    });
    it('returns false for non-empty array', function () {
      assert.equal(false, matcher([1]).result);
    });
  });
  describe('#.array(1)', function () {
    var matcher = match.array(1);
    it('returns true matching array', function () {
      assert.equal(true, matcher([1]).result);
    });
    it('returns false matching different array', function () {
      assert.equal(false, matcher([2]).result);
    });
  });
  describe('#.array(1,2,3)', function () {
    var matcher = match.array(1,2,3);
    it('returns true matching array', function () {
      assert.equal(true, matcher([1,2,3]).result);
    });
    it('returns false matching different array', function () {
      assert.equal(false, matcher([3,2,1]).result);
    });
  });
});

describe('pattern', function() {
  describe('#()', function () {
    it('should throw if used empty', function () {
      var p = pattern();
      assert.throws(function() { p(); }, Error);
    });
    it('should test match and execute function', function () {
      var p = pattern(
        match(42),function(){return "life"}
      );
      assert.equal("life", p(42));
    });
    it('should test match multiple matchers and functions', function () {
      var p = pattern(
        match(42),function(){return "life"},
        match(43),function(){return "notlife"}
      );
      assert.equal("life", p(42));
      assert.equal("notlife", p(43));
    });
    it('should test match multiple values', function () {
      var p = pattern(
        match(1),function(){return "notcount"},
        match(1,2),function(){return "count"}
      );
      assert.equal("count", p(1,2));
    });
    it('should fail testing multiple values', function () {
      var p = pattern(
        match(1,2),function(){return "count"}
      );
      assert.throws(function() { p(1); }, Error);
    });
    it('should catch any with any matcher', function () {
      var __ = match.any();
      var p = pattern(
        match(__),function(){return "all"}
      );
      assert.equal("all", p(4));
    });
    it('should pass varables to evaluator', function () {
      var _$_ = match.var()
      var p = pattern(
        match(_$_),function(x){return x*2}
      );
      assert.equal(4, p(2));
    });
    it('should pass multiple varables to evaluator', function () {
      var _$_ = match.var()
      var p = pattern(
        match(_$_,_$_),function(x,y){return x+y}
      );
      assert.equal(6, p(2,4));
    });
    it('should should pass variables mixed in to pattern', function () {
      var _$_ = match.var()
      var p = pattern(
        match(1,_$_),function(x){return x*2}
      );
      assert.equal(4, p(1,2));
    });
    it('should should pass variables mixed in to pattern in complicated way', function () {
      var _$_ = match.var()
      var p = pattern(
        match(1,_$_,3,_$_),function(x,y){return x+y}
      );
      assert.equal(6, p(1,2,3,4));
    });
    it('should catch all with all', function () {
      var ALL = match.all()
      var p = pattern(
        match(1),function(){return "notcount"},
        match(1,2),function(){return "count"},
        match(ALL),function(){return "last"}
      );
      assert.equal("last", p(4,4,2));
    });
    it('test all basic', function () {
      var _$_ = match.var()
      var __ = match.any();
      var ALL = match.all()
      var p = pattern(
        match(1,_$_,4),function(x){return 2*x},
        match(1,__,3),function(){return "any"},
        match(ALL),function(){return "all"}
      );
      assert.equal("any", p(1,423442,3));
      assert.equal(8, p(1,4,4));
      assert.equal("all", p(1123123));
    });
    it('test empty lists', function () {
      var _$_ = match.var()
      var __ = match.any();
      var ALL = match.all()
      var ARRAY = match.array
      var p = pattern(
        match(1,ARRAY()),function(){return "found"}
      );
      assert.equal("found", p(1,[]));
    })
    it('test simple lists', function () {
      var _$_ = match.var()
      var __ = match.any();
      var ALL = match.all()
      var ARRAY = match.array
      var p = pattern(
        match(1,ARRAY(2,3,4),5),function(){return "found"}
      );
      assert.equal("found", p(1,[2,3,4],5));
    })
    it('test variable from simple lists', function () {
      var _$_ = match.var()
      var __ = match.any();
      var ALL = match.all()
      var ARRAY = match.array
      var p = pattern(
        match(1,ARRAY(2,_$_,4),5),function(x){return x}
      );
      assert.equal(3, p(1,[2,3,4],5));
    })
    it('test variables from mixed lists', function () {
      var _$_ = match.var()
      var __ = match.any();
      var ALL = match.all()
      var ARRAY = match.array
      var p = pattern(
        match(_$_,ARRAY(2,_$_,4),ARRAY(2,2,_$_)),function(a,b,c){return a+b+c}
      );
      assert.equal(19, p(4,[2,10,4],[2,2,5]));
    })
    /*it('should fail identification', function () {
      var _$_ = match.var()
      var __ = match.any()
      var p = pattern(
        match(1,_$_,3,_$_),function(x,y){return x+y},
        match(__),function(){return "nicesave"}
      );
      assert.equal("nicesave", p(1,2,2,4));
    });*/
  });
});
