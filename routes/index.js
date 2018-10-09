var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function(req, res, next) {
	res.render("index", { title: "Express" });
});

var request = require("request");
router.get("/search", function(req, res) {
	var q = req.query.q;
	request(
		"http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?f=json&maxSuggestions=6&text=" +
			q,
		function(err, resp, body) {
			res.setHeader("Content-Type", "application/json");
			res.send(body);
		}
	);
});

router.get("/searchPlaces", function(req, res) {
	var q = req.query.q;
	request(
		"http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?f=json&maxSuggestions=6&text=" +
			q,
		function(err, resp, body) {
			if (err) return;
			res.render("places", JSON.parse(body));
		}
	);
});

router.post("/getDetails", function(req, res) {
	var place = req.body.place;
	var key = req.body.magicKey;
	request(
		"http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?SingleLine=" +
			place +
			"&f=json&outFields=Addr_type,Match_addr,StAddr,City&magicKey=" +
			key +
			"&maxLocations=6",
		function(err, resp, body) {
			if (err) return;
			var body = JSON.parse(body);
			var extent = body.candidates[0].extent;
			var spatialReference = body.spatialReference;
			extent.spatialReference = spatialReference;
			var stringExtent = JSON.stringify(extent);
			console.log(
				"http://14.139.172.6:6080/arcgis/rest/services/Solar_Radiation_Map_of_India/MapServer/5/query?f=json&returnGeometry=true&spatialRel=esriSpatialRelIntersects&maxAllowableOffset=38&geometry=" +
					stringExtent +
					"&geometryType=esriGeometryEnvelope&inSR=102100&outFields=*&outSR=102100"
			);
			request(
				"http://14.139.172.6:6080/arcgis/rest/services/Solar_Radiation_Map_of_India/MapServer/5/query?f=json&returnGeometry=true&spatialRel=esriSpatialRelIntersects&maxAllowableOffset=38&geometry=" +
					stringExtent +
					"&geometryType=esriGeometryEnvelope&inSR=102100&outFields=*&outSR=102100",
				function(error, respo, budy) {
					res.setHeader("Content-Type", "application/json");
					res.send(budy);
				}
			);
		}
	);
});

function getCordinatesX(cord, dist) {
	var meters = dist;
	var coef = meters * 0.0000089;
	var new_lat = cord.lat + coef;
	var new_long = cord.lang + coef / Math.cos(cord.lat * 0.018);
	var newCord = {
		lat: new_lat,
		lang: new_long
	};
	return newCord;
}

router.get("/getLatInfo2", function(req, res) {
	var lat = parseFloat(req.query.lat);
	var lng = parseFloat(req.query.long);
	request(
		"https://developer.nrel.gov/api/solar/solar_resource/v1.json?api_key=dTW8WuLvLy2YbRlTy1B3YHOqIvHNOSSbA59kgiFw&lat=" +
			lat +
			"&lon=" +
			lng,
		function(err, resp, body) {
			res.setHeader("Content-Type", "application/json");
			res.send(body);
		}
	);
});
router.get("/getLatInfo", function(req, reso) {
	var lat = parseFloat(req.query.lat);
	var lang = parseFloat(req.query.long);
	var dist = parseFloat(Math.sqrt(req.query.area));
	var cord = {
		lat: lat,
		lang: lang
	};
	console.log(cord);
	var newCord = getCordinatesX(cord, dist);
	console.log(newCord);
	var extent = {
		xmin: Math.floor(lang),
		ymin: Math.floor(lat),
		xmax: Math.floor(newCord.lang),
		ymax: Math.floor(newCord.lat),
		spatialReference: { wkid: 4326, latestWkid: 4326 }
	};
	// var output = {
	// 	extent: extent
	// };
	var stringExtent = JSON.stringify(extent);
	console.log(stringExtent);
	var ur =
		"http://atlasserver.niwe.res.in/arcgis/rest/services/Solar_radiation/Solar_Radiation_Map_of_India/MapServer/5/query?f=json&returnGeometry=true&spatialRel=esriSpatialRelIntersects&maxAllowableOffset=38&geometry=" +
		stringExtent +
		"&geometryType=esriGeometryEnvelope&inSR=102100&outFields=*&outSR=102100";
	console.log(ur);
	request(
		{
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				host: "atlasserver.niwe.res.in"
			},
			uri: ur,
			method: "GET"
		},
		function(err, res, body) {
			//it works!
			console.log("asdf");
			console.log(err);
			console.log(res);
			console.log(body);
		}
	);
	// request(
	// 	"http://atlasserver.niwe.res.in/arcgis/rest/services/Solar_radiation/Solar_Radiation_Map_of_India/MapServer/5/query?f=json&returnGeometry=true&spatialRel=esriSpatialRelIntersects&maxAllowableOffset=38&geometry=" +
	// 		stringExtent +
	// 		"&geometryType=esriGeometryEnvelope&inSR=102100&outFields=*&outSR=102100",
	// 	function(err, resp, body) {
	// 		reso.setHeader("Content-Type", "application/json");
	// 		console.log(err);
	// 		console.log(resp);
	// 		console.log(body);
	// 		body = JSON.parse(body);
	// 		console.log("here");
	// var output = {};
	// if (body.features[0]) {
	// 	output.error = null;
	// 	output.CUF = {
	// 		value: body.features[0].attributes.CUF,
	// 		units: body.fieldAliases.CUF
	// 	};
	// 	output.AEP = {
	// 		value: body.features[0].attributes.AEP_per_MW,
	// 		units: body.fieldAliases.AEP_per_MW
	// 	};
	// 	output.DNI = {
	// 		value: body.features[0].attributes.DNI,
	// 		units: body.fieldAliases.DNI
	// 	};
	// 	output.GHI = {
	// 		value: body.features[0].attributes.GHI,
	// 		units: body.fieldAliases.GHI
	// 	};
	// 	output.DHI = {
	// 		value: body.features[0].attributes.DHI,
	// 		units: body.fieldAliases.DHI
	// 	};
	// } else {
	// 	output.error = "We got no data here";
	// }
	// 		reso.send(JSON.stringify(output));
	// 		//output.=body.features[0].attributes.CUF;
	// 	}
	// );
});
module.exports = router;
