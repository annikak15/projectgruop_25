import{ type WeightedAdjacencyList, Dijkstras_alg, Find_Parking_lots

} from './project_graph_queue.js'

import {
     list
} from './lib/list.js';


const graph_uppsala: WeightedAdjacencyList = {
   
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
    
        //node 6 =  "Centralgaraget 
        list ({target: 1, weight: 2}),

        //node 7 = BMC
        list ({target: 0, weight: 4}, {target: 2, weight: 2}),

        //node 8 = Akademiska sjukhuset 
        list ({target: 2, weight: 11}, {target: 3, weight: 3}, {target: 4, weight: 6})

      ],

      size: 9
};

//TEST 1
test('Returns an array with the parking lots from ångström', ()=> {
   
    const result = Find_Parking_lots(graph_uppsala, 0);

    expect(result).toStrictEqual(["Aimo park - Ångströmslaboratoriet - 1 min","Aimo parkering - Husargatan (Hemköp) - 3 min",
    "Studenternas IP parkering - 5 min","Aimo park Grimhild - 11 min","Centralgaraget - 15 min"]);

    
}); 

//TEST 2
test('Returns undefined if the start node is not in the graph', ()=> {
    const result = Find_Parking_lots(graph_uppsala, 10);

    expect(result).toBe(undefined);

});

//TEST 3
test('Returns an array with the parking lots from centralen', ()=> {
   
    const result = Find_Parking_lots(graph_uppsala, 1);

    expect(result).toStrictEqual(["Centralgaraget - 2 min","Aimo park Grimhild - 3 min","Studenternas IP parkering - 8 min",
    "Aimo parkering - Husargatan (Hemköp) - 12 min","Aimo park - Ångströmslaboratoriet - 14 min"]);

  
}); 

//TEST 4
test ('Returns undefined for a start node that is not adjecent', ()=> {

    const graph_uppsala_test: WeightedAdjacencyList = {
   
        adj: [
    
           
            list({ target: 1, weight: 15 }, { target: 2, weight: 3 }, {target: 3, weight: 5}, {target: 5, weight: 1} ),
            
            list({ target: 0, weight: 15}, { target: 3, weight: 8 }, {target: 4, weight: 3}, {target: 6, weight: 2}),
            
            list({ target: 0, weight: 3 }, {target: 3, weight: 4}, ),
            
            list({ target: 0, weight: 5 }, { target: 1, weight: 8 }, {target: 4, weight: 6},  {target: 2, weight: 4} ),
           
            list({ target: 1, weight: 3 }, {target: 3, weight: 6}),
        
            list({ target: 0, weight: 1 }),
        
            list ({target: 1, weight: 2}),

            // node 7 is not connected to other nodes
            list ({target: 7, weight: 0}),
        
          ],
          size: 8
    }; 

    const result = Find_Parking_lots(graph_uppsala_test, 7);

    expect(result).toBe(undefined);

}); 

//TEST 5
test('Returns predecessor and shortest distances to all the other nodes from a start node - Ångström', ()=> {
   
    const result = Dijkstras_alg(graph_uppsala, 0); 

    expect(result).toStrictEqual({"parents":[null,3,0,0,3,0,1,0,3],"distances":[0,13,3,5,11,1,15,4,8]});

});

//TEST 6
test('Returns all parking lots from a start node that is a parking lot, including itself as the closest one', ()=> {
    
    const result = Find_Parking_lots(graph_uppsala, 6);
    //node 6 = centralgaraget

    expect(result).toStrictEqual(["Centralgaraget - 0 min","Aimo park Grimhild - 5 min","Studenternas IP parkering - 10 min",
    "Aimo parkering - Husargatan (Hemköp) - 14 min","Aimo park - Ångströmslaboratoriet - 16 min"]);
});

//TEST 7
test('Returns undefined for a graph where the start node does not exist', ()=> {

    const result = Find_Parking_lots(graph_uppsala, 10);

    expect(result).toBe(undefined); 
});