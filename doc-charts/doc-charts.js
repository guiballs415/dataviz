var timeseries_spec = {

	width: 600,
	height: 280,

	grid: {
		weight: {
			axis: 1,
			level: 1,
		},
		color: {
			axis: "#80868b",
			level: "#dadce0",
		},
	},

	tick: {
		length: 6,
		margin: 24,
	},

	padding: {
		top: 10,
		right: 40,
		bottom: 48,
		left: 44,
	},

	label: {
		size: 14,
		color: "#202124",
		margin: {
			level: 6, // distance between axis and right edge of label
			tick: 8,
		},
		height: 16,
	},

	line: {
		weight: 3,
		colors: [
			"#12b5cb", // Cyan 600
			"#e52592", // Pink 600
			"#7cb342", // Light Green 600
			"#9334e6", // Purple 600
			"#1a73e8", // Blue 600
			"#f9ab00", // Yellow 600
			"#80868b", // Gray 600
		],
	},
};

var parishes_chart_spec = {

	slices: wind_speed_timeseries,
	transform: transform_hurricane_force_timeseries,
	wind_threshold: 74, // mph

	chart: timeseries_spec,
	levels: [ 25, 50, 75, 100, 125, 150 ],
	metric: "Maximum wind speed (mph)",

	time_difference: -5, // Jamaica time difference from UTC (hours)

	analysis_spec: timeseries_table_spec, 
};

// Limited to interpolation within same day
function interpolate_time(t1, t2, target) {

	var hr = Number(t1.time.substring(0,2));
	var min = Number(t2.time.substring(2));
	var d_scale = (target - t1.wind) / (t2.wind - t1.wind);
	var d_hours = d_scale * (t2.hours - t1.hours);
	var t3 = {
		hours: t1.hours + d_hours,
		date: t1.date,
	};

	hr = hr + Math.floor(d_hours);
	min = min + Math.floor((d_hours - Math.floor(d_hours)) * 60);

	hr += Math.floor(min / 60);
	min = min % 60;
	t3.time = (hr < 10 ? "0" : "") + hr + (min < 10 ? "0" : "") + min;

	return t3;
}

function transform_hurricane_force_timeseries(spec) {

	var data = new Array();
	var analysis = new Array();
	var timeseries, hr, min, month, date, t1, t2, dh, dm, dt, i, j;

	for (i=0 ; i < spec.slices.length ; i++) {
		timeseries = spec.slices[i].timeseries;
		for (j=0 ; j < timeseries.length && timeseries[j].wind < parishes_chart_spec.wind_threshold ; j++) ;
		if (j < timeseries.length) data.push(spec.slices[i]);
	}

	for (i=0 ; i < data.length ; i++) {
		timeseries = data[i].timeseries;
		for (j=0 ; j < timeseries.length ; j++) {
			hr = Number(timeseries[j].time.substring(0,2));
			min = timeseries[j].time.substring(2);
			hr += parishes_chart_spec.time_difference;
			if (hr < 0) {
				hr += 24;
				month = timeseries[j].date.substring(0,4);
				date = Number(timeseries[j].date.substring(4));
				date -= 1;
				timeseries[j].date = month + date;
			}
			timeseries[j].time = (hr < 10 ? "0" : "") + hr + min;
		}
	}

	for (i=0 ; i < data.length ; i++) {

		timeseries = data[i].timeseries;
		
		for (j=0 ; j < timeseries.length && timeseries[j].wind < parishes_chart_spec.wind_threshold ; j++) ;
		if (j == timeseries.length) {
			data[i].start = 999999;
			continue;
		}

		if (j == 0) t1 = timeseries[j];
		else t1 = interpolate_time(timeseries[j-1], timeseries[j], parishes_chart_spec.wind_threshold);

		for ( ; j < timeseries.length && timeseries[j].wind >= parishes_chart_spec.wind_threshold ; j++) ;

		if (j == timeseries.length) t2 = timeseries[j-1];
		else t2 = interpolate_time(timeseries[j-1], timeseries[j], parishes_chart_spec.wind_threshold);

		dh = t2.hours - t1.hours;
		dm = Math.floor((dh - Math.floor(dh)) * 60);
		dh = Math.floor(dh);
		if (dh > 0) dt = dh + " hours" + (dm > 0 ? ", " : "");
		else dt = "";
		if (dm > 0) dt += dm + " minutes";

		j = analysis.length;
		analysis[j] = new Array();
		analysis[j][0] = data[i].parish;
		analysis[j][1] = format_time(t1.time, true) + " " + t1.date;
		analysis[j][2] = (j < timeseries.length ? "" : "> ") + dt;
		analysis[j][3] = t1.hours;
		data[i].start = t1.hours;
	}

	analysis.sort(function(a, b) { return (a[3] < b[3] ? -1 : 1) });
	spec.analysis_spec.table = analysis;

	data.sort(function(a, b) { return (a.start < b.start ? -1 : 1) });

	return data;
}

