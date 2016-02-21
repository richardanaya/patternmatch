# patternmatch.js
A pattern matching library in native javascript. This library is inspired from F# and other macro pattern matching libraries with functional programming in mind.  Particularly, I wanted to take advantage of new ES6 language structures to really create precise pattern matching expressions. Let's take a simple example of fibonacci:

![fibonacci equation](http://www.rapidtables.com/math/number/fibonacci/Fibonacci%20sequence.GIF)

We could write this in javascript as follows

```javascript 
function fibonacci(x){
  if(x==0){
    return 0;
  }
  else if(x==1){
    return 1;
  }
  else {
    return fibonacci(n-1) + fibonacci(n-2)
  }
}
```

Even written like this, which may be totally suitable, there's alot of conditions that start requiring alot of code, testing x is a number, testing its not less than zero. Wouldn't it be nice to write this more concisely and accurately! 

```javascript 
var fibonacci = patternmatch(
  [0],                       0,
  [1],                       1,
  [_$NUMBER_.when(x=>x>1)],  (x)=>fibonacci(x-1)+fibonacci(x-2),
  [ALL],                     Error("Not valid input!")
)
```

Looks much more like the algebraic form and much nicer than remembering to write this:

```javascript 
function fibonacci(x){
  if(typeof x != "number" || arguments.length > 1 || x<0){
    throw Error("Not valid input!")
  }
  if(x==0){
    return 0;
  }
  else if(x==1){
    return 1;
  }
  else {
    return fibonacci(n-1) + fibonacci(n-2)
  }
}
```

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

Get variables out of a pattern

```javascript
var p = patternmatch(
  ["hello", _$_],   (name)=>"goodbye "+name,
  [1, __, _$_],     (x)=>x
);

p("hello","richard")  //"goodbye richard"
p(1,2,3)              //3
```

##Types

Use type specific symbols (```_NUMBER_,_BOOL_,_STRING_```) to match based on type

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
##Partial matching

Match only parts of a pattern with ```_REST_```

```javascript
var p = patternmatch(
  [1,_REST_],   "starts with one",
  [_REST_,3],   "ends with 3",
  [5,_REST_,5], "starts and ends with 5"
);

p(1,2)    //"starts with one"
p(1,2,3)    //"starts with one"
p(3,3,3,3)    //"ends with 3"
p(5,5)  //"starts and ends with 5"
p(5,5,5,5)  //"starts and ends with 5"
```

##Arrays
Match within arrays too

```javascript
var process = patternmatch(
  ["command",$ARRAY("move",_REST_)],  (cmd)=>"move command"+cmd[1],
  ["command",ARRAY("jump")],          "jump command"
);

process("command",["move","left"])    //"move command left"
process("command",["move","right"])    //"move command right"
process("command",["jump"])    //"jump command"
```

##When
Add your own conditions

```javascript
var setTemperature = patternmatch(
  [_NUMBER_.when((x)=>x>72),  "too hot",
  [_NUMBER_.when((x)=>x<72),  "too cold",
  [72],                       "just right"
  [ALL],                      Error("Uhh.. consult the manual")
);

setTemperature(80) //"too hot"
setTemperature(60) //"too cold"
setTemperature(72) //"just right"
```

##Extractors
Handle complex object types by extracting out values so they can easily be matched as if they were arrays

```javascript
var POINT = extractor(function(pt){
  return [pt.x,pt.y];
});
var isOrigin = patternmatch(
  [POINT(0,0)],                                              "you found the origin!",
  [POINT(0,0).when(p=>Math.abs(p[0])<1&&Math.abs(p[1])<1)],  "You're so close!",
  [ALL],                                                     "not the origin"
);

isOrigin({x:0,y:0}) //"you found the origin!"
isOrigin({x:0.5,y:0.5}) //"You're so close!"
isOrigin({x:10,y:10}) //"not the origin"
```
