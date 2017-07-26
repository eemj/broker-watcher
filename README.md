# Broker Watcher
_A `tera-proxy` script that keeps an eye on the broker for your desired items._

## Installation
- Open a **Bash** or a **Command Prompt** and type in the following to install the required dependencies.
```sh
npm install
```

## Usage
Requires you to have [`command`](https://github.com/pinkipi/command) module.
### Commands
- `/proxy broker toggle` - Toggles the module's state (you might need this since it will spam you)

### Configuration
- Editing the query.csv file, you can either open it with Microsoft Excel or a spreadsheet editor or use a text editor:

**Example:**

Item ID | Search Phrase | Price Limit
---|---|---
[Database](http://teradatabase.net/en/items) | `<enter something here>` | 9999 (everything below or equal this price will get whispered back to you)

- Editing values in the [`index.js`](https://github.com/eemj/broker-watcher/blob/master/index.js) file
```js
const START_ON_LOGIN = true // Do you want the script to run when you login?
const DELAY_ACTIONS = true // Simulate human search times (un-advised to turn this off).

// NOTE: If the two values below are really set to low, it will cause huge lags and it might also become detectable.
const SEARCH_INTERVAL_MS = 60000 // The time it takes to search your whole query.
const NEXT_PAGE_MS = 150 // The time it takes to send a next page query.

const MODULE_WHISPER_NAME = '>Broker' // The "bot"'s name.
```
