# patternmatch.js
A pattern matching library inspired from functional programming in native javascript.

# What is pattern matching?

# Patterns

Let's look at some cool stuff we can pattern match!

##Literals
```javascript
var {pattern,match} = require("patternmatch");
var [_$_,__,ALL,ARRAY] = [pattern.var,pattern.any,pattern.all,pattern.array];

var p = match(
  pattern(null),        ()=>"found null",
  pattern(undefined),   ()=>"found undefined",
  pattern(42),          ()=>"life",
  pattern("foo"),       ()=>"bar",
  pattern("ha","ha"),   ()=>"laugh",
  pattern(ALL),         ()=>"everything else"
);

p(null)           //"found null"
p(undefined)      //"found undefined"
p(42)             //"life"
p("foo")          //"bar"
p("ha","ha")      //"laugh"
p("jabberwocky")  //"everything else"
```

##Placeholders

Place holders let you ignore certain arguments

```javascript
var p = match(
  pattern("beginning",__,"end"), ()=>"match"
);

p("beginning","my story","end")           //"match"
p("beginning","their story story","end")  //"match"
```
##Variables

Extract variables out of a pattern

```javascript
var p = match(
  pattern("hello",_$_), (name)=>"goodbye "+name,
  pattern(1,__,_$_),    (x)=>x
);

p("hello","richard")  //"goodbye richard"
p(1,2,3)              //3
```
