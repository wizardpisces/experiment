翻译题：

The vm module enables compiling and running code within V8 Virtual Machine contexts. The vm module is not a security mechanism. Do not use it to run untrusted code.

JavaScript code can be compiled and run immediately or compiled, saved, and run later.

A common use case is to run the code in a different V8 Context. This means invoked code has a different global object than the invoking code.

One can provide the context by contextifying an object. The invoked code treats any property in the context like a global variable. Any changes to global variables caused by the invoked code are reflected in the context object.