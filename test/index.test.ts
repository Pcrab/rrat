import { describe, it } from "node:test";
import assert from "node:assert";

import { createRadixTree, mergeRadixTree } from "../src";

describe("Radix Tree", () => {
    it("basic usage", () => {
        const testTree = createRadixTree();

        // empty path is allowed
        testTree.insert("", "testEmpty");
        assert.strictEqual(testTree.search("")?.content, "testEmpty");
        assert.strictEqual(testTree.search("/")?.content, "testEmpty");

        testTree.insert("/test", "test");
        assert.strictEqual(testTree.search("/test")?.content, "test");
        // trailing slash is ignored
        assert.strictEqual(testTree.search("/test/")?.content, "test");
        // leading slash is also ignored
        assert.strictEqual(testTree.search("test/")?.content, "test");

        testTree.insert("/test/1", "test1");
        assert.strictEqual(testTree.search("/test/1")?.content, "test1");

        // no result
        assert.strictEqual(testTree.search("/test/2"), null);

        // test remove
        assert.strictEqual(testTree.remove("/test/1"), true);
        assert.strictEqual(testTree.search("/test/1"), null);
        // remove non-existing path
        assert.strictEqual(testTree.remove("/unknown"), false);
    });

    it("wildcard", () => {
        const testTree = createRadixTree();
        testTree.insert("/test/*/1", "test*1");
        assert.strictEqual(testTree.search("/test/wild/1")?.content, "test*1");

        testTree.insert("/some/:param/1", "some:param1");
        assert.strictEqual(testTree.search("/some/testParam/1")?.content, "some:param1");
        assert.strictEqual(testTree.search("/some/testParam/1")?.params.get("param"), "testParam");

        // remove wildcard with any wildcard path name
        assert.strictEqual(testTree.remove("/test/:unInsertedName/1"), true);
        assert.strictEqual(testTree.search("/test/wild/1"), null);
    });

    it("override wildcard", () => {
        const testTree = createRadixTree();
        testTree.insert("/test/*/1", "test*1");
        assert.strictEqual(testTree.search("/test/wild/1")?.content, "test*1");

        testTree.insert("/test/:param/2", "testParam2");
        assert.strictEqual(testTree.search("/test/wild1/2")?.content, "testParam2");
        assert.strictEqual(testTree.search("/test/wild1/2")?.params.get("param"), "wild1");

        testTree.insert("/test/:newparam/3", "testParam3");
        assert.strictEqual(testTree.search("/test/wild2/3")?.content, "testParam3");
        assert.strictEqual(testTree.search("/test/wild2/3")?.params.get("param"), undefined);
        assert.strictEqual(testTree.search("/test/wild2/3")?.params.get("newparam"), "wild2");
    });

    it("merge trees", () => {
        const testTree = createRadixTree();
        testTree.insert("/*/1", "test*1");

        const testTree2 = createRadixTree();
        testTree2.insert("/:param/2", "testParam2");

        mergeRadixTree(testTree, testTree2);
        assert.strictEqual(testTree.search("/wild/1"), null);
        assert.strictEqual(testTree.search("/wild/2")?.content, "testParam2");

        // merge into unexisting path
        const testTree3 = createRadixTree();
        testTree3.insert("/1", "test*1");

        const testTree4 = createRadixTree();
        testTree4.insert("/:param/2", "testParam2");

        mergeRadixTree(testTree3, testTree4);
        assert.strictEqual(testTree3.search("/1")?.content, "test*1");
        assert.strictEqual(testTree3.search("/wild/2")?.content, "testParam2");
    });

    it("merge endpoint", () => {
        const testTree = createRadixTree();
        testTree.insert("/test/tt/1", "test*1");

        const testTree2 = createRadixTree();
        testTree2.insert("/param/2", "testParam2");

        mergeRadixTree(testTree, testTree2, "test/asdf");
        assert.strictEqual(testTree.search("/test/tt/1")?.content, "test*1");
        assert.strictEqual(testTree.search("/test/asdf/param/2")?.content, "testParam2");
        // test parent node is set correctly
        assert.strictEqual(testTree.search("/test/asdf/param")?.parent?.name, "asdf");

        // merge into unexisting endpoint
        const testTree3 = createRadixTree();
        testTree3.insert("/test/1", "test*1");

        const testTree4 = createRadixTree();
        testTree4.insert("/:param/2", "testParam2");

        mergeRadixTree(testTree3, testTree4, "notExist");
        assert.strictEqual(testTree3.search("/test/1")?.content, "test*1");
        assert.strictEqual(testTree3.search("/notExist/wild/2")?.content, "testParam2");
    });
});
