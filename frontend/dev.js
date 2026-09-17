process.env.NODE_OPTIONS = '';
const { spawn } = require('child_process');

const child = spawn(process.execPath, ['./node_modules/next/dist/bin/next', 'dev'], {
  stdio: 'inherit',
  shell: false
});

child.on('exit', code => process.exit(code || 0));
child.on('error', err => {
  console.error(err);
  process.exit(1);
});
