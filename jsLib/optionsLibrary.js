function cndf(x){
    if(x < -5){
        return 0;
    }
    if (x > 5){
        return 1;
    }
    // constants
    var a1 = 0.254829592;
    var a2 = -0.284496736;
    var a3 = 1.421413741;
    var a4 = -1.453152027;
    var a5 = 1.061405429;
    var p = 0.3275911;

    // Save the sign of x
    var sign = 1;
    if (x < 0)
        sign = -1;
    x = Math.abs(x) / Math.sqrt(2.0);

    // A&S formula 7.1.26
    var t = 1.0 / (1.0 + p * x);
    var y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.Exp(-x * x);

    return 0.5 * (1.0 + sign * y);
}

function ndf(x){
    return 1 / Math.sqrt(2 * Math.PI) * Math.exp(-1 * x * x / 2);
}

function loss(a,b){
    //return Math.Abs(Math.Sqrt(a)-Math.Sqrt(b));
    return a - b;
}

function d1(p, x, t, q, r, sigma){
    return (Math.log(p / x) + t * (r - q + (sigma * sigma) / 2)) / (sigma * Math.sqrt(t));
}

function d2(p, x, t, q, r, sigma){
    return (Math.log(p / x) + t * (r - q + (sigma * sigma) / 2)) / (sigma * Math.sqrt(t)) - (sigma * Math.sqrt(t));
}
