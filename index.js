let map;
let markers = [];
const bbox = [ -123.398325, 48.407871, -123.316130, 48.455786 ]

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 48.441360, lng: -123.354942 },
    zoom: 13
  });
}

const pointsInput = document.getElementById('points');
const updateBtn = document.getElementById('update');

updateBtn.addEventListener('click', () => {
    update();
});

function update() {
    const points = pointsInput.value;
    if (!points) {
        alert('Please enter a number of points');
        return;
    }
    const animate = !!markers.length;
    const newMarkers = [];
    for (let i = 0; i < points; i++) {
        const position = turf.randomPosition(bbox);
        const marker = new Marker(position);
        newMarkers.push(marker);
        if (markers.length) {
            const closestPosition = findClosest(position);
            marker.setLine(closestPosition);
        }
        marker.setMarker();
    }

    clearMap();
    markers = [...newMarkers];
    newMarkers.splice();
    if (animate) {
        animateMarkers();
    }
}

function findClosest(position) {
    let closestDistance;
    let closestPosition;
    const point = turf.point(position);
    markers.forEach((m) => {
        const mPoint = turf.point(m.position);
        const distance = turf.distance(point, mPoint);
        if (!closestDistance || (distance < closestDistance)) {
            closestDistance = distance;
            closestPosition = m.position;
        }
    });

    return closestPosition;
}

function clearMap() {
    markers.forEach((m) => {
        m.gMarker.setMap(null);
    });
    markers = [];
}

let start;
function animateMarkers() {
    start = undefined;
    requestAnimationFrame(step);
}


function step(timestamp) {
    if (!start) {
        start = timestamp;
    }
    const elapsed = timestamp - start;

    markers.forEach((m) => m.update());
    if (elapsed < 1200) {
        requestAnimationFrame(step);
    }
}




class Marker {
    constructor(position) {
        this.position = position;
    }

    setLine(start) {
        this.startPosition = start;
        this.line = turf.lineString([this.startPosition, this.position]);
        this.distance = turf.distance(turf.point(start), turf.point(this.position));
        this.stepDistance = this.distance / 45;  // even steps for now... ~60 fps
        this.step = 0;
    }

    setMarker() {
        const p = this.startPosition ? this.startPosition : this.position;
        const position = { lat: p[1], lng: p[0] };

        this.gMarker = new google.maps.Marker({
            position
        });
        this.gMarker.setMap(map);
    }

    update() {
        const distance = this.step * this.stepDistance;
        const position = turf.along(this.line, distance);
        const coords = position.geometry.coordinates;
        const latlng = { lat: coords[1], lng: coords[0]};
        this.gMarker.setPosition(latlng);
        if (this.step < 45) {
            this.step++;
        }
    }




}




