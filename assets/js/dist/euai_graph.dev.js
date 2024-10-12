"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// Global variables for original data and category filters
var originalData;
var categoryColorMap = {};
var activeFilters = new Set(); // Track active category filters
// Fetch and load the JSON data for nodes and links from the specified URL

fetch(euAIdataUrl).then(function (response) {
  return response.json();
}) // Parse JSON response
.then(function (data) {
  return initializeGraph(data);
}) // Initialize graph creation
["catch"](function (error) {
  return console.error("Error loading data:", error);
}); // Catch and log any errors
// Function to initialize the graph with validated data

function initializeGraph(data) {
  originalData = JSON.parse(JSON.stringify(data)); // Store the original data
  // console.log("Original Data at init:")
  // console.log(originalData);
  // Initialize category color map globally

  initializeCategoryColors(data.nodes);

  if (data && Array.isArray(data.nodes) && Array.isArray(data.links)) {
    var _validateData = validateData(data),
        nodes = _validateData.nodes,
        links = _validateData.links; // Validate and filter nodes and links


    createGraph({
      nodes: nodes,
      links: links
    }); // Call createGraph with validated data
  } else {
    console.error("Error: Data format is incorrect or nodes/links are missing.");
  }
} // Function to initialize the category colors


function initializeCategoryColors(nodes) {
  var categories = Array.from(new Set(nodes.map(function (node) {
    return node.category;
  }))); // Get unique categories
  // Define a color scale

  var colorScale = d3.scaleOrdinal(d3.schemePaired); // Assign colors to each category in the global categoryColorMap

  categories.forEach(function (category, index) {
    categoryColorMap[category] = colorScale(index);
  });
} // Validate nodes and links to ensure consistency and return only valid links


function validateData(data) {
  var nodeIds = new Set(data.nodes.map(function (node) {
    return node.id;
  })); // Create a set of node IDs

  var validLinks = data.links.filter(function (link) {
    return nodeIds.has(link.source) && nodeIds.has(link.target);
  }); // Filter links that have both source and target nodes present in the node set

  return {
    nodes: data.nodes,
    links: validLinks
  }; // Return validated nodes and links
} // Filter out redundant links and choose the shorter label when there are bidirectional links


function filterLinkLabelsAndArrows(links) {
  var linkMap = {}; // Initialize a map to track unique pairs of links

  links.forEach(function (link) {
    var pairId = "".concat(link.source.id, "-").concat(link.target.id); // Unique identifier for the link

    var reversePairId = "".concat(link.target.id, "-").concat(link.source.id); // Unique identifier for reverse direction

    if (!linkMap[pairId] && !linkMap[reversePairId]) {
      // If neither direction exists, add the link
      linkMap[pairId] = link;
    } else if (linkMap[reversePairId]) {
      // If the reverse direction exists, choose the shorter reason label
      var reverseLink = linkMap[reversePairId];

      if (link.reason.length < reverseLink.reason.length) {
        delete linkMap[reversePairId]; // Remove the reverse link

        linkMap[pairId] = link; // Add the shorter reason label link
      }
    }
  });
  return Object.values(linkMap); // Return the filtered links as an array
} // Set up the tooltip for displaying node information on hover


function setupTooltip(node) {
  // Create a tooltip div and set its initial styles
  var tooltip = d3.select("body").append("div").attr("class", "tooltip").style("position", "absolute").style("padding", "8px").style("border-radius", "5px").style("pointer-events", "none").style("opacity", 0); // Show tooltip with node's fullname on mouseover

  function showTooltip(event, d) {
    tooltip.transition().duration(200).style("opacity", 1); // Fade in tooltip

    tooltip.html("".concat(d.fullname)).style("left", event.pageX + 10 + "px").style("top", event.pageY - 15 + "px");
  } // Hide tooltip on mouseout


  function hideTooltip() {
    tooltip.transition().duration(500).style("opacity", 0); // Fade out tooltip
  }

  node.on("mouseover", function (event, d) {
    return showTooltip(event, d);
  }) // Attach event handlers for tooltip
  .on("mouseout", function () {
    return hideTooltip();
  });
} // Set up the SVG container and append group elements


