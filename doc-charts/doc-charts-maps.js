var melissa_spec = {

	bounds: {
		southwest: { lat: 17.30, lng: -77.75 }, 
		northeast: { lat: 18.60, lng: -76.75 }
	},

	vertices: [ wind_speed_areas.vertices_58mph, wind_speed_areas.vertices_74mph ],
	colors: [ "#8c8dc2", "#8a52a5" ],
	
	style: {
		fillOpacity: 0.65,
		strokeOpacity: 0,
		clickable: false,
	},

	ticks: [ "≥ 58 mph", "≥ 74 mph" ],
	title: "Maximum wind speed",
	legend_color_opacity: 0.9,

	draw_layers: draw_melissa_layers,
};

function create_map_legend(spec, legend) {

	var title = document.createElement("div");
	var colors = document.createElement("div");
	var ticks = document.createElement("div");
	var div, i;

	legend.classList.add("legend");
	title.classList.add("title");
	colors.classList.add("colors");
	ticks.classList.add("ticks");

	legend.appendChild(title);
	legend.appendChild(colors);
	legend.appendChild(ticks);

	title.textContent = spec.title;

	for (i=0 ; i < spec.colors.length ; i++) {
		div = document.createElement("div");
		colors.appendChild(div);
		div.style.backgroundColor = spec.colors[i];
		div.style.opacity = spec.legend_color_opacity;
	}

	for (i=0 ; i < spec.ticks.length ; i++) {
		div = document.createElement("div");
		ticks.appendChild(div);
		div.textContent = spec.ticks[i];
	}
}

function add_maximize_button(div, data_spec) {

	var button = document.createElement("div");
	button.classList.add("maximize-button");
	div.appendChild(button);

	div.addEventListener("scroll", function() {
		button.style.right = (data_spec.ui.button.initial_position - div.scrollLeft) + "px";
	});

	button.addEventListener("click", function() {
		maximize_dataviz(data_spec);
	});
}

function maximize_map(spec, center, zoom) {

	var popup = document.getElementById("popup");
	var div = document.createElement("div");
	var legend = document.createElement("div");
	var map = new google.maps.Map(div, {
		center: center,
		zoom: zoom,
		mapTypeId: 'hybrid',
		disableDefaultUI: true,
		gestureHandling: "greedy",
		zoomControl: true,
		zoomControlOptions: {
			position: google.maps.ControlPosition.RIGHT_BOTTOM,
		},
		mapTypeControl: true,
		mapTypeControlOptions: {
    		style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
			position: google.maps.ControlPosition.TOP_LEFT,
		},
	});

	spec.draw_layers(map);

	div.classList.add("map");
	legend.classList.add("map-legend");

	div.appendChild(legend);
	create_map_legend(spec, legend);

	show_maximized_content(div);
}

function draw_melissa_layers(map) {

	var spec = melissa_spec;
	var vertices = spec.vertices;
	var polygon, paths, v, i, j, k;

	for (i=0 ; i < vertices.length ; i++) {

		paths = new Array();
		for (j=0 ; j < vertices[i].length ; j++) {

			v = new Array();
			for (k=0 ; k < vertices[i][j].length ; k++) v.push(new google.maps.LatLng(vertices[i][j][k]));

			paths.push(v);
		}

		polygon = new google.maps.Polygon({ paths: paths });
		polygon.setOptions(spec.style);
		polygon.setOptions({ fillColor: spec.colors[i] });
		polygon.setMap(map);
	}
}

function create_map(spec, div, legend) {

	var map, bounds, button;

	bounds = new google.maps.LatLngBounds(
		new google.maps.LatLng(spec.bounds.southwest),
		new google.maps.LatLng(spec.bounds.northeast)
	);

	map = new google.maps.Map(div, {
		center: bounds.getCenter(),
		zoom: 10,
		mapTypeId: 'hybrid',
		disableDefaultUI: true,
	});
	map.fitBounds(bounds, { top: 0, right: 0, bottom: 0, left: 0 });
	spec.draw_layers(map);

	create_map_legend(spec, legend);

	button = document.createElement("div");
	button.classList.add("maximize-button");
	div.appendChild(button);
	button.addEventListener("click", function() {
		maximize_map(spec, map.getCenter(), map.getZoom());
	});
}

// Bootstrap loader (Dynamic Library Import API)
(g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
	key: "AIzaSyCqHHpYbRdkCj5_gWK6V51ZRuAK__gg1-8",
    v: "weekly",
});