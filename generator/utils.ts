import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import chalk from 'chalk';
import { series } from 'async';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);
const exists = promisify(fs.exists);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);


function executeCmd(cwd: string, cmd: string, args: string[]) : Promise<number> {
    return new Promise((resolve, reject) => {
        console.log(`[${cwd}] executing: ${cmd} ${args.join(' ')}`);

        const child = spawn(cmd, args, {
            cwd: cwd,
            windowsHide: true,
        });

        child.stdout.on('data', data => process.stdout.write(chalk.grey(data.toString())));
        child.stderr.on('data', data => process.stdout.write(chalk.red(data.toString())));
        child.on('error', err => {
            reject(err);
        });
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
    if (!await exists(basePath)) {
        return;
    }

    for (const subPathName of await readdir(basePath)) {
        const subPath = path.resolve(`${basePath}/${subPathName}`);

        const fileStat = await stat(subPath);
        if (fileStat.isDirectory()) {
            await rmdirRecursive(subPath);
            continue;
        }

        if (fileStat.isFile()) {
            await unlink(subPath);
            continue;
        }
    }

    await rmdir(basePath);
}

function lowerCaseCompare(a: string, b: string) {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();

    if (aLower === bLower) {
        return 0;
    }

    return aLower < bLower ? -1 : 1;
}

function lowerCaseStartsWith(a: string, b: string) {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();

    return aLower.startsWith(bLower);
}

function lowerCaseCompareLists(listA: string[], listB: string[]) {
    for (let i = 0; i < listA.length; i++) {
        if (listB.length < i + 1) {
            return -1;
        }

        const compareResult = lowerCaseCompare(listA[i], listB[i]);

        if (compareResult !== 0) {
            return compareResult;
        }
    }

    if (listB.length > listA.length) {
        return 1;
    }

    return 0;
}

async function readJsonFile(filePath: string) {    
    const rawContents = await readFile(filePath, { encoding: 'utf8' });

    return JSON.parse(rawContents);
}

async function writeJsonFile(filePath: string, json: any) {
    const rawContents = JSON.stringify(json, null, 2);

    await writeFile(filePath, rawContents, { encoding: 'utf8' });
}

async function safeMkdir(filePath: string) {
    if (!await exists(filePath)) {
        await mkdir(filePath, { recursive: true });
    }
}

async function safeUnlink(filePath: string) {
    if (await exists(filePath)) {
        await unlink(filePath);
    }
}

async function fileExists(filePath: string) {
    return await exists(filePath);
}

function executeSynchronous<T>(asyncFunc: () => Promise<T>) {
    series(
        [asyncFunc],
        (error, _) => {
            if (error) {
                throw error;
            }
        });
}

function chunker<T>(input: T[], chunks: number): T[][] {
    const minChunkSize = Math.floor(input.length / chunks);
    let remainder = input.length - (minChunkSize * chunks);

    let position = 0;
    const output = [];
    for (let i = 0; i < chunks; i++) {
        let chunkSize = minChunkSize;
        if (remainder > 0) {
            remainder--;
            chunkSize++;
        }
        
        const chunk = input.slice(position, position + chunkSize);
        output.push(chunk);
        position += chunkSize;
    }

    return output;
}

export {
    executeCmd,
    findDirRecursive,
    findRecursive,
    rmdirRecursive,
    lowerCaseCompare,
    lowerCaseStartsWith,
    lowerCaseCompareLists,
    readJsonFile,
    writeJsonFile,
    safeMkdir,
    safeUnlink,
    fileExists,
    executeSynchronous,
    chunker,
}