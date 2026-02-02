import fs from 'fs';

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateId() {
    return Number(getTime().replace(/\D/g, '')).toString(36);
}

function getTime() {
    return new Date()
        .toISOString()
        .replace(/Z|T/g, (m) => (m === 'T' ? ' ' : ''));
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
        nodes: [
            {
                id: generateId(),
                depth: 0,
                move: null,
                parentId: null,
                childrenIds: [],
            },
        ],
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

delNode('test', '5jhn3xl4ols')