import { parse } from './src/language/parser.ts';
import { buildSchema } from './src/utilities/buildASTSchema.ts';
import { executeSync } from './src/execution/execute.ts';

const schema = buildSchema(`
  directive @mask(regex: String!, replace: String!) on FIELD

  type Query {
    name: String
    email: String
    phone: String
  }
`);

const rootValue = {
  name: () => 'John Doe',
  email: () => 'john.doe@example.com',
  phone: () => '123-456-7890',
};

console.log('Testing @mask directive...\n');

const test1 = executeSync({
  schema,
  document: parse('{ name @mask(regex: " ", replace: "_") }'),
  rootValue,
});
console.log('Test 1 - Mask spaces with underscores:');
console.log('  Input: "John Doe"');
console.log('  Result:', JSON.stringify(test1));
console.log('  Expected: { data: { name: "John_Doe" } }');
console.log('  Pass:', test1.data?.name === 'John_Doe' ? '✓' : '✗');
console.log();

const test2 = executeSync({
  schema,
  document: parse('{ email }'),
  rootValue,
});
console.log('Test 2 - Without @mask directive:');
console.log('  Input: "john.doe@example.com"');
console.log('  Result:', JSON.stringify(test2));
console.log('  Expected: { data: { email: "john.doe@example.com" } }');
console.log('  Pass:', test2.data?.email === 'john.doe@example.com' ? '✓' : '✗');
console.log();

const test3 = executeSync({
  schema,
  document: parse('{ phone @mask(regex: "\\\\d", replace: "*") }'),
  rootValue,
});
console.log('Test 3 - Mask all digits:');
console.log('  Input: "123-456-7890"');
console.log('  Result:', JSON.stringify(test3));
console.log('  Expected: { data: { phone: "***-***-****" } }');
console.log('  Pass:', test3.data?.phone === '***-***-****' ? '✓' : '✗');
console.log();

const test4 = executeSync({
  schema,
  document: parse('{ name @mask(regex: " ", replace: "_"), email }'),
  rootValue,
});
console.log('Test 4 - Multiple fields, only one with @mask:');
console.log('  Result:', JSON.stringify(test4));
console.log('  Expected: { data: { name: "John_Doe", email: "john.doe@example.com" } }');
console.log('  Pass:', test4.data?.name === 'John_Doe' && test4.data?.email === 'john.doe@example.com' ? '✓' : '✗');
console.log();

console.log('All tests completed!');
