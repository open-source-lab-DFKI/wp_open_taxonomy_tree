/**
 * Open Taxonomy Tree Wordpress Plugin
 *
 */

jQuery(document).ready(function($) {

var root;

// Create measurements
var margin = {top: 20, right: 20, bottom: 20, left: 20},
    width  = 900 - margin.right - margin.left,
    height = 500 - margin.top - margin.bottom;

// Set size of tree layout
var tree = d3.layout.tree()
    .size([height, width]);

// Rotate the coordinates for horizontal layout
var diagonal = d3.svg.diagonal()
    .projection(function(d) {return [d.y, d.x];});

// Create the svg
var svg = d3.select('#taxonomytree').append("svg")
    .attr("viewBox", "0 0 " + width + " " + height)
    .attr("preserveAspectRatio", "xMinYMin")
    .append("g")
    .attr("transform", "translate(" + margin.left + ","  + margin.top/2 + ")");

// Ajax
jQuery.ajax({
    url: TaxononmyTreeAjax.ajaxurl,
    data: {
	    'action': 'taxonomytree',
    },
    dataType: 'JSON',
    success: function(data) {
	    // alert(JSON.stringify(data));
	    root = data;
	    root.x0 = height / 2;
	    root.y0 = 0;

	    update(root);
    },
    error: function(errorThrown) {
	   //alert(JSON.stringify(errorThrown));
	   console.log(errorThrown);
    }
});


function update(source) {

/**
 * Create arrays and measurements
 *
 */

// Create nodes
var nodes = tree.nodes(root);

// Create links
var links = tree.links(nodes);

console.log(root);
console.log(nodes);
console.log(links);

// Create length units
var unitLenght = 150;
    nodes.forEach(function(d) {return d.y = d.depth * unitLenght + unitLenght;});
    nodes.forEach(function(d) {
		if (d.depth==0) {return d.y = d.y - unitLenght/3;}
		if (d.depth==2) {return d.y = d.y + unitLenght/2;}
		if (d.depth==3) {return d.y = d.y - unitLenght/6;}
    });


/**
 * Create Elements
 *
 */

// Create and style digaonals of all links
svg.selectAll(".link")
    .data(links)
    .enter()
    .append("g")
    .attr("class", "diagonal")
    .append("path")
    .attr("class", "link")
    .style("stroke-width", "1")
    .style("fill", "none")
    .style("stroke", function(d) {
		if (d.target.taxonomy_color) {
		    return d.target.taxonomy_color
		}
		if (d.target.parent.taxonomy_color ) {
		    return d.target.parent.taxonomy_color
		}
		if (d.target.parent.parent.taxonomy_color ) {
		    return d.target.parent.parent.taxonomy_color
		}
	})
    .attr("d", diagonal)
    .attr("z-index", "-100");

// Create g.node
var node = svg.selectAll(".node")
	.data(nodes)
	.enter()
	.append("g")
	.attr("class", "node")
	.attr("transform", function(d) {
        // Rotate the coordinates d.x and d.y for horizontal layout
		return "translate(" + d.y + "," + d.x  + ")";
    })
	.attr("z-index", "0");

// Append names on g.node
node.filter(function(d) {return d.depth==0 || d.depth==3})
	.append("text")
	.attr("class", "labels")
	.text(function(d) {return d.name;}) // Appends the name of the node as text
	.style("text-anchor", function(d) {if (d.depth==0) {return "end";}}) // Switches the textanchor of depth 1 and 2
	.attr("transform", "translate(0, -5)")
	.style("fill", "black")
	.filter(function(d) {return d.depth==0;})
	.call(wrap, 90, 15);

// Append g.circle to level 3
node.filter(function(d) {return d.depth==3;})
	.append("g")
	.attr("class", "circle");

// Append g.line to level 3
node.filter(function(d) {return d.depth==3;})
	.append("g")
	.attr("class", "line");


// Create Links for blogposts
nodes.forEach(function(d){

	// Request and save post_name
	if ( d.post_content ) {

        var lineLength = 1.7 * unitLenght;

		// Create Link
		svg.selectAll(".labels")
			.filter(function(e) {return (d.post_title==e.name);})
			.text(d.post_title)								// Insert text content in a-element
			.style("fill", d.parent.parent.taxonomy_color );

		// Create line
		svg.selectAll(".line")
			.filter(function(e) {
                return (d.post_title==e.name);
            })
			.insert("line")
			.attr("class", "inline")
			.attr("stroke-width", 1)
			.attr("x1", function(d) {return 0})
			.attr("y1", function(d) {return 0})
			.attr("x2", function(d) {return 0  + lineLength})
			.attr("y2", function(d) {return 0})
			.style("stroke", d.parent.parent.taxonomy_color)

		// Create circle
		svg.selectAll(".circle")
			.filter(function(e) {
                return (d.post_title==e.name);
            })
			.insert("a")
			.attr("xlink:href", location.href + d.post_name)
			.attr("class", "blog-link")
			.insert("circle")
			.attr("class", "mycircle")
			.attr('r', 5)
			.attr("cx", lineLength -5 -1.5)
			.attr("cy", -5 -3*1.5)
			.style("stroke", d.parent.parent.taxonomy_color)
            .style("fill", "none");

		// Insert line in circle
		svg.selectAll(".circle")
			.filter(function(e) {
                return (d.post_title==e.name);
            })
			.insert("line")
			.attr("class", "horizontal-line")
			.attr("stroke-width", 1)
			.attr("x1", lineLength -9.5 )
			.attr("y1", -5 -3*1.5)
			.attr("x2", lineLength -3.5)
			.attr("y2", -5 -3*1.5)
			.style("stroke", d.parent.parent.taxonomy_color)
			.style("z-index", 100)

        // Insert line in circle
		svg.selectAll(".circle")
			.filter(function(e) {
                return ( d.post_title==e.name );
            })
			.insert("line")
			.attr("class", "vertiacal-line")
			.attr("stroke-width", 1)
			.attr("x1", lineLength -6.5 )
			.attr("y1", -5 -5*1.5)
			.attr("x2", lineLength -6.5)
			.attr("y2", -5 -1*1.5)
			.style("stroke", d.parent.parent.taxonomy_color)
			.style("z-index", 100)
	}
});

// Path names
// Create defs with ID
svg.selectAll('.infoCurvy')
	.data(links)
	.enter()
	.append("defs").append("path")
	.attr("class", "infoCurvy")
	.attr("id", function(d){return d.target.term_id})
	.attr("d", diagonal);

// Create textCurvy related to defs
var curvyText = svg.selectAll('.textCurvy')
	.data(nodes)
	.enter()
	.append('g')
	.append("text")
	.attr("dy", "-0.35em")
	.attr("class", "textCurvy")
	.append("textPath")
	.attr("xlink:href",function(d) {return "#"+d.term_id;})
	.text(function(d) {return d.name})
	.attr("startOffset", "100%")
	.style("text-anchor", "end")
	.style("fill", function(d) {
		if (d.taxonomy_color) {
            return d.taxonomy_color
        }
		if (d.parent.taxonomy_color) {
            return d.parent.taxonomy_color
        }
        else { return "black" }}
    );

/*
 *
 * MOUSE INTERAKTION
 *
 */

node.on("mouseover", handleMouseOver);
node.on("mouseout", handleMouseOut);
node.on("click", handleMouseClick);

curvyText.on("mouseover", handleMouseOver);
curvyText.on("mouseout", handleMouseOut);

function handleMouseOver (d) {

	// Highlight taxonomy path of element
	svg.selectAll(".link")
    	.filter(function(e) {
    		return ((d.name==e.name)			   && (e.source === d.parent) || (e.target === d)) ||
    			   ((d.parent.name==e.name)		   && (e.source === e.parent) || (e.target === d.parent)) ||
    			   ((d.parent.parent.name==e.name) && (e.source === e.parent) || (e.target === d.parent.parent));
        })
    	.style("stroke-width", "2.25");

	// Highlight text of element
	svg.selectAll(".textCurvy, .labels")
        .filter(function(j) {return (d.name==j.name);})
		.style("font-weight", "600");

	// Highlight line of element
	svg.selectAll(".inline")
		.filter(function(j) {return (d.name==j.name);})
		.style("stroke-width", "2.25");

	// Highlight circle of element
	svg.selectAll(".mycircle")
		.filter(function(j) {return (d.name==j.name);})
		.style("fill", d.parent.parent.taxonomy_color);

	svg.selectAll(".vertiacal-line, .horizontal-line")
		.filter(function(j) {return (d.name==j.name);})
		.classed("highlight", true)
		.style("stroke", "white");
}

function handleMouseOut (d) {

	// unhighlight text and path of mouseover element
	d3.selectAll(".link, .mycircle, .inline")
        .style("stroke-width", "1");

    d3.selectAll(".mycircle")
        .style("fill", "none");

    d3.selectAll(".highlight")
		.classed("highlight", false)
		.style("stroke", d.parent.parent.taxonomy_color);

    d3.selectAll(".textCurvy, .labels")
        .style("font-weight", "400");
}

function handleMouseClick (d) {

	if (d.post_content) {

		var alertBox = document.getElementById("alertbox");
		    alertBox.style.display = "block";

		$("#alert-box-inner").animate({opacity: "1"}, 100);
		$("#alert-box-inner-inner").animate({opacity: "1"}, 500);

		var alertBoxText = document.getElementById("alert-text");
		var ourHTMLString = "";
		    ourHTMLString += "<h3>" + d.post_title + "</h3>";
		    ourHTMLString += "<p>" + d.post_excerpt + "</p>";

		alertBoxText.innerHTML = ourHTMLString;

		var taxonomyBoxLink = document.getElementById("alert-link");
		    taxonomyBoxLink.href = location.href + d.post_name;
	}
}



addAlertBox();

function addAlertBox() {

    var taxonomyTree = document.getElementById("taxonomytree");
        taxonomyTree.insertAdjacentHTML('afterend', '<div id="alertbox" style="display: none;"></div>');
    var alertBox = document.getElementById("alertbox");
        alertbox.innerHTML += '<div id="alert-box-inner" class="hide-me"></div>';
    var alertBoxInner = document.getElementById("alert-box-inner");
        alertBoxInner.innerHTML += '<div id="alert-box-inner-inner" class="hide-me"></div>';
    var alertBoxInnerInner = document.getElementById("alert-box-inner-inner");
        alertBoxInnerInner.innerHTML += '<span id="alert-skip">X</span>';
        alertBoxInnerInner.innerHTML += '<div id="alert-text"></div>';
        alertBoxInnerInner.innerHTML += '<div id="alert-thumbnail"></div>';


    var removeAlertBox = document.getElementById("alert-skip");
        removeAlertBox.addEventListener('click', function() {

            $("#alert-box-inner-inner").animate({opacity: "0"}, 500);

            setTimeout(function(){
                $("#alert-box-inner").animate({opacity: "0"}, 300);
            }, 500);

            setTimeout(function() {
                // TODO: variablen nur einmal deklarieren?
                var alertBox = document.getElementById("alertbox");
                alertBox.style.display = "none";
            }, 800);

        });
}


// Wraps texts
//QUESTION: warum fehlen hier so viele SEMIKOLONS???
function wrap(text, width, mydy) {

    text.each(function() {

        var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", "" + mydy /-2 + "px")

        while (word = words.pop()) {
            line.push(word)
            tspan.text(line.join(" "))

            if (tspan.node().getComputedTextLength() > width) {
                line.pop()
                tspan.text(line.join(" "))
                line = [word]
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", "" + mydy + "px").text(word)
            }
        }
    })
}

} // update()

}); // jQuery()
