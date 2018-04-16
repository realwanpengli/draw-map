function test() {
	var a = [1,2,3].concat(['123','abc']);
	console.log(a);
	let b = a;
	a[0]=-999;
	console.log(a,b);
	var p = new Parallel([1,2,3,4,5], {env: {a:{'aaa':'a','bbb':'b'}}});
	console.log('p', p);
	p.map(function(ele) {
		console.log('ele', ele);
		ele =  ele + 1;
		return global.env.a.aaa;
	}).then(function(data) {
		console.log('data', data);
	});

}

async function getStockPriceByName(name) {
  var symbol = await getStockSymbol(name);
  var stockPrice = await getStockPrice(symbol);
  return stockPrice;
}