function setupGraphContainer(margin, width, height) {
  var svg = d3.select("#graph-container").append("svg") // Create an SVG element
  .attr("width", width + margin.left + margin.right) // Set width with margins
  .attr("height", height + margin.top + margin.bottom) // Set height with margins
  .call(d3.zoom().on("zoom", function (event) {
    return g.attr("transform", event.transform);
  })); // Enable zoom functionality

  var g = svg.append("g").attr("transform", "translate(".concat(margin.left, ",").concat(margin.top, ")")); // Append group element and apply transformation
  // Define arrow markers for directional links

  svg.append("defs").selectAll("marker").data(["end"]).enter().append("marker").attr("id", function (d) {
    return d;
  }).attr("viewBox", "0 -5 10 10").attr("refX", 15).attr("refY", 0).attr("markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto").append("path").attr("d", "M0,-5L10,0L0,5").attr("fill", "#aaa"); // Define the marker's shape and color

  return g; // Return the group element for further use
} // Show detailed node information in the sidebar


function showInfo(d, data) {
  var sidebar = d3.select("#node-info-content"); // Select the sidebar element

  var info = ""; // Define a mapping for field names to display labels and formatters

  var fieldMappings = {
    fullname: {
      label: "Name",
      format: function format(value) {
        return value;
      }
    },
    showname: {
      label: "Aka",
      format: function format(value) {
        return value;
      }
    },
    category: {
      label: "Category",
      format: function format(value) {
        return value;
      }
    },
    url: {
      label: "URL",
      format: function format(value) {
        return "<a href=\"".concat(value, "\" target=\"_blank\">\n            ").concat(value, "\n          </a>");
      }
    },
    startDate: {
      label: "Start Date",
      format: function format(value) {
        return value;
      }
    },
    endDate: {
      label: "End Date",
      format: function format(value) {
        return value;
      }
    },
    budget: {
      label: "Budget",
      format: function format(value) {
        return "\u20AC ".concat(value);
      }
    },
    proposalUrl: {
      label: "Proposal URL",
      format: function format(value) {
        return "<a href=\"".concat(value, "\" target=\"_blank\">\n            ").concat(value, "\n          </a>");
      }
    },
    coordinator: {
      label: "Coordinator",
      format: function format(value) {
        return value;
      }
    },
    coordinatingInstitution: {
      label: "Coordinating Institution",
      format: function format(value) {
        return value;
      }
    }
  }; // Build the HTML content dynamically based on the mapping

  Object.keys(fieldMappings).forEach(function (key) {
    if (d[key]) {
      // Check if the field is present in the data
      var _fieldMappings$key = fieldMappings[key],
          label = _fieldMappings$key.label,
          format = _fieldMappings$key.format;
      info += "<div><strong>".concat(label, ":</strong> ").concat(format(d[key]), "</div><br>");
    }
  }); // Group connections by their 'reason' field and display them

  var groupedConnections = data.links.filter(function (link) {
    return link.source.id === d.id || link.target.id === d.id;
  }).reduce(function (acc, link) {
    var isSource = link.source.id === d.id;
    var otherNode = isSource ? link.target.showname : link.source.showname;
    var direction = isSource ? "\u2192" : "\u2190";
    var linkColor = isSource ? "#4CAF50" : "#FF5722";
    if (!acc[link.reason]) acc[link.reason] = [];
    acc[link.reason].push("<li style=\"margin-bottom: 8px;\"><strong style=\"color: ".concat(linkColor, ";\">").concat(d.showname, "</strong> ").concat(direction, " <strong>").concat(otherNode, "</strong></li>"));
    return acc;
  }, {}); // Create HTML string by grouping connections under headings

  for (var _i = 0, _Object$entries = Object.entries(groupedConnections); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
        reason = _Object$entries$_i[0],
        connections = _Object$entries$_i[1];

    info += "<h3>".concat(reason, "</h3><ul>").concat(connections.join(""), "</ul>");
  }

  sidebar.html(info); // Update the sidebar with the constructed HTML content
} // Set up drag functionality to move nodes around


function setupDrag(simulation, node) {
  // Event handler for drag start
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart(); // Increase simulation activity

    d.fx = d.x;
    d.fy = d.y;
  } // Event handler for dragging the node


  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  } // Event handler for drag end


  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0); // Reset simulation activity

    d.fx = null;
    d.fy = null;
  }

  node.call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended)); // Attach drag event handlers to nodes
} // Set up and render links and their labels


