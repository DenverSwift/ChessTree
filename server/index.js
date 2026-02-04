import fs from 'node:fs';
import { createInterface } from 'node:readline/promises';

const readline = createInterface({
    input: process.stdin,
    output: process.stdout
});

async function input(message) {
    const answer = await readline.question(message);
    readline.close();
    return answer;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateId() {
    return Number(getTime().replace(/\D/g, '')).toString(36);
}

function getTime() {
    return new Date()
        .toISOString()
        .replace(/[ZT]/g, (m) => (m === 'T' ? ' ' : ''));
}
// 2026-02-01 07:57:32.528
// yyyy-mm-dd hh:mm:ss:ms
//    date       time

function createEmptyTree(name) {
    let jsonPattern = {
        meta: {
            name: name,
            createdAt: getTime(),
            updatedAt: getTime(),
        },
        nodes: [],
    };
    fs.writeFileSync(`./${name}.json`, JSON.stringify(jsonPattern, null, 2));
    return 0;
}

function addNode(nameTree, parentId, move) {
    let parsedData = JSON.parse(fs.readFileSync(`./${nameTree}.json`))
    let depth;
    const id = generateId();

    if (parentId !== null) {
        const parentNode = parsedData.nodes.find((node) => node.id === parentId);
        depth = parentNode.depth + 1;
        parentNode.childrenIds.push(id);
    } else {
        depth = 1;
    }

    parsedData.nodes.push({
        id: id,
        depth: depth,
        move: move,
        parentId: parentId,
        childrenIds: [],
    });

    let data = JSON.stringify(parsedData, null, 2);
    fs.writeFileSync(`./${nameTree}.json`, data);
}

function editNode(nameTree, id, newMove) {
    let parsedData = JSON.parse(fs.readFileSync(`./${nameTree}.json`))
    const node = parsedData.nodes.find((node) => node.id === id);
    node.move = newMove;

    let data = JSON.stringify(parsedData, null, 2);
    fs.writeFileSync(`./${nameTree}.json`, data);
}

function delNode(nameTree, id) {
    let parsedData = JSON.parse(fs.readFileSync(`./${nameTree}.json`))

    parsedData.nodes = parsedData.nodes.filter((node) => node.id !== id)

    let data = JSON.stringify(parsedData, null, 2);
    fs.writeFileSync(`./${nameTree}.json`, data);
}

function deleteBranch(nameTree, targetId) { //удаление ветки
    let parsedData = JSON.parse(fs.readFileSync(`./${nameTree}.json`))

    function performDelete(nodes, id) {
        const node = nodes.find(n => n.id === id);
        if (!node) return;

        if (node.childrenIds && node.childrenIds.length > 0) {
            node.childrenIds.forEach(childId => {
                performDelete(nodes, childId);
            });
        }

        const index = nodes.findIndex(n => n.id === id);
        if (index !== -1) {
            nodes.splice(index, 1);
        }
    }

    performDelete(parsedData.nodes, targetId);

    let data = JSON.stringify(parsedData, null, 2);
    fs.writeFileSync(`./${nameTree}.json`, data);
}

async function resolveDeleteMethod(nameTree, id) {
    let parsedData = JSON.parse(fs.readFileSync(`./${nameTree}.json`))
    const node = parsedData.nodes.find((node) => node.id === id);

    if (node.childrenIds.length === 0) {
        delNode(nameTree, id);
    } else {
        const wipeMode = await input("removeBranch/resetNode? ")

        if (wipeMode === "removeBranch") {
            deleteBranch(nameTree, id);
        } else if (wipeMode === "resetNode") {
            editNode(nameTree, id, "");
        }
    }
}
