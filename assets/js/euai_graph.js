// Global variables for original data and category filters
let originalData;
const categoryColorMap = {};
let activeFilters = new Set(); // Track active category filters

// Fetch and load the JSON data for nodes and links from the specified URL
fetch(euAIdataUrl)
  .then((response) => response.json()) // Parse JSON response
  .then((data) => initializeGraph(data)) // Initialize graph creation
  .catch((error) => console.error("Error loading data:", error)); // Catch and log any errors

// Function to initialize the graph with validated data
function initializeGraph(data) {
  originalData = JSON.parse(JSON.stringify(data)); // Store the original data
  // console.log("Original Data at init:")
  // console.log(originalData);
  // Initialize category color map globally
  initializeCategoryColors(data.nodes);

  if (data && Array.isArray(data.nodes) && Array.isArray(data.links)) {
    const { nodes, links } = validateData(data); // Validate and filter nodes and links
    createGraph({ nodes, links }); // Call createGraph with validated data
  } else {
    console.error(
      "Error: Data format is incorrect or nodes/links are missing."
    );
  }
}

// Function to initialize the category colors
function initializeCategoryColors(nodes) {
  const categories = Array.from(new Set(nodes.map((node) => node.category))); // Get unique categories

  // Define a color scale
  const colorScale = d3.scaleOrdinal(d3.schemePaired);

  // Assign colors to each category in the global categoryColorMap
  categories.forEach((category, index) => {
    categoryColorMap[category] = colorScale(index);
  });
}

// Validate nodes and links to ensure consistency and return only valid links
function validateData(data) {
  const nodeIds = new Set(data.nodes.map((node) => node.id)); // Create a set of node IDs
  const validLinks = data.links.filter(
    (link) => nodeIds.has(link.source) && nodeIds.has(link.target)
  ); // Filter links that have both source and target nodes present in the node set
  return { nodes: data.nodes, links: validLinks }; // Return validated nodes and links
}

// Filter out redundant links and choose the shorter label when there are bidirectional links
function filterLinkLabelsAndArrows(links) {
  const linkMap = {}; // Initialize a map to track unique pairs of links

  links.forEach((link) => {
    const pairId = `${link.source.id}-${link.target.id}`; // Unique identifier for the link
    const reversePairId = `${link.target.id}-${link.source.id}`; // Unique identifier for reverse direction

    if (!linkMap[pairId] && !linkMap[reversePairId]) {
      // If neither direction exists, add the link
      linkMap[pairId] = link;
    } else if (linkMap[reversePairId]) {
      // If the reverse direction exists, choose the shorter reason label
      const reverseLink = linkMap[reversePairId];
      if (link.reason.length < reverseLink.reason.length) {
        delete linkMap[reversePairId]; // Remove the reverse link
        linkMap[pairId] = link; // Add the shorter reason label link
      }
    }
  });

  return Object.values(linkMap); // Return the filtered links as an array
}

