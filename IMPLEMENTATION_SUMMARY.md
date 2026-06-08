# @mask Directive Implementation Summary

## Overview
Successfully implemented the `@mask` directive for graphql-js, which applies regex-based string replacement to field values during execution.

## Changes Made

### 1. Directive Definition (`src/type/directives.ts`)
- Added `GraphQLMaskDirective` with:
  - Name: `mask`
  - Locations: `FIELD`
  - Arguments:
    - `regex` (String!, required): The regex pattern to match
    - `replace` (String!, required): The replacement string

### 2. Execution Logic (`src/execution/Executor.ts`)
- Modified `completeLeafValue()` method to:
  - Accept `fieldDetailsList` parameter to access directive information
  - Check for `@mask` directive on the field
  - Apply regex replacement when directive is present and value is a string
  - Import `getDirectiveValues` from `values.ts`
  - Import `GraphQLMaskDirective` from `directives.ts`

### 3. Exports (`src/type/index.ts`)
- Added `GraphQLMaskDirective` to the public exports

### 4. Unit Tests (`src/execution/__tests__/mask-directive-test.ts`)
Comprehensive test suite covering:
- Basic query without @mask directive
- Regex replacement on string fields
- Complex regex patterns
- Variable arguments for @mask
- List fields with @mask
- Non-null fields with @mask
- buildSchema with SDL-defined @mask directive
- Multiple @mask directives on different fields
- Edge cases:
  - Non-matching regex
  - Empty replacement string
  - Special regex characters

## Usage Examples

### Using buildSchema with SDL
```typescript
import { buildSchema } from 'graphql/utilities';
import { executeSync } from 'graphql/execution';
import { parse } from 'graphql/language';

const schema = buildSchema(`
  directive @mask(regex: String!, replace: String!) on FIELD

  type Query {
    name: String
    email: String
    phone: String
  }
`);

const result = executeSync({
  schema,
  document: parse('{ name @mask(regex: " ", replace: "_") }'),
  rootValue: { name: () => 'John Doe' },
});

// Result: { data: { name: 'John_Doe' } }
```

### Masking Sensitive Data
```typescript
// Mask all digits in phone number
const result = executeSync({
  schema,
  document: parse('{ phone @mask(regex: "\\d", replace: "*") }'),
  rootValue: { phone: () => '123-456-7890' },
});

// Result: { data: { phone: '***-***-****' } }
```

### Using Variables
```typescript
const result = executeSync({
  schema,
  document: parse(
    'query ($pattern: String!, $replacement: String!) { ' +
    'name @mask(regex: $pattern, replace: $replacement) }'
  ),
  rootValue: { name: () => 'John Doe' },
  variableValues: { pattern: ' ', replacement: '-' },
});

// Result: { data: { name: 'John-Doe' } }
```

## Implementation Details

### How It Works
1. During field value completion in `completeLeafValue()`, the executor checks for the `@mask` directive
2. If present, it extracts the `regex` and `replace` arguments (supporting both literal values and variables)
3. For string values, it creates a RegExp with the global flag and applies the replacement
4. Non-string values are unaffected
5. The directive only applies to leaf types (scalars and enums)

### Key Design Decisions
- Applied at the leaf completion stage, after type coercion
- Uses global regex flag (`g`) to replace all occurrences
- Only affects string values, other types pass through unchanged
- Integrates seamlessly with existing directive infrastructure
- Follows the same pattern as `@include` and `@skip` directives

## Testing
All tests pass successfully, covering:
- ✓ Basic functionality
- ✓ Multiple use cases
- ✓ Variable support
- ✓ List fields
- ✓ Non-null fields
- ✓ SDL schema definition
- ✓ Edge cases

## Compatibility
- Works with existing graphql-js infrastructure
- Compatible with `buildSchema()` for SDL-first development
- Compatible with programmatic schema construction
- Supports both literal and variable directive arguments
