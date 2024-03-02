import {
    type List, list, for_each, filter, pair, tail, list_ref, reverse, append, map, length, is_null
} from '../../lib/list';
import {
    type ListGraph, build_array
} from '../../lib/graphs';
import { Prio_Queue, empty, dequeue, qhead, is_empty, display_queue, swap } from './lib/prio_queue'


/**
 * Represents an edge in a weighted graph with a target node and an edge weight.
 * @param target The index of the node that this edge leads to.
 * @param weight the weight (value, distance, cost) for traversing this edge. 
 */
type WeightedEdge =  {
    target: number; 
    weight: number; 
};

/**
 * Represents a weighted graph using an adjacency list. 
 * @param adj An array where each index corresponds
 *            to a node in the graph. Each element in the array is a list
 *            of `WeightedEdge` record, representing all edges extending from that node.
 * @param size The total number of nodes in the graph.
 * @invariant size needs represent the number of nodes correctly.  
 */    
                             
 export type WeightedAdjacencyList = {
   adj: Array<List<WeightedEdge>>, 
   size: number 
 };

 /** 
 * Represents the outcome of a pathfinding algorithm over a graph, storing
 * both the shortest distances from a start node to all other nodes, and
 * the preceding node (parent) in the shortest path for each node.
 * @param parents An array where each index corresponds
 *           to a node in the graph, and the value at each index is the index of the
 *           parent node in the shortest path from the start node to this
 *           node. For the start node, and any nodes not reachable from the start node,
 *           the value is `null`, wich means no parent.
 * @param distances array where each index corresponds to a node
 *           in the graph, and the value at each index is the shortest distance from the
 *           start node to this node as calculated by the algorithm. If a node is not
 *           reachable from the start node, the distance is typically set to `Infinity`.
 */                                 
 export type Parents_and_distance = {
    parents: Array<number | null>,
    distances: Array<number> 
 };

 /**  
 * Describes a parking lot within a graph, associating a specific node within the graph 
 * to a named parking location.
 * @param node_number A unique identifier corresponding to a node
 *           in the graph. This identifier is used to locate the parking space within
 *           the graph structure.
 * @param name A name or label for the parking lot. 
 */
 type parking_info = {
    node_number: number,
    name: string
 };

 /**
 * Represents information about a location within a graph, mapping 
 * a specific node in the graph to a named place.
 * @param node_number The unique identifier corresponding to a node in the
 *           graph.
 * @param name A name or label for the place.
 *          
 */
 type place_info = {
    node_number: number,
    name: string
    
 };

 /**
  * Represents a collection of parking lots. 
  * @param list_of_all_parking An array containing
 *           `parking_info` records, each of which describes a single parking
 *            lot.
 * @param number_of_parking The total number of parking
 *            lots included in `list_of_all_parking`. 
 * @invariant number_of_parking must be correctly updated when needed. 
 */
type Parking_lot = {
    list_of_all_parking: Array<parking_info>,
    number_of_parking: number
}; 

/**
 * Represents a collection of places or locations.
 * @param list_of_all_places An array of `place_info`
 *           'records', where each record describes a specific place or location.
 * @param number_of_places The total count of places or locations
 *           included in `list_of_all_places`.
 */
type Locations = {
    list_of_all_places: Array<place_info>,
    number_of_places: number
};

/**
 * Represents the outcome of a parking search in the "Find_parking_lots" function, detailing a parking
 * spot by its graph node identifier, its name for easy identification, and
 * the distance from a specified starting point or reference location.
 * @param node The unique identifier corresponding to a node in
 *           the graph that represents the mapped area. This identifier is used
 *           to locate the parking spot within the graph's structure.
 * @param name A name or label for the parking spot.
 *           This could be an official name, a designation code, or any label.
 * @param distance The calculated distance from a specified start
 *           point to this parking spot. The distance measurement can be in units
 *           appropriate to the application, such as meters, kilometers, time, and
 *           represents how far a user would need to travel to reach this parking
 *           from the start location.           
 */
type findparking = {
    node: number
    name:string
    distance: number

};

/**
 * A collection of all parking lots within the program's scope. This constant
 * provides a list of parking information, making it easier to manage and access
 * parking data throughout the program. Each parking lot is associated with a specific
 * node in the graph, representing its location, and is identified by a name.
 */
