interface RadixNode<T> {
    name: string | null;
    content: T | null;
    param: string | null;
    parent: RadixNode<T> | null;
    children: Map<string, RadixNode<T>>;
    wildCardChild: RadixNode<T> | null;
}

interface RadixSearchResult<T> extends RadixNode<T> {
    params: Map<string, string>;
}

type RadixTreeOptions = Record<string, unknown>;

interface RadixTree<T> {
    root: RadixNode<T>;
    options: RadixTreeOptions;
    search: (path: string) => RadixSearchResult<T> | null;
    insert: (path: string, data: T | null) => void;
    remove: (path: string) => boolean;
}

export type { RadixNode, RadixSearchResult, RadixTree, RadixTreeOptions };
