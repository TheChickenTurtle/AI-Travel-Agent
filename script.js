let map;
let routePolyline;
let startMarker, endMarker;
let startLocation, endLocation;

const API_KEY = 'AIzaSyCXqo2b9CUzkcexcQI1IHT80xcmDi3561A';

async function initMap() {
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    const { PlaceAutocompleteElement } = await google.maps.importLibrary("places");
    await google.maps.importLibrary("geometry");

    map = new Map(document.getElementById("map"), {
        center: { lat: 40.730610, lng: -73.935242 }, // Default to NYC
        zoom: 12,
        mapId: "DEMO_MAP_ID",
        gestureHandling: "greedy",
    });

    // Initialize Autocomplete Elements
    const startAutocomplete = new PlaceAutocompleteElement();
    document.getElementById('start-autocomplete-container').appendChild(startAutocomplete);

    const endAutocomplete = new PlaceAutocompleteElement();
    document.getElementById('end-autocomplete-container').appendChild(endAutocomplete);

    // Listen for place selections
    startAutocomplete.addEventListener('gmp-select', async ({ placePrediction }) => {
        const place = placePrediction.toPlace();
        await place.fetchFields({ fields: ['location', 'id'] });
        startLocation = { placeId: place.id };
    });

    endAutocomplete.addEventListener('gmp-select', async ({ placePrediction }) => {
        const place = placePrediction.toPlace();
        await place.fetchFields({ fields: ['location', 'id'] });
        endLocation = { placeId: place.id };
    });

    // Initialize Polyline and Markers
    routePolyline = new google.maps.Polyline({
        strokeColor: '#1a73e8',
        strokeOpacity: 0.8,
        strokeWeight: 6,
        map: map,
    });

    startMarker = new AdvancedMarkerElement({ map });
    endMarker = new AdvancedMarkerElement({ map });

    document.getElementById('get-route-btn').addEventListener('click', calculateAndDisplayRoute);
}

async function calculateAndDisplayRoute() {
    const errorDiv = document.getElementById("error-display");
    const routeInfoDiv = document.getElementById("route-info");

    // Clear previous results
    routePolyline.setPath([]);
    startMarker.position = null;
    endMarker.position = null;
    errorDiv.style.display = 'none';
    routeInfoDiv.style.display = 'none';

    if (!startLocation || !endLocation) {
        errorDiv.textContent = 'Please select both a start and end location.';
        errorDiv.style.display = 'block';
        return;
    }

    const request = {
        origin: startLocation,
        destination: endLocation,
        travelMode: 'DRIVE',
    };

    try {
        const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": API_KEY,
                "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.startLocation,routes.legs.endLocation"
            },
            body: JSON.stringify(request)
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorBody.error.message}`);
        }

        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const decodedPath = google.maps.geometry.encoding.decodePath(route.polyline.encodedPolyline);
            routePolyline.setPath(decodedPath);

            const bounds = new google.maps.LatLngBounds();
            decodedPath.forEach(path => bounds.extend(path));
            map.fitBounds(bounds);

            // Set markers
            startMarker.position = {
                lat: route.legs[0].startLocation.latLng.latitude,
                lng: route.legs[0].startLocation.latLng.longitude
            };
            endMarker.position = {
                lat: route.legs[0].endLocation.latLng.latitude,
                lng: route.legs[0].endLocation.latLng.longitude
            };

            // Display route info
            const distance = (route.distanceMeters / 1609.34).toFixed(1); // miles
            const durationSeconds = parseInt(route.duration.slice(0, -1));
            const hours = Math.floor(durationSeconds / 3600);
            const minutes = Math.round((durationSeconds % 3600) / 60);
            document.getElementById('route-summary').textContent = `Distance: ${distance} mi, Duration: ${hours}h ${minutes}m`;
            routeInfoDiv.style.display = 'block';

        } else {
            throw new Error("No routes found.");
        }

    } catch (error) {
        console.error("Directions request failed:", error);
        errorDiv.textContent = "Unable to calculate route. Please try different locations.";
        errorDiv.style.display = "block";
    }
}

initMap();