const basePath = process.argv[2];
require("child_process").execSync(`npm install --prefix generator`, {stdio: 'inherit'});
require("child_process").execSync(`npm run postprocessor ${basePath} --prefix generator`, {stdio: 'inherit'});
require("child_process").execSync(`npm install --prefix tools`, {stdio: 'inherit'});
require("child_process").execSync(`npm run test --prefix tools`, {stdio: 'inherit'});
