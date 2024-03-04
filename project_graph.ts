
import {
    type List, list, for_each, filter, pair, head, tail, list_ref, reverse, append, map, length, is_null
} from './lib/list';
import {
    type Queue, is_empty, head as qhead, 
} from './lib/queue_array';
import {
    type ListGraph, build_array
} from './lib/graphs';

import { Prio_Queue, empty, enqueue, dequeue
} from './lib/prio_queue'
import * as PromptSync from "prompt-sync";

const prompt: PromptSync.Prompt = PromptSync({ sigint: true });


/**
 * Represents an edge in a weighted graph with a target node and an edge weight.
 * @template target The index of the node that this edge leads to.
 * @template weight the weight (value, distance, cost) for traversing this edge.
 * @invariant the weight can not be a negativ number. 
 */
type WeightedEdge =  {
    target: number; 
    weight: number; 
};

/**
 * Represents a weighted graph using an adjacency list.
 * @template adj An array where each index corresponds
 *           to a node in the graph. Each element in the array is a list
 *           of `WeightedEdge` record, representing all edges extending from that node.
 * @template size The total number of nodes in the graph.
 */                                 
 type WeightedAdjacencyList = {
   adj: Array<List<WeightedEdge>>, //adjecnt list with target and weight
   size: number // number for nodes
 };

 /** 
 * Represents the outcome of a pathfinding algorithm over a graph, storing
 * both the shortest distances from a start node to all other nodes, and
 * the preceding node (parent) in the shortest path for each node.
 * @template parents An array where each index corresponds
 *           to a node in the graph, and the value at each index is the index of the
 *           parent node in the shortest path from the start node to this
 *           node. For the start node, and any nodes not reachable from the start node,
 *           the value is `null`, wich means no parent.
 * @template distances array where each index corresponds to a node
 *           in the graph, and the value at each index is the shortest distance from the
 *           start node to this node as calculated by the algorithm. If a node is not
 *           reachable from the start node, the distance is typically set to `Infinity`.
 */                                 
 type Parents_and_distance = {
    parents: Array<number | null>,
    distances: Array<number> 
 };

 /**  
 * Describes a parking lot within a graph, associating a specific node within the graph 
 * to a named parking location.
 * @template node_number A unique identifier corresponding to a node
 *           in the graph. This identifier is used to locate the parking space within
 *           the graph structure.
 * @template name A name or label for the parking space. 
 */
 type parking_info = {
    node_number: number,
    name: string
 };

 /**
 * Represents information about a location within a graph, mapping 
 * a specific node in the graph to a named place.
 * @template node_number The unique identifier corresponding to a node in the
 *           graph.
 * @template name A name or label for the place.
 *          
 */
 type place_info = {
    node_number: number,
    name: string
    
 };

 /**
  * Represents a collection of parking lots. 
  * @template list_of_all_parking An array containing
 *           `parking_info` records, each of which describes a single parking
 *            lot.
 * @template number_of_parking The total number of parking
 *            lots included in `list_of_all_parking`. 
 */
type Parking_lot = {
    list_of_all_parking: Array<parking_info>,
    number_of_parking: number
}; 

/**
 * Represents a collection of places or locations.
 * @template list_of_all_places An array of `place_info`
 *           objects, where each object describes a specific place or location.
 * @template number_of_places The total count of places or locations
 *           included in `list_of_all_places`.
 */
type Locations = {
    list_of_all_places: Array<place_info>,
    number_of_places: number
};

/**
 * Represents the outcome of a parking search, detailing a parking
 * spot by its graph node identifier, its name for easy identification, and
 * the distance from a specified starting point or reference location.
 * @template node The unique identifier corresponding to a node in
 *           the graph that represents the mapped area. This identifier is used
 *           to locate the parking spot within the graph's structure.
 * @template name A name or label for the parking spot.
 *           This could be an official name, a designation code, or any label.
 * @template distance The calculated distance from a specified start
 *           point to this parking spot. The distance measurement can be in units
 *           appropriate to the application, such as meters or kilometers, and
 *           represents how far a user would need to travel to reach this parking
 *           from the start location.           
 */
type findparking = {
    node: number
    name:string
    distance: number

};

/**
 * A collection of all available parking lots within the program's scope. This constant
 * provides a list of parking information, making it easier to manage and access
 * parking data throughout the program. Each parking lot is associated with a specific
 * node in the graph, representing its location, and is identified by a name.
 */
const All_Parking_lots: Parking_lot = {
    list_of_all_parking: [{node_number:2, name: "Aimo parkering - Husargatan (Hemköp)"}, 
                          {node_number: 3, name: "Studenternas IP parkering"}, 
                          {node_number: 4, name: "Aimo park Grimhild"},
                          { node_number: 5, name: "Aimo park - Ångströmslaboratoriet" },
                          { node_number: 6, name: "Centralstation gatuparekring" }],
    number_of_parking: 5
}; 

/**
 * This constant represents list of locations relevant 
 * to the program
 */
