/*--------------------------------------------------------------------
GGR472 LAB 4: Incorporating GIS Analysis into web maps using Turf.js 
--------------------------------------------------------------------*/


/*--------------------------------------------------------------------
Step 1: INITIALIZE MAP
--------------------------------------------------------------------*/
//Define access token
mapboxgl.accessToken = 'pk.eyJ1IjoibWVnaGFua29saW4iLCJhIjoiY2xkbTByamQyMDRzajN1bGlxbHJnYm56bSJ9.FAxkUWsOApq-qNHJhlT4xg';

//Initialize map and edit to your preference
const map = new mapboxgl.Map({
    container: 'map', //container id in HTML
    style: 'mapbox://styles/meghankolin/clf9zdgzw002d01o8kyufj2fx',  //****ADD MAP STYLE HERE *****
    center: [-79.39, 43.65],  // starting point, longitude/latitude
    zoom: 12 // starting zoom level
});

//Adding zoom and rotation controls
map.addControl(new mapboxgl.NavigationControl());

//Adding an option to make the map full-screen
map.addControl(new mapboxgl.FullscreenControl());

/*--------------------------------------------------------------------
Step 2: VIEW GEOJSON POINT DATA ON MAP
--------------------------------------------------------------------*/
//HINT: Create an empty variable
// Create empty GeoJSON objects to hold point features
let bikecollision;

//Use the fetch method to access the GeoJSON from your online repository
fetch('https://raw.githubusercontent.com/meghankolin/ggr472-lab4/main/data/pedcyc_collision_06-21.geojson')
    //Convert the response to JSON format and then store the response in your new variable
    .then(response => response.json())
    .then(response => {
        console.log(response); //Check response in the console
        bikecollision = response; //Store GeoJSON as a variable using the URL from the fetch response
    });


/*--------------------------------------------------------------------
    Step 3: CREATE BOUNDING BOX AND HEXGRID
--------------------------------------------------------------------*/
//HINT: All code to create and view the hexgrid will go inside a map load event handler
map.on('load', () => {
    //Testing the collision points, commented out ater hexgrid was completed
    //map.addSource('collisionpts', {
    //    type: 'geojson',
    //    data: bikecollision
    //});

    //map.addLayer({
    //    'id': 'bikepts',
    //    'type': 'circle',
    //    'source': 'collisionpts',
    //    'paint': {
    //        'circle-radius': 2,
    //        'circle-color': '#f57f37'
    //    }
    //});

    //First create a bounding box around the collision point data then store as a feature collection variable
    let bboxbikes; //Creating the variable in which the bounding box will be stored
    let bbox = turf.envelope(bikecollision); //Creating the envelope around the points
    let bboxscaled = turf.transformScale(bbox, 1.10); //Scale bbox up by 10%

    //Putting the resulting envelope in GeoJSON format
    bboxbikes = {
        "type": "FeatureCollection",
        "features": [bboxscaled]
    };

    //Testing the box to ensure it worked
    // map.addSource('collis-bbox', {
    //    type: 'geojson',
    //    data: bboxbikes,
    //});

    //map.addLayer({
    //    'id': 'bike-box',
    //    'type': 'fill',
    //    'source': 'collis-bbox',
    //    'paint': {
    //        'fill-color': '#a0e7f0',
    //        'fill-opacity': 0.5
    //    }
    //});

    //      Access and store the bounding box coordinates as an array variable
    console.log(bboxscaled)
    console.log(bboxscaled.geometry.coordinates)

    let bboxcoords = [bboxscaled.geometry.coordinates[0][0][0],
                    bboxscaled.geometry.coordinates[0][0][1],
                    bboxscaled.geometry.coordinates[0][2][0],
                    bboxscaled.geometry.coordinates[0][2][1]];
    //Use bounding box coordinates as argument in the turf hexgrid function
    let hexnum = turf.hexGrid(bboxcoords, 0.5, { units: 'kilometers' });


/*--------------------------------------------------------------------
Step 4: AGGREGATE COLLISIONS BY HEXGRID
--------------------------------------------------------------------*/
//HINT: Use Turf collect function to collect all '_id' properties from the collision points data for each heaxagon
let collishex = turf.collect(hexnum, bikecollision, '_id', 'values')

//Count the number of points within each hex
let maxcollis = 0; //Setting the lowest possible number

collishex.features.forEach((feature) => {
    feature.properties.COUNT = feature.properties.values.length
    if (feature.properties.COUNT > maxcollis) { //If the number of intersecting points is larger than zero...
        maxcollis = feature.properties.COUNT //...change the value of maxcollis to than number
    }
});

//View the collect output in the console. Where there are no intersecting points in polygons, arrays will be empty
console.log(maxcollis);


// /*--------------------------------------------------------------------
// Step 5: FINALIZE YOUR WEB MAP
// --------------------------------------------------------------------*/
//HINT: Think about the display of your data and usability of your web map.
//      Update the addlayer paint properties for your hexgrid using:
//        - an expression
//        - The COUNT attribute
//        - The maximum number of collisions found in a hexagon
    map.addSource('collis-hex', {
        type: 'geojson',
        data: hexnum,
    });

    map.addLayer({
        'id': 'collis-hex-sym',
        'type': 'fill',
        'source': 'collis-hex',
        'paint': {
            'fill-opacity': 0.5,
            'fill-outline-color': "black",
            'fill-color': [
                "step",
                ['get', 'COUNT'],
                "white",
                10, "#FFECD2",
                20, "#EC5F9A",
                30, "#3E1491",
                40, "#06145C"
            ]
        }
    });
});

//Add a legend and additional functionality including pop-up windows
    //Including pop-up windows sharing information regarding the number of collisions occuring in each hex
        map.on('click', 'collis-hex-sym', (e) => {
            // Copy coordinates array.
            const coordinates = e.features[0].geometry.coordinates.slice();
            const description = e.features[0].properties.COUNT;    

            // Setting the popup to appear over the object being clicked instead of appearing somewhere else.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML("<b>Number of collisions: </b>" + description)
            .addTo(map);
            });