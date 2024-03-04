import { type Pair, type List, head, tail, flatten, 
    build_list, map, filter, pair, is_null } from './list';


/**
* A hash function for use in hash tables
* It should have good dispersion, but does not need to be difficult to invert or predict.
* @template K the type of keys
* @param key the key
* @returns the hash of the key.
*/
export type HashFunction<K> = (key: K) => number;
/**
* The identity function as a hash function
* Do not use except for learning about hash tables
* @param key the key
* @returns key
*/
export const hash_id: HashFunction<number> = key => key;
/**
* A hash table that uses chaining for conflict resolution
* Chains are persistent lists, for simplicity.
* @template K the type of keys
* @template V the type of values
* @param arr the array of chains
* @param hash the hash function
* @invariant the type of values does not contain undefined
*/
export type ChainingHashtable<K, V> = {
readonly arr:  Array<List<Pair<K, V>>>,
readonly hash: HashFunction<K>
}
/**
* Create an empty chaining hash table
* @template K the type of keys
* @template V the type of values
* @param size the number of chains (should be close to max expected size)
* @param hash the hash function
* @precondition the type of values does not contain undefined
* @returns an empty hash table
*/
export function ch_empty<K, V>(size: number, hash: HashFunction<K>): ChainingHashtable<K,V> {
const arr = new Array(size);
for (var i = 0 ; i < size ; i++) {
   arr[i] = null;
}
return { arr, hash };
}
/**
* Scan an association list for the given key.
* @template K the type of keys
* @template V the type of values
* @param xs the list to scan
* @param key the key to scan for
* @returns the associated value, or undefined if it does not exist.
*/
function scan<K, V>(xs: List<Pair<K, V>>, key: K): V | undefined {
return  is_null(xs)
       ? undefined
       : key === head(head(xs))
       ? tail(head(xs))
       : scan(tail(xs), key);
}
/**
* Search a hash table for the given key.
* @template K the type of keys
* @template V the type of values
* @param table the hash table to scan
* @param key the key to scan for
* @returns the associated value, or undefined if it does not exist.
*/
export function ch_lookup<K, V>({arr, hash}: ChainingHashtable<K,V>, key: K): V | undefined {
return scan(arr[hash(key) % arr.length], key);
}
/**
* Insert a key-value pair into a chaining hash table.
* Overwrites the existing value associated with the key, if any.
* @template K the type of keys
* @template V the type of values
* @param table the hash table
* @param key the key to insert at
* @param value the value to insert
* @returns true iff the key already existed
*/
export function ch_insert<K, V>({arr, hash}: ChainingHashtable<K,V>, key: K, value: V): boolean {
const index = hash(key) % arr.length;
if (scan(arr[index], key) === undefined) {
   arr[index] = pair(pair(key, value), arr[index])
   return false;
} else {
   arr[index] = map(kv => key === head(kv) ? pair(key, value) : kv, arr[index]);
   return true;
}
}
/**
* Delete a key-value pair from a chaining hash table.
* @template K the type of keys
* @template V the type of values
* @param table the hash table
* @param key the key to delete
* @returns true iff the key existed
*/
export function ch_delete<K, V>({arr, hash}: ChainingHashtable<K,V>, key: K): boolean {
const index = hash(key) % arr.length;
if (scan(arr[index], key) === undefined) {
   return false;
} else {
   arr[index] = filter(kv => head(kv) !== key, arr[index]);
   return true;
}
}
/**
* Get all keys in a chaining hash table.
* @template K the type of keys
* @template V the type of values
* @param table the hash table
* @returns all keys in the table
*/
export function ch_keys<K, V>(tab: ChainingHashtable<K,V>): List<K> {
return map(head, flatten(build_list(i => tab.arr[i], tab.arr.length)));
}
/**
* A probing function for a probing hash table
* @template K the type of keys
* @param length the length of the arrays in the hash table
* @param key the key to probe for
* @param i the probe index (starts at 0)
* @returns the array index to examine
*/
export type ProbingFunction<K> = (length: number, key: K, i: number) => number;
/**
* A hash table that resolves collisions by probing
* @template K the type of keys
* @template V the type of values
* @param keys the key array. null means that a key has been deleted.
* @param data the data associated with each key
* @param probe the probing function
* @param size the number of elements currently in the table
* @invariant the key type K contains neither null nor undefined
* @invariant If keys[i] is neither null nor undefined, 
*     then data[i] contains a value of type V.
* @invariant size is equal to the number of elements in keys 
*     that are neither null nor undefined.
*/
export type ProbingHashtable<K, V> = {
readonly keys:  Array<K | null | undefined >,
readonly data:  Array<V>,
readonly probe: ProbingFunction<K>,
size: number // number of elements
};
// linear probing with a given hash function
export function probe_linear<K>(hash: HashFunction<K>): ProbingFunction<K> {
return (length: number, key: K, i: number) => (hash(key) + i) % length;
}
//quadratic probing with a given hash function
export function probe_quadratic<K>(hash: HashFunction<K>): ProbingFunction<K> {
return (length: number, key: K, i: number) => (hash(key) + i*i) % length;
}
//double hashing
export function probe_double<K>(base_hash: HashFunction<K>,
                           probe_hash: HashFunction<K>): ProbingFunction<K> {
return (length: number, key: K, i: number) => 
  (base_hash(key) + i*probe_hash(key)) % length;
}
/**
* Create an empty probing hash table
* @template K the type of keys
* @template V the type of values
* @param length the maximum number of elements to accomodate
* @param hash the hash function
* @precondition the key type K contains neither null nor undefined
* @returns an empty hash table
*/
export function ph_empty<K, V>(length: number, 
                          probe: ProbingFunction<K>): ProbingHashtable<K,V> {
return { keys: new Array(length), data: new Array(length), 
        probe, size: 0 };
}
// helper function implementing probing from a given probe index i
export function probe_from<K, V>({keys, probe}: ProbingHashtable<K,V>, 
                     key: K, i: number): number | undefined {
function step(i: number): number | undefined {
   const index = probe(keys.length, key, i);
   return i === keys.length || keys[index] === undefined
              ? undefined
          : keys[index] === key
              ? index
          : step(i + 1);
}
return step(i);
}
/**
* Search a hash table for the given key.
* @template K the type of keys
* @template V the type of values
* @param table the hash table to scan
* @param key the key to scan for
* @returns the associated value, or undefined if it does not exist.
*/
export function ph_lookup<K, V>(tab: ProbingHashtable<K,V>, key: K): V | undefined {
const index = probe_from(tab, key, 0);
return index === undefined
      ? undefined
      : tab.data[index];
}
/**
* Insert a key-value pair into a probing hash table.
* Overwrites the existing value associated with the key, if any.
* @template K the type of keys
* @template V the type of values
* @param table the hash table
* @param key the key to insert at
* @param value the value to insert
* @returns true iff the insertion succeeded (the hash table was not full)
*/
export function ph_insert<K, V>(tab: ProbingHashtable<K,V>, key: K, value: V): boolean {
function insertAt(index: number): true {
   tab.keys[index] = key;
   tab.data[index] = value;
   tab.size = tab.size + 1;
   return true;
}
function insertFrom(i: number): boolean {
   const index = tab.probe(tab.keys.length, key, i);
   if (tab.keys[index] === key || tab.keys[index] === undefined) {
       return insertAt(index);
   } else if (tab.keys[index] === null) {
       const location = probe_from(tab, key, i);
       return insertAt(location === undefined ? index : location);
   } else {
       return insertFrom(i + 1);
   }
}
return tab.keys.length === tab.size ? false : insertFrom(0);
}
/**
* Delete a key-value pair from a probing hash table.
* @template K the type of keys
* @template V the type of values
* @param table the hash table
* @param key the key to delete
* @returns true iff the key existed
*/
export function ph_delete<K, V>(tab: ProbingHashtable<K,V>, key: K): boolean {
const index = probe_from(tab, key, 0);
if (index === undefined) {
   return false;
} else { 
   tab.keys[index] = null;
   tab.size = tab.size - 1;
   return true;
}
}
/**
* Filters out nulls and undefined values from a list, and from its element type
* @template T the element type of the resulting list
* @param xs a list with nulls and undefined values
* @returns the input list without nulls and undefined values
*/
function filterNulls<T>(xs:List<T | undefined | null>): List<T> {
if (is_null(xs)) {
   return null;
} else {
   const x = head(xs);
   if (x === undefined || x === null) {
       return filterNulls(tail(xs));
   } else {
       return pair(x, filterNulls(tail(xs)));
   }
}
}
/**
* Extract all the keys of a probing hash table
* @template K 
* @template V
* @param {ProbingHashtable<K,V>} tab
* @returns all the keys of the table
*/
export function ph_keys<K, V>(tab: ProbingHashtable<K,V>): List<K> {
return filterNulls(build_list(i => tab.keys[i], tab.keys.length));
}