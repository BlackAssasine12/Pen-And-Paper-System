// fileReader.js

let myData;

document.getElementById('fileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const data = JSON.parse(e.target.result);
            myData = data;
            initializeWallet(data);

            generateCharakterAttributes(data);
            genCharInfo(data);
            bindHideButtons();
            updateCharakterCalculation();

        };
        reader.readAsText(file);
    }
});
