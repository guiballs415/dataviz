var parishes_table_spec = {

	schema: [
		"Parish",
		"Maximum wind speed",
	],

	table: [
		[ "Clarendon", { text: "≥ 58 mph", bar: 58, color: "#8c8dc2" } ],
		[ "Hanover", { text: "≥ 74 mph", bar: 74, color: "#8a52a5" } ],
		[ "Kingston", { text: "≥ 39 mph", bar: 39, color: "#a5c1dc" } ],
		[ "Manchester", { text: "≥ 74 mph", bar: 74, color: "#8a52a5" } ],
		[ "Portland", { text: "≥ 39 mph", bar: 39, color: "#a5c1dc" } ],
		[ "St Andrew", { text: "≥ 39 mph", bar: 39, color: "#a5c1dc" } ],
		[ "St Ann", { text: "≥ 74 mph", bar: 74, color: "#8a52a5" } ],
		[ "St Catherine", { text: "≥ 39 mph", bar: 39, color: "#a5c1dc" } ],
		[ "St Elizabeth", { text: "≥ 74 mph", bar: 74, color: "#8a52a5" } ], 
		[ "St James", { text: "≥ 74 mph", bar: 74, color: "#8a52a5" } ],
		[ "St Mary", { text: "≥ 58 mph", bar: 58, color: "#8c8dc2" } ],
		[ "St Thomas", { text: "≥ 39 mph", bar: 39, color: "#a5c1dc" } ],
		[ "Trelawny", { text: "≥ 74 mph", bar: 74, color: "#8a52a5" } ],
		[ "Westmoreland", { text: "≥ 74 mph", bar: 74, color: "#8a52a5" } ],
	],

	bars: {
		width: 100,
		scale: 74,
		opacity: 0.85,
	},

	style: "two-columns",
};

var timeseries_table_spec = {

	schema: [
		"Parish",
		"Wind ≥ 74 mph",
		"Duration",
	],

	table: null,

	style: "three-columns",
};

function create_table(spec, table) {

	var num_cols = spec.schema.length;
	var div, sub_div, i, j;

	table.classList.add(spec.style);

	// Header
	for (j=0 ; j < num_cols ; j++) {

		div = document.createElement("div");
		div.classList.add("header");
		table.appendChild(div);

		div.textContent = spec.schema[j];
	}

	// Rows
	for (i=0 ; i < spec.table.length ; i++) {
		for (j=0 ; j < num_cols ; j++) {

			div = document.createElement("div");
			table.appendChild(div);

			if (spec.table[i][j].text == undefined) {

				div.textContent = spec.table[i][j];

			} else if (spec.table[i][j].bar == undefined) {

				div.textContent = spec.table[i][j].text;

			} else {

				div.classList.add("value-with-bar");

				sub_div = document.createElement("div");
				div.appendChild(sub_div);
				sub_div.textContent = spec.table[i][j].text;

				sub_div = document.createElement("div");
				sub_div.classList.add("bar");
				div.appendChild(sub_div);

				sub_div.style.backgroundColor = spec.table[i][j].color;
				sub_div.style.opacity = spec.bars.opacity;
				sub_div.style.width = Math.round(spec.table[i][j].bar / spec.bars.scale * spec.bars.width) + "px";
			}
		}
	}
}