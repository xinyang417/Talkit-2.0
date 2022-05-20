"use strict";

var clickCount = 0;
var maxCount = 9;

function showEasterEgg() {
    clickCount++;
    if (clickCount == maxCount) {
        var imgEE = document.getElementById("easterEgg");
        imgEE.style.display = 'block';
    }
    setTimeout(function () {
        document.getElementById('eEgg').style.display = 'none';
        location.reload();
    }, 12000);
}