function setupLinks(g, data) {
  var filteredLinks = filterLinkLabelsAndArrows(data.links); // Filter out redundant links
  // Draw links as lines between nodes

  var link = g.append("g").attr("class", "links").selectAll("line").data(filteredLinks).enter().append("line").attr("class", "link").style("stroke-width", 2).style("stroke", "#aaa").attr("marker-end", "url(#end)"); // Attach arrow markers to end of each link
  // Add labels to the links

  g.append("g").attr("class", "link-labels").selectAll("text").data(filteredLinks).enter().append("text").attr("class", "link-label").attr("dy", 5).attr("text-anchor", "middle").text(function (d) {
    return d.reason;
  }); // Display link 'reason' as label

  return link;
} // Set up and render nodes with category-based colors and labels


function setupNodes(g, data) {
  // Create node elements (circles) for each data node
  var node = g.append("g").attr("class", "nodes").selectAll("circle").data(data.nodes).enter().append("circle").attr("class", "node").attr("r", 10).style("fill", function (d) {
    return categoryColorMap[d.category];
  }); // Apply category-specific colors
  // Add labels (text) to each node based on their 'showname'

  g.append("g").attr("class", "node-labels").selectAll("text").data(data.nodes).enter().append("text").attr("class", "node-label").attr("dy", -15).attr("text-anchor", "middle").text(function (d) {
    return d.showname;
  }); // Display the 'showname' of each node

  return node; // Return node selection for further use
} // Add nodes to the force simulation and update positions on each tick


function addNodesToSimulation(simulation, data, link, node) {
  // Update positions of nodes and links on each tick of the simulation
  simulation.nodes(data.nodes).on("tick", function () {
    link.attr("x1", function (d) {
      return d.source.x;
    }).attr("y1", function (d) {
      return d.source.y;
    }).attr("x2", function (d) {
      return d.target.x;
    }).attr("y2", function (d) {
      return d.target.y;
    });
    node.attr("cx", function (d) {
      return d.x;
    }).attr("cy", function (d) {
      return d.y;
    }); // Update positions of node labels

    d3.selectAll(".node-label").attr("x", function (d) {
      return d.x;
    }).attr("y", function (d) {
      return d.y;
    }); // Update positions of link labels

    d3.selectAll(".link-label").attr("x", function (d) {
      return (d.source.x + d.target.x) / 2;
    }).attr("y", function (d) {
      return (d.source.y + d.target.y) / 2;
    });
  });
} // Function to add a legend for toggling categories


function addLegend(g, nodes) {
  var categories = Array.from(new Set(nodes.map(function (node) {
    return node.category;
  }))); // add active to categories

  activeFilters.forEach(function (category) {
    if (!categories.includes(category)) {
      categories.push(category);
    }
  }); // sort alphabetically

  categories.sort();
  var legend = g.append("g").attr("class", "legend").attr("transform", "translate(10, 10)"); // Add a surrounding rectangle to the legend

  var legendWidth = 200;
  var legendHeight = categories.length * 20 + 70;
  legend.append("rect").attr("width", legendWidth).attr("height", legendHeight).style("fill", "none").style("stroke", "#444").style("stroke-width", "1px"); // Add legend title

  legend.append("text").attr("x", 10).attr("y", 15).attr("font-weight", "bold").text("Legend");
  legend.append("text").attr("x", 10).attr("y", 35).text("(Click to toggle)");
  categories.forEach(function (category, index) {
    var legendRow = legend.append("g").attr("class", "legend-item").attr("transform", "translate(10, ".concat(index * 20 + 45, ")")).style("cursor", "pointer").on("click", function () {
      return toggleCategoryFilter(category);
    }); // Toggle category filter on click

    legendRow.append("rect").attr("width", 12).attr("height", 12).style("fill", categoryColorMap[category]).style("opacity", activeFilters.has(category) ? 0.3 : 1) // Set opacity if category is filtered
    .style("stroke", "#444");
    legendRow.append("text").attr("x", 20).attr("y", 10).text(category);
  });
} // Function to filter nodes and links by active categories and update graph


