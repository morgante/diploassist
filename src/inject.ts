interface Coordinate {
  x: number;
  y: number;
}

(function () {
  let doNotRerenderTopshare = false;

  function addConvoy(
      centerOfConvoyingUnit: Coordinate,
      centerOfConvoyedUnit: Coordinate,
      centerOfConvoyDestination: Coordinate,
      didConvoyFail: boolean
  ): void {
    let yInflectionIncrement: number;
    let xInflectionIncrement: number;
    const midpointXCoordinate = (centerOfConvoyedUnit.x + centerOfConvoyDestination.x) / 2,
          midpointYCoordinate = (centerOfConvoyedUnit.y + centerOfConvoyDestination.y) / 2,
          quarterXCoordinate = (3 * centerOfConvoyedUnit.x + centerOfConvoyDestination.x) / 4,
          quarterYCoordinate = (3 * centerOfConvoyedUnit.y + centerOfConvoyDestination.y) / 4,
          threeQuartersXCoordinate = (centerOfConvoyedUnit.x + 3 * centerOfConvoyDestination.x) / 4,
          threeQuartersYCoordinate = (centerOfConvoyedUnit.y + 3 * centerOfConvoyDestination.y) / 4;
    if (centerOfConvoyDestination.x > centerOfConvoyedUnit.x) {
      yInflectionIncrement = .05 * (centerOfConvoyDestination.y - centerOfConvoyedUnit.y);
      xInflectionIncrement = .05 * (centerOfConvoyedUnit.x - centerOfConvoyDestination.x);
    } else {
      yInflectionIncrement = .05 * (centerOfConvoyedUnit.y - centerOfConvoyDestination.y);
      xInflectionIncrement = .05 * (centerOfConvoyDestination.x - centerOfConvoyedUnit.x);
    }
    const convoyAssistPath = ["M", centerOfConvoyingUnit.x,
      ",", centerOfConvoyingUnit.y,
      "C", midpointXCoordinate,
      ",", midpointYCoordinate,
      " ", quarterXCoordinate + yInflectionIncrement, ",", quarterYCoordinate + xInflectionIncrement,
      " ", threeQuartersXCoordinate, ",", threeQuartersYCoordinate].join("");

    d3.select("svg")
      .append('path')
      .attr('class', 'diploassist')
      .attr('d', convoyAssistPath)
      .attr('stroke', didConvoyFail ? '#ff0000' : '#000000')
      .attr('stroke-width', '2')
      .attr('stroke-dasharray', '10,10')
      .attr('fill', 'none');
  }

  function getCoordinates(terr): Coordinate {
    return territories[terr].unit_center;
  }

  function render() {
    // Clean up old lines
    d3.selectAll('.diploassist').remove();

    const orders = d3.select("#orders-text");

    // fail fast on other pages
    if (orders.empty()) {
      return;
    }

    const convoys = orders.text().matchAll(/(\w{3}) C (\w{3}) - (\w{3})(?:\W+[SF])?/gi);

    for (const convoy of convoys) {
      const status = convoy[4] || "S";
      const fail = status === "F";
      addConvoy(getCoordinates(convoy[1]), getCoordinates(convoy[2]), getCoordinates(convoy[3]), fail);
    }
  }

  function getTopshare(player: string): number {
    const playerName = player.split("#")[0].trim();
    const topshare = parseInt((parseInt(toppers[playerName]) / parseInt(allPlayers[playerName]) * 100).toPrecision(2));
    return topshare ? topshare : 0;
  }

  function loadTopshare(): void {
    const info = d3.select("#info");
    let index = 0;

    if (info.empty()) { 
      return;
    }

    const players = Array.from(info.text().matchAll(/\S* \S*#([0-9]{4}|None)\s+\—\s+([a-zA-Z])*/gi));

    if (players.length) {
      doNotRerenderTopshare = true;
    }

    d3.select("#info").select('ul').selectAll('li').text(function(d){
      const newText = `${players[index][0]}:  Topshare = ${getTopshare(players[index][0])}%`;
      index += 1;
      return newText;
    });
  }

  render();
  loadTopshare();

  d3.select("#info").on("DOMSubtreeModified", function() {
    if (doNotRerenderTopshare) {
      return;
    }
    loadTopshare();
  })

  // Listen for changes to the orders text
  d3.select("#orders-text").on("DOMSubtreeModified", function () {
    render();
  });
})();
