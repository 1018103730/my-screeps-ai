export function dealPixel() {
    let pixelNum = Game.resources['pixel']
    if (pixelNum <= 0) return
    if (Game.time % 10) return

    let orders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: PIXEL})
        .sort((a, b) => b.price - a.price);
    let order = orders[0];

    if (order.price <= 800) return

    let canDealPixel = Math.min(pixelNum, order.amount)

    Game.market.deal(order.id, canDealPixel)
    console.log('售出pixel:' + canDealPixel + ',收入:' + canDealPixel * order.price + 'cr')
}