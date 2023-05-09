# RRAT

Rrat is a simple radix tree data structure implementation specialized for routing. It is inspired by [radix3](https://github.com/unjs/radix3).

## Installation

```bash
pnpm i rrat
```

## Usage

```typescript
import { createRadixTree } from "rrat";

const tree = createRadixTree();
testTree.insert("", "root");
/*
  {
      name: "/",
      content: "root"
  }
*/
testTree.search("/");

testTree.insert("/foo", "foo");
/*
  {
      name: "/foo",
      content: "foo"
  }
*/
testTree.search("/foo");

testTree.insert("/test/:param/1", "testParam");
/*
  {
      name: "/test/random/1",
      content: "testParam",
      params: Map {
        "param" => "random"
      }
  }
*/
testTree.search("/test/random/1");
```

More examples can be found in the [test](./test) directory.

Currently, all leading and trailing slashes are ignored. This may change in the future.