function get_timeseries_chart(data_slices, data_spec) {

	var chart_spec = timeseries_spec;
	var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	var grid = document.createElementNS(svg.namespaceURI, "g");
	var curves = document.createElementNS(svg.namespaceURI, "g");
	var labels = document.createElementNS(svg.namespaceURI, "g");
	var ticks = new Array();
	var grid_width = chart_spec.width - chart_spec.padding.left - chart_spec.padding.right;
	var grid_height = chart_spec.height - chart_spec.padding.top - chart_spec.padding.bottom;
	var line, text, t1, t2, date, v, sx, sy, x, y, p, i, j;

	svg.setAttribute("viewBox", "0 0 " + chart_spec.width + " " + chart_spec.height);
	svg.setAttribute("width", chart_spec.width);
	svg.setAttribute("height", chart_spec.height);

	svg.appendChild(grid);
	svg.appendChild(curves);
	svg.appendChild(labels);

	// Find first tick
	t1 = null;
	for (i=0 ; i < data_slices.length ; i++) {
		v = data_slices[i].timeseries;
		if (t1 == null || v[0].hours < t1.hours) t1 = v[0];
	}
	ticks.push(t1);

	// Find rest of the ticks
	while (true) {
		t2 = null;
		for (i=0 ; i < data_slices.length ; i++) {
			v = data_slices[i].timeseries;
			for (j=0 ; j < v.length && v[j].hours <= t1.hours ; j++) ;
			if (j < v.length && (t2 == null || v[j].hours < t2.hours)) t2 = v[j];
		}
		if (t2 == null) break;
		ticks.push(t2);
		t1 = t2;
	}

	// Draw horizontal grid lines & labels
	for (i=0 ; i <= data_spec.levels.length ; i++) {

		x = chart_spec.padding.left;
		y = chart_spec.padding.top + grid_height - i * grid_height / data_spec.levels.length;

		line = document.createElementNS(svg.namespaceURI, "line");
		line.setAttribute("fill", "none");
		line.setAttribute("stroke", (i == 0 ? chart_spec.grid.color.axis : chart_spec.grid.color.level));
		line.setAttribute("stroke-width", (i == 0 ? chart_spec.grid.weight.axis : chart_spec.grid.weight.level));
		line.setAttribute("x1", x);
		line.setAttribute("y1", y);
		line.setAttribute("x2", x + grid_width);
		line.setAttribute("y2", y);
		grid.appendChild(line);

		text = document.createElementNS(svg.namespaceURI, "text");
		text.textContent = (i == 0 ? 0 : data_spec.levels[i-1]);
		text.setAttribute("font-size", chart_spec.label.size);
		text.setAttribute("fill", chart_spec.label.color);
		text.setAttribute("y", y);
		text.setAttribute("alignment-baseline", "middle");
		text.setAttribute("x", chart_spec.padding.left - chart_spec.label.margin.level);
		text.setAttribute("text-anchor", "end");
		labels.appendChild(text);
	}

	// Draw ticks & labels
	for (i=0 ; i < ticks.length ; i++) {

		x = chart_spec.padding.left + chart_spec.tick.margin
			+ i * (grid_width - chart_spec.tick.margin * 2) / (ticks.length - 1);
		y = chart_spec.padding.top + grid_height;

		line = document.createElementNS(svg.namespaceURI, "line");
		line.setAttribute("fill", "none");
		line.setAttribute("stroke", chart_spec.grid.color.axis);
		line.setAttribute("stroke-width", chart_spec.grid.weight.axis);
		line.setAttribute("x1", x);
		line.setAttribute("y1", y);
		line.setAttribute("x2", x);
		line.setAttribute("y2", y + chart_spec.tick.length);
		grid.appendChild(line);

		text = document.createElementNS(svg.namespaceURI, "text");
		text.textContent = format_time(ticks[i].time);
		text.setAttribute("font-size", chart_spec.label.size);
		text.setAttribute("fill", chart_spec.label.color);
		text.setAttribute("x", x);
		text.setAttribute("text-anchor", "middle");
		text.setAttribute("y", y + chart_spec.label.margin.tick);
		text.setAttribute("alignment-baseline", "text-before-edge");
		labels.appendChild(text);

		if (i > 0 && ticks[i].date === date) continue;
		date = ticks[i].date;

		text = document.createElementNS(svg.namespaceURI, "text");
		text.textContent = date;
		text.setAttribute("font-size", chart_spec.label.size);
		text.setAttribute("fill", chart_spec.label.color);
		text.setAttribute("x", x);
		text.setAttribute("text-anchor", "middle");
		text.setAttribute("y", y + chart_spec.label.margin.tick + chart_spec.label.height);
		text.setAttribute("alignment-baseline", "text-before-edge");
		labels.appendChild(text);
	}

	// Draw curves
	sx = (grid_width - chart_spec.tick.margin * 2) / (ticks[ticks.length-1].hours - ticks[0].hours);
	sy = grid_height / data_spec.levels[data_spec.levels.length-1];

	for (i=0 ; i < data_slices.length ; i++) {

		v = data_slices[i].timeseries;

		line = document.createElementNS(svg.namespaceURI, "polyline");
		line.setAttribute("fill", "none");
		line.setAttribute("stroke", chart_spec.line.colors[i % chart_spec.line.colors.length]);
		line.setAttribute("stroke-width", chart_spec.line.weight);
		curves.appendChild(line);

		for (j=0 ; j < v.length ; j++) {
			x = chart_spec.padding.left + chart_spec.tick.margin + (v[j].hours - ticks[0].hours) * sx;
			y = chart_spec.padding.top + grid_height - v[j].wind * sy;
			p = svg.createSVGPoint();
			p.x = x;
			p.y = y;
			line.points.appendItem(p);
		}
	}

	return svg;
}

