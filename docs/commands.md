# Commands

This page describes the format of command objects. If you haven't already, you may wish to read about how to pass command objects to Redux-Data in the [documentation for `connect()`](/docs/connect.md).

## Type of Commands
Redux-Data currently supports three types of commands: create, update, and delete. All command objects require at least two properties: `target`, and `action`.

```javascript
{
  target: 'items', // the name of a record type in your schema
  action: 'create', // or 'update', or 'delete'
}
```

Each type of command has slightly different features, which are described in more detail below.

### Create
#### Format
The create command, as you might expect, creates a new record in the store. In addition to the `target` and `action` properties, command objects may contain two other properties: `preset`, and `then`.

```javascript
{
  target: 'items',
  action: 'create',

  /*
    The 'preset' property accepts an object representing fields of a record
    that will be merged together with the fields you pass when invoking the
    command's function. For instance if you'd like all items created with this
    command to have a 'quantity' of '0' you can use the following:
  */
  preset: {
    quantity: 0,
  },

  /*
    The 'then' property accepts a function which will be invoked when the
    command has successfully completed. You can execute any code you like
    in this function, one possible use is to use your router to navigate
    to a different route. Or, if you so chose, you can log the newly created
    record to the console.

    The function will be passed one argument: the newly created record.
  */
  then: record => console.log(record);
}
```

#### Usage
When you declare a create command (see [documentation for `connect()`](/docs/connect.md)) Redux-Data will merge a function into your component's props with the name you identified. In the case of the create command, the function can be used as follows:

```javascript
/*
  A create command's function expects one argument: an object with properties
  representing fields of the record you are creating. For this example let's
  say you declared a 'createItem' command, and in your schema you indicated
  that records of the 'items' have a 'name' field.
*/
createItem({
  name: 'Pencil'
}).then(record => {
  /*
    Commands return a promise, so you can call the 'then' method to execute
    code when the command has successfully completed. This is nearly identical
    to the 'then' property of the command object as described above.
  */
  console.log(record);
}).catch(errors => {
  /*
    If you're server returns an error when attempting to create the record
    you can deal with it here. The value of the 'error' argument will be
    set by your adapter.
  */
  console.log(errors);
})
```

### Update
The `update` command is nearly identical in format and usage to the `create` command. The only difference is the `id` field of a record must be set (either with a preset property or when invoking the command's function).

'id' field set with `preset`:
```javascript
{
  target: 'items',
  action: 'update',
  preset: {
    /*
      You'll probably get this from the props when declaring the command.
    */
    id: 'an id'
  },
}
```

'id' field set when invoking command's function:
```javascript
updateItem({
  id: 'an id'
})
```

### Delete
#### Format
A `delete` command object accepts the `target`, `action`, and `then` properties, but does not currently support `preset`.

```javascript
{
  target: 'items',
  action: 'delete',
  then: () => {
    // No documented arguments are passed to a delete's 'then' function.
    console.log('Deleted.');
  }
}
```

#### Usage
When you declare a delete command (see [documentation for `connect()`](/docs/connect.md)) Redux-Data will merge a function into your component's props with the name you identified. In the case of the delete command, the function can be used as follows:

```javascript
/*
  A delete command's function expects one argument: the 'id' of a record to
  be deleted.
*/
deleteItem('an id').then( => {
  /*
    Commands return a promise, so you can call the 'then' method to execute
    code when the command has successfully completed. This is nearly identical
    to the 'then' property of the command object as described above.
  */
  console.log('Deleted.');
}).catch(errors => {
  /*
    If you're server returns an error when attempting to delete the record
    you can deal with it here. The value of the 'error' argument will be
    set by your adapter.
  */
  console.log(errors);
})
```
