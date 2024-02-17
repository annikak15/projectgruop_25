
import {
    type List, list, for_each, filter, pair, head, tail, list_ref, reverse, append, map, length
} from '../../PKD/lib/list';
import {
    type Queue, is_empty, head as qhead, 
} from '../../PKD/lib/queue_array';
import {
    type ListGraph, build_array
} from '../../PKD/lib/graphs';

import { Prio_Queue, empty, enqueue, dequeue

} from '../../PKD/lib/prio_queue'

import * as PromptSync from "prompt-sync";

const prompt: PromptSync.Prompt = PromptSync({ sigint: true });




type WeightedEdge =  {
    target: number; // Target node index
    weight: number; // Weight (value) of the edge
}
                                  
 type WeightedAdjacencyList = {
   adj: Array<List<WeightedEdge>>, //adjecnt list with target and weight
   size: number // number for nodes
 };
                                  

 type Parents_and_distance = {
    parents: Array<number | null>, // parenst to each node
    distances: Array<number> // shortest distances from start node to each node
 };

 type parking_info = {
    node_number: number,
    name: string
 };

 type place_info = {
    node_number: number,
    name: string
    
 };

type Parking_lot = {
    list_of_all_parking: Array<parking_info>,
    number_of_parking: number
}; 

type Places = {
    list_of_all_places: Array<place_info>,
    number_of_places: number
};

type findparking = {
    node: number
    name:string
    distance: number

};

const All_Parking_lots: Parking_lot = {
    list_of_all_parking: [{node_number:2, name: "Hemköp"}, {node_number: 3, name: "Studentrenas"}, {node_number: 4, name: "Grimhild"}],
    number_of_parking: 3
}; 

const All_places: Places = {
    list_of_all_places: [{node_number:0, name: "Ångström"}, {node_number: 1, name: "Centralen"}],
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

function Dijkstra_alg(Graph: WeightedAdjacencyList, startNode: number): Parents_and_distance {
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

function Find_Parking_lots(Graph: WeightedAdjacencyList, startnode: number): Array<string>{
    const result = Dijkstra_alg(Graph, startnode);
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


/**
 * user input - find parking
 */
function start(){


const answer_find_parking= prompt('Do you want to find parking? (yes/no): ');

if (answer_find_parking?.toLowerCase() === 'yes') {
        const answer_place = prompt('What is your location: 1 - Ångström, 2 - Centralen: ')   
        // Find parking function
        
} else if (answer_find_parking?.toLowerCase() === 'no') {
    console.log('No parking search initiated.')

    
} else {
    console.log('Invalid input, please answer "yes" or "no".');
}

const answer_book_parking = prompt('Do you want to book parking? (yes/no): ');

if (answer_book_parking === 'yes') {
    // Book parking function
}


}


const graph1: WeightedAdjacencyList = {
   
    adj: [
    // Node 0 is connected to Node 1 with a weight of 10, and Node 2 with a weight of 3
     list({ target: 1, weight: 15 }, { target: 2, weight: 3 }, {target: 3, weight: 5}),
    
    // Node 1 is connected back to Node 0 with a weight of 10, and to Node 3 with a weight of 5
    list({ target: 0, weight: 15}, { target: 3, weight: 8 }, {target: 4, weight: 3}),
    
    // Node 2 is connected back to Node 0 with a weight of 3, and to Node 3 with a weight of 8
    list({ target: 0, weight: 3 }, {target: 3, weight: 4}, ),
    
    // Node 3 is connected back to Node 1 with a weight of 5, and to Node 2 with a weight of 8
    list({ target: 0, weight: 5 }, { target: 1, weight: 8 }, {target: 4, weight: 6}),
   
    list({ target: 1, weight: 3 }, {target: 3, weight: 6}),

  ],

  size: 5

}; 
    
    
console.log(Dijkstra_alg(graph1, 0));
console.log(JSON.stringify(Find_Parking_lots(graph1, 0)));


    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    


                        