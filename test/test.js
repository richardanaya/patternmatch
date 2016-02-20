var assert = require('assert');
var patternmatch = require("../patternmatch");
var match = patternmatch.match;
var pattern = patternmatch.pattern;
var PatternBuilder = patternmatch.PatternBuilder;
var __ = patternmatch.__;
var _$_ = patternmatch._$_;
var _REST_ = patternmatch._REST_;
var _$REST_ = patternmatch._$REST_;

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
})

/*var _$_ = pattern.var;
var __ = pattern.any;
var ALL = pattern.all;
var ARRAY = pattern.array;
var REST = pattern.rest;
var _REST_ = pattern.restVar;

describe('pattern', function() {
  describe('#()', function () {
    it('should match number literals', function () {
      var p = pattern(42);
      assert.equal(true, p(42).result);
      assert.equal(false, p(43).result);
    });
    it('should match null literal', function () {
      var p = pattern(null);
      assert.equal(true, p(null).result);
      assert.equal(false, p(1).result);
    });
    it('should matched undefined literal', function () {
      var p = pattern(undefined);
      assert.equal(true, p(undefined).result);
      assert.equal(false, p(1).result);
    });
    it('should matched undefined literal', function () {
      var p = pattern("hey");
      assert.equal(true, p("hey").result);
      assert.equal(false, p("bro").result);
    });
    it('should match rest at end', function () {
      var p = pattern(1,REST);
      assert.equal(true, p(1).result);
      assert.equal(false, p(2).result);
      assert.equal(true, p(1,2).result);
      assert.equal(true, p(1,2,3).result);
      assert.equal(false, p(2,1).result);
    });
    it('should match rest at beginning', function () {
      var p = pattern(REST,1);
      assert.equal(true, p(1).result);
      assert.equal(false, p(2).result);
      assert.equal(true, p(2,1).result);
      assert.equal(true, p(3,2,1).result);
      assert.equal(false, p(1,2,3).result);
    });
    it('should match rest at middle', function () {
      var p = pattern(1,REST,3);
      assert.equal(false, p(1).result);
      assert.equal(false, p(1,2).result);
      assert.equal(true, p(1,2,3).result);
      assert.equal(true, p(1,2,2,3).result);
    });
    it('should match rest alone', function () {
      var p = pattern(REST);
      assert.equal(true, p(1).result);
      assert.equal(true, p(1,2,3).result);
    });
    it('should throw exception with no definition', function () {
      assert.throws(function() { pattern() }, Error);
    });
  });
  describe('#.any()', function () {
    var p = pattern.any;
    it('returns true', function () {
      assert.equal(true, p().result);
    });
  });
  describe('#.array()', function () {
    var p = pattern.array();
    it('returns true for empty array', function () {
      assert.equal(true, p([]).result);
    });
    it('returns false for non-empty array', function () {
      assert.equal(false, p([1]).result);
    });
  });
  describe('#.array(1)', function () {
    var p = pattern.array(1);
    it('returns true matching array', function () {
      assert.equal(true, p([1]).result);
    });
    it('returns false matching different array', function () {
      assert.equal(false, p([2]).result);
    });
  });
  describe('#.array(1,2,3)', function () {
    var p = pattern.array(1,2,3);
    it('returns true matching array', function () {
      assert.equal(true, p([1,2,3]).result);
    });
    it('returns false matching different array', function () {
      assert.equal(false, p([3,2,1]).result);
    });
  });
});

describe('match', function() {
  describe('#()', function () {
    it('should throw if used empty', function () {
      var m = match();
      assert.throws(function() { p(); }, Error);
    });
    it('should test match and execute function', function () {
      var m = match(
        pattern(42),function(){return "life"}
      );
      assert.equal("life", m(42));
    });
    it('should test match multiple matchers and functions', function () {
      var m = match(
        pattern(42),function(){return "life"},
        pattern(43),function(){return "notlife"}
      );
      assert.equal("life", m(42));
      assert.equal("notlife", m(43));
    });
    it('should test match multiple values', function () {
      var m = match(
        pattern(1),function(){return "notcount"},
        pattern(1,2),function(){return "count"}
      );
      assert.equal("count", m(1,2));
    });
    it('should fail testing multiple values', function () {
      var m = match(
        pattern(1,2),function(){return "count"}
      );
      assert.throws(function() { m(1); }, Error);
    });
    it('should catch any with any matcher', function () {
      var m = match(
        pattern(__),function(){return "all"}
      );
      assert.equal("all", m(4));
    });
    it('should pass varables to evaluator', function () {
      var m = match(
        pattern(_$_),function(x){return x*2}
      );
      assert.equal(4, m(2));
    });
    it('should pass multiple varables to evaluator', function () {
      var m = match(
        pattern(_$_,_$_),function(x,y){return x+y}
      );
      assert.equal(6, m(2,4));
    });
    it('should should pass variables mixed in to pattern', function () {
      var m = match(
        pattern(1,_$_),function(x){return x*2}
      );
      assert.equal(4, m(1,2));
    });
    it('should should pass variables mixed in to pattern in complicated way', function () {
      var m = match(
        pattern(1,_$_,3,_$_),function(x,y){return x+y}
      );
      assert.equal(6, m(1,2,3,4));
    });
    it('should catch all with all', function () {
      var m = match(
        pattern(1),function(){return "notcount"},
        pattern(1,2),function(){return "count"},
        pattern(ALL),function(){return "last"}
      );
      assert.equal("last", m(4,4,2));
    });
    it('test all basic', function () {
      var m = match(
        pattern(1,_$_,4),function(x){return 2*x},
        pattern(1,__,3),function(){return "any"},
        pattern(ALL),function(){return "all"}
      );
      assert.equal("any", m(1,423442,3));
      assert.equal(8, m(1,4,4));
      assert.equal("all", m(1123123));
    });
    it('test empty lists', function () {
      var m = match(
        pattern(1,ARRAY()),function(){return "found"}
      );
      assert.equal("found", m(1,[]));
    })
    it('test simple lists', function () {
      var m = match(
        pattern(1,ARRAY(2,3,4),5),function(){return "found"}
      );
      assert.equal("found", m(1,[2,3,4],5));
    })
    it('test variable from simple lists', function () {
      var m = match(
        pattern(1,ARRAY(2,_$_,4),5),function(x){return x}
      );
      assert.equal(3, m(1,[2,3,4],5));
    })
    it('test variables from mixed lists', function () {
      var m = match(
        pattern(_$_,ARRAY(2,_$_,4),ARRAY(2,2,_$_)),function(a,b,c){return a+b+c}
      );
      assert.equal(19, m(4,[2,10,4],[2,2,5]));
    })
    it('test literals', function () {
      var m = match(
        pattern(null),        function(){return "found null"},
        pattern(undefined),   function(){return "found undefined"},
        pattern(42),          function(){return "life"},
        pattern("foo"),       function(){return "bar"},
        pattern("ha","ha"),   function(){return "laugh"},
        pattern(ALL),         function(){return "everything else"}
      );
      assert.equal("found null", m(null));
      assert.equal("found undefined", m(undefined));
      assert.equal("life", m(42));
      assert.equal("bar", m("foo"));
      assert.equal("laugh", m("ha","ha"));
      assert.equal("everything else", m("jabberwocky"));
    })
    it('test placeholders', function () {
      var m = match(
        pattern("beginning",__,"end"),function(){return "match"}
      );
      assert.equal("match", m("beginning","my story","end"));
      assert.equal("match", m("beginning","their story","end"));
    })
    it('test variables', function () {
      var m = match(
        pattern("hello",_$_),function(name){return "goodbye "+name},
        pattern(1,__,_$_),function(x){return x}
      );
      assert.equal("goodbye richard", m("hello","richard"));
      assert.equal(3, m(1,2,3));
    })
    it('test rest', function () {
      var m = match(
        pattern(12,REST),function(name){return "12 rest"},
        pattern(REST,_$_),function(x){return "Ending variable "+x}
      );
      assert.equal("12 rest", m(12,1,2,3));
      assert.equal("Ending variable 3", m(1,2,3));
    })
    it('test within a class', function () {
      var MyClass = function(){
          this.name = "Richard"
      }
      MyClass.prototype.greet = match(
        pattern("hello"),function(){return this.name;}
      );

      var m = new MyClass();
      assert.equal("Richard", m.greet("hello"));
    })
  });
});
*/
