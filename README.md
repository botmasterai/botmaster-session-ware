[![Build Status](https://travis-ci.org/botmasterai/botmaster-session-ware.svg?branch=master)](https://travis-ci.org/botmasterai/botmaster-session-ware)

# Botmaster Session Ware

A configurable botmaster ware to provide session data to downstream middleware. Works with Botmaster ^3.0.7.

# Quick Start

```bash
npm install botmaster-session-ware -S
```

```js
const Botmaster = require('botmaster');
const SessionWare = require('botmaster-session-ware');

botmaster.use({
  type: 'incoming',
  name: 'some controller',
  controller: (bot, update) => {
    // this will be {} on the first call from a certain user
    // and will contain the last message upon all the next iterations
    console.log(update.session);

    update.session.lastMessage = update.message;
  }
})
.
.
.
// place after declaring all your other middleware
const sessionWare = SessionWare();
botmaster.useWrapped(sessionWare.incoming, sessionWare.outgoing);
```

# Using a different adapter

Adapters should be provided in their own package. Their api must follow the MemoryStore example.

## API

### SessionWare

Create an object providing incoming and outgoing middleware that manages a 
session object for you. By using this middleware, your other middleware will
have access to a persisted `update.session` object.

**Parameters**

-   `options` **\[[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** options object for generated sessionWare
    -   `options.adapter` **\[[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** an object implementing the adapter api. defaults to in MemoryStore.
    -   `options.sessionPath` **\[[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]** dot denoted path to where to store the context in the update. defaults to 'session'

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** an object that contains two functions 'incoming' and 'outgoing'.
They should be used with the useWrapped method of botmaster

### MemoryStore

The most basic adapter ever for SessionWare. This is the default store that is
used when instantiating a SessionWare object without any params.
It provides the standard required API for stores. I.e. a getter and a setter method.
Called `get` and `set` that both return promises where get resolves with the session
value and set sets the session value

#### get

Get or create a session with the id.

**Parameters**

-   `id` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** a unique id for the session

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** evaluates to an object that is the  session

#### set

Update a session in the storage.

**Parameters**

-   `id` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** a unique id for the session
-   `value` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** the new value for the session

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** resolves when the session has been saved
