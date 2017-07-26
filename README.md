# Broker Watcher
_A `tera-proxy` script that keeps an eye on the broker for your desired items._

## Installation
- Open a **Bash** or a **Command Prompt** and type in the following to install the required dependencies.
```sh
npm install
```

## Usage
Requires you to have `commands` module and

### Commands
- `/proxy broker toggle` - Toggles the module's state.

### Configuration
- Editing the query.csv file, you can either open it with Microsoft Excel or a spreadsheet editor or use a text editor:

**Example:**

Item ID | Search Phrase | Price Limit
---|---|---
[Database](teradatabase.net/en/item/) | `<enter something here>` | 9999 (everything below or equal this price will get whispered back to you)