function updateGraphByActiveFilters() {
  var originalDataCopy = JSON.parse(JSON.stringify(originalData)); // If no active filters, show the original graph

  if (activeFilters.size === 0) {
    createGraph(JSON.parse(JSON.stringify(originalDataCopy)));
    return;
  } // Filter nodes based on active filters


  var filteredNodes = originalDataCopy.nodes.filter(function (node) {
    return !activeFilters.has(node.category);
  });
  var filteredNodeIds = new Set(filteredNodes.map(function (node) {
    return node.id;
  })); // Filter links based on filtered nodes

  var filteredLinks = originalDataCopy.links.filter(function (link) {
    return filteredNodeIds.has(link.source) && filteredNodeIds.has(link.target);
  }); // console.log("Filtered Nodes:")
  // console.log(filteredNodes);
  // console.log("Filtered ids:")
  // console.log(filteredNodeIds);
  // console.log("Filtered Links:")
  // console.log(filteredLinks);
  // console.log("Active filters:")
  // console.log(activeFilters);

  createGraph({
    nodes: filteredNodes,
    links: filteredLinks
  });
} // Toggle category filter and update the graph


function toggleCategoryFilter(category) {
  //console.log("Toggling category filter:", category);
  // Toggle the category in the active filter set
  if (activeFilters.has(category)) {
    activeFilters["delete"](category);
  } else {
    activeFilters.add(category);
  } // Update the graph based on active filters


  updateGraphByActiveFilters();
} // Function to set up click highlight functionality and show node info


function setupClickHighlight(node, link, data) {
  node.on("click", function (event, d) {
    // Show node information in the sidebar
    showInfo(d, data); // Reset opacity for nodes, links, and labels

    node.style("opacity", 0.1);
    link.style("opacity", 0.1);
    d3.selectAll(".node-label").style("opacity", 0.1);
    d3.selectAll(".link-label").style("opacity", 0.1); // Highlight clicked node

    d3.select(this).style("opacity", 1); // Highlight connected links and nodes

    link.filter(function (l) {
      return l.source.id === d.id || l.target.id === d.id;
    }).style("opacity", 1).each(function (l) {
      d3.select("#node-".concat(l.source.id)).style("opacity", 1);
      d3.select("#node-".concat(l.target.id)).style("opacity", 1);
    }); // Highlight connected nodes

    node.filter(function (n) {
      return link.filter(function (l) {
        return l.source.id === d.id || l.target.id === d.id;
      }).data().some(function (l) {
        return l.source.id === n.id || l.target.id === n.id;
      });
    }).style("opacity", 1); // Highlight labels of connected nodes and links

    d3.selectAll(".node-label").filter(function (n) {
      return n.id === d.id || link.data().some(function (l) {
        return (l.source.id === d.id || l.target.id === d.id) && (l.source.id === n.id || l.target.id === n.id);
      });
    }).style("opacity", 1);
    d3.selectAll(".link-label").filter(function (l) {
      return l.source.id === d.id || l.target.id === d.id;
    }).style("opacity", 1);
  }); // Reset highlight when clicking on the background

  d3.select("#graph-container").on("click", function (event) {
    if (event.target.tagName === "svg") {
      node.style("opacity", 1);
      link.style("opacity", 1);
      d3.selectAll(".node-label").style("opacity", 1);
      d3.selectAll(".link-label").style("opacity", 1);
    }
  });
} // Create and render the entire graph with nodes, links, and additional elements


function createGraph(data) {
  // Clear previous graph elements, if any
  d3.select("#graph-container").select("svg").remove(); // log the active filters
  // console.log("Graph created, Active filters:");
  // console.log(activeFilters);
  // console.log("Data:");
  // console.log(data);
  // console.log("Original Data:");
  // console.log(originalData);
  // console.log("Original Data:")
  // console.log(originalData);

  var margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  };
  var width = window.innerWidth - margin.left - margin.right; // Calculate available width

  var height = window.innerHeight - margin.top - margin.bottom; // Calculate available height

  var g = setupGraphContainer(margin, width, height); // Set up SVG container and return group element
  // Create force simulation for node positioning

  var simulation = d3.forceSimulation(data.nodes).force("link", d3.forceLink(data.links).id(function (d) {
    return d.id;
  }).distance(200)).force("charge", d3.forceManyBody().strength(-500)).force("center", d3.forceCenter(width / 2, height / 2)); // Set up and render links

  var link = setupLinks(g, data); // Set up and render nodes with labels

  var node = setupNodes(g, data); // Attach tooltip functionality to nodes

  setupTooltip(node); // Attach drag functionality to nodes

  setupDrag(simulation, node); // Add nodes and links to simulation and handle tick updates

  addNodesToSimulation(simulation, data, link, node); // Add legend for toggling categories

  addLegend(g, data.nodes);
  setupClickHighlight(node, link, data);
}