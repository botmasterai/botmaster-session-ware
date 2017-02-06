[![Build Status](https://travis-ci.org/botmasterai/botmaster-session-ware.svg?branch=master)](https://travis-ci.org/botmasterai/botmaster-session-ware)

# Botmaster Session Ware

A configurable botmaster ware to provide session data to downstream middleware.

# Quick Start

```bash
npm install botmaster-session-ware -S
```

```js
const Botmaster = require('botmaster');
const SessionWare = require('botmaster-session-ware');

const {incoming, outgoing} = SessionWare();
botmaster.use('incoming', incoming);
botmaster.use('outgoing', outgoing);
```

# Using a different adapter

Adapters should be provided in their own package. Their api must follow the MemoryStore example.

## API Usage

### MemoryStore

The most basic adapter ever for SessionWare

#### get

Get or create a session with the id.

**Parameters**

-   `id` **String** a unique id for the session

Returns **Promise** evaluates to an object that is the  session

#### set

Update a session in the storage.

**Parameters**

-   `id` **String** a unique id for the session
-   `value` **Object** the new value for the session

Returns **Promise** resolves when the session has been saved

### SessionWare

Create an object providing incoming and outgoing middleware

**Parameters**

-   `options` **[Object]** options object for generated sessionWare
    -   `options.adapter` **[Object]** an object implementing the adapter api. defaults to in memory.
    -   `options.sessionPath` **[String]** dot denoted path to where to store the context in the update. defaults to 'session'

Returns **Object** an object that contains two functions 'incoming' and 'outgoing'. The incoming should be placed before any middleware that requires it and the outgoing should be placed after all middleware have used it.
