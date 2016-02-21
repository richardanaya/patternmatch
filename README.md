# patternmatch.js
A pattern matching library in native javascript. This library is inspired from F# and other macro pattern matching libraries with functional programming in mind.  Particularly, I wanted to take advantage of new ES6 language structures to really create precise pattern matching expressions.

# What is pattern matching?

Pattern matching is an idea from function programming to transform data using a very strict form of expression. Some languages are even pretty cool about telling you if you missed a certain case.  Sure, you could write a bunch of if statements, but programming is also part about communication. I wanted a very simple way to communicate what's going on.  Pattern matching tries to keep your code looking algebriac and less about state and variable comparison. I try to use various symbols in order to express what's going on.

#Installing
```
npm install patternmatch
```
OR
```
<script src="https://npmcdn.com/patternmatch@latest/patternmatch.js"></script>
```

# Patterns

Let's look at some cool stuff we can pattern match!

##Literals
```javascript
var patternmatch = require("patternmatch");

//Gather pattern matching symbols
var [__,_$_,_REST_,_$REST_,_NUMBER_,_$NUMBER_,_STRING_,_$STRING_,_BOOL_,_$BOOL_,ARRAY,$ARRAY,extractor,ALL] = [patternmatch.__,patternmatch._$_,patternmatch._REST_,patternmatch._$REST_,patternmatch._NUMBER_,patternmatch._$NUMBER_,patternmatch._STRING_,patternmatch._$STRING_,patternmatch._BOOL_,patternmatch._$BOOL_,patternmatch.ARRAY,patternmatch.$ARRAY,patternmatch.extractor,patternmatch.ALL]


var p = patternmatch(
  [null],        "found null",
  [undefined],   "found undefined",
  [42],          "life",
  ["foo"],       "bar",
  ["ha","ha"],   "laugh",
  [3,2,1],       "count down",
  [ALL],         "everything else"
);

p(null)           //"found null"
p(undefined)      //"found undefined"
p(42)             //"life"
p("foo")          //"bar"
p("ha","ha")      //"laugh"
p(3,2,1)          //"count down"
p("jabberwocky")  //"everything else"
```

##Placeholders

Place holders let you ignore certain arguments

```javascript
var p = patternmatch(
  ["beginning",__,"end"], "match"
);

p("beginning","my story","end")           //"match"
p("beginning","their story story","end")  //"match"
```
##Variables

Extract variables out of a pattern

```javascript
var p = patternmatch(
  ["hello", _$_],   (name)=>"goodbye "+name,
  [1, __, _$_],     (x)=>x
);

p("hello","richard")  //"goodbye richard"
p(1,2,3)              //3
```

##Types

```javascript
var add = patternmatch(
  [_$NUMBER_,_$NUMBER_],  (a,b)=>return a+b,
  [_NUMBER_],             Error("Cannot add one number"),
  [ALL],                  Error("Cannot add non numbers")
);

add(1,2)    //3
add(1)      //error: Cannot add one number
add("foo")  //error: Cannot add non number
```

##Arrays

##When

##Extractors
