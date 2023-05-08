import type { RadixNode, RadixSearchResult, RadixTree, RadixTreeOptions } from "./types";

const createRadixTree = <T>(options: RadixTreeOptions = {}): RadixTree<T> => {
    const root: RadixNode<T> = {
        name: "",
        content: null,
        param: null,
        parent: null,
        children: new Map(),
        wildCardChild: null,
    };
    return {
        root,
        options,
        search: (path: string): RadixSearchResult<T> | null => {
            return search(root, path);
        },
        insert: (path: string, data: T): void => {
            insert(root, path, data);
        },
        remove: (path: string): boolean => {
            return remove(root, path);
        },
    };
};

const search = <T>(rootNode: RadixNode<T>, path: string): RadixSearchResult<T> | null => {
    const paths = parsePaths(path);
    let currentNode = rootNode;
    const params = new Map<string, string>();
    for (const path of paths) {
        const node = currentNode.children.get(path);
        if (node) {
            currentNode = node;
        } else {
            if (currentNode.wildCardChild) {
                currentNode = currentNode.wildCardChild;
                if (currentNode.param) {
                    params.set(currentNode.param, path);
                }
            } else {
                return null;
            }
        }
    }
    return {
        ...currentNode,
        params,
    };
};

const insert = <T>(rootNode: RadixNode<T>, path: string, data: T): void => {
    const paths = parsePaths(path);
    let currentNode: RadixNode<T> = rootNode;
    for (const path of paths) {
        const node = currentNode.children.get(path);
        if (node) {
            currentNode = node;
        } else {
            const newNode: RadixNode<T> = {
                name: path,
                content: null,
                param: null,
                parent: currentNode,
                children: new Map(),
                wildCardChild: null,
            };
            // all wildcard node are treated as the same, and later inserted nodes will override the previous one
            if (path === "*" || path.startsWith(":")) {
                if (path.startsWith(":")) {
                    newNode.param = path.slice(1);
                }
                newNode.name = "*";
                currentNode.wildCardChild = newNode;
            } else {
                currentNode.children.set(path, newNode);
            }
            currentNode = newNode;
        }
    }
    currentNode.content = data;
};

const remove = <T>(rootNode: RadixNode<T>, path: string): boolean => {
    const paths = parsePaths(path);
    let currentNode = rootNode;
    for (const path of paths) {
        const node = currentNode.children.get(path);
        if (!node) {
            if ((path === "*" || path.startsWith(":")) && currentNode.wildCardChild) {
                currentNode = currentNode.wildCardChild;
            } else {
                return false;
            }
        } else {
            currentNode = node;
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    currentNode.parent?.children.delete(paths[paths.length - 1]!);
    return true;
};

const parsePaths = (path: string): string[] => {
    // remove leading and trailing slashes
    if (path.startsWith("/")) {
        path = path.slice(1);
    }
    if (path.endsWith("/")) {
        path = path.slice(0, -1);
    }

    // split and remove empty paths
    const paths = path.split("/").filter((path) => {
        return path !== "";
    });

    // if no path is given, set to only contains root path
    if (paths.length === 0) {
        paths.push("");
    }
    return paths;
};

export { createRadixTree };
