# patternmatch.js
A pattern matching library inspired from functional programming in native javascript.

# Examples
```javascript
var patternmatch = require("patternmatch")
var pattern = patternmatch.pattern
var _$_ = patternmatch.match.var()
var __ = patternmatch.match.any();
var ALL = patternmatch.match.all();
var ARRAY = patternmatch.match.array;

//Basic pattern matching
var p = pattern(
  match(1,_$_,3),(x)=>2*x,
  match(7),()=>"lucky",
  match(ARRAY()),()=>"emptyarray",
  match(ARRAY(1,2,3)),()=>"countdown",
  match(ALL),()=>"all"}
);

p(7) // "lucky"
p(1,5,3) // 10
p(1,10,3) // 20
p("blah") // "all"
p([]]) // "emptyarray"
p([1,2,3]) // "countdown"
```
