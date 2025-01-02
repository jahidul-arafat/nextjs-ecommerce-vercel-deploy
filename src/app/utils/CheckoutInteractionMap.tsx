// V1.2
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface CheckoutInteractionMapProps {
    data: {
        nodes: Array<{ id: string; group: number; name?: string; quantity?: number }>;
        links: Array<{ source: string; target: string; value: number; weight?: number }>;
    };
}

const CheckoutInteractionMap: React.FC<CheckoutInteractionMapProps> = ({ data }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({ width, height });
            }
        };

        window.addEventListener('resize', updateDimensions);
        updateDimensions();

        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    useEffect(() => {
        if (!svgRef.current || !data.nodes.length || dimensions.width === 0) return;

        const { width, height } = dimensions;

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height);

        svg.selectAll("*").remove();

        const g = svg.append("g");

        // Calculate node degrees
        const nodeDegrees = data.links.reduce((acc, link) => {
            acc[link.source] = (acc[link.source] || 0) + 1;
            acc[link.target] = (acc[link.target] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });

        // Connect product nodes to "Products" node
        const productsLinks = data.nodes
            .filter(node => node.id.startsWith('Product_'))
            .map(node => ({ source: node.id, target: 'Products', value: 1, weight: 1 }));

        const allLinks = [...data.links, ...productsLinks];

        const simulation = d3.forceSimulation(data.nodes)
            .force("link", d3.forceLink(allLinks).id((d: any) => d.id).distance(50))
            .force("charge", d3.forceManyBody().strength(-100))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius((d: any) => Math.sqrt(nodeDegrees[d.id] || 1) * 5 + 10));

        const link = g.append("g")
            .selectAll("line")
            .data(allLinks)
            .join("line")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", (d: any) => Math.sqrt(d.value));

        const node = g.append("g")
            .selectAll("circle")
            .data(data.nodes)
            .join("circle")
            .attr("r", (d: any) => Math.sqrt(nodeDegrees[d.id] || 1) * 5 + 5)
            .attr("fill", (d: any) => d3.schemeCategory10[d.group % 10]);

        const label = g.append("g")
            .selectAll("text")
            .data(data.nodes)
            .join("text")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .text((d: any) => `${d.id} (${nodeDegrees[d.id] || 0})`)
            .attr("font-size", "8px")
            .attr("fill", "#333");

        node.append("title")
            .text((d: any) => `${d.id}\nDegree: ${nodeDegrees[d.id] || 0}`);

        simulation.on("tick", () => {
            link
                .attr("x1", (d: any) => d.source.x)
                .attr("y1", (d: any) => d.source.y)
                .attr("x2", (d: any) => d.target.x)
                .attr("y2", (d: any) => d.target.y);

            node
                .attr("cx", (d: any) => d.x)
                .attr("cy", (d: any) => d.y);

            label
                .attr("x", (d: any) => d.x)
                .attr("y", (d: any) => d.y);
        });

        const zoom = d3.zoom()
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        svg.call(zoom as any);

    }, [data, dimensions]);

    return (
        <div ref={containerRef} style={{ width: '100%', height: '900px' }}>
            <svg ref={svgRef}></svg>
        </div>
    );
};

export default CheckoutInteractionMap;


// V1.1
// import React, {useEffect, useRef, useState} from 'react';
// import * as d3 from 'd3';
//
// interface Node {
//     id: string;
//     group: number;
// }
//
// interface Link {
//     source: string;
//     target: string;
//     value: number;
// }
//
// interface GraphData {
//     nodes: Node[];
//     links: Link[];
// }
//
// interface CheckoutInteractionMapProps {
//     data: GraphData;
// }
//
//
// const CheckoutInteractionMap: React.FC<CheckoutInteractionMapProps> = ({ data }) => {
//     const svgRef = useRef<SVGSVGElement>(null);
//     const containerRef = useRef<HTMLDivElement>(null);
//     const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
//
//     useEffect(() => {
//         const updateDimensions = () => {
//             if (containerRef.current) {
//                 setDimensions({
//                     width: containerRef.current.clientWidth,
//                     height: containerRef.current.clientHeight
//                 });
//             }
//         };
//
//         updateDimensions();
//         window.addEventListener('resize', updateDimensions);
//
//         return () => window.removeEventListener('resize', updateDimensions);
//     }, []);
//
//     useEffect(() => {
//         if (!svgRef.current || !data.nodes.length || dimensions.width === 0 || dimensions.height === 0) return;
//
//         const { width, height } = dimensions;
//         const margin = { top: 20, right: 20, bottom: 20, left: 20 };
//
//         const svg = d3.select(svgRef.current)
//             .attr('width', width)
//             .attr('height', height);
//
//         svg.selectAll("*").remove();
//
//         const g = svg.append("g");
//
//         const simulation = d3.forceSimulation(data.nodes)
//             .force("link", d3.forceLink(data.links).id((d: any) => d.id).distance(30))
//             .force("charge", d3.forceManyBody().strength(-100))
//             .force("center", d3.forceCenter(width / 2, height / 2))
//             .force("collision", d3.forceCollide().radius(10));
//
//         const link = g.append("g")
//             .selectAll("line")
//             .data(data.links)
//             .join("line")
//             .attr("stroke", "#999")
//             .attr("stroke-opacity", 0.6)
//             .attr("stroke-width", (d: any) => Math.sqrt(d.value));
//
//         const node = g.append("g")
//             .selectAll("circle")
//             .data(data.nodes)
//             .join("circle")
//             .attr("r", 5)
//             .attr("fill", (d: any) => d3.schemeCategory10[d.group % 10]);
//
//         const label = g.append("g")
//             .selectAll("text")
//             .data(data.nodes)
//             .join("text")
//             .attr("text-anchor", "middle")
//             .attr("dominant-baseline", "central")
//             .text((d: any) => d.id)
//             .attr("font-size", "6px")
//             .attr("fill", "#333");
//
//         node.append("title")
//             .text((d: any) => d.id);
//
//         simulation.on("tick", () => {
//             link
//                 .attr("x1", (d: any) => d.source.x)
//                 .attr("y1", (d: any) => d.source.y)
//                 .attr("x2", (d: any) => d.target.x)
//                 .attr("y2", (d: any) => d.target.y);
//
//             node
//                 .attr("cx", (d: any) => d.x)
//                 .attr("cy", (d: any) => d.y);
//
//             label
//                 .attr("x", (d: any) => d.x)
//                 .attr("y", (d: any) => d.y);
//         });
//
//         // Add zoom capabilities
//         const zoom = d3.zoom()
//             .on('zoom', (event) => {
//                 g.attr('transform', event.transform);
//             });
//
//         svg.call(zoom as any);
//
//         // Fit the graph to the SVG container
//         simulation.on("end", () => {
//             const bounds = g.node().getBBox();
//             const dx = bounds.width;
//             const dy = bounds.height;
//             const x = bounds.x + dx / 2;
//             const y = bounds.y + dy / 2;
//
//             const scale = 0.9 / Math.max(dx / width, dy / height);
//             const translate = [width / 2 - scale * x, height / 2 - scale * y];
//
//             svg.transition()
//                 .duration(750)
//                 .call(zoom.transform as any, d3.zoomIdentity
//                     .translate(translate[0], translate[1])
//                     .scale(scale));
//         });
//
//     }, [data, dimensions]);
//
//     return (
//         <div ref={containerRef} style={{ width: '100%', height: '400px' }}>
//             <svg ref={svgRef}></svg>
//         </div>
//     );
// };
//
// export default CheckoutInteractionMap;