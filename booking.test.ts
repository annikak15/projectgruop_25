import { make_booking, find_unbooked, 
         make_date_number, ParkingTable, is_booked, find_person, 
         Reservation, is_within_date, leave_spot, park_at, enqueue
} from "./project_booking";
import { get_park_from_parkingLots, load_parks_from_file, make_parking_table, set_up 
} from "./parking_lots";
import { empty } from "./lib/prio_queue";


const pFile = "saved_parking_lots.json";

//Person 1 info 
const person1 = 200405601111; 
const dateStart1 = new Date(); 
dateStart1.setFullYear(2022);
const dateEnd1 = new Date(); 
dateEnd1.setFullYear(dateEnd1.getFullYear() + 1); 

//Perosn 2 info 
const person2 = 198807062222; 
const dateStart2 = new Date(); 
dateStart2.setDate(1);
const dateEnd2 = new Date(); 
dateEnd2.setDate(dateEnd2.getDate() + 2); 

//Person 3 info 
const person3 = 196617183333; 
const dateStart3 = new Date(); 
dateStart3.setDate(dateStart2.getDate() + 3);
const dateEnd3 = new Date(); 
dateEnd3.setDate(dateStart2.getDate() + 3); 

//Person 4 info (note same start time as person 1)
const person4 = 199905284444; 
const dateStart4 = new Date(dateStart1); 
const dateEnd4 = new Date(); 
dateEnd4.setDate(60); 

//Testing find_unbooked
test("Finding non-booked parking lots", () => {
    set_up();
    const park = get_park_from_parkingLots(pFile, "test")!; 
    const dateStart = new Date(); 
    const dateEnd = dateStart; 
    dateEnd.setDate(30); 
    expect(find_unbooked(dateStart, dateEnd, park)).toEqual([0, 1, 2]); 
});

test("case: empty parking lot", () => {
    set_up();
    const park = get_park_from_parkingLots(pFile, "empty")!;
    const dateStart = new Date(); 
    const dateEnd = dateStart; 
    dateEnd.setDate(30); 
    expect(find_unbooked(dateStart, dateEnd, park)).toEqual([]); 
});

test("case: finding empty parking with occupied parking lots", () => {
    set_up(); 
    const park = get_park_from_parkingLots(pFile, "test")!;
    make_booking(dateStart1, dateEnd1, 0, park, person1);
    expect(find_unbooked(dateStart4, dateEnd4, park)).toEqual([1, 2]);
});

//Testing is_within_date
test("case: test if today's falls between a start and an end date", () => {
    const startDate = new Date();
    startDate.setFullYear(2020);
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1); //end date one year from now
    expect(is_within_date(startDate, endDate)).toBe(true);
});

//Testing find_person
test("case: find person in a reservations queue", () => {
    set_up();
    const park = get_park_from_parkingLots("saved_parking_lots.json", "test")!;
    make_booking(dateStart1, dateEnd1, 0, park, person1);
    make_booking(dateStart2, dateEnd2, 0, park, person2); 
    const reserv: Reservation = {person: person2,
                                 dateStart: dateStart2,
                                 dateEnd: dateEnd2}
    expect(find_person(park.reserved[0], person2)).toEqual(reserv);
});

test("case: find_person returns undefined if no reservation is found", () => {
    set_up(); 
    const park = get_park_from_parkingLots("saved_parking_lots.json", "test")!;
    expect(find_person(park.reserved[0], person1)).toBe(undefined);
});

