/** @file baseclass.js
 *
 * @copyright	2012 Ruediger Helsch
 * @license	Feel free to take what you want and use it how you see fit.
 * $Revision: 1.7 $
 * $Date: 2012-04-10 20:35:34 $
 */
"use strict";

if (!Object.create) {		   // Available since ECMAScript fifth edition
    Object.create = function (o) { // Provide Object.create if it's missing
        function C() {}
        C.prototype = o;
        return new C;
    };
}

/** @class BaseClass */
var BaseClass = (function () {
    /**
     * Derives a subclass from a parent class.
     * @param Function ctor (optional) the constructor function
     * @param Object prot an Object containing the prototype definition
     * @return Class the subclass
     */
    function extend(ctor, prot) {
	if (typeof(ctor) == "object" && ctor) { // Argument ctor missing, only prot
	    prot = ctor;
	    ctor = prot.__construct;
	}
	if (!ctor) {
	    var parent = this; // Remember parent in closure
	    ctor =
		!this
		    ? function () {}
		: !prot || !prot.__vconstruct
		    ? function () { parent.apply(this, arguments); }
		: function () {
		    var args =  Array.prototype.slice.call(arguments, 0);
		    args.unshift(ctor, parent); // Prepend own class and parent class to arguments
		    ctor.prototype.__vconstruct.apply(this, args);
		};
	}
	ctor.prototype = Object.create(this ? this.prototype : null);
	if (prot)
	    for (var n in prot)
		if (prot.hasOwnProperty(n) && n != "__construct")
		    ctor.prototype[n] = prot[n];
	ctor.prototype.constructor = ctor;
	ctor.extend = extend;
	return ctor;
    }

    return extend.call(Object, function BaseClass(){});
})();
