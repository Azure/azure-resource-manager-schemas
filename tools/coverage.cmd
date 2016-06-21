call %~dp0\node_modules\.bin\istanbul cover --root %~dp0 --dir %~dp0\js-coverage %~dp0\node_modules\mocha\bin\_mocha -- --ui tdd
start %~dp0\js-coverage\lcov-report\index.html