Object-oriented inheritance in JavaScript
=========================================

Used to traditional object-oriented languages, I found JavaScript's
prototype-based inheritance confusing. Also I hated to repeatedly type
the four-step JavaScript procedure for inheritance. We have computers
for this! So I wrote this small utility function, which derives a
subclass in one step and avoids polluting the *prototype* with
instance variables of the parent class.


Usage
-----

This module consists of one class *BaseClass*, the root of an
object-oriented inheritance tree, which has one method extend().  This
method extend() is used to derive a subclass from a parent class. It
is used like

	subclass = parentclass.extend(ctor, prot);

with *ctor* the constructor function and *prot* an object containing
the prototype definitions (methods in object oriented language). Both
arguments can be specified inline, as in example 1 below.



Inheriting from unrelated classes
---------------------------------

The method extend() can also be used as a free function to derive from
an unrelated class. The call has the form

	subclass = BaseClass.extend.call(parentclass, ctor, prot);

where *BaseClass* is the global *BaseClass* object and *parentclass*
is the parent class from which the subclass is to be derived.  If the
parent class is *null*, the *prototype* property of the constructor is
initialized to an object with no further prototype chain. The object
instances of the subclass will inherit only the properties explicitly
specified through argument *prot*, and no parent class properties are
inherited, even not the properties of Object.  See example 2.



Omitting argument *ctor*
------------------------

If argument *ctor* is omitted and only the prototype object *prot* is
specified, extend() looks for method `__construct` in *prot*. If
`prot.__construct` is defined, it is used as the constructor
function. If it is not defined, extend() builds a constructor function
that passes all arguments through to the constructor of the parent
class.

Specifying the constructor function inside *prot* can be useful
e.g. to implement private class variables.

In JavaScript there are no private and protected members. A limited
form of private class variables can be achieved through the revealing
module pattern. The private class variables are essentially enclosed
in a function closure.  And if the constructor shall have access to
the private variables, it must be defined together with the other
methods.  See example 3.


A virtual constructor
---------------------

Note that the *prototype* property is attached to the same function
that is passed as argument *ctor* or as `prot.__construct`. Do not use
the same constructor function for two subclasses! In the second call
to extend(), the *protoype* property would be overwritten.

If you want to be able to create multiple subclasses with the same
constructor function, just let extend() build a constructor function
(only pass the *prot* argument and don't define `prot.__construct`).
Define a virtual constructor function `prot.__vconstruct` instead. The
constructor function built by extend() will then call this function
instead of the parent class constructor. Your `prot.__vconstruct` will
be called with:

-   the constructor function built by extend() as the first argument,
-   the parent class constructor as the second argument,
-   and then all the other arguments.

It is the responsibility of `__vconstruct()` to call the parent
constructor if necessary, like in this example where all arguments are
passed unmodified to the parent constructor:

	__vconstruct: function(ctor, parent, arg1) {
	    parent.apply(this, Array.prototype.slice.call(arguments, 2));
	    // ... More work to do for __vconstruct()?
	}

See example 4. Note that `__vconstruct()` can inspect the *prototype*
property of the function objects *ctor* and *parent* to find out more
about them.


The prototype object *prot*
---------------------------

The second argument *prot* passed to extend() (or the only argument if
the constructor function is omitted) is the prototype object. It
contains methods adding the behaviour for the subclass. These methods
can extend the parent class or override methods of the parent
class. "Static" or class constants should also be specified in the
prototype object *prot*.

The following properties have a special significance:

-   `constructor` is a standard property of JavaScript. It is
    automatically added by extend() and points to the constructor
    function @a ctor of the subclass.
-   `__construct()` is called as a constructor if it is present and
    no *ctor* argument has been passed to extend().
-   `__vconstruct()` is called if a) it is defined, b) the *ctor*
    argument of extend() has been omitted, and c) no
    `prot.__construct()` is defined.


Implement private members as variables of the constructor function
------------------------------------------------------------------

In JavaScript there are no private and protected members. A limited
form of private instance members can be achieved if these are defined
as variables inside the constructor function. These variables can only
be accessed by privileged methods which are created inside the
constructor.

