let dice1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

let dice1Length = dice1.length
let Random = Math.floor(Math.random() * dice1Length)


dice1.push(20)

goodDice(dice1)
badDice(dice1)

function goodDice(dice) {
    let goodDice = [...dice]
    goodDice.pop()
    console.log(goodDice)

}

function badDice(dice) {
    let badDice = [...dice]
    badDice.splice(0, 1)
    console.log(badDice)

}
