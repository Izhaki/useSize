import fs from 'fs-extra';
import * as path from 'path';
import glob from 'glob';
import { exe } from 'pliz';

async function removeDist() {
  await fs.remove('dist');
}

function set(object, propPath: string, value) {
  const way = propPath.split('.');
  const last = way.pop();

  way.reduce((o, prop) => (o[prop] = o[prop] || {}), object)[last] = value;
}

function removeExtension(filePath: string): string {
  const { dir, name } = path.parse(filePath);
  return path.join(dir, name);
}

function getPackageJsonDirectory(filePath: string): string {
  const { dir, name } = path.parse(filePath);
  return name === 'index'
    ? dir // Same as the index file path
    : path.join(dir, name); // If not an index file return without extension (x/y.js → x/y)
}

async function getPackageJson(packageJsonPath) {
  try {
    return await fs.readJson(packageJsonPath);
  } catch (err) {
    return {
      sideEffects: false,
    };
  }
}

async function frankBuild(folderName: string, propPaths: string[]) {
  const filePaths = glob.sync(`**/*.js`, { cwd: folderName });

  await Promise.all(
    filePaths.map(async (filePath) => {
      const directory = getPackageJsonDirectory(filePath);
      const packageJsonPath = path.join('dist', directory, 'package.json');
      const packageJson = await getPackageJson(packageJsonPath);

      packageJson.types = path.relative(
        path.join(directory),
        path.join('__types__', `${removeExtension(filePath)}.d.ts`)
      );

      const relative = path.relative(
        path.join('dist', directory),
        path.join(folderName, filePath)
      );

      propPaths.forEach((propPath) => {
        set(packageJson, propPath, relative);
      });

      await fs.outputJson(packageJsonPath, packageJson, { spaces: 2 });
    })
  );
}

function createExportKeyReducer(exports, exportPath) {
  const key = exportPath === '/index' ? '.' : `.${exportPath}`;
  exports[key] = {
    require: `./__cjs__${exportPath}.js`,
    default: `./__modern__${exportPath}.js`,
  };
  return exports;
}

function addExports(distPackageJson) {
  distPackageJson.exports = [
    '/index',
    '/detectors/resizeObserver',
    '/detectors/erd',
    '/regulators',
  ].reduce(createExportKeyReducer, {});
}

function extractDistPackageJson() {
  const { scripts, devDependencies, ...distPackageJson } =
    fs.readJsonSync('package.json');
  return distPackageJson;
}

function saveDistPackageJson(distPackageJson) {
  fs.outputJsonSync(path.join('dist', 'package.json'), distPackageJson, {
    spaces: 2,
  });
}

async function frankDist() {
  const distPackageJson = extractDistPackageJson();
  addExports(distPackageJson);
  saveDistPackageJson(distPackageJson);
}

const extensions = ['.ts'];
const ignore = ['**/types.ts'];

async function buildTarget({ target, packagePropPaths }) {
  process.env.BABEL_ENV = target;
  const outDir = `dist/__${target}__`;

  const babelArgs = [
    'src',
    '--extensions',
    `"${extensions.join(',')}"`,
    '--out-dir',
    outDir,
    '--ignore',
    // Need to put these patterns in quotes otherwise they might be evaluated by the used terminal.
    `"${ignore.join('","')}"`,
  ];
  const command = ['babel', ...babelArgs].join(' ');
  await exe(command);
  await frankBuild(outDir, packagePropPaths);
}

async function generateTypes() {
  await exe('tsc --project tsconfig.build.json --outDir dist/__types__');
}

async function copyToDist(filePath) {
  const distPath = path.join('dist', filePath);
  await fs.copy(filePath, distPath);
  console.log(`Copied ${filePath} to ${distPath}`);
}

async function build() {
  await removeDist();
  await frankDist();

  await generateTypes();

  await buildTarget({
    target: 'esm',
    packagePropPaths: ['module'],
  });

  await buildTarget({
    target: 'cjs',
    packagePropPaths: ['main'],
  });

  await buildTarget({
    target: 'modern',
    packagePropPaths: [],
  });

  await copyToDist('README.md');
  await copyToDist('LICENSE');
}

export default build;
