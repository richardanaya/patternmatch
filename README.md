# patternmatch.js
A pattern matching library inspired from functional programming in native javascript.

# What is pattern matching?

# Patterns

Let's look at some cool stuff we can pattern match!

##Literals
```javascript
var {pattern,match} = require("patternmatch");
var [_$_,__,ALL,ARRAY] = [match.var,match.any,match.all,match.array];

var p = pattern(
  match(null),        ()=>"found null",
  match(undefined),   ()=>"found undefined",
  match(42),          ()=>"life",
  match("foo"),       ()=>"bar",
  match("ha","ha"),   ()=>"laugh",
  match(ALL),         ()=>"everything else"
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
var p = pattern(
  match("beginning",__,"end"), ()=>"match"
);

p("beginning","my story","end")           //"match"
p("beginning","their story story","end")  //"match"
```
##Variables

Extract variables out of a pattern

```javascript
var p = pattern(
  match("hello",_$_), (name)=>"goodbye "+name,
  match(1,__,_$_),    (x)=>x
);

p("hello","richard")  //"goodbye richard"
p(1,2,3)              //3
```