// Set up the tooltip for displaying node information on hover
function setupTooltip(node) {
  // Create a tooltip div and set its initial styles
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("padding", "8px")
    .style("border-radius", "5px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  // Show tooltip with node's fullname on mouseover
  function showTooltip(event, d) {
    tooltip.transition().duration(200).style("opacity", 1); // Fade in tooltip
    tooltip
      .html(`${d.fullname}`)
      .style("left", event.pageX + 10 + "px")
      .style("top", event.pageY - 15 + "px");
  }

  // Hide tooltip on mouseout
  function hideTooltip() {
    tooltip.transition().duration(500).style("opacity", 0); // Fade out tooltip
  }

  node
    .on("mouseover", (event, d) => showTooltip(event, d)) // Attach event handlers for tooltip
    .on("mouseout", () => hideTooltip());
}

// Set up the SVG container and append group elements
function setupGraphContainer(margin, width, height) {
  const svg = d3
    .select("#graph-container")
    .append("svg") // Create an SVG element
    .attr("width", width + margin.left + margin.right) // Set width with margins
    .attr("height", height + margin.top + margin.bottom) // Set height with margins
    .call(
      d3.zoom().on("zoom", (event) => g.attr("transform", event.transform))
    ); // Enable zoom functionality

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`); // Append group element and apply transformation

  // Define arrow markers for directional links
  svg
    .append("defs")
    .selectAll("marker")
    .data(["end"])
    .enter()
    .append("marker")
    .attr("id", (d) => d)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "#aaa"); // Define the marker's shape and color

  return g; // Return the group element for further use
}


  // Show detailed node information in the sidebar
  function showInfo(d,data) {
    const sidebar = d3.select("#node-info-content"); // Select the sidebar element
    let info = "";

    // Define a mapping for field names to display labels and formatters
    const fieldMappings = {
      fullname: {
        label: "Name",
        format: (value) => value,
      },
      showname: {
        label: "Aka",
        format: (value) => value,
      },
      category: {
        label: "Category",
        format: (value) => value,
      },
      url: {
        label: "URL",
        format: (value) => (
          `<a href="${value}" target="_blank">
            ${value}
          </a>`
        ),
      },
      startDate: {
        label: "Start Date",
        format: (value) => value,
      },
      endDate: {
        label: "End Date",
        format: (value) => value,
      },
      budget: {
        label: "Budget",
        format: (value) => `€ ${value}`,
      },
      proposalUrl: {
        label: "Proposal URL",
        format: (value) => (
          `<a href="${value}" target="_blank">
            ${value}
          </a>`
        ),
      },
      coordinator: {
        label: "Coordinator",
        format: (value) => value,
      },
      coordinatingInstitution: {
        label: "Coordinating Institution",
        format: (value) => value,
      },
    };

    // Build the HTML content dynamically based on the mapping
    Object.keys(fieldMappings).forEach((key) => {
      if (d[key]) {
        // Check if the field is present in the data
        const { label, format } = fieldMappings[key];
        info += `<div><strong>${label}:</strong> ${format(d[key])}</div><br>`;
      }
    });

    // Group connections by their 'reason' field and display them
    const groupedConnections = data.links
      .filter((link) => link.source.id === d.id || link.target.id === d.id)
      .reduce((acc, link) => {
        const isSource = link.source.id === d.id;
        const otherNode = isSource
          ? link.target.showname
          : link.source.showname;
        const direction = isSource ? `→` : `←`;
        const linkColor = isSource ? "#4CAF50" : "#FF5722";

        if (!acc[link.reason]) acc[link.reason] = [];
        acc[link.reason].push(
          `<li style="margin-bottom: 8px;"><strong style="color: ${linkColor};">${d.showname}</strong> ${direction} <strong>${otherNode}</strong></li>`
        );
        return acc;
      }, {});

    // Create HTML string by grouping connections under headings
    for (const [reason, connections] of Object.entries(groupedConnections)) {
      info += `<h3>${reason}</h3><ul>${connections.join("")}</ul>`;
    }

    sidebar.html(info); // Update the sidebar with the constructed HTML content
  }


// Set up drag functionality to move nodes around
function setupDrag(simulation, node) {
  // Event handler for drag start
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart(); // Increase simulation activity
    d.fx = d.x;
    d.fy = d.y;
  }

  // Event handler for dragging the node
  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  // Event handler for drag end
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0); // Reset simulation activity
    d.fx = null;
    d.fy = null;
  }

  node.call(
    d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended)
  ); // Attach drag event handlers to nodes
}

// Set up and render links and their labels
function setupLinks(g, data) {
  const filteredLinks = filterLinkLabelsAndArrows(data.links); // Filter out redundant links

  // Draw links as lines between nodes
  const link = g
    .append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(filteredLinks)
    .enter()
    .append("line")
    .attr("class", "link")
    .style("stroke-width", 2)
    .style("stroke", "#aaa")
    .attr("marker-end", "url(#end)"); // Attach arrow markers to end of each link

  // Add labels to the links
  g.append("g")
    .attr("class", "link-labels")
    .selectAll("text")
    .data(filteredLinks)
    .enter()
    .append("text")
    .attr("class", "link-label")
    .attr("dy", 5)
    .attr("text-anchor", "middle")
    .text((d) => d.reason); // Display link 'reason' as label

  return link;
}

// Set up and render nodes with category-based colors and labels
function setupNodes(g, data) {
  // Create node elements (circles) for each data node
  const node = g
    .append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(data.nodes)
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("r", 10)
    .style("fill", (d) => categoryColorMap[d.category]); // Apply category-specific colors

  // Add labels (text) to each node based on their 'showname'
  g.append("g")
    .attr("class", "node-labels")
    .selectAll("text")
    .data(data.nodes)
    .enter()
    .append("text")
    .attr("class", "node-label")
    .attr("dy", -15)
    .attr("text-anchor", "middle")
    .text((d) => d.showname); // Display the 'showname' of each node

  return node; // Return node selection for further use
}

// Add nodes to the force simulation and update positions on each tick
function addNodesToSimulation(simulation, data, link, node) {
  // Update positions of nodes and links on each tick of the simulation
  simulation.nodes(data.nodes).on("tick", () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

    // Update positions of node labels
    d3.selectAll(".node-label")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y);

    // Update positions of link labels
    d3.selectAll(".link-label")
      .attr("x", (d) => (d.source.x + d.target.x) / 2)
      .attr("y", (d) => (d.source.y + d.target.y) / 2);
  });
}



// Function to add a legend for toggling categories
function addLegend(g, nodes) {
    const categories = Array.from(new Set(nodes.map((node) => node.category)));
  
    // add active to categories
    activeFilters.forEach((category) => {
      if (!categories.includes(category)) {
        categories.push(category);
      }
    });
  
    // sort alphabetically
    categories.sort();
  
    const legend = g
      .append("g")
      .attr("class", "legend")
      .attr("transform", "translate(10, 10)");
    // Add a surrounding rectangle to the legend
    const legendWidth = 200;
    const legendHeight = categories.length * 20 + 70;
    legend
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "none")
      .style("stroke", "#444")
      .style("stroke-width", "1px");
  
    // Add legend title
    legend
      .append("text")
      .attr("x", 10)
      .attr("y", 15)
      .attr("font-weight", "bold")
      .text("Legend");
  
    legend.append("text").attr("x", 10).attr("y", 35).text("(Click to toggle)");
  
    categories.forEach((category, index) => {
      const legendRow = legend
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", `translate(10, ${index * 20 + 45})`)
        .style("cursor", "pointer")
        .on("click", () => toggleCategoryFilter(category)); // Toggle category filter on click
  
      legendRow
        .append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .style("fill", categoryColorMap[category])
        .style("opacity", activeFilters.has(category) ? 0.3 : 1) // Set opacity if category is filtered
        .style("stroke", "#444");
  
      legendRow.append("text").attr("x", 20).attr("y", 10).text(category);
    });
  }
  
  // Function to filter nodes and links by active categories and update graph
  function updateGraphByActiveFilters() {
    var originalDataCopy = JSON.parse(JSON.stringify(originalData));
  
    // If no active filters, show the original graph
    if (activeFilters.size === 0) {
      createGraph(JSON.parse(JSON.stringify(originalDataCopy)));
      return;
    }
  
    // Filter nodes based on active filters
    const filteredNodes = originalDataCopy.nodes.filter(
      (node) => !activeFilters.has(node.category)
    );
    const filteredNodeIds = new Set(filteredNodes.map((node) => node.id));
  
    // Filter links based on filtered nodes
    const filteredLinks = originalDataCopy.links.filter(
      (link) =>
        filteredNodeIds.has(link.source) && filteredNodeIds.has(link.target)
    );
  
    // console.log("Filtered Nodes:")
    // console.log(filteredNodes);
    // console.log("Filtered ids:")
    // console.log(filteredNodeIds);
    // console.log("Filtered Links:")
    // console.log(filteredLinks);
    // console.log("Active filters:")
    // console.log(activeFilters);
  
    createGraph({ nodes: filteredNodes, links: filteredLinks });
  }
  // Toggle category filter and update the graph
  function toggleCategoryFilter(category) {
    //console.log("Toggling category filter:", category);
    // Toggle the category in the active filter set
    if (activeFilters.has(category)) {
      activeFilters.delete(category);
    } else {
      activeFilters.add(category);
    }
  
    // Update the graph based on active filters
    updateGraphByActiveFilters();
  }
  // Function to set up click highlight functionality and show node info
function setupClickHighlight(node, link, data) {
    node.on("click", function (event, d) {
      // Show node information in the sidebar
      showInfo(d, data);
  
      // Reset opacity for nodes, links, and labels
      node.style("opacity", 0.1);
      link.style("opacity", 0.1);
      d3.selectAll(".node-label").style("opacity", 0.1);
      d3.selectAll(".link-label").style("opacity", 0.1);
  
      // Highlight clicked node
      d3.select(this).style("opacity", 1);
  
      // Highlight connected links and nodes
      link
        .filter((l) => l.source.id === d.id || l.target.id === d.id)
        .style("opacity", 1)
        .each(function (l) {
          d3.select(`#node-${l.source.id}`).style("opacity", 1);
          d3.select(`#node-${l.target.id}`).style("opacity", 1);
        });
  
      // Highlight connected nodes
      node.filter((n) =>
        link.filter((l) => l.source.id === d.id || l.target.id === d.id)
          .data()
          .some((l) => l.source.id === n.id || l.target.id === n.id)
      ).style("opacity", 1);
  
      // Highlight labels of connected nodes and links
      d3.selectAll(".node-label")
        .filter((n) => n.id === d.id || link.data().some((l) => (l.source.id === d.id || l.target.id === d.id) && (l.source.id === n.id || l.target.id === n.id)))
        .style("opacity", 1);
  
      d3.selectAll(".link-label")
        .filter((l) => l.source.id === d.id || l.target.id === d.id)
        .style("opacity", 1);
    });
  
    // Reset highlight when clicking on the background
    d3.select("#graph-container").on("click", function (event) {
      if (event.target.tagName === "svg") {
        node.style("opacity", 1);
        link.style("opacity", 1);
        d3.selectAll(".node-label").style("opacity", 1);
        d3.selectAll(".link-label").style("opacity", 1);
      }
    });
  }
  
  

