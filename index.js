const fs = require('fs')
const path = require('path')
const csvjson = require('csvjson')

// You can arrange the values below:
const START_ON_LOGIN = true
const DELAY_ACTIONS = true

const SEARCH_INTERVAL_MS = 60000
const NEXT_PAGE_MS = 150

const MODULE_WHISPER_NAME = '>Broker'
// ==================================================== 

const queryDir = path.join(__dirname, 'query.csv')

if (!fs.existsSync(queryDir)) {
  console.log(`[broker] "${queryDir}" doesn't exist.`)
  process.exit()
}

const queries = csvjson.toObject('id,name,price\n' + fs.readFileSync(queryDir))
  .map(query => ({ id: parseInt(query.id), name: query.name, price: (parseInt(query.price) * 10000) }))

const Command = require('command')

module.exports = function BrokerListing (dispatch) {
  const results = new Map()
  let sessionQueries = [...queries]
  let ilvl = null
  let cid = null
  let name = null
  let currentSearch = {}
  let searchInterval = null

  dispatch.hook('S_LOGIN', 1, event => {
    ({ cid, name } = event)
    searchInterval = setInterval(brokerSearchQueries, SEARCH_INTERVAL_MS)
    if (START_ON_LOGIN) brokerSearchQueries()
  })

  dispatch.hook('S_RETURN_TO_LOBBY', () => {
    clearInterval(searchInterval)
    searchInterval = null
  })

  const command = Command(dispatch)
  command.add('broker', args => {
    if (args.toLowerCase().trim() !== 'toggle') return
    if(searchInterval) {
      clearInterval(searchInterval)
      searchInterval = null
    } else searchInterval = setInterval(brokerSearchQueries, SEARCH_INTERVAL_MS)
    sendMessage(`Module&nbsp;</font><font color="#32cd32">${searchInterval ? 'ON' : 'OFF'}`)
  })

  dispatch.hook('S_TRADE_BROKER_HIGHEST_ITEM_LEVEL', 1, event => { ({ ilvl } = event) })

  dispatch.hook('S_TRADE_BROKER_WAITING_ITEM_LIST', 1, event => {
    if (!Object.keys(currentSearch).length) return
    if ((event.page + 1) !== event.pageCount) {
      if (!event.listings.length) return
      if (!results.has(currentSearch.id)) results.set(currentSearch.id, { price: (currentSearch.price / 10000), date: new Date(), name: currentSearch.name, items: [] })
      results.get(currentSearch.id).items = results.get(currentSearch.id).items.concat(
        event.listings.filter(listing => {
          if (listing.item === currentSearch.id) {
            listing.price_fn = Math.floor((listing.offline ? listing.buyout.low : listing.price.low) / listing.quantity)
            if (listing.price_fn <= currentSearch.price) return true
          }
        })
      )
      if ((event.page + 1) <= event.pageCount) {
        if (DELAY_ACTIONS) setTimeout(() => { brokerNextPage(event.page + 1) }, NEXT_PAGE_MS)
        else brokerNextPage(event.page + 1)
      }
    } else {
      const result = results.get(currentSearch.id)
      if (result.items.length) {
        for (const item of result.items) {
          sendMessage(`(${result.date.toTimeString().split(' ').shift()}) "${result.name}" &lt;=${Math.floor(result.price)} x${item.quantity} | from: "${item.name}"`)
        }
      }
      currentSearch = {}
      brokerSearchNextQuery()
    }
  })

  function sendMessage (msg) {
    dispatch.toClient('S_WHISPER', 1, {
      player: cid,
      unk1: 0,
      gm: 0,
      unk2: 0,
      author: MODULE_WHISPER_NAME,
      recipient: name,
      message: `<font>${msg}</font>`
    })
  }

  function brokerSearchQueries () {
    if (Object.keys(currentSearch).length) return
    results.clear()
    brokerSearchNextQuery()
  }

  function brokerSearchNextQuery () {
    if (Object.keys(currentSearch).length) return
    if (!sessionQueries.length) {
      sessionQueries = Array.prototype.concat(queries)
      return
    }
    const query = sessionQueries.pop()
    currentSearch = query
    dispatch.toServer('C_TRADE_BROKER_WAITING_ITEM_LIST_NEW', 1, {
      lvl1Min: 1,
      lvlMax: 65,
      itemLvlMin: 0,
      itemLvlMax: ilvl,
      enchantMin: 0,
      enchantMax: 15,
      priceMin: { low: 1, high: 0, unsigned: false },
      priceMax: { low: 1115752192, high: 23, unsigned: false },
      tierMin: 0,
      tierMax: 12,
      rarity: 0,
      negotiable: 0,
      idStatus: 0,
      masterwork: 0,
      categories: '',
      items: '',
      query: query.name,
      query2: '',
      exact: 0,
      unk1: 0,
      unk2: 0,
      unk3: 0,
      unk4: 90000000,
      unk5: 0,
      unk6: 0,
      unk11: 1
    })
  }

  function brokerNextPage (page) { dispatch.toServer('C_TRADE_BROKER_WAITING_ITEM_LIST_PAGE', 1, { page }) }
}
