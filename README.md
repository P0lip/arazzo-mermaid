```js
yarn build
node dist/bin.js src/__fixtures__/petstore.yaml --output petstore.mermaid
```

### Things that aren't supported:

- No validation, although you'd get some errors if an object cannot be resolved, etc.
- Reusable objects
- No Failure Action

I wasn't exactly sure what would be the best way to represent it.
A step may contain quite a bit of information which isn't easy to render in a block.
I suppose having a tooltip and an actual UI component appearing when you click on it would be the way to go.

Also, if I had more time, I'd write a parser and evaluator for Runtime Expressions, and tweak linker a bit to clean the code a little bit in some spots.
Linking should also be done fully concurrently.