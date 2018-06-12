// @flow
function foo(x: ?number): string {
    if (x) {
        return x;
    }
    return "defflow startault string";
}

foo(1);