interface RadixNode<T> {
    /**
     * The name of the node.\
     * If the node is a wildcard node, its name is always "*".
     * If defined begin with `:`, the actual name will be set to `param`.
     */
    name: string | null;
    content: T | null;
    /**
     * The name of the wildcard parameter.
     * @example
     * "/user/*" => param: null
     * "/user/:id" => param: "id"
     */
    param: string | null;
    parent: RadixNode<T> | null;
    children: Map<string, RadixNode<T>>;
    wildCardChild: RadixNode<T> | null;
}

interface RadixSearchResult<T> extends RadixNode<T> {
    /**
     * params is a map of the specified parameters in the path.
     */
    params: Map<string, string>;
}

type RadixTreeOptions = Record<string, unknown>;

interface RadixTree<T> {
    /**
     * The root node of the radix tree.
     */
    root: RadixNode<T>;
    /**
     * The options of the radix tree. Currently, there is no option.
     */
    options: RadixTreeOptions;
    /**
     * Search a path in the radix tree.
     * Edit the search result will not affect the radix tree.
     * @param path The path to search.
     * @returns If the path is not found, return null.
     */
    search: (path: string) => RadixSearchResult<T> | null;
    /**
     * Insert a path into the radix tree, split by "/".\
     * Use `*` or `:param` to insert a wildcard path.\
     * If begin with `:`, it will exist in params in search result.
     * @param path The path to insert.
     * @param data The data to insert.
     * @example <caption>Path begin with `:`</caption>
     * insert("/user/:id", null)
     * search("/user/1") // { params: Map(1) { "id" => "1" } }
     * @example <caption>Path is `*`</caption>
     * insert("/user/*", null)
     * search("/user/1") // { params: Map(0) {} }
     */
    insert: (path: string, data: T | null) => void;
    /**
     * Remove a path from the radix tree.
     * @param path The path to remove.
     * @returns If the path is removed successfully, returns true. Otherwise, returns false.
     */
    remove: (path: string) => boolean;
}

export type { RadixNode, RadixSearchResult, RadixTree, RadixTreeOptions };
