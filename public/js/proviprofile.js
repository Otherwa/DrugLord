const map = new maplibregl.Map({
    container: 'map',
    style: 'https://maps.geoapify.com/v1/styles/osm-carto/style.json?apiKey=0e4ffb970b8f4957bd7450e8df3b2a49', // stylesheet location
    center: [74.5, 19], // starting position [lng, lat]
    zoom: 3, // starting zoom
    pitch: 30// starting tilt
});

// get location
// Initialize the geolocate control.
const geolocate = new maplibregl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true
});

var flag = 0;
var marker = null;
// when a geolocate event occurs.
geolocate.on('geolocate', function (data) {
    // console.log('A geolocate event has occurred.')
    // get option
    // console.log(data);
    var lng = data.coords.longitude;
    var lat = data.coords.latitude;


    $('#lat').val(lat)
    $('#lon').val(lng)

    // only one marker as per
    if (flag == 0) {
        marker = new maplibregl.Marker({
            draggable: true,
            anchor: 'center'
        }).setLngLat([lng, lat]).addTo(map);
    }
    flag = 0 + 1;

    function onDragEnd() {
        var lngLat = marker.getLngLat();
        console.log(lngLat);

        var requestOptions = {
            method: 'GET',
        };


        $('#lat').val(lngLat.lat)
        $('#lon').val(lngLat.lng)


        fetch("https://api.geoapify.com/v1/geocode/reverse?lat=" + lngLat.lat + "&lon=" + lngLat.lng + "&apiKey=0e4ffb970b8f4957bd7450e8df3b2a49", requestOptions)
            .then(response => response.json())
            .then(result => {
                console.log(result);
                $('#ngoaddress').val(
                    result.features[0].properties.address_line1 + "," +
                    result.features[0].properties.address_line2)
                $('#city').val(
                    result.features[0].properties.city
                )
                $('#postcode').val(
                    result.features[0].properties.postcode
                )
                $('#state').val(
                    result.features[0].properties.state
                )
                $('#loc').html('Bread 👍')
            })
            .catch(error => console.log('error', error));
    }

    marker.on('dragend', onDragEnd);
});

// controls
var nav = new maplibregl.NavigationControl();
map.addControl(nav, 'top-left');
map.addControl(geolocate);

map.on('load', function () {
    geolocate.trigger();
});


// /adhar verifications/
const d = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
]

// permutation table
const p = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
]

// validates Aadhar number received as string
function validate(aadharNumber) {
    let c = 0
    let invertedArray = aadharNumber.split('').map(Number).reverse()

    invertedArray.forEach((val, i) => {
        c = d[c][p[(i % 8)][val]]
    })

    return (c === 0)
}

function verify() {
    var aadharNo = $('#adhar').val();
    if (validate(aadharNo)) {
        $('#adhar').css('color', 'blue')
        $('#profileset').prop('disabled', false)
    } else {
        $('#adhar').css('color', 'red')
        $('#profileset').prop('disabled', true)
    }
}



$('#adhar').on('input', () => {
    verify();
})