const All_places: Locations = {
    list_of_all_places: [{node_number:0, name: "Ångström"}, 
                         {node_number: 1, name: "Centralen"}],
    number_of_places: 2
}; 

/**
 * Finds the shortest paths to all nodes from a start node
 * @param Graph a weighted undirected graph
 * @param startNode number to start from
 * @precondition Graph can't have negative weight values
 * @returns a record with parent to node and distance from start node
 * 
 */

function Dijkstra_alg(Graph: WeightedAdjacencyList, startNode: number): Parents_and_distance | null {

    if (startNode < 0 || startNode >= Graph.size) {
        console.error("Error: Start node does not exist in the graph.");
        return null;
    }
    const size: number = Graph.size
    const parents: Array<number | null> = build_array(size, () => null); 
    const distance: Array<number> = build_array(size, () => Infinity); 
    const visited: Array<boolean> = build_array(size, ()=> false); 

    distance[startNode] = 0; 

    for (let i = 0; i < size; i = i + 1) { // Find the closest node
        let closestNode: number | undefined = undefined ;
        let closestDistance = Infinity;

        for (let node = 0; node < size; node = node + 1) {
            if(!visited[node] && distance[node] < closestDistance) { 
                closestNode = node;
                closestDistance = distance[node];
            }
        }

        if (closestNode === undefined) { // If no node is found break out of the loop
            break;
        } 
       
        visited[closestNode] = true; // closest node is visited

        const adjlist = Graph.adj[closestNode];
        const length_adj = length(adjlist); //adjlist ? adjlist.length : 0; - .length does not return the right length, why?

        if (length_adj) {
            for (let j = 0; j < length_adj; j = j + 1) {
                const edge = list_ref(adjlist, j)!;
                const target = edge.target;
                const weight = edge.weight;
                if (!visited[target] && distance[closestNode] + weight < distance[target]) {
                    distance[target] = distance[closestNode] + weight;
                    parents[target] = closestNode;
                }
            }

        }

    }

    const parents_And_distances:Parents_and_distance = {
        parents: parents,
        distances: distance
    }; 

    return parents_And_distances;
    
}

/**
 * Finds all the parking lots 
 * @param Graph a weighted undirected graph
 * @param startnode a number 
 * @precondition Graph can't have negative weight values
 * @returns an array with the names of the parking lots in order from closest to furthest from startnode
 */

function Find_Parking_lots(Graph: WeightedAdjacencyList, startnode: number): Array<string> | void {
    const result = Dijkstra_alg(Graph, startnode);

    if (is_null(result)) {
        return;

    }

    const distance = result.distances;
    const parking_lots = All_Parking_lots.list_of_all_parking;
    const number_of_parking_lots = All_Parking_lots.number_of_parking;
    let parking_id: Array<parking_info> = [];
    let parking_all_info: Array<findparking> = [];

    for ( let i = 0; i < number_of_parking_lots; i = i + 1) { 
        const parking = parking_lots[i];
        parking_id.push(parking); 
    }

    for (let j = 0; j < parking_id.length; j = j + 1) {
        const parking_inf = parking_id[j];
        const node = parking_inf.node_number;
        const distance_from_start = distance[node];
        const Parking_node_name_distance: findparking = { node: node, name: parking_inf.name, distance: distance_from_start};
        parking_all_info.push(Parking_node_name_distance);
    }

    const sorted_parking_lots = parking_all_info.sort((a, b) => a.distance - b.distance);

    const Parking_lot_names = sorted_parking_lots.map(lot => lot.name);


    return Parking_lot_names;
}
const graph_uppsala: WeightedAdjacencyList = {
   
    adj: [

    // Node 0 is connected to Node 1 with a weight of 10, and Node 2 with a weight of 3
     list({ target: 1, weight: 15 }, { target: 2, weight: 3 }, {target: 3, weight: 5}, {target: 5, weight: 1} ),
    
    // Node 1 is connected back to Node 0 with a weight of 10, and to Node 3 with a weight of 5
    list({ target: 0, weight: 15}, { target: 3, weight: 8 }, {target: 4, weight: 3}, {target: 6, weight: 2}),
    
    // Node 2 is connected back to Node 0 with a weight of 3, and to Node 3 with a weight of 8
    list({ target: 0, weight: 3 }, {target: 3, weight: 4}, ),
    
    // Node 3 is connected back to Node 1 with a weight of 5, and to Node 2 with a weight of 8
    list({ target: 0, weight: 5 }, { target: 1, weight: 8 }, {target: 4, weight: 6},  {target: 2, weight: 4} ),
   
    list({ target: 1, weight: 3 }, {target: 3, weight: 6}),

    list({ target: 0, weight: 1 }),

    list ({target: 1, weight: 2}),

  ],

  size: 7

}; 
    
    
console.log(Dijkstra_alg(graph_uppsala, 0));
console.log(JSON.stringify(Find_Parking_lots(graph_uppsala, 0)));


    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    


                        