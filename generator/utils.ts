import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import chalk from 'chalk';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const rmdir = promisify(fs.rmdir);

function executeCmd(cwd: string, cmd: string, args: string[]) : Promise<number> {
    return new Promise((resolve, reject) => {
        console.log(`Running: ${cmd} ${args.join(' ')}`);

        const child = spawn(cmd, args, {
            cwd: cwd,
            windowsHide: true,
        });

        child.stdout.on('data', data => process.stdout.write(chalk.grey(data.toString())));
        child.stderr.on('data', data => process.stdout.write(chalk.grey(data.toString())));
        child.on('exit', code => {
            if (code !== 0) {
                reject(`Exited with code ${code}`);
            }
            resolve(code ? code : 0);
        });
    });
}

async function findDirRecursive(basePath: string, filter: (name: string) => boolean): Promise<string[]> {
    let results: string[] = [];

    for (const subPathName of await readdir(basePath)) {
        const subPath = path.resolve(`${basePath}/${subPathName}`);

        const fileStat = await stat(subPath);
        if (!fileStat.isDirectory()) {
            continue;
        }

        if (filter(subPath)) {
            results.push(subPath)
        }

        const pathResults = await findDirRecursive(subPath, filter);
        results = results.concat(pathResults);
    }

    return results;
}

async function findRecursive(basePath: string, filter: (name: string) => boolean): Promise<string[]> {
    let results: string[] = [];

    for (const subPathName of await readdir(basePath)) {
        const subPath = path.resolve(`${basePath}/${subPathName}`);

        const fileStat = await stat(subPath);
        if (fileStat.isDirectory()) {
            const pathResults = await findRecursive(subPath, filter);
            results = results.concat(pathResults);
            continue;
        }

        if (!fileStat.isFile()) {
            continue;
        }

        if (!filter(subPath)) {
            continue;
        }

        results.push(subPath);
    }

    return results;
}

async function rmdirRecursive(basePath: string) {
    for (const subPathName of await readdir(basePath)) {
        const subPath = path.resolve(`${basePath}/${subPathName}`);

        const fileStat = await stat(subPath);
        if (fileStat.isDirectory()) {
            await rmdirRecursive(subPath);
            continue;
        }

        if (fileStat.isFile()) {
            continue;
        }

        await rmdir(subPath);
    }
}

export {
    executeCmd,
    findDirRecursive,
    findRecursive,
    rmdirRecursive,
}