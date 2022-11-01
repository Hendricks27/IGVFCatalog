

export default function findOptimalTick(range, target){
    let multiplier = 1;
    let min_loss = range + 1000;
    let res = undefined;

    while (true){
        let tmp;
        for (let i of [1,2,5]){
            tmp = multiplier * i;
            let loss = Math.abs(range/tmp - target);

            if (loss < min_loss){
                min_loss = loss;
                res = tmp;
            }
        }
        multiplier = multiplier * 10;

        if (range / tmp < 1){
            break
        }
    }

    return res
}












