module.exports.Fail = Fail;
function Fail(message)
{
	throw new Error("FAILURE: " + message);
}

module.exports.True = True;
function True(condition)
{
	if(!(condition === true))
	{
		Fail("Condition \"" + condition + "\" should have been true.");
	}
}

module.exports.False = False;
function False(condition)
{
	if(!(condition === false))
	{
		Fail("Condition \"" + condition + "\" should have been false.");
	}
}

module.exports.Null = Null;
function Null(value)
{
	if(!(value === null))
	{
		Fail("Expected value to be null.");
	}
}

module.exports.NotNull = NotNull;
function NotNull(value)
{
	if(!(value !== null))
	{
		Fail("Expected value to be not null.");
	}
}

module.exports.Empty = Empty;
function Empty(value)
{
	if(!(value === null || value === undefined || value.length === 0))
	{
		Fail("Expected " + value + " to be empty.");
	}
}

module.exports.Equal = Equal;
function Equal(lhs, rhs, message)
{
	if(!(lhs === rhs))
	{
        var errorMessage = "Expected \"" + lhs + "\" to equal \"" + rhs + "\"";
        if(message)
        {
            errorMessage += ": " + message;
        }
        else
        {
            errorMessage += ".";
        }
		Fail(errorMessage);
	}
}

module.exports.Throws = Throws;
function Throws(func, errorValidator)
{
	try
	{
		func();
		Fail("Provided function should have thrown.");
	}
	catch(e)
	{
		if(errorValidator)
		{
			errorValidator(e);
		}
	}
}