function format_time(time, always_show_minutes=false) {

	var h = Number(time.substring(0,2));
	var m = Number(time.substring(2));
	var s;

	if (h < 1) s = "12";
	else if (h < 13) s = h;
	else s = h - 12;

	if (m < 1 && !always_show_minutes) ;
	else if (m < 10) s += ":0" + m;
	else s += ":" + m;

	if (h < 12) s += "\u2009AM";
	else s += "\u2009PM";

	return s;
}

function create_timeseries_legend(data, legend) {

	var div, color, label, i;

	for (i=0 ; i < data.length ; i++) {

		div = document.createElement("div");
		color = document.createElement("div");
		label = document.createElement("div");

		color.classList.add("color");
		label.classList.add("label");

		div.appendChild(color);
		div.appendChild(label);
		legend.appendChild(div);

		color.style.backgroundColor = timeseries_spec.line.colors[i % timeseries_spec.line.colors.length];
		label.textContent = data[i].parish;
	}
}

function create_chart(spec, div, legend) {

	var blank = document.createElement("div");
	var legend = document.createElement("div");
	var metric = document.createElement("div");
	var graph = document.createElement("div");
	var data, svg, i;

	if (spec.transform != undefined) data = spec.transform(spec);

	if (spec.chart == timeseries_spec) svg = get_timeseries_chart(data, spec);
	else return;

	legend.classList.add("timeseries-legend");
	create_timeseries_legend(data, legend);

	metric.classList.add("metric");
	metric.textContent = spec.metric;

	graph.appendChild(svg);

	div.appendChild(blank);
	div.appendChild(legend);
	div.appendChild(metric);
	div.appendChild(graph);
}