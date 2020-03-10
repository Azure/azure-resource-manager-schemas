import { expect, assert } from 'chai';
import tv4 from 'tv4';

interface ValidationResult {
    valid: boolean,
    missingSchemas: string[],
    errors: ValidationError[],
}

interface ValidationError {
    message: any,
    dataPath: string,
    schemaPath: string | undefined,
    subErrors: ValidationError[],
}

function logError(message: string) {
    console.log(`ERROR: ${message}`);
}

function getJsonDiffMessage<T>(actual: T, expected: T, messageSuffix: string) {
    // This is a workaround for the DevOps test result analyzer not correctly showing the diff between actual and expected.
    return `\nActual: ${JSON.stringify(actual, null, 2)}\nExpected: ${JSON.stringify(expected, null, 2)}\n${messageSuffix}`;
}

function getErrorMessage(prefix: string, value: string, suffix: string) {
    let errorMessage = prefix;
    if (value === undefined) {
        errorMessage += "n";
    }
    else if (value === "") {
        errorMessage += "n empty";
    }

    if (value !== "") {
        errorMessage += " " + value;
    }
    errorMessage += " " + suffix;

    return errorMessage;
}


function getProperty(propertyPath: string, jsonValue: any) {
    let result = jsonValue;

    const propertyNamesInPath = propertyPath.split("/");
    for (const propertyName of propertyNamesInPath) {
        result = result[propertyName];

        if (result === undefined) {
            throw new Error(`Could not find definition "${propertyPath}".`);
        }
    }

    return result;
}

function resolveSchemaLocalReferences(partialSchemaJson: any, fullSchemaJson: any, currentPath: string, resolvedPaths: {[path: string]: string}): {[path: string]: any} {
    if (partialSchemaJson === fullSchemaJson || !(partialSchemaJson instanceof Object) || !(fullSchemaJson instanceof Object)) {
        return partialSchemaJson;
    }

    if (Array.isArray(partialSchemaJson)) {
        return (partialSchemaJson as Array<any>).map((val, i) => resolveSchemaLocalReferences(val, fullSchemaJson, `${currentPath}/${i}`, resolvedPaths));
    }

    const result: {[path: string]: any} = {};
    for (const key in partialSchemaJson) {
        const value = partialSchemaJson[key];

        if (key === '$ref' && typeof value === 'string' && value.startsWith('#/')) {
            const stringValue = value as string;

            if (resolvedPaths[stringValue] === undefined) {
                resolvedPaths[stringValue] = currentPath;
                const propertyPath = (value as string).substring(2); // Skip the initial "#/"
                const referencedProperty = getProperty(propertyPath, fullSchemaJson);
                return resolveSchemaLocalReferences(referencedProperty, fullSchemaJson, currentPath, resolvedPaths);
            }

            result[key] = resolvedPaths[stringValue];
        } else {
            result[key] = resolveSchemaLocalReferences(value, fullSchemaJson, `${currentPath}/${key}`, resolvedPaths);
        }
    }

    return result;
}

function scopeToPath(schemaPath: string, schema: any) {
    const hashIndex = schemaPath.indexOf('#');

    if (hashIndex === -1) {
        return schema;
    }

    schemaPath = schemaPath.substring(hashIndex + 1);
    if (schemaPath.startsWith('/')) {
        schemaPath = schemaPath.substring(1);
    }

    if (schemaPath.length === 0) {
        return schema;
    }

    return getProperty(schemaPath, schema);
}

