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

map.addSource('bikecollision', {
    type: 'geojson',
    data: cyclecollis //The variable created a little bit further down in the code.
});

map.addLayer({
    'id': 'collisions',
    'type': 'circle',
    'source': 'bikecollision',
    'paint': {
        'circle-radius': 3,
        'circle-color': '#4ddbff'
    }
})


/*--------------------------------------------------------------------
Step 2: VIEW GEOJSON POINT DATA ON MAP
--------------------------------------------------------------------*/
//HINT: Create an empty variable
let cyclecollis;

//      Use the fetch method to access the GeoJSON from your online repository
//      Convert the response to JSON format and then store the response in your new variable
fetch('https://raw.githubusercontent.com/meghankolin/ggr472-lab4/main/data/pedcyc_collision_06-21.geojson?token=GHSAT0AAAAAAB7V34MNSNTHEXB4OIWZAUIMZAYVPRA')
    .then(response => response.json)
    .then(response => {
        console.log(response); //Check response in the console
        cyclecollis = response; //Store GeoJSON as a variable using the URL from the fetch response
    });


/*--------------------------------------------------------------------
    Step 3: CREATE BOUNDING BOX AND HEXGRID
--------------------------------------------------------------------*/
//HINT: All code to create and view the hexgrid will go inside a map load event handler
//      First create a bounding box around the collision point data then store as a feature collection variable
//      Access and store the bounding box coordinates as an array variable
//      Use bounding box coordinates as argument in the turf hexgrid function


/*--------------------------------------------------------------------
Step 4: AGGREGATE COLLISIONS BY HEXGRID
--------------------------------------------------------------------*/
//HINT: Use Turf collect function to collect all '_id' properties from the collision points data for each heaxagon
//      View the collect output in the console. Where there are no intersecting points in polygons, arrays will be empty


// /*--------------------------------------------------------------------
// Step 5: FINALIZE YOUR WEB MAP
// --------------------------------------------------------------------*/
//HINT: Think about the display of your data and usability of your web map.
//      Update the addlayer paint properties for your hexgrid using:
//        - an expression
//        - The COUNT attribute
//        - The maximum number of collisions found in a hexagon
//      Add a legend and additional functionality including pop-up windows