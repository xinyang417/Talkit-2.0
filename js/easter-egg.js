"use strict";

var clickCount = 0;
var maxCount = 9;

function showEasterEgg() {
    clickCount++;
    if (clickCount == maxCount) {
        alert("Are you looking for us?");
        var imgEE = document.getElementById("easterEgg");
        imgEE.style.display = 'block';
    }
    setTimeout(function () {
        document.getElementById('eEgg').style.display = 'none'
    }, 12000);
}