For a good description see
http://javascript.crockford.com/private.html .  See example 5.


Mixing the two models
---------------------

This implementation of the object-oriented model directly uses the
mechanisms of the JavaScript prototype based inheritance model. Both
can be freely mixed.  Example 2 below shows how to inherit from an
unrelated JavaScript *parentclass*, and going in the other direction
is even simpler.


Examples
========


Example 1: Hierarchical inheritance
-----------------------------------

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

var Cat = BaseClass.extend(	// Derive subclass Cat from BaseClass
    function Cat(name) {	// The constructor ctor for Cat:
	this.name = name ? name : "Cat"; // An instance variable
    },
    {				// Here comes the prototype prot for Cat:
	sound: "meow",		// A class (static) constant

	say: function () {	// A method
	    alert(this.name + " makes " + this.sound);
	},

 	hunt: function () {	// Another method
	    alert(this.name + " catches mice");
	}
    }
);

var Tiger = Cat.extend(		// Derive subclass Tiger from parent class Cat
    function Tiger(name) {	// The constructor ctor for Tiger:
	Cat.call(this, name ? name : "Tiger"); // Call parent class constructor
    },
    {				// Here comes the prototype prot for Tiger:
	sound: "grooarrr",	// This class constant overrides sound from Cat

	hunt: function (prey) {	// Overrides hunt() from Cat. Inherit say() from Cat
	    alert(this.name + " hunts " + (prey ? prey : "sheep"));
	}
    }
);

var miezi = new Cat("Miezi");
var tiger = new Tiger;
var balthazar = new Tiger("Balthazar");

miezi.say();			// Alert "Miezi makes meow"
tiger.say();			// Alert "Tiger makes grooarrr"
balthazar.say();		// Alert "Balthazar makes grooarrr"
balthazar.hunt("deer");		// Alert "Balthazar hunts deer"

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Class *Cat* is derived from global BaseClass, *Tiger* from
*Cat*. Constructor and Prototype definition are specified inline. Note
that inside the braces around the prototype definition, commas must
separate the declarations, but no comma is allowed after the last
declaration.

Class *Cat* has no parent class that needs to initialize anything, it
doesn't need to call the constructor of the parent class. Class
*Tiger* calls the constructor of class *Cat*. Note that it uses the
plain name of class *Cat*, as there is no such thing as *super* or
*parent*.



Example 2: Deriving from unrelated JavaScript classes
-----------------------------------------------------

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~{.js}

var C_BaseClass = BaseClass.extend(function(){}, {});
var C_Object = BaseClass.extend.call(Object, function(){}, {});
var C_null = BaseClass.extend.call(null, function(){}, {});

var o_BaseClass = new C_BaseClass;
var o_Object = new C_Object;
var o_null = new C_null;

alert(""+o_BaseClass);	// Alert "[object Object]"
//alert(""+o_null);	// Would crash, does not inherit Object.prototype.toString

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Class *C_BaseClass* is a normal subclass of *BaseClass*. Class
*C_Object* is a subclass of Object, a sibling of *BaseClass*. Class
*C_null* does not inherit anything, even not the standard method
*Object.prototype.toString*.



Example 3: Using private class variables, the revealing module pattern
----------------------------------------------------------------------

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~{.js}

var CountUp = BaseClass.extend( (function () {
    var counter = 0;		// Private class (static) variable
    function add(i) { counter += i > 0 ? i : 1; } // Private class (static) function
    function __construct(j) { this.ivar = j; add(j); }
    function increment() { add(this.ivar); }
    function get() { return counter; }

    return {	// Export three public functions to be accessible through CountUp
	__construct: __construct,
	increment: increment,
	get: get
    };
})() );

var o1 = new CountUp(3);	// Sets o1.ivar to 3, add to counter -> 3
var o2 = new CountUp(10);	// Sets o2.ivar to 10, add to counter -> 13
o1.increment();			// Add o1.ivar to counter -> 16
o2.increment();			// Add o2.ivar to counter -> 26

