var utilities = require("./utilities.js");

module.exports.ExpectedActualString = ExpectedActualString;
function ExpectedActualString(expected, actual, message)
{
    return (message ? message : "") + "\nExpected: " + utilities.toString(expected) + "\nActual:   " + utilities.toString(actual);
}

module.exports.Fail = Fail;
function Fail(message)
{
    throw new Error(message);
}

module.exports.True = True;
function True(condition, message)
{
    if(!(condition === true))
    {
        Fail(ExpectedActualString(true, condition, message));
    }
}

module.exports.False = False;
function False(condition, message)
{
    if(!(condition === false))
    {
        Fail(ExpectedActualString(false, condition, message));
    }
}

module.exports.Null = Null;
function Null(value, message)
{
    if(!(value === null))
    {
        Fail(ExpectedActualString(null, value, message));
    }
}

module.exports.NotNull = NotNull;
function NotNull(value, message)
{
    if(!(value !== null))
    {
        Fail(ExpectedActualString("not null", value, message));
    }
}

module.exports.Empty = Empty;
function Empty(value, message)
{
    if(!(value === null || value === undefined || value.length === 0))
    {
        Fail(ExpectedActualString("empty", value, message));
    }
}

module.exports.NotEmpty = NotEmpty;
function NotEmpty(value, message) {
    if (value === null || value === undefined || value.length === 0) {
        Fail(ExpectedActualString("not empty", value, message));
    }
}

module.exports.Equal = Equal;
function Equal(lhs, rhs, message)
{
    if(!utilities.equals(lhs, rhs))
    {
        Fail(ExpectedActualString(lhs, rhs, message));
    }
}

module.exports.Throws = Throws;
function Throws(func, errorValidator)
{
    var threw = true;
    try
    {
        func();
        threw = false;
    }
    catch(e)
    {
        if(errorValidator)
        {
            errorValidator(e);
        }
    }

    if (!threw)
    {
        Fail("Provided function should have thrown.");
    }

}