// Create and render the entire graph with nodes, links, and additional elements
function createGraph(data) {
  // Clear previous graph elements, if any
  d3.select("#graph-container").select("svg").remove();

  // log the active filters
  // console.log("Graph created, Active filters:");
  // console.log(activeFilters);
  // console.log("Data:");
  // console.log(data);
  // console.log("Original Data:");
  // console.log(originalData);
  // console.log("Original Data:")
  // console.log(originalData);
  const margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
  };
  const width = window.innerWidth - margin.left - margin.right; // Calculate available width
  const height = window.innerHeight - margin.top - margin.bottom; // Calculate available height

  const g = setupGraphContainer(margin, width, height); // Set up SVG container and return group element

  // Create force simulation for node positioning
  const simulation = d3
    .forceSimulation(data.nodes)
    .force(
      "link",
      d3
        .forceLink(data.links)
        .id((d) => d.id)
        .distance(200)
    )
    .force("charge", d3.forceManyBody().strength(-500))
    .force("center", d3.forceCenter(width / 2, height / 2));

  // Set up and render links
  const link = setupLinks(g, data);
  // Set up and render nodes with labels
  const node = setupNodes(g, data);

  // Attach tooltip functionality to nodes
  setupTooltip(node);

  // Attach drag functionality to nodes
  setupDrag(simulation, node);

  // Add nodes and links to simulation and handle tick updates
  addNodesToSimulation(simulation, data, link, node);

  // Add legend for toggling categories
  addLegend(g, data.nodes);
  setupClickHighlight(node, link,data);

}


document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('info-sidebar');
  const handle = document.getElementById('resize-handle');
  let isResizing = false;

  handle.addEventListener('mousedown', (event) => {
      isResizing = true;
      document.addEventListener('mousemove', resizeSidebar);
      document.addEventListener('mouseup', stopResizing);
      event.preventDefault();
  });

  function resizeSidebar(event) {
      if (isResizing) {
          const newWidth = event.clientX;
          sidebar.style.width = newWidth + 'px';
      }
  }

  function stopResizing() {
      isResizing = false;
      document.removeEventListener('mousemove', resizeSidebar);
      document.removeEventListener('mouseup', stopResizing);
  }
});
