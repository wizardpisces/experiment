// stringconcat 函数， 满足以下：
var result1 = stringconcat("a", "b");
// result1 = "a+b"
var stringconcatWithPrefix = stringconcat.prefix("hellworld"); // prefix的实现
var result2 = stringconcatWithPrefix("a", "b", "c");
// result2 = "hellworld+a+b+c"

// solution