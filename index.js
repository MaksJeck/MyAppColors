const colors = require('colors');
console.log(colors.green('hi'));

const [arg1, arg2] = process.argv.slice(2);
console.log(process.argv);
function getPrimes(a, num) {
    const seive = [];
    const primes = [];

    for (let i = 2; i <= num; i++) {
        if (!seive[i]) {
            primes.push(i);
            for (let j = i * i; j <= num; j += i) {
                seive[j] = true;
            }
        } 
    }
    return primes;
}
console.log(getPrimes(+arg1, +arg2));