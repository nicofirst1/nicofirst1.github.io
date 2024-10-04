// Fetch and load the JSON data for nodes and links
fetch(euAIdataUrl)
    .then(response => response.json())
    .then(data => {
        if (data && Array.isArray(data.nodes) && Array.isArray(data.links)) {
            // Validate links to ensure each link references an existing node
            const nodeIds = new Set(data.nodes.map(node => node.id));
            const validLinks = data.links.filter(link => nodeIds.has(link.source) && nodeIds.has(link.target));
            createGraph({ nodes: data.nodes, links: validLinks });
        } else {
            console.error("Error: Data format is incorrect or nodes/links are missing.");
        }
    })
    .catch(error => console.error('Error loading data:', error));

// Function to create and render the graph
function createGraph(data) {
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = window.innerWidth - margin.left - margin.right;
    const height = window.innerHeight - margin.top - margin.bottom;

    const svg = d3.select("#graph-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .call(d3.zoom().on("zoom", (event) => g.attr("transform", event.transform)))
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const g = svg.append("g");

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Define arrow markers for directional links
    svg.append("defs").selectAll("marker")
        .data(["end"])
        .enter().append("marker")
        .attr("id", d => d)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#aaa");

    const simulation = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(data.links).id(d => d.id).distance(200))
        .force("charge", d3.forceManyBody().strength(-500))
        .force("center", d3.forceCenter(width / 2, height / 2));

    // Filter out redundant links for both labels and arrows
    const filteredLinks = filterLinkLabelsAndArrows(data.links);

    // Draw the filtered links with directional arrows
    const link = g.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(filteredLinks) // Use filtered links for arrows
        .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", 2)
        .style("stroke", "#aaa")
        .attr("marker-end", "url(#end)");

    const node = g.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(data.nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", 10)
        .style("fill", d => color(d.category))
        .on("mouseover", (event, d) => showTooltip(event, d))
        .on("mouseout", () => hideTooltip())
        .on("click", (event, d) => showInfo(d))
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    // Add labels to nodes
    g.append("g")
        .attr("class", "node-labels")
        .selectAll("text")
        .data(data.nodes)
        .enter().append("text")
        .attr("class", "node-label")
        .attr("dy", -15)
        .attr("text-anchor", "middle")
        .text(d => d.showname);

    // Link labels with directional positioning (using the filteredLinks)
    g.append("g")
        .attr("class", "link-labels")
        .selectAll("text")
        .data(filteredLinks) // Use filtered links for labels
        .enter().append("text")
        .attr("class", "link-label")
        .attr("dy", 5)
        .attr("text-anchor", "middle")
        .text(d => d.reason);

    // Function to filter out redundant link labels and arrows
    function filterLinkLabelsAndArrows(links) {
        const linkMap = {};

        links.forEach(link => {
            const pairId = `${link.source.id}-${link.target.id}`;
            const reversePairId = `${link.target.id}-${link.source.id}`;

            if (!linkMap[pairId] && !linkMap[reversePairId]) {
                // If neither direction exists, add the link
                linkMap[pairId] = link;
            } else if (linkMap[reversePairId]) {
                // If the reverse direction exists, choose the shorter reason
                const reverseLink = linkMap[reversePairId];
                if (link.reason.length < reverseLink.reason.length) {
                    // Keep the shorter reason and remove the other direction
                    delete linkMap[reversePairId];
                    linkMap[pairId] = link;
                }
            }
        });

        // Convert linkMap back to an array of filtered links
        return Object.values(linkMap);
    }

    // Tooltip functions
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("padding", "8px")
        .style("background", "#f9f9f9")
        .style("border", "1px solid #ddd")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    function showTooltip(event, d) {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`${d.fullname}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 15) + "px");
    }

    function hideTooltip() {
        tooltip.transition().duration(500).style("opacity", 0);
    }

    simulation.nodes(data.nodes).on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        d3.selectAll(".node-label")
            .attr("x", d => d.x)
            .attr("y", d => d.y);

        d3.selectAll(".link-label")
            .attr("x", d => (d.source.x + d.target.x) / 2)
            .attr("y", d => (d.source.y + d.target.y) / 2);
    });

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    function showInfo(d) {
        const sidebar = d3.select("#node-info-content");
        let info = '';
        if (d.fullname) info += `<div><strong>Name:</strong> ${d.fullname}</div><br>`;
        if (d.fullname) info += `<div><strong>Aka:</strong> ${d.showname}</div><br>`;
        if (d.category) info += `<div><strong>Category:</strong> ${d.category}</div><br>`;
        if (d.url) info += `<div><strong>URL:</strong> <a href="${d.url}" target="_blank" style="color: blue;">${d.url}</a></div><br>`;
        if (d.description) info += `<div><strong>Description:</strong> ${d.description}</div><br>`;

        // Group connections by their 'reason'
        const groupedConnections = data.links
            .filter(link => link.source.id === d.id || link.target.id === d.id)
            .reduce((acc, link) => {
                const isSource = link.source.id === d.id;
                const otherNode = isSource ? link.target.showname : link.source.showname;
                const direction = isSource ? `→` : `←`;
                const linkColor = isSource ? "#4CAF50" : "#FF5722";

                if (!acc[link.reason]) acc[link.reason] = [];
                acc[link.reason].push(`<li style="margin-bottom: 8px;"><strong style="color: ${linkColor};">${d.showname}</strong> ${direction} <strong>${otherNode}</strong></li>`);
                return acc;
            }, {});

        // Create HTML string by grouping connections under headings
        for (const [reason, connections] of Object.entries(groupedConnections)) {
            info += `<h3>${reason}</h3><ul>${connections.join("")}</ul>`;
        }

        sidebar.html(info);
    }
}
