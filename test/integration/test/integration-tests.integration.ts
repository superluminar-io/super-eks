import { execSync } from 'child_process';

beforeAll(() => {
  execSync('npx cdk deploy --require-approval never', {
    encoding: 'utf8',
    stdio: 'inherit',
  });
});

afterAll(() => {
  execSync('npx cdk destroy', {
    encoding: 'utf8',
    stdio: 'inherit',
  });
});

test('Empty Stack', () => {
  fail;
});
