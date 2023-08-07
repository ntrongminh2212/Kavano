const GOOGLE_API_KEY = "AIzaSyAPF2iaxNT_6eEuIz26R_Ge4l6w6d_PEG4";
const GRAPHHOPPER_KEY = "d5030352-1d74-41fd-b1ce-119de655bad3";
const OPENROUTEKEY = "5b3ce3597851110001cf6248b157ac50ecf446a79cf133ac6bf31237"
const MAP_SERVER_URL = "https://api.openrouteservice.org/v2";


const GEOCODE_URL = MAP_SERVER_URL + "/geocode";
const ISOCHRONE_URL = MAP_SERVER_URL + "/isochrone";
const MAP_MATCHING_API = MAP_SERVER_URL + "/match";
const MATRIX_SOLUTION_URL = MAP_SERVER_URL + "/matrix/solution";
const MATRIX_CALCULATE_URL = MAP_SERVER_URL + "/matrix/calculate";
const VRP_OPTIMIZE_URL = MAP_SERVER_URL + "/vrp/optimize";
const ROUTE_URL = MAP_SERVER_URL + "/directions/driving-car";

export default {
    GOOGLE_API_KEY,
    GRAPHHOPPER_KEY,
    MAP_SERVER_URL,
    GEOCODE_URL,
    ISOCHRONE_URL,
    MAP_MATCHING_API,
    MATRIX_SOLUTION_URL,
    MATRIX_CALCULATE_URL,
    VRP_OPTIMIZE_URL,
    ROUTE_URL,
    OPENROUTEKEY
}