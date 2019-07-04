function hexColorFromPercent(i){
    if(i <= 0){
        return colorToHex(80, 0, 0)
    }
    else if(i <= 0.5 && i > 0){
        return colorToHex((255-80)/0.5  * i + 80, 00, 00)
    }
    else if(i <= 1 && i > 0.5){
        return colorToHex(255, 510*(i-0.5), 510*(i-0.5))
    }
    else if(i <= 4 && i > 1){
        return colorToHex((-255/3)*(i-1) + 255 , 255 , (-255/3)*(i-1) + 255 )
    }
    else if(i <= 11 && i > 4){
        return colorToHex(0, (80-255)/7 * (i-4) + 255, 0)
    }
    else if(i > 11){
        return colorToHex(0, 80, 0)
    }
}

function colorToHex(r,g,b){
    return '2px solid rgb('+Math.round(r)+","+Math.round(g)+","+Math.round(b)+")"
}