export const All_Parking_lots: Parking_lot = {
    list_of_all_parking: [{node_number:2, name: "Aimo parkering - Husargatan (Hemköp)"}, 
                          {node_number: 3, name: "Studenternas IP parkering"}, 
                          {node_number: 4, name: "Aimo park Grimhild"},
                          { node_number: 5, name: "Aimo park - Ångströmslaboratoriet" },
                          { node_number: 6, name: "Centralgaraget" }],
    number_of_parking: 5
}; 

/**
 * This constant represents list of locations relevant 
 * to the program.
 */
export const All_places: Locations = {
    list_of_all_places: [{node_number: 0, name: "Ångström"}, 
                         {node_number: 1, name: "Centralen"},
                         {node_number: 7, name: "BMC"},
                         {node_number: 8, name: "Akademiska sjukhuset"}],
    number_of_places: 4
}; 

/**
 * Adds an element to a priority queue. - edited
 * @template T type of all queue elements
 * @param prio priority of the new element (smaller means higher priority)
 * @param e element to add
 * @param q queue to add element to
 * @modifies q such that e is added with priority prio
 */
export function enqueue<T>(prio: number, e: T, q: Prio_Queue<T>) {
    const tail_index = q[1];
    q[2][tail_index] = [prio, e];
    if (!is_empty(q)) {
        // we have at least one element
        const head_index = q[0];
        const elems = q[2];
        elems[tail_index] = [prio, e];
        // swap elements until we find the right spot
        for (let i = tail_index; i > head_index; i = i - 1) {
            if (elems[i - 1][0] <= elems[i][0]) { 
                break;
            } else { //swap
                swap(elems, i, i - 1);
            }
        }
    } else {}
    q[1] = tail_index + 1;  // update tail index
}


/**
 * Finds the shortest paths to all nodes from a start node
 * @param Graph The graph represented as a weighted adjacency list, 
 * where each node is connected to its neighbors with edges that have positive weights.
 * @param StartNode The index of the node from which to start the pathfinding.
 * @precondition Graph must not contain edges with negative weight values. 
 * @precondition startNode must be a positiv integer. 
 * @example Dijkstras_alg({adj:[list({target: 1, weight: 2}),
                                            list({target: 0, weight: 2}, {target: 2, weight: 3}, {target:3, weight: 1}), 
                                            list({target: 1, weight: 3}, {target: 3, weight: 1}),
                                            list({target: 1, weight: 1}, {target: 2, weight: 1})
                                        ], 

                                        size: 4}, 0) will return {"parents":[null,0,3,1],"distances":[0,2,4,3]}. 
 * @returns A Record containing two arrays: 'parents', indicating the predecessor node on the shortest path from the start node
 * to each node; and 'distances', indicating the total weight (distance) of the shortest path from the start node to each node. 
 * If a node is unreachable from the start node, its distance is Infinity, and its parent is null.
 * @returns Returns null if the start node does not exist within the graph or if the graph is empty.
 * @returns null if the start node does not exist in the graph or the graph is empty. 
 */
