import { cp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { spawn } from 'node:child_process';
const root = process.cwd();
const staging = resolve(root, '.pages-build', 'app');
if (!staging.startsWith(root + sep)) throw new Error('Build staging must be inside workspace.');
await rm(staging, { recursive: true, force: true });
await mkdir(staging, { recursive: true });
for (const file of ['package.json', 'package-lock.json', 'tsconfig.json', 'next.config.ts'])
  await cp(resolve(root, file), resolve(staging, file));
await cp(resolve(root, 'src'), resolve(staging, 'src'), {
  recursive: true,
  filter: (source) =>
    !relative(resolve(root, 'src'), source).split(sep).join('/').startsWith('app/api'),
});
await symlink(
  resolve(root, 'node_modules'),
  resolve(staging, 'node_modules'),
  process.platform === 'win32' ? 'junction' : 'dir',
);
const child = spawn(
  process.execPath,
  [resolve(root, 'node_modules/next/dist/bin/next'), 'build', '--webpack'],
  {
    cwd: staging,
    stdio: 'inherit',
    env: {
      ...process.env,
      FLOODROUTE_STATIC_EXPORT: '1',
      NEXT_PUBLIC_STATIC_DEMO: '1',
      FLOODROUTE_BUILD_DIR: '.next',
      GITHUB_PAGES_BASE_PATH: process.env.GITHUB_PAGES_BASE_PATH || '/FloodRoute',
    },
  },
);
const code = await new Promise((resolve, reject) => {
  child.on('error', reject);
  child.on('exit', resolve);
});
if (code !== 0) process.exit(Number(code) || 1);
await writeFile(resolve(staging, 'out', '.nojekyll'), '');
console.log('Static Pages artifact: ' + resolve(staging, 'out'));