alert("counter = " + o1.get());	// Alert "counter = 26"

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

If the constructor shall have access to the private class variables,
it must be defined together with the other methods. The constructor
and all the methods are defined inside the body of an anonymous
function. The function is immediately called and the result of this
function call is the only argument to extend(). This result is the
object passed to the *return* instruction of the anonymous function,
and extend() uses it as the prototype argument *prot*. Even after the
anonymous function has returned, the functions defined inside it have
still access to the private variables of the anonymous function. Note
that function add() is not exported, but can still be called by its
sibling methods.

Since function add() makes sure to add only positive increments to
*counter*, and access to the private class variable *counter* is only
possible through the three exported functions, there is now no way to
make the class-wide *counter* count down again.



Example 4: Using a virtual constructor `__vconstruct`
-----------------------------------------------------

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~{.js}

var C1 = BaseClass.extend(function C1(arg) {
    alert("C1 constructor called with " + arg); },
    {}
);

var C2 = C1.extend({
    __vconstruct: function(ctor, parent, arg) {
	alert("__construct called with ctor = " + ctor
              + ", parent = " + parent + ", arg = " + arg);
	parent.apply(this, Array.prototype.slice.call(arguments, 2));
    }
});

o1 = C2(5); // Alert "__construct called with ctor = function () { ... },
//	    //        parent = function C1(arg) { ... }, arg = 5"
//	    // Alert "C1 constructor called with 5"

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Class *C1* is defined in a normal way with constructor. Class *C2* is
derived from *C1*, and neither is a constructor function passed to
extend() as the first argument, nor is `prot.__construct()`
defined. Method extend() builds a constructor, and because a virtual
constructor `prot.__vconstruct()` is defined, it is called with the
two additional first arguments *ctor* and *parent*. The virtual
constructor `__vconstruct() calls the parent class constructor,
stripping off the first two arguments and passing all other arguments
unmodified to the parent class constructor.


Example 5: Private instance variables
-------------------------------------

JavaScript has nor private members. Implement private member variables
as variables inside the constructor function. They can be accessed
only by privileged functions, which are created by the constructor.

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~{.js}

var CountDown = BaseClass.extend(function (start, step) {
    var that = this;		// Save 'this' for functions called without object (sub() below)
    var counter = start ? start : 100; // A private member variable
    this.step = step ? step : 1; // A public member variable
    function sub(i) {		// A private function
	 counter -= that.step > 0 ? that.step : 1; // Function add() is called without object,
    }				// can not use 'this' to access public member variables.
    this.get = function () {	// A privileged method with access to private variables.
	return counter;		// It can access public (through this) and private members.
    };
    this.countdown = function () { // Privileged methods must be created inside the constructor.
	sub();			   // Function sub() is not exported, must be called without object
    };				   // (there is no this.sub()).
}, {
    print: function () {	// A nonprivileged method.
	alert(this.get());	// It can access private variables only through privileged methods.
    }
});

var o1 = new CountDown;		// Use default values start 100, step 1
o1.countdown();			// 99
o1.countdown();			// 98
o1.step = 5;
o1.countdown();			// 93

var o2 = new CountDown(10, 2);	// Start 10, step 2

o2.countdown();			// 8
o2.countdown();			// 6

o1.print();			// Alert "93"
o2.print();			// Alert "6"

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The constructor defines the private variable *counter*, a private
function `sub()` and two privileged accessor functions `this.get()`
and `this.countdown()`. After the constructor has returned, only these
functions defined inside the constructor can continue to access the
private variable *counter*. Since function `sub()` makes sure only to
count down, there is now no way to make the counter go up again. Note
that `sub()` is not exported as `this.sub()` and can only be called as
a free standing function. For that reason there is no *this* available
in `sub()`. But `sub()` can access all variables of the constructor,
and the constructor has saved its *this* variable in a private
variable *that*. Function `sub()` can now access public member
variables through *that*.

Copyright	2012 Rüdiger Helsch

License		Feel free to take what you want and use it how you see fit.

$Revision: 1.4 $

$Date: 2012-04-12 21:20:57 $