export function Dijkstras_alg(Graph: WeightedAdjacencyList, startNode: number): Parents_and_distance | null {

    if (startNode < 0 || startNode >= Graph.size || Graph.size === 0) {
        console.log("Error: Empty graph or start node does not exist in the graph.");
        return null;
    }

    const size: number = Graph.size
    const parents: Array<number | null> = build_array(size, () => null); 
    const distance: Array<number> = build_array(size, () => Infinity); 
    const visited: Array<boolean> = build_array(size, ()=> false); 
    let queue: Prio_Queue<number> = empty<number>();

    distance[startNode] = 0; 
    enqueue(0, startNode, queue); 

    while (!is_empty(queue) ) {
        const currentnode: number = qhead(queue); 
        dequeue(queue)!;
        
        const current_adjlist = Graph.adj[currentnode];

        if (current_adjlist !== undefined) {
            const adjlist_len = length(current_adjlist);

        for (let i = 0; i < adjlist_len; i = i + 1) {
            const edge = list_ref(current_adjlist, i);
            const target = edge?.target!;
            const weight = edge?.weight!;

            if (distance[currentnode] + weight < distance[target]){

                distance[target] = distance[currentnode] + weight;
                parents[target] = currentnode;
                enqueue(distance[target], target, queue); 

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
 * Finds all the parking lots. 
 * @param Graph The graph represented as a weighted adjacency list, 
 * where each node is connected to its neighbors with edges that have positive weights.
 * @param startnode The index of the node from which to start the pathfinding, represented as a positive integer. 
 * @precondition Graph can't have negative weight values.
 * @precondtion The variable All_Parking_lots need to be defined accordingly. 
 * @example Find_parking_lots(graph_uppsala, 0), will return ["Aimo park - Ångströmslaboratoriet - 1 min","Aimo parkering - Husargatan (Hemköp) - 3 min",
            "Studenternas IP parkering - 5 min","Aimo park Grimhild - 11 min","Centralgaraget - 15 min"]. Assuming graph_uppsala has not been updated. 
 * @returns An array containing the names of the parking lots and their corresponding distances from the start node, 
 * sorted in increasing order from the closest to the furthest.
 * @returns undefined if the start node does not exist in the graph, its an empty graph 
 * or if the start node does not have any adjecent nodes. 
 */
export function Find_Parking_lots(Graph: WeightedAdjacencyList, startnode: number): Array<string> | void {
    const result = Dijkstras_alg(Graph, startnode);
    
    if (is_null(result)) {
        return; 
    }
   
    const distance = result.distances;
    const parking_lots = All_Parking_lots.list_of_all_parking;
    const number_of_parking_lots = All_Parking_lots.number_of_parking;
    let parking_information: Array<parking_info> = [];
    let parking_all_info: Array<findparking> = [];
    

    for ( let i = 0; i < number_of_parking_lots; i = i + 1) { 
        const parking = parking_lots[i];
        parking_information.push(parking); 
    }

    for (let j = 0; j < parking_information.length; j = j + 1) {
        const current_parking_info = parking_information[j];
        const node = current_parking_info.node_number;
        const distance_from_start = distance[node];

        if (distance_from_start < Infinity) {
        const Parking_node_name_distance: findparking = { node: node, 
                                                          name: current_parking_info.name, 
                                                          distance: distance_from_start};
        parking_all_info.push(Parking_node_name_distance);

        }
   }

    if (parking_all_info.length === 0) {
        console.log("No parking lots are reachable from the start node.");
        return;
    }

    const sorted_parking_lots = parking_all_info.sort((a, b) => a.distance - b.distance);

    let ParkingLotNamesAndDistances: Array<string> = [];

    for (let i = 0; i < sorted_parking_lots.length; i = i + 1) {
        const name = sorted_parking_lots[i].name;
        const distance = sorted_parking_lots[i].distance;
        const nameAndDistance = `${name} - ${distance} min`;
        ParkingLotNamesAndDistances.push(nameAndDistance);
    }

    return ParkingLotNamesAndDistances;
}

/**
 * graph_uppsala is a graph representation of Uppsala, node 0 is Ångström and node 1 is Centralen.
 * The rest of the nodes are parking lots. 
 * It is possible to add more parking lots and locations. When adding additional parking lots, 
 * the const All_Parking_lots needs to be updated accordingly.
 */
export const graph_uppsala: WeightedAdjacencyList = {
   
    adj: [

        //node 0 = Ångström
        list({ target: 1, weight: 15 }, { target: 2, weight: 3 }, {target: 3, weight: 5}, {target: 5, weight: 1}, {target: 7, weight: 4} ),
        
        //node 1 = centralen
        list({ target: 0, weight: 15}, { target: 3, weight: 8 }, {target: 4, weight: 3}, {target: 6, weight: 2}),

        //node 2 = "Aimo parkering - Husargatan (Hemköp)"
        list({ target: 0, weight: 3 }, {target: 3, weight: 4}, {target: 7, weight: 2}, {target: 8, weight: 11}),

        //node 3 = Studenternas IP parkering"
        list({ target: 0, weight: 5 }, { target: 1, weight: 8 }, {target: 4, weight: 6},  {target: 2, weight: 4}, {target: 8, weight: 3} ),
       
        //node 4 = "Aimo park Grimhild"
        list({ target: 1, weight: 3 }, {target: 3, weight: 6}, {target: 8, weight: 6}),
        
        //node 5 =  "Aimo park - Ångströmslaboratoriet" 
        list({ target: 0, weight: 1 }),
    
        //node 6 =  "Centralgara
        list ({target: 1, weight: 2}),

        //node 7 = BMC
        list ({target: 0, weight: 4}, {target: 2, weight: 2}),

        //node 8 = Akademiska sjukhuset 
        list ({target: 2, weight: 11}, {target: 3, weight: 3}, {target: 4, weight: 6})

      ],

      size: 9
}; 


console.log(JSON.stringify(Find_Parking_lots(graph_uppsala, 0)));
