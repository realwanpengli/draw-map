function test() {
	a = {};
	a['x'] = 'b';
	console.log('a', a);
}

async function getStockPriceByName(name) {
  var symbol = await getStockSymbol(name);
  var stockPrice = await getStockPrice(symbol);
  return stockPrice;
}

