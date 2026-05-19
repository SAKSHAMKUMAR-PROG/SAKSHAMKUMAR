function findPrimes(limit) {
    const primes = [];
    // Start from 2 because 1 is not a prime number
    for (let num = 2; num <= limit; num++) {
        let isPrime = true;
        for (let i = 2; i <= Math.sqrt(num); i++) {
            if (num % i === 0) {
                isPrime = false;
                break;
            }
        }
        if (isPrime) primes.push(num);
    }
    return primes;
}

console.log(findPrimes(100));
