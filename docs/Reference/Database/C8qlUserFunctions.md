# Managing C8QL user functions

These functions implement the
[HTTP API for managing C8QL user functions](https://docs.macrometa.io/jsC8/latest/HTTP/C8QLUserFunctions/index.html).

## fabric.listFunctions

`async fabric.listFunctions(): Array<Object>`

Fetches a list of all C8QL user functions registered with the fabric.

**Examples**

```js
const fabric = new Fabric();
const functions = fabric.listFunctions();
// functions is a list of function descriptions
```

## fabric.createFunction

`async fabric.createFunction(name, code): Object`

Creates an C8QL user function with the given _name_ and _code_ if it does not
already exist or replaces it if a function with the same name already existed.

**Arguments**

* **name**: `string`

  A valid C8QL function name, e.g.: `"myfuncs::accounting::calculate_vat"`.

* **code**: `string`

  A string evaluating to a JavaScript function (not a JavaScript function
  object).

**Examples**

```js
const fabric = new Fabric();
await fabric.createFunction(
  'ACME::ACCOUNTING::CALCULATE_VAT',
  String(function (price) {
    return price * 0.19;
  })
);
// Use the new function in an C8QL query with template handler:
const cursor = await fabric.query(c8ql`
  FOR product IN products
  RETURN MERGE(
    {vat: ACME::ACCOUNTING::CALCULATE_VAT(product.price)},
    product
  )
`);
// cursor is a cursor for the query result
```

## fabric.dropFunction

`async fabric.dropFunction(name, [group]): Object`

Deletes the C8QL user function with the given name from the fabric.

**Arguments**

* **name**: `string`

  The name of the user function to drop.

* **group**: `boolean` (Default: `false`)

  If set to `true`, all functions with a name starting with _name_ will be
  deleted; otherwise only the function with the exact name will be deleted.

**Examples**

```js
const fabric = new Fabric();
await fabric.dropFunction('ACME::ACCOUNTING::CALCULATE_VAT');
// the function no longer exists
```
