//////////////////////
// MAP VIEW
var mapDisplay = L.map('mapDisplay').setView([51.505, -0.09], 10);
const tiles2 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(mapDisplay);