//Testing make_booking 
//OBS ÄNDRA SÅ ATT DET BLIR RÄTT DATUM 
test("case: Dates sorted correctly", () => {
    set_up();
    //person A
    const personA = 200005061111;
    const startA = new Date(); 
    const endA = new Date();
    endA.setDate(endA.getDate() + 1);

    //person B 
    const personB = 198909082222; 
    const startB = new Date(endA); 
    startB.setDate(startB.getDate() + 1); 
    const endB = new Date(startB); 
    endB.setDate(endB.getDate() + 1); 

    //perosn C
    const personC = 197919083333; 
    const startC = new Date(endB); 
    startC.setDate(startC.getDate() + 1); 
    const endC = new Date(startC); 
    endC.setDate(endC.getDate() + 1); 

    const park = get_park_from_parkingLots(pFile, "test")!; 
    const dateNr1 = make_date_number(startA);
    const dateNr2 = make_date_number(startB);
    const dateNr3 = make_date_number(startC);
    make_booking(startB, endB, 0, park, personB); 
    make_booking(startA, endA, 0, park, personA);
    make_booking(startC, endC, 0, park, personC); 
    const expectedQ = [0, 3, [[dateNr1, {"dateEnd": endA, 
                                         "dateStart": startA, 
                                         "person": personA}], 
                              [dateNr2, {"dateEnd": endB, 
                                         "dateStart": startB, 
                                         "person": personB}],
                              [dateNr3, {"dateEnd": endC, 
                                         "dateStart": startC, 
                                         "person": personC}]]];
    expect(park.reserved[0]).toEqual(expectedQ);
});

test("case: trying to book a spot that is not available", () => {
    set_up(); 
    const park = get_park_from_parkingLots(pFile, "test")!;
    make_booking(dateStart1, dateEnd1, 0, park, person1);
    expect(is_booked(dateStart4, dateEnd4, park.reserved[0])).toBe(true);
});

//Testing leave_park 
/**
 * Testa: 
 * - Lämna spot man inte står på 
 * - lämna spot normalt och någon före som ej använt park_at
 */
test("case: leaving when you are parked at a parking spot", () => {
    set_up();
    const park = get_park_from_parkingLots(pFile, "test")!;
    make_booking(dateStart1, dateEnd1, 0, park, person1);
    park.parked[0] = person1;
    park.spots[0] = 0; 
    expect(leave_spot(park, 0, person1)).toBe(true);
})

test("case: trying to leave a spot when you are not parked", () => {
    set_up(); 
    const park = get_park_from_parkingLots(pFile, "test")!;
    expect(leave_spot(park, 0, person1)).toBe(false); 
})

//Testing park_at
test("case: parking in empty spot with reservation", () => {
    set_up();
    const park = get_park_from_parkingLots(pFile, "test")!;
    make_booking(dateStart1, dateEnd1, 0, park, person1);
    expect(park_at(park, 0, person1)).toBe(true);
}); 

test("case: parking in empty spot where someone has parked for too long", () => {
    set_up();
    let park = get_park_from_parkingLots(pFile, "test")!;
    make_booking(dateStart1, dateEnd1, 0, park, person1); 
    park.spots[0] = 0
    park.parked[0] = 200002020000
    const reservation: Reservation = {person: 200002020000,
                                      dateStart: dateStart1,
                                      dateEnd: dateEnd1}

    enqueue(make_date_number(dateStart1), reservation, park.reserved[0])
    expect(park_at(park, 0, person1)).toBe(true);
})

test("case: trying to park without any reservation is not allowed", () => {
    set_up(); 
    let park = get_park_from_parkingLots(pFile, "test")!;
    expect(park_at(park, 0, person1)).toBe(false);
})

test("case: trying to sign in to a parkingspot twice is not allowed", () => {
    set_up(); 
    let park = get_park_from_parkingLots(pFile, "test")!;
    make_booking(dateStart1, dateEnd1, 1, park, person1); 
    park_at(park, 1, person1);
    expect(park_at(park, 1, person1)).toBe(false);
});


//Additional testing of parking_lots.ts 
test("case: trying to load data from file that does not exist",
    () => {
    //(is supposed to print out an error message in terminal)
    expect(load_parks_from_file("file doesn't exist")).toBe(undefined);
})

test("case: trying to reach a parking lot that does not exist", () => {
    expect(get_park_from_parkingLots(pFile, "not a lot")).toBe(undefined);
})