function assertErrors(expectedErrors: ValidationError[], actualErrors: ValidationError[], assertSubErrors: boolean, errorPrefix: string) {
    if (!expectedErrors || expectedErrors.length === 0) {
        assert.deepStrictEqual(actualErrors, [], getJsonDiffMessage(actualErrors, [], `Expected result not to contain errors, but found errors.`));
        return;
    }

    if (expectedErrors.length !== actualErrors.length) {
        assert.deepStrictEqual(actualErrors, expectedErrors, getJsonDiffMessage(actualErrors, expectedErrors, `Different number of expected errors (expected ${expectedErrors.length}, found ${actualErrors.length}).`));
        return;
    }

    for (let errorIndex = 0; errorIndex < expectedErrors.length; ++errorIndex) {
        const expectedError = expectedErrors[errorIndex];
        const actualError = actualErrors[errorIndex];

        const errorNumber = `${errorPrefix}${errorIndex + 1}`;

        assert.strictEqual(actualError.message, expectedError.message, getJsonDiffMessage(actualErrors, expectedErrors, `The error message for error ${errorNumber} was not the expected error.`));
        assert.strictEqual(actualError.dataPath, expectedError.dataPath, getJsonDiffMessage(actualErrors, expectedErrors, `The error dataPath for error ${errorNumber} was not the expected dataPath.`));

        // Assert sub errors if the -AssertSubErrors parameter is used and there are expected sub errors
        if (assertSubErrors && expectedError.subErrors && expectedError.subErrors.length > 0) {
            assertErrors(expectedError.subErrors, actualError.subErrors, assertSubErrors, `${errorNumber}.`);
        }
    }
}

async function validate(json: any, schema: any, loadSchema: (uri: string) => Promise<any>): Promise<ValidationResult> {
    if (json === null || json === undefined) {
        logError(getErrorMessage("Cannot validate a", json, "json object."));
        return { valid: false, errors: [{ message: "Invalid JSON", dataPath: '', subErrors: [], schemaPath: '' }], missingSchemas: [] };
    }

    if (!schema) {
        logError(getErrorMessage("Cannot use a", schema, "schema for validation."));
        return { valid: false, errors: [{ message: "Invalid schema", dataPath: '', subErrors: [], schemaPath: '' }], missingSchemas: [] };
    }

    tv4.addSchema(json);
    tv4.addSchema(schema);
    await addMissingSchemas(tv4.getMissingUris(), loadSchema);
    let result = convertTv4ValidationResult(tv4.validateMultiple(json, schema));

    while (result.missingSchemas && result.missingSchemas.length > 0) {
        await addMissingSchemas(result.missingSchemas, loadSchema);
        result = convertTv4ValidationResult(tv4.validateMultiple(json, schema));
    }

    return result;
}

function convertTv4ValidationResult(tv4ValidationResult: tv4.MultiResult): ValidationResult {
    for (const missingSchema of tv4ValidationResult.missing) {
        expect(missingSchema).to.not.equal('', `tv4ValidationResult should not have had any empty missing schemas: ${JSON.stringify(tv4ValidationResult.missing)}`);
    }

    return {
        valid: tv4ValidationResult.valid,
        missingSchemas: tv4ValidationResult.missing,
        errors: tv4ValidationResult.errors.map(cleanValidationErrorProperties),
    };
}

function cleanValidationErrorProperties(error: tv4.ValidationError): ValidationError {
    return {
        message: error.message,
        dataPath: error.dataPath ? error.dataPath : '/',
        schemaPath: error.schemaPath,
        subErrors: error.subErrors ? error.subErrors.map(cleanValidationErrorProperties) : []
    };
}

async function addMissingSchemas(missingUris: string[], loadSchema: (uri: string) => Promise<any>) {
    while (missingUris && missingUris.length > 0) {
        var missingUri = missingUris.pop();
        if (missingUri && missingUri.length > 0) {
            const schema = await loadSchema(missingUri);
            tv4.addSchema(missingUri, schema);

            missingUris = tv4.getMissingUris();
        }
    }
}

export async function execute(test: any, loadSchema: (uri: string) => Promise<any>) {
    const fullSchema = await loadSchema(test.definition);
    let definitionSchema = scopeToPath(test.definition, fullSchema);
    definitionSchema = resolveSchemaLocalReferences(definitionSchema, fullSchema, '#', {});

    const result = await validate(test.json, definitionSchema, loadSchema);

    assertErrors(test.expectedErrors, result.errors, false, '');
}