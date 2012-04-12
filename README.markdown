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

This module consists of one class BaseClass, the root of an
object-oriented inheritance tree, which has one method extend().  This
method extend() is used to derive a subclass from a parent class. It
is used like

	subclass = parentclass.extend(ctor, prot);

with *ctor* the constructor function and *prot* an object
containing the prototype definitions (methods in object oriented
language). Both arguments can be specified inline, as in
example 1 below.




Examples
========


Example 1: hierarchical inheritance
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

Class *Cat* is derived from global #BaseClass, *Tiger* from
*Cat*. Constructor and Prototype definition are specified inline. Note
that inside the braces around the prototype definition, commas must
separate the declarations, but no comma is allowed after the last
declaration.

Class *Cat* has no parent class that needs to initialize anything, it
doesn't need to call the constructor of the parent class. Class
*Tiger* calls the constructor of class *Cat*. Note that it uses the
plain name of class *Cat*, as there is no such thing as *super* or
*parent*.
 