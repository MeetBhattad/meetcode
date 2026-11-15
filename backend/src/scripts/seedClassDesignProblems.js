require('dotenv').config();
const axios = require('axios');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const BACKEND_URL = 'http://localhost:3000';

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('❌ ADMIN_EMAIL / ADMIN_PASSWORD missing from .env');
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────
// SHARED HELPERS per language
// ─────────────────────────────────────────────────────────────

const CPP_HELPER = `#include <iostream>
#include <sstream>
#include <string>
#include <vector>
#include <deque>
#include <queue>
#include <stack>
#include <list>
#include <set>
#include <map>
#include <unordered_map>
#include <unordered_set>
#include <algorithm>
#include <climits>
#include <cstdio>
using namespace std;

vector<string> tokenize(const string& line) {
    vector<string> tokens;
    stringstream ss(line);
    string t;
    while (ss >> t) tokens.push_back(t);
    return tokens;
}
`;

const JAVA_HELPER = `import java.util.*;
import java.util.stream.*;

class Helper {
    static String[] split(String line) {
        String trimmed = line.trim();
        if (trimmed.isEmpty()) return new String[0];
        return trimmed.split("\\\\s+");
    }
}
`;

const PY_HELPER = `import sys
from typing import List
from collections import defaultdict, OrderedDict, deque

def tokenize(line):
    return line.split()
`;

// ─────────────────────────────────────────────────────────────
// HARNESS GENERATORS (DSL-driven)
// ─────────────────────────────────────────────────────────────

const TYPE_CONV = {
  cpp:    { int: (t) => `stoi(${t})`,  string: (t) => t,  double: (t) => `stod(${t})` },
  java:   { int: (t) => `Integer.parseInt(${t})`, string: (t) => t, double: (t) => `Double.parseDouble(${t})` },
  python: { int: (t) => `int(${t})`,  string: (t) => t,  double: (t) => `float(${t})` },
};

function buildDispatch(lang, methods) {
  // Match the template's indentation for multi-line output
  const indent = lang === 'java' ? '                ' : '        ';
  const joinStr = '\n' + indent;

  return methods.map((m, idx) => {
    // First method must be `if`; the rest chain with `else if` / `elif`
    let prefix;
    if (lang === 'python') {
      prefix = idx === 0 ? 'if' : 'elif';
    } else {
      prefix = idx === 0 ? 'if' : 'else if';
    }

    const argList = m.args.map((type, i) => TYPE_CONV[lang][type](`tokens[${i + 1}]`)).join(', ');
    const call = `obj->${m.name}(${argList})`;
    const callJava = `obj.${m.name}(${argList})`;
    const callPy = `obj.${m.name}(${argList})`;

    if (lang === 'cpp') {
      if (m.returns === 'void') return `${prefix} (m == "${m.name}") { ${call}; cout << "null" << endl; }`;
      if (m.returns === 'int') return `${prefix} (m == "${m.name}") { cout << ${call} << endl; }`;
      if (m.returns === 'bool') return `${prefix} (m == "${m.name}") { cout << (${call} ? "true" : "false") << endl; }`;
      if (m.returns === 'double') return `${prefix} (m == "${m.name}") { printf("%.5f\\n", ${call}); }`;
      if (m.returns === 'string') return `${prefix} (m == "${m.name}") { cout << ${call} << endl; }`;
      if (m.returns === 'vector<int>') return `${prefix} (m == "${m.name}") { auto v = ${call}; for (size_t i = 0; i < v.size(); i++) { if (i) cout << " "; cout << v[i]; } cout << endl; }`;
    }
    if (lang === 'java') {
      if (m.returns === 'void') return `${prefix} (m.equals("${m.name}")) { ${callJava}; System.out.println("null"); }`;
      if (m.returns === 'int') return `${prefix} (m.equals("${m.name}")) { System.out.println(${callJava}); }`;
      if (m.returns === 'bool') return `${prefix} (m.equals("${m.name}")) { System.out.println(${callJava} ? "true" : "false"); }`;
      if (m.returns === 'double') return `${prefix} (m.equals("${m.name}")) { System.out.printf("%.5f%n", ${callJava}); }`;
      if (m.returns === 'string') return `${prefix} (m.equals("${m.name}")) { System.out.println(${callJava}); }`;
      if (m.returns === 'vector<int>') return `${prefix} (m.equals("${m.name}")) { List<Integer> v = ${callJava}; StringBuilder sb = new StringBuilder(); for (int i = 0; i < v.size(); i++) { if (i > 0) sb.append(" "); sb.append(v.get(i)); } System.out.println(sb.toString()); }`;
    }
    if (lang === 'python') {
      if (m.returns === 'void') return `${prefix} m == "${m.name}": ${callPy}; print("null")`;
      if (m.returns === 'int') return `${prefix} m == "${m.name}": print(${callPy})`;
      if (m.returns === 'bool') return `${prefix} m == "${m.name}": print("true" if ${callPy} else "false")`;
      if (m.returns === 'double') return `${prefix} m == "${m.name}": print(f"{${callPy}:.5f}")`;
      if (m.returns === 'string') return `${prefix} m == "${m.name}": print(${callPy})`;
      if (m.returns === 'vector<int>') return `${prefix} m == "${m.name}": print(' '.join(map(str, ${callPy})))`;
    }
    return '';
  }).join(joinStr);
}

function buildCtorArgs(lang, spec) {
  return spec.constructor.args.map((type, i) => TYPE_CONV[lang][type](`tokens[${i + 1}]`)).join(', ');
}

function buildCppHarness(spec) {
  const ctor = buildCtorArgs('cpp', spec);
  const dispatch = buildDispatch('cpp', spec.methods);
  return `${CPP_HELPER}
{{USER_CODE}}

int main() {
    string line;
    getline(cin, line);
    auto tokens = tokenize(line);
    ${spec.className}* obj = new ${spec.className}(${ctor});
    cout << "null" << endl;
    while (getline(cin, line)) {
        tokens = tokenize(line);
        if (tokens.empty()) continue;
        string m = tokens[0];
        ${dispatch}
    }
    return 0;
}`;
}

function buildJavaHarness(spec) {
  const ctor = buildCtorArgs('java', spec);
  const dispatch = buildDispatch('java', spec.methods);
  return `${JAVA_HELPER}
{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] tokens = Helper.split(sc.nextLine());
        ${spec.className} obj = new ${spec.className}(${ctor});
        System.out.println("null");
        while (sc.hasNextLine()) {
            String line = sc.nextLine();
            if (line.isEmpty()) continue;
            tokens = Helper.split(line);
            if (tokens.length == 0) continue;
            String m = tokens[0];
            ${dispatch}
        }
    }
}`;
}

function buildPyHarness(spec) {
  const ctor = buildCtorArgs('python', spec);
  const dispatch = buildDispatch('python', spec.methods);
  return `${PY_HELPER}
{{USER_CODE}}

def main():
    line = sys.stdin.readline().rstrip('\\n')
    tokens = tokenize(line)
    obj = ${spec.className}(${ctor})
    print("null")
    for line in sys.stdin:
        line = line.rstrip('\\n')
        if not line:
            continue
        tokens = tokenize(line)
        if not tokens:
            continue
        m = tokens[0]
        ${dispatch}

if __name__ == "__main__":
    main()`;
}

// ─────────────────────────────────────────────────────────────
// PROBLEM DEFINITIONS
// ─────────────────────────────────────────────────────────────

const problemsData = [
  {
    title: 'Min Stack',
    problemNumber: 155,
    difficulty: 'medium',
    tags: 'stack',
    className: 'MinStack',
    constructor: { args: [] },
    methods: [
      { name: 'push', args: ['int'], returns: 'void' },
      { name: 'pop', args: [], returns: 'void' },
      { name: 'top', args: [], returns: 'int' },
      { name: 'getMin', args: [], returns: 'int' },
    ],
    description: 'Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.\n\nImplement the `MinStack` class:\n- `MinStack()` initializes the stack object.\n- `void push(int val)` pushes the element `val` onto the stack.\n- `void pop()` removes the element on the top of the stack.\n- `int top()` gets the top element of the stack.\n- `int getMin()` retrieves the minimum element in the stack.\n\n**Input format:** Line 1 = class name. Each subsequent line = one operation (`method arg1 arg2 ...`).\n\n**Output format:** One line per operation. `null` for void methods.',
    visibleTestCases: [
      { input: 'MinStack\npush -2\npush 0\npush -3\ngetMin\npop\ntop\ngetMin', output: 'null\nnull\nnull\nnull\n-3\nnull\n0\n-2', explanation: 'After pushing -2, 0, -3, getMin returns -3. Pop removes -3, top returns 0, getMin returns -2.' }
    ],
    hiddenTestCases: [
      { input: 'MinStack\npush 5\ntop\ngetMin\npush 3\ngetMin\npop\ngetMin', output: 'null\nnull\n5\n5\nnull\n3\nnull\n5' }
    ],
    startCode: [
      { language: 'C++', initialCode: 'class MinStack {\npublic:\n    MinStack() {\n        // Write your code here\n    }\n    \n    void push(int val) {\n        // Write your code here\n    }\n    \n    void pop() {\n        // Write your code here\n    }\n    \n    int top() {\n        // Write your code here\n        return 0;\n    }\n    \n    int getMin() {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class MinStack {\n    public MinStack() {\n        // Write your code here\n    }\n    \n    public void push(int val) {\n        // Write your code here\n    }\n    \n    public void pop() {\n        // Write your code here\n    }\n    \n    public int top() {\n        // Write your code here\n        return 0;\n    }\n    \n    public int getMin() {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class MinStack:\n    def __init__(self):\n        # Write your code here\n        pass\n\n    def push(self, val: int) -> None:\n        # Write your code here\n        pass\n\n    def pop(self) -> None:\n        # Write your code here\n        pass\n\n    def top(self) -> int:\n        # Write your code here\n        pass\n\n    def getMin(self) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class MinStack {\n    stack<int> s, minS;\npublic:\n    MinStack() {}\n    void push(int val) {\n        s.push(val);\n        if (minS.empty() || val <= minS.top()) minS.push(val);\n    }\n    void pop() {\n        if (s.top() == minS.top()) minS.pop();\n        s.pop();\n    }\n    int top() { return s.top(); }\n    int getMin() { return minS.top(); }\n};' },
      { language: 'Java', completeCode: 'class MinStack {\n    private Stack<Integer> s = new Stack<>();\n    private Stack<Integer> minS = new Stack<>();\n    public MinStack() {}\n    public void push(int val) {\n        s.push(val);\n        if (minS.isEmpty() || val <= minS.peek()) minS.push(val);\n    }\n    public void pop() {\n        if (s.peek().equals(minS.peek())) minS.pop();\n        s.pop();\n    }\n    public int top() { return s.peek(); }\n    public int getMin() { return minS.peek(); }\n}' },
      { language: 'Python', completeCode: 'class MinStack:\n    def __init__(self):\n        self.stack = []\n        self.min_stack = []\n\n    def push(self, val: int) -> None:\n        self.stack.append(val)\n        if not self.min_stack or val <= self.min_stack[-1]:\n            self.min_stack.append(val)\n\n    def pop(self) -> None:\n        if self.stack[-1] == self.min_stack[-1]:\n            self.min_stack.pop()\n        self.stack.pop()\n\n    def top(self) -> int:\n        return self.stack[-1]\n\n    def getMin(self) -> int:\n        return self.min_stack[-1]' },
    ],
  },
  {
    title: 'LRU Cache',
    problemNumber: 146,
    difficulty: 'medium',
    tags: 'linkedList',
    className: 'LRUCache',
    constructor: { args: ['int'] },
    methods: [
      { name: 'get', args: ['int'], returns: 'int' },
      { name: 'put', args: ['int', 'int'], returns: 'void' },
    ],
    description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement the `LRUCache` class:\n- `LRUCache(int capacity)` initializes the LRU cache with positive size `capacity`.\n- `int get(int key)` returns the value of the `key` if it exists, otherwise `-1`.\n- `void put(int key, int value)` updates the value of the `key` if it exists, otherwise adds it. If the number of keys exceeds capacity, evict the least recently used key.\n\nBoth `get` and `put` must run in O(1) average time.',
    visibleTestCases: [
      { input: 'LRUCache 2\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2\nput 4 4\nget 1\nget 3\nget 4', output: 'null\nnull\nnull\n1\nnull\n-1\nnull\n-1\n3\n4', explanation: 'Standard LRU eviction: key 2 evicted on put(3,3), key 3 evicted on put(4,4).' }
    ],
    hiddenTestCases: [
      { input: 'LRUCache 1\nput 1 1\nget 1\nput 2 2\nget 1\nget 2', output: 'null\nnull\n1\nnull\n-1\n2' }
    ],
    startCode: [
      { language: 'C++', initialCode: 'class LRUCache {\npublic:\n    LRUCache(int capacity) {\n        // Write your code here\n    }\n    \n    int get(int key) {\n        // Write your code here\n        return -1;\n    }\n    \n    void put(int key, int value) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class LRUCache {\n    public LRUCache(int capacity) {\n        // Write your code here\n    }\n    \n    public int get(int key) {\n        // Write your code here\n        return -1;\n    }\n    \n    public void put(int key, int value) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class LRUCache:\n    def __init__(self, capacity: int):\n        # Write your code here\n        pass\n\n    def get(self, key: int) -> int:\n        # Write your code here\n        pass\n\n    def put(self, key: int, value: int) -> None:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class LRUCache {\n    int cap;\n    list<pair<int,int>> lru;\n    unordered_map<int, list<pair<int,int>>::iterator> mp;\npublic:\n    LRUCache(int capacity) : cap(capacity) {}\n    int get(int key) {\n        if (!mp.count(key)) return -1;\n        auto it = mp[key];\n        int val = it->second;\n        lru.erase(it);\n        lru.push_front({key, val});\n        mp[key] = lru.begin();\n        return val;\n    }\n    void put(int key, int value) {\n        if (mp.count(key)) { lru.erase(mp[key]); }\n        else if (lru.size() == cap) { mp.erase(lru.back().first); lru.pop_back(); }\n        lru.push_front({key, value});\n        mp[key] = lru.begin();\n    }\n};' },
      { language: 'Java', completeCode: 'class LRUCache {\n    private int cap;\n    private LinkedHashMap<Integer, Integer> map;\n    public LRUCache(int capacity) {\n        this.cap = capacity;\n        this.map = new LinkedHashMap<>(capacity, 0.75f, true) {\n            protected boolean removeEldestEntry(Map.Entry<Integer, Integer> e) {\n                return size() > cap;\n            }\n        };\n    }\n    public int get(int key) {\n        return map.getOrDefault(key, -1);\n    }\n    public void put(int key, int value) {\n        map.put(key, value);\n    }\n}' },
      { language: 'Python', completeCode: 'class LRUCache:\n    def __init__(self, capacity: int):\n        self.cap = capacity\n        self.map = OrderedDict()\n\n    def get(self, key: int) -> int:\n        if key not in self.map:\n            return -1\n        self.map.move_to_end(key)\n        return self.map[key]\n\n    def put(self, key: int, value: int) -> None:\n        if key in self.map:\n            self.map.move_to_end(key)\n        self.map[key] = value\n        if len(self.map) > self.cap:\n            self.map.popitem(last=False)' },
    ],
  },
  {
    title: 'Implement Trie (Prefix Tree)',
    problemNumber: 208,
    difficulty: 'medium',
    tags: 'trie',
    className: 'Trie',
    constructor: { args: [] },
    methods: [
      { name: 'insert', args: ['string'], returns: 'void' },
      { name: 'search', args: ['string'], returns: 'bool' },
      { name: 'startsWith', args: ['string'], returns: 'bool' },
    ],
    description: 'A trie (prefix tree) is a tree data structure used to efficiently store and retrieve keys in a dataset of strings.\n\nImplement the `Trie` class:\n- `Trie()` initializes the trie object.\n- `void insert(String word)` inserts the string `word` into the trie.\n- `boolean search(String word)` returns `true` if `word` is in the trie, `false` otherwise.\n- `boolean startsWith(String prefix)` returns `true` if there is a previously inserted word that starts with `prefix`.',
    visibleTestCases: [
      { input: 'Trie\ninsert apple\nsearch apple\nsearch app\nstartsWith app\ninsert app\nsearch app', output: 'null\nnull\ntrue\nfalse\ntrue\nnull\ntrue', explanation: 'After inserting "apple", search for "app" is false but startsWith "app" is true. After inserting "app", search for "app" is true.' }
    ],
    hiddenTestCases: [
      { input: 'Trie\ninsert abc\nstartsWith a\nstartsWith ab\nstartsWith abc\nstartsWith abcd', output: 'null\nnull\ntrue\ntrue\ntrue\nfalse' }
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Trie {\npublic:\n    Trie() {\n        // Write your code here\n    }\n    \n    void insert(string word) {\n        // Write your code here\n    }\n    \n    bool search(string word) {\n        // Write your code here\n        return false;\n    }\n    \n    bool startsWith(string prefix) {\n        // Write your code here\n        return false;\n    }\n};' },
      { language: 'Java', initialCode: 'class Trie {\n    public Trie() {\n        // Write your code here\n    }\n    \n    public void insert(String word) {\n        // Write your code here\n    }\n    \n    public boolean search(String word) {\n        // Write your code here\n        return false;\n    }\n    \n    public boolean startsWith(String prefix) {\n        // Write your code here\n        return false;\n    }\n}' },
      { language: 'Python', initialCode: 'class Trie:\n    def __init__(self):\n        # Write your code here\n        pass\n\n    def insert(self, word: str) -> None:\n        # Write your code here\n        pass\n\n    def search(self, word: str) -> bool:\n        # Write your code here\n        pass\n\n    def startsWith(self, prefix: str) -> bool:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'struct Node {\n    Node* ch[26] = {};\n    bool end = false;\n};\n\nclass Trie {\n    Node* root;\npublic:\n    Trie() { root = new Node(); }\n    void insert(string word) {\n        Node* n = root;\n        for (char c : word) {\n            if (!n->ch[c-\'a\']) n->ch[c-\'a\'] = new Node();\n            n = n->ch[c-\'a\'];\n        }\n        n->end = true;\n    }\n    bool search(string word) {\n        Node* n = root;\n        for (char c : word) {\n            if (!n->ch[c-\'a\']) return false;\n            n = n->ch[c-\'a\'];\n        }\n        return n->end;\n    }\n    bool startsWith(string prefix) {\n        Node* n = root;\n        for (char c : prefix) {\n            if (!n->ch[c-\'a\']) return false;\n            n = n->ch[c-\'a\'];\n        }\n        return true;\n    }\n};' },
      { language: 'Java', completeCode: 'class Node {\n    Node[] ch = new Node[26];\n    boolean end = false;\n}\n\nclass Trie {\n    private Node root;\n    public Trie() { root = new Node(); }\n    public void insert(String word) {\n        Node n = root;\n        for (char c : word.toCharArray()) {\n            if (n.ch[c-\'a\'] == null) n.ch[c-\'a\'] = new Node();\n            n = n.ch[c-\'a\'];\n        }\n        n.end = true;\n    }\n    public boolean search(String word) {\n        Node n = root;\n        for (char c : word.toCharArray()) {\n            if (n.ch[c-\'a\'] == null) return false;\n            n = n.ch[c-\'a\'];\n        }\n        return n.end;\n    }\n    public boolean startsWith(String prefix) {\n        Node n = root;\n        for (char c : prefix.toCharArray()) {\n            if (n.ch[c-\'a\'] == null) return false;\n            n = n.ch[c-\'a\'];\n        }\n        return true;\n    }\n}' },
      { language: 'Python', completeCode: 'class Trie:\n    def __init__(self):\n        self.root = {}\n\n    def insert(self, word: str) -> None:\n        n = self.root\n        for c in word:\n            n = n.setdefault(c, {})\n        n[\'$\'] = True\n\n    def search(self, word: str) -> bool:\n        n = self.root\n        for c in word:\n            if c not in n:\n                return False\n            n = n[c]\n        return \'$\' in n\n\n    def startsWith(self, prefix: str) -> bool:\n        n = self.root\n        for c in prefix:\n            if c not in n:\n                return False\n            n = n[c]\n        return True' },
    ],
  },
  {
    title: 'Design Add and Search Words Data Structure',
    problemNumber: 211,
    difficulty: 'medium',
    tags: 'trie',
    className: 'WordDictionary',
    constructor: { args: [] },
    methods: [
      { name: 'addWord', args: ['string'], returns: 'void' },
      { name: 'search', args: ['string'], returns: 'bool' },
    ],
    description: 'Design a data structure that supports adding new words and finding if a string matches any previously added string.\n\nImplement the `WordDictionary` class:\n- `WordDictionary()` initializes the object.\n- `void addWord(String word)` adds `word` to the data structure.\n- `boolean search(String word)` returns `true` if there is any string in the data structure that matches `word`, `false` otherwise. `word` may contain dots `.` where dots can be matched with any letter.',
    visibleTestCases: [
      { input: 'WordDictionary\naddWord bad\naddWord dad\naddWord mad\nsearch pad\nsearch bad\nsearch .ad\nsearch b..', output: 'null\nnull\nnull\nnull\nfalse\ntrue\ntrue\ntrue', explanation: 'Wildcards match any letter.' }
    ],
    hiddenTestCases: [
      { input: 'WordDictionary\naddWord a\nsearch a\nsearch .\nsearch ..', output: 'null\nnull\ntrue\ntrue\nfalse' }
    ],
    startCode: [
      { language: 'C++', initialCode: 'class WordDictionary {\npublic:\n    WordDictionary() {\n        // Write your code here\n    }\n    \n    void addWord(string word) {\n        // Write your code here\n    }\n    \n    bool search(string word) {\n        // Write your code here\n        return false;\n    }\n};' },
      { language: 'Java', initialCode: 'class WordDictionary {\n    public WordDictionary() {\n        // Write your code here\n    }\n    \n    public void addWord(String word) {\n        // Write your code here\n    }\n    \n    public boolean search(String word) {\n        // Write your code here\n        return false;\n    }\n}' },
      { language: 'Python', initialCode: 'class WordDictionary:\n    def __init__(self):\n        # Write your code here\n        pass\n\n    def addWord(self, word: str) -> None:\n        # Write your code here\n        pass\n\n    def search(self, word: str) -> bool:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class WordDictionary {\n    WordDictionary* ch[26] = {};\n    bool end = false;\npublic:\n    WordDictionary() {}\n    void addWord(string word) {\n        WordDictionary* n = this;\n        for (char c : word) {\n            if (!n->ch[c-\'a\']) n->ch[c-\'a\'] = new WordDictionary();\n            n = n->ch[c-\'a\'];\n        }\n        n->end = true;\n    }\n    bool search(string word) {\n        WordDictionary* n = this;\n        for (int i = 0; i < word.size(); i++) {\n            char c = word[i];\n            if (c == \'.\') {\n                for (int j = 0; j < 26; j++) {\n                    if (n->ch[j] && n->ch[j]->search(word.substr(i+1))) return true;\n                }\n                return false;\n            }\n            if (!n->ch[c-\'a\']) return false;\n            n = n->ch[c-\'a\'];\n        }\n        return n->end;\n    }\n};' },
      { language: 'Java', completeCode: 'class WordDictionary {\n    private WordDictionary[] ch = new WordDictionary[26];\n    private boolean end = false;\n    public WordDictionary() {}\n    public void addWord(String word) {\n        WordDictionary n = this;\n        for (char c : word.toCharArray()) {\n            if (n.ch[c-\'a\'] == null) n.ch[c-\'a\'] = new WordDictionary();\n            n = n.ch[c-\'a\'];\n        }\n        n.end = true;\n    }\n    public boolean search(String word) {\n        WordDictionary n = this;\n        for (int i = 0; i < word.length(); i++) {\n            char c = word.charAt(i);\n            if (c == \'.\') {\n                for (int j = 0; j < 26; j++) {\n                    if (n.ch[j] != null && n.ch[j].search(word.substring(i+1))) return true;\n                }\n                return false;\n            }\n            if (n.ch[c-\'a\'] == null) return false;\n            n = n.ch[c-\'a\'];\n        }\n        return n.end;\n    }\n}' },
      { language: 'Python', completeCode: 'class WordDictionary:\n    def __init__(self):\n        self.root = {}\n\n    def addWord(self, word: str) -> None:\n        n = self.root\n        for c in word:\n            n = n.setdefault(c, {})\n        n[\'$\'] = True\n\n    def search(self, word: str) -> bool:\n        def dfs(node, i):\n            if i == len(word):\n                return \'$\' in node\n            c = word[i]\n            if c == \'.\':\n                return any(dfs(node[k], i + 1) for k in node if k != \'$\')\n            if c not in node:\n                return False\n            return dfs(node[c], i + 1)\n        return dfs(self.root, 0)' },
    ],
  },
  {
    title: 'Implement Queue using Stacks',
    problemNumber: 232,
    difficulty: 'medium',
    tags: 'stack',
    className: 'MyQueue',
    constructor: { args: [] },
    methods: [
      { name: 'push', args: ['int'], returns: 'void' },
      { name: 'pop', args: [], returns: 'int' },
      { name: 'peek', args: [], returns: 'int' },
      { name: 'empty', args: [], returns: 'bool' },
    ],
    description: 'Implement a first-in-first-out (FIFO) queue using only two stacks.\n\nImplement the `MyQueue` class:\n- `void push(int x)` pushes `x` to the back of the queue.\n- `int pop()` removes the element from the front and returns it.\n- `int peek()` returns the element at the front.\n- `boolean empty()` returns `true` if the queue is empty, `false` otherwise.',
    visibleTestCases: [
      { input: 'MyQueue\npush 1\npush 2\npeek\npop\nempty', output: 'null\nnull\nnull\n1\n1\nfalse', explanation: 'FIFO behavior with two stacks.' }
    ],
    hiddenTestCases: [
      { input: 'MyQueue\npush 1\npush 2\npush 3\npop\npop\npop\nempty', output: 'null\nnull\nnull\nnull\n1\n2\n3\ntrue' }
    ],
    startCode: [
      { language: 'C++', initialCode: 'class MyQueue {\npublic:\n    MyQueue() {\n        // Write your code here\n    }\n    \n    void push(int x) {\n        // Write your code here\n    }\n    \n    int pop() {\n        // Write your code here\n        return 0;\n    }\n    \n    int peek() {\n        // Write your code here\n        return 0;\n    }\n    \n    bool empty() {\n        // Write your code here\n        return true;\n    }\n};' },
      { language: 'Java', initialCode: 'class MyQueue {\n    public MyQueue() {\n        // Write your code here\n    }\n    \n    public void push(int x) {\n        // Write your code here\n    }\n    \n    public int pop() {\n        // Write your code here\n        return 0;\n    }\n    \n    public int peek() {\n        // Write your code here\n        return 0;\n    }\n    \n    public boolean empty() {\n        // Write your code here\n        return true;\n    }\n}' },
      { language: 'Python', initialCode: 'class MyQueue:\n    def __init__(self):\n        # Write your code here\n        pass\n\n    def push(self, x: int) -> None:\n        # Write your code here\n        pass\n\n    def pop(self) -> int:\n        # Write your code here\n        pass\n\n    def peek(self) -> int:\n        # Write your code here\n        pass\n\n    def empty(self) -> bool:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class MyQueue {\n    stack<int> in, out;\npublic:\n    MyQueue() {}\n    void push(int x) { in.push(x); }\n    int pop() {\n        if (out.empty()) { while (!in.empty()) { out.push(in.top()); in.pop(); } }\n        int x = out.top(); out.pop(); return x;\n    }\n    int peek() {\n        if (out.empty()) { while (!in.empty()) { out.push(in.top()); in.pop(); } }\n        return out.top();\n    }\n    bool empty() { return in.empty() && out.empty(); }\n};' },
      { language: 'Java', completeCode: 'class MyQueue {\n    private Stack<Integer> in = new Stack<>();\n    private Stack<Integer> out = new Stack<>();\n    public MyQueue() {}\n    public void push(int x) { in.push(x); }\n    public int pop() {\n        if (out.isEmpty()) { while (!in.isEmpty()) out.push(in.pop()); }\n        return out.pop();\n    }\n    public int peek() {\n        if (out.isEmpty()) { while (!in.isEmpty()) out.push(in.pop()); }\n        return out.peek();\n    }\n    public boolean empty() { return in.isEmpty() && out.isEmpty(); }\n}' },
      { language: 'Python', completeCode: 'class MyQueue:\n    def __init__(self):\n        self.in_stack = []\n        self.out_stack = []\n\n    def push(self, x: int) -> None:\n        self.in_stack.append(x)\n\n    def pop(self) -> int:\n        if not self.out_stack:\n            while self.in_stack:\n                self.out_stack.append(self.in_stack.pop())\n        return self.out_stack.pop()\n\n    def peek(self) -> int:\n        if not self.out_stack:\n            while self.in_stack:\n                self.out_stack.append(self.in_stack.pop())\n        return self.out_stack[-1]\n\n    def empty(self) -> bool:\n        return not self.in_stack and not self.out_stack' },
    ],
  },
  {
    title: 'Implement Stack using Queues',
    problemNumber: 225,
    difficulty: 'medium',
    tags: 'stack',
    className: 'MyStack',
    constructor: { args: [] },
    methods: [
      { name: 'push', args: ['int'], returns: 'void' },
      { name: 'pop', args: [], returns: 'int' },
      { name: 'top', args: [], returns: 'int' },
      { name: 'empty', args: [], returns: 'bool' },
    ],
    description: 'Implement a last-in-first-out (LIFO) stack using only two queues.\n\nImplement the `MyStack` class:\n- `void push(int x)` pushes `x` onto the stack.\n- `int pop()` removes the element on top and returns it.\n- `int top()` returns the element on top.\n- `boolean empty()` returns `true` if the stack is empty, `false` otherwise.',
    visibleTestCases: [
      { input: 'MyStack\npush 1\npush 2\ntop\npop\nempty', output: 'null\nnull\nnull\n2\n2\nfalse', explanation: 'LIFO behavior.' }
    ],
    hiddenTestCases: [
      { input: 'MyStack\npush 1\npush 2\npush 3\npop\npop\npop\nempty', output: 'null\nnull\nnull\nnull\n3\n2\n1\ntrue' }
    ],
    startCode: [
      { language: 'C++', initialCode: 'class MyStack {\npublic:\n    MyStack() {\n        // Write your code here\n    }\n    \n    void push(int x) {\n        // Write your code here\n    }\n    \n    int pop() {\n        // Write your code here\n        return 0;\n    }\n    \n    int top() {\n        // Write your code here\n        return 0;\n    }\n    \n    bool empty() {\n        // Write your code here\n        return true;\n    }\n};' },
      { language: 'Java', initialCode: 'class MyStack {\n    public MyStack() {\n        // Write your code here\n    }\n    \n    public void push(int x) {\n        // Write your code here\n    }\n    \n    public int pop() {\n        // Write your code here\n        return 0;\n    }\n    \n    public int top() {\n        // Write your code here\n        return 0;\n    }\n    \n    public boolean empty() {\n        // Write your code here\n        return true;\n    }\n}' },
      { language: 'Python', initialCode: 'class MyStack:\n    def __init__(self):\n        # Write your code here\n        pass\n\n    def push(self, x: int) -> None:\n        # Write your code here\n        pass\n\n    def pop(self) -> int:\n        # Write your code here\n        pass\n\n    def top(self) -> int:\n        # Write your code here\n        pass\n\n    def empty(self) -> bool:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class MyStack {\n    queue<int> q;\npublic:\n    MyStack() {}\n    void push(int x) {\n        q.push(x);\n        for (int i = 0; i < (int)q.size() - 1; i++) { q.push(q.front()); q.pop(); }\n    }\n    int pop() { int x = q.front(); q.pop(); return x; }\n    int top() { return q.front(); }\n    bool empty() { return q.empty(); }\n};' },
      { language: 'Java', completeCode: 'class MyStack {\n    private Queue<Integer> q = new LinkedList<>();\n    public MyStack() {}\n    public void push(int x) {\n        q.offer(x);\n        for (int i = 0; i < q.size() - 1; i++) q.offer(q.poll());\n    }\n    public int pop() { return q.poll(); }\n    public int top() { return q.peek(); }\n    public boolean empty() { return q.isEmpty(); }\n}' },
      { language: 'Python', completeCode: 'class MyStack:\n    def __init__(self):\n        self.q = deque()\n\n    def push(self, x: int) -> None:\n        self.q.append(x)\n        for _ in range(len(self.q) - 1):\n            self.q.append(self.q.popleft())\n\n    def pop(self) -> int:\n        return self.q.popleft()\n\n    def top(self) -> int:\n        return self.q[0]\n\n    def empty(self) -> bool:\n        return not self.q' },
    ],
  },
  {
    title: 'Design HashMap',
    problemNumber: 706,
    difficulty: 'easy',
    tags: 'hashMap',
    className: 'MyHashMap',
    constructor: { args: [] },
    methods: [
      { name: 'put', args: ['int', 'int'], returns: 'void' },
      { name: 'get', args: ['int'], returns: 'int' },
      { name: 'remove', args: ['int'], returns: 'void' },
    ],
    description: 'Design a HashMap without using any built-in hash table libraries.\n\nImplement the `MyHashMap` class:\n- `void put(int key, int value)` inserts or updates the `key` with `value`.\n- `int get(int key)` returns the value to which the key is mapped, or `-1` if not present.\n- `void remove(int key)` removes the key and its value.',
    visibleTestCases: [
      { input: 'MyHashMap\nput 1 1\nput 2 2\nget 1\nget 3\nput 2 1\nget 2\nremove 2\nget 2', output: 'null\nnull\nnull\n1\n-1\nnull\n1\nnull\n-1', explanation: 'Basic put/get/remove.' }
    ],
    hiddenTestCases: [
      { input: 'MyHashMap\nput 1 10\nput 1 20\nget 1\nremove 1\nget 1', output: 'null\nnull\nnull\n20\nnull\n-1' }
    ],
    startCode: [
      { language: 'C++', initialCode: 'class MyHashMap {\npublic:\n    MyHashMap() {\n        // Write your code here\n    }\n    \n    void put(int key, int value) {\n        // Write your code here\n    }\n    \n    int get(int key) {\n        // Write your code here\n        return -1;\n    }\n    \n    void remove(int key) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class MyHashMap {\n    public MyHashMap() {\n        // Write your code here\n    }\n    \n    public void put(int key, int value) {\n        // Write your code here\n    }\n    \n    public int get(int key) {\n        // Write your code here\n        return -1;\n    }\n    \n    public void remove(int key) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class MyHashMap:\n    def __init__(self):\n        # Write your code here\n        pass\n\n    def put(self, key: int, value: int) -> None:\n        # Write your code here\n        pass\n\n    def get(self, key: int) -> int:\n        # Write your code here\n        pass\n\n    def remove(self, key: int) -> None:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class MyHashMap {\n    vector<int> m;\npublic:\n    MyHashMap() : m(1000001, -1) {}\n    void put(int key, int value) { m[key] = value; }\n    int get(int key) { return m[key]; }\n    void remove(int key) { m[key] = -1; }\n};' },
      { language: 'Java', completeCode: 'class MyHashMap {\n    private int[] m = new int[1000001];\n    public MyHashMap() { Arrays.fill(m, -1); }\n    public void put(int key, int value) { m[key] = value; }\n    public int get(int key) { return m[key]; }\n    public void remove(int key) { m[key] = -1; }\n}' },
      { language: 'Python', completeCode: 'class MyHashMap:\n    def __init__(self):\n        self.m = {}\n\n    def put(self, key: int, value: int) -> None:\n        self.m[key] = value\n\n    def get(self, key: int) -> int:\n        return self.m.get(key, -1)\n\n    def remove(self, key: int) -> None:\n        self.m.pop(key, None)' },
    ],
  },
  {
    title: 'Design Parking System',
    problemNumber: 1603,
    difficulty: 'easy',
    tags: 'array',
    className: 'ParkingSystem',
    constructor: { args: ['int', 'int', 'int'] },
    methods: [
      { name: 'addCar', args: ['int'], returns: 'bool' },
    ],
    description: 'Design a parking system for a parking lot with three types of parking spaces: big, medium, and small, with a fixed number of slots for each size.\n\nImplement the `ParkingSystem` class:\n- `ParkingSystem(int big, int medium, int small)` initializes the object with the number of slots for each parking space type.\n- `boolean addCar(int carType)` checks whether there is a parking space of `carType` for the car. Returns `true` if a space is available, `false` otherwise. `carType` is `1` (big), `2` (medium), or `3` (small).',
    visibleTestCases: [
      { input: 'ParkingSystem 1 1 0\naddCar 1\naddCar 2\naddCar 3\naddCar 1', output: 'null\ntrue\ntrue\nfalse\nfalse', explanation: '1 big, 1 medium, 0 small.' }
    ],
    hiddenTestCases: [
      { input: 'ParkingSystem 2 0 1\naddCar 1\naddCar 1\naddCar 1\naddCar 3\naddCar 3', output: 'null\ntrue\ntrue\nfalse\ntrue\nfalse' }
    ],
    startCode: [
      { language: 'C++', initialCode: 'class ParkingSystem {\npublic:\n    ParkingSystem(int big, int medium, int small) {\n        // Write your code here\n    }\n    \n    bool addCar(int carType) {\n        // Write your code here\n        return false;\n    }\n};' },
      { language: 'Java', initialCode: 'class ParkingSystem {\n    public ParkingSystem(int big, int medium, int small) {\n        // Write your code here\n    }\n    \n    public boolean addCar(int carType) {\n        // Write your code here\n        return false;\n    }\n}' },
      { language: 'Python', initialCode: 'class ParkingSystem:\n    def __init__(self, big: int, medium: int, small: int):\n        # Write your code here\n        pass\n\n    def addCar(self, carType: int) -> bool:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class ParkingSystem {\n    int slots[4];\npublic:\n    ParkingSystem(int big, int medium, int small) {\n        slots[1] = big; slots[2] = medium; slots[3] = small;\n    }\n    bool addCar(int carType) {\n        if (slots[carType] > 0) { slots[carType]--; return true; }\n        return false;\n    }\n};' },
      { language: 'Java', completeCode: 'class ParkingSystem {\n    private int[] slots = new int[4];\n    public ParkingSystem(int big, int medium, int small) {\n        slots[1] = big; slots[2] = medium; slots[3] = small;\n    }\n    public boolean addCar(int carType) {\n        if (slots[carType] > 0) { slots[carType]--; return true; }\n        return false;\n    }\n}' },
      { language: 'Python', completeCode: 'class ParkingSystem:\n    def __init__(self, big: int, medium: int, small: int):\n        self.slots = [0, big, medium, small]\n\n    def addCar(self, carType: int) -> bool:\n        if self.slots[carType] > 0:\n            self.slots[carType] -= 1\n            return True\n        return False' },
    ],
  },
  {
    title: 'Design Circular Queue',
    problemNumber: 622,
    difficulty: 'medium',
    tags: 'array',
    className: 'MyCircularQueue',
    constructor: { args: ['int'] },
    methods: [
      { name: 'enQueue', args: ['int'], returns: 'bool' },
      { name: 'deQueue', args: [], returns: 'bool' },
      { name: 'Front', args: [], returns: 'int' },
      { name: 'Rear', args: [], returns: 'int' },
      { name: 'isEmpty', args: [], returns: 'bool' },
      { name: 'isFull', args: [], returns: 'bool' },
    ],
    description: 'Design your implementation of the circular queue.\n\nImplement the `MyCircularQueue` class:\n- `MyCircularQueue(int k)` initializes the object with the size `k`.\n- `boolean enQueue(int value)` inserts an element at the rear. Returns `true` if successful.\n- `boolean deQueue()` deletes an element from the front. Returns `true` if successful.\n- `int Front()` gets the front item, or `-1` if empty.\n- `int Rear()` gets the rear item, or `-1` if empty.\n- `boolean isEmpty()` checks if the queue is empty.\n- `boolean isFull()` checks if the queue is full.',
    visibleTestCases: [
      { input: 'MyCircularQueue 3\nenQueue 1\nenQueue 2\nenQueue 3\nenQueue 4\nRear\nisFull\ndeQueue\nenQueue 4\nRear', output: 'null\ntrue\ntrue\ntrue\nfalse\n3\ntrue\ntrue\ntrue\n4', explanation: 'Queue fills up, then a dequeue makes room for one more.' }
    ],
    hiddenTestCases: [
      { input: 'MyCircularQueue 1\nisEmpty\nenQueue 5\nFront\nRear\ndeQueue\nFront', output: 'null\ntrue\ntrue\n5\n5\ntrue\n-1' }
    ],
    startCode: [
      { language: 'C++', initialCode: 'class MyCircularQueue {\npublic:\n    MyCircularQueue(int k) {\n        // Write your code here\n    }\n    \n    bool enQueue(int value) {\n        // Write your code here\n        return false;\n    }\n    \n    bool deQueue() {\n        // Write your code here\n        return false;\n    }\n    \n    int Front() {\n        // Write your code here\n        return -1;\n    }\n    \n    int Rear() {\n        // Write your code here\n        return -1;\n    }\n    \n    bool isEmpty() {\n        // Write your code here\n        return true;\n    }\n    \n    bool isFull() {\n        // Write your code here\n        return false;\n    }\n};' },
      { language: 'Java', initialCode: 'class MyCircularQueue {\n    public MyCircularQueue(int k) {\n        // Write your code here\n    }\n    \n    public boolean enQueue(int value) {\n        // Write your code here\n        return false;\n    }\n    \n    public boolean deQueue() {\n        // Write your code here\n        return false;\n    }\n    \n    public int Front() {\n        // Write your code here\n        return -1;\n    }\n    \n    public int Rear() {\n        // Write your code here\n        return -1;\n    }\n    \n    public boolean isEmpty() {\n        // Write your code here\n        return true;\n    }\n    \n    public boolean isFull() {\n        // Write your code here\n        return false;\n    }\n}' },
      { language: 'Python', initialCode: 'class MyCircularQueue:\n    def __init__(self, k: int):\n        # Write your code here\n        pass\n\n    def enQueue(self, value: int) -> bool:\n        # Write your code here\n        pass\n\n    def deQueue(self) -> bool:\n        # Write your code here\n        pass\n\n    def Front(self) -> int:\n        # Write your code here\n        pass\n\n    def Rear(self) -> int:\n        # Write your code here\n        pass\n\n    def isEmpty(self) -> bool:\n        # Write your code here\n        pass\n\n    def isFull(self) -> bool:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class MyCircularQueue {\n    vector<int> buf;\n    int cap, front, rear, cnt;\npublic:\n    MyCircularQueue(int k) : buf(k), cap(k), front(0), rear(-1), cnt(0) {}\n    bool enQueue(int value) {\n        if (cnt == cap) return false;\n        rear = (rear + 1) % cap;\n        buf[rear] = value;\n        cnt++;\n        return true;\n    }\n    bool deQueue() {\n        if (cnt == 0) return false;\n        front = (front + 1) % cap;\n        cnt--;\n        return true;\n    }\n    int Front() { return cnt == 0 ? -1 : buf[front]; }\n    int Rear() { return cnt == 0 ? -1 : buf[rear]; }\n    bool isEmpty() { return cnt == 0; }\n    bool isFull() { return cnt == cap; }\n};' },
      { language: 'Java', completeCode: 'class MyCircularQueue {\n    private int[] buf;\n    private int cap, front, rear, cnt;\n    public MyCircularQueue(int k) {\n        buf = new int[k]; cap = k; front = 0; rear = -1; cnt = 0;\n    }\n    public boolean enQueue(int value) {\n        if (cnt == cap) return false;\n        rear = (rear + 1) % cap; buf[rear] = value; cnt++; return true;\n    }\n    public boolean deQueue() {\n        if (cnt == 0) return false;\n        front = (front + 1) % cap; cnt--; return true;\n    }\n    public int Front() { return cnt == 0 ? -1 : buf[front]; }\n    public int Rear() { return cnt == 0 ? -1 : buf[rear]; }\n    public boolean isEmpty() { return cnt == 0; }\n    public boolean isFull() { return cnt == cap; }\n}' },
      { language: 'Python', completeCode: 'class MyCircularQueue:\n    def __init__(self, k: int):\n        self.buf = [0] * k\n        self.cap = k\n        self.front = 0\n        self.rear = -1\n        self.cnt = 0\n\n    def enQueue(self, value: int) -> bool:\n        if self.cnt == self.cap:\n            return False\n        self.rear = (self.rear + 1) % self.cap\n        self.buf[self.rear] = value\n        self.cnt += 1\n        return True\n\n    def deQueue(self) -> bool:\n        if self.cnt == 0:\n            return False\n        self.front = (self.front + 1) % self.cap\n        self.cnt -= 1\n        return True\n\n    def Front(self) -> int:\n        return -1 if self.cnt == 0 else self.buf[self.front]\n\n    def Rear(self) -> int:\n        return -1 if self.cnt == 0 else self.buf[self.rear]\n\n    def isEmpty(self) -> bool:\n        return self.cnt == 0\n\n    def isFull(self) -> bool:\n        return self.cnt == self.cap' },
    ],
  },
  {
    title: 'Design Browser History',
    problemNumber: 1472,
    difficulty: 'medium',
    tags: 'linkedList',
    className: 'BrowserHistory',
    constructor: { args: ['string'] },
    methods: [
      { name: 'visit', args: ['string'], returns: 'void' },
      { name: 'back', args: ['int'], returns: 'string' },
      { name: 'forward', args: ['int'], returns: 'string' },
    ],
    description: 'You have a browser of one tab where you start on the `homepage` and can visit another `url`, get back in the history number of `steps` or move forward.\n\nImplement the `BrowserHistory` class:\n- `BrowserHistory(string homepage)` initializes the object with `homepage`.\n- `void visit(string url)` visits `url` from the current page. All forward history is cleared.\n- `string back(int steps)` moves back up to `steps` in history and returns the current URL.\n- `string forward(int steps)` moves forward up to `steps` in history and returns the current URL.',
    visibleTestCases: [
      { input: 'BrowserHistory leetcode.com\nvisit google.com\nvisit facebook.com\nvisit youtube.com\nback 1\nback 1\nforward 1\nvisit linkedin.com\nforward 2\nback 2\nback 7', output: 'null\nnull\nnull\nnull\nfacebook.com\ngoogle.com\nfacebook.com\nnull\nlinkedin.com\ngoogle.com\nleetcode.com', explanation: 'Classic browser history traversal.' }
    ],
    hiddenTestCases: [
      { input: 'BrowserHistory a.com\nvisit b.com\nback 1\nforward 1\nback 5', output: 'null\nnull\na.com\nb.com\na.com' }
    ],
    startCode: [
      { language: 'C++', initialCode: 'class BrowserHistory {\npublic:\n    BrowserHistory(string homepage) {\n        // Write your code here\n    }\n    \n    void visit(string url) {\n        // Write your code here\n    }\n    \n    string back(int steps) {\n        // Write your code here\n        return "";\n    }\n    \n    string forward(int steps) {\n        // Write your code here\n        return "";\n    }\n};' },
      { language: 'Java', initialCode: 'class BrowserHistory {\n    public BrowserHistory(String homepage) {\n        // Write your code here\n    }\n    \n    public void visit(String url) {\n        // Write your code here\n    }\n    \n    public String back(int steps) {\n        // Write your code here\n        return "";\n    }\n    \n    public String forward(int steps) {\n        // Write your code here\n        return "";\n    }\n}' },
      { language: 'Python', initialCode: 'class BrowserHistory:\n    def __init__(self, homepage: str):\n        # Write your code here\n        pass\n\n    def visit(self, url: str) -> None:\n        # Write your code here\n        pass\n\n    def back(self, steps: int) -> str:\n        # Write your code here\n        pass\n\n    def forward(self, steps: int) -> str:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class BrowserHistory {\n    vector<string> hist;\n    int pos;\npublic:\n    BrowserHistory(string homepage) { hist.push_back(homepage); pos = 0; }\n    void visit(string url) {\n        hist.resize(pos + 1);\n        hist.push_back(url);\n        pos++;\n    }\n    string back(int steps) {\n        pos = max(0, pos - steps);\n        return hist[pos];\n    }\n    string forward(int steps) {\n        pos = min((int)hist.size() - 1, pos + steps);\n        return hist[pos];\n    }\n};' },
      { language: 'Java', completeCode: 'class BrowserHistory {\n    private List<String> hist = new ArrayList<>();\n    private int pos = 0;\n    public BrowserHistory(String homepage) { hist.add(homepage); }\n    public void visit(String url) {\n        while (hist.size() > pos + 1) hist.remove(hist.size() - 1);\n        hist.add(url);\n        pos++;\n    }\n    public String back(int steps) {\n        pos = Math.max(0, pos - steps);\n        return hist.get(pos);\n    }\n    public String forward(int steps) {\n        pos = Math.min(hist.size() - 1, pos + steps);\n        return hist.get(pos);\n    }\n}' },
      { language: 'Python', completeCode: 'class BrowserHistory:\n    def __init__(self, homepage: str):\n        self.hist = [homepage]\n        self.pos = 0\n\n    def visit(self, url: str) -> None:\n        self.hist = self.hist[:self.pos + 1]\n        self.hist.append(url)\n        self.pos += 1\n\n    def back(self, steps: int) -> str:\n        self.pos = max(0, self.pos - steps)\n        return self.hist[self.pos]\n\n    def forward(self, steps: int) -> str:\n        self.pos = min(len(self.hist) - 1, self.pos + steps)\n        return self.hist[self.pos]' },
    ],
  },
  {
    title: 'Time Based Key-Value Store',
    problemNumber: 981,
    difficulty: 'medium',
    tags: 'binarySearch',
    className: 'TimeMap',
    constructor: { args: [] },
    methods: [
      { name: 'set', args: ['string', 'string', 'int'], returns: 'void' },
      { name: 'get', args: ['string', 'int'], returns: 'string' },
    ],
    description: 'Design a time-based key-value data structure that can store multiple values for the same key at different time stamps and retrieve the key\'s value at a certain timestamp.\n\nImplement the `TimeMap` class:\n- `void set(String key, String value, int timestamp)` stores the key with the value at the given time.\n- `String get(String key, int timestamp)` returns a value such that `set` was called previously with `timestamp_prev <= timestamp`. If there are multiple such values, return the one with the largest `timestamp_prev`. If no values, return `""`.\n\n**Note:** For this platform, `get` returns an empty string if no match. For the test cases, all `get` calls will return non-empty strings.',
    visibleTestCases: [
      { input: 'TimeMap\nset foo bar 1\nget foo 1\nget foo 3\nset foo bar2 4\nget foo 4\nget foo 5', output: 'null\nnull\nbar\nbar\nnull\nbar2\nbar2', explanation: 'Return most recent value at or before timestamp.' }
    ],
    hiddenTestCases: [
      { input: 'TimeMap\nset a 1 10\nget a 10\nget a 100\nset a 2 20\nget a 15', output: 'null\nnull\n1\n1\nnull\n1' }
    ],
    startCode: [
      { language: 'C++', initialCode: 'class TimeMap {\npublic:\n    TimeMap() {\n        // Write your code here\n    }\n    \n    void set(string key, string value, int timestamp) {\n        // Write your code here\n    }\n    \n    string get(string key, int timestamp) {\n        // Write your code here\n        return "";\n    }\n};' },
      { language: 'Java', initialCode: 'class TimeMap {\n    public TimeMap() {\n        // Write your code here\n    }\n    \n    public void set(String key, String value, int timestamp) {\n        // Write your code here\n    }\n    \n    public String get(String key, int timestamp) {\n        // Write your code here\n        return "";\n    }\n}' },
      { language: 'Python', initialCode: 'class TimeMap:\n    def __init__(self):\n        # Write your code here\n        pass\n\n    def set(self, key: str, value: str, timestamp: int) -> None:\n        # Write your code here\n        pass\n\n    def get(self, key: str, timestamp: int) -> str:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class TimeMap {\n    unordered_map<string, vector<pair<int,string>>> m;\npublic:\n    TimeMap() {}\n    void set(string key, string value, int timestamp) {\n        m[key].push_back({timestamp, value});\n    }\n    string get(string key, int timestamp) {\n        if (!m.count(key)) return "";\n        auto& v = m[key];\n        auto it = upper_bound(v.begin(), v.end(), make_pair(timestamp, string(200, \'\\xff\')));\n        if (it == v.begin()) return "";\n        return prev(it)->second;\n    }\n};' },
      { language: 'Java', completeCode: 'class TimeMap {\n    private Map<String, TreeMap<Integer, String>> m = new HashMap<>();\n    public TimeMap() {}\n    public void set(String key, String value, int timestamp) {\n        m.computeIfAbsent(key, k -> new TreeMap<>()).put(timestamp, value);\n    }\n    public String get(String key, int timestamp) {\n        if (!m.containsKey(key)) return "";\n        Map.Entry<Integer, String> e = m.get(key).floorEntry(timestamp);\n        return e == null ? "" : e.getValue();\n    }\n}' },
      { language: 'Python', completeCode: 'class TimeMap:\n    def __init__(self):\n        self.m = defaultdict(list)\n\n    def set(self, key: str, value: str, timestamp: int) -> None:\n        self.m[key].append((timestamp, value))\n\n    def get(self, key: str, timestamp: int) -> str:\n        if key not in self.m:\n            return ""\n        arr = self.m[key]\n        lo, hi = 0, len(arr) - 1\n        res = ""\n        while lo <= hi:\n            mid = (lo + hi) // 2\n            if arr[mid][0] <= timestamp:\n                res = arr[mid][1]\n                lo = mid + 1\n            else:\n                hi = mid - 1\n        return res' },
    ],
  },
  {
    title: 'Find Median from Data Stream',
    problemNumber: 295,
    difficulty: 'hard',
    tags: 'heap',
    className: 'MedianFinder',
    constructor: { args: [] },
    methods: [
      { name: 'addNum', args: ['int'], returns: 'void' },
      { name: 'findMedian', args: [], returns: 'double' },
    ],
    description: 'The median is the middle value in an ordered integer list. If the size of the list is even, there is no middle value, and the median is the mean of the two middle values.\n\nImplement the `MedianFinder` class:\n- `void addNum(int num)` adds `num` to the data structure.\n- `double findMedian()` returns the median of all elements so far.\n\n**Output format:** Printed with 5 decimal places (e.g., `1.50000`).',
    visibleTestCases: [
      { input: 'MedianFinder\naddNum 1\naddNum 2\nfindMedian\naddNum 3\nfindMedian', output: 'null\nnull\nnull\n1.50000\nnull\n2.00000', explanation: 'Median after [1,2] is 1.5; after [1,2,3] is 2.' }
    ],
    hiddenTestCases: [
      { input: 'MedianFinder\naddNum 5\nfindMedian\naddNum 3\nfindMedian\naddNum 8\nfindMedian', output: 'null\nnull\n5.00000\nnull\n4.00000\nnull\n5.00000' }
    ],
    startCode: [
      { language: 'C++', initialCode: 'class MedianFinder {\npublic:\n    MedianFinder() {\n        // Write your code here\n    }\n    \n    void addNum(int num) {\n        // Write your code here\n    }\n    \n    double findMedian() {\n        // Write your code here\n        return 0.0;\n    }\n};' },
      { language: 'Java', initialCode: 'class MedianFinder {\n    public MedianFinder() {\n        // Write your code here\n    }\n    \n    public void addNum(int num) {\n        // Write your code here\n    }\n    \n    public double findMedian() {\n        // Write your code here\n        return 0.0;\n    }\n}' },
      { language: 'Python', initialCode: 'class MedianFinder:\n    def __init__(self):\n        # Write your code here\n        pass\n\n    def addNum(self, num: int) -> None:\n        # Write your code here\n        pass\n\n    def findMedian(self) -> float:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class MedianFinder {\n    priority_queue<int> lo;\n    priority_queue<int, vector<int>, greater<int>> hi;\npublic:\n    MedianFinder() {}\n    void addNum(int num) {\n        lo.push(num);\n        hi.push(lo.top()); lo.pop();\n        if (hi.size() > lo.size()) { lo.push(hi.top()); hi.pop(); }\n    }\n    double findMedian() {\n        if (lo.size() > hi.size()) return lo.top();\n        return (lo.top() + hi.top()) / 2.0;\n    }\n};' },
      { language: 'Java', completeCode: 'class MedianFinder {\n    private PriorityQueue<Integer> lo = new PriorityQueue<>(Collections.reverseOrder());\n    private PriorityQueue<Integer> hi = new PriorityQueue<>();\n    public MedianFinder() {}\n    public void addNum(int num) {\n        lo.offer(num);\n        hi.offer(lo.poll());\n        if (hi.size() > lo.size()) lo.offer(hi.poll());\n    }\n    public double findMedian() {\n        if (lo.size() > hi.size()) return lo.peek();\n        return (lo.peek() + hi.peek()) / 2.0;\n    }\n}' },
      { language: 'Python', completeCode: 'import heapq\n\nclass MedianFinder:\n    def __init__(self):\n        self.lo = []\n        self.hi = []\n\n    def addNum(self, num: int) -> None:\n        heapq.heappush(self.lo, -num)\n        heapq.heappush(self.hi, -heapq.heappop(self.lo))\n        if len(self.hi) > len(self.lo):\n            heapq.heappush(self.lo, -heapq.heappop(self.hi))\n\n    def findMedian(self) -> float:\n        if len(self.lo) > len(self.hi):\n            return float(-self.lo[0])\n        return (-self.lo[0] + self.hi[0]) / 2.0' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

async function main() {
  try {
    console.log(`🔐 Logging in as ${ADMIN_EMAIL}...`);
    const loginRes = await axios.post(`${BACKEND_URL}/user/login`, {
      emailId: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    const cookies = loginRes.headers['set-cookie'];
    if (!cookies) throw new Error('Login failed');
    const client = axios.create({ headers: { Cookie: cookies } });
    console.log('✅ Logged in\n');

    const problemsWithHarnesses = problemsData.map((p) => ({
      title: p.title,
      problemNumber: p.problemNumber,
      description: p.description,
      difficulty: p.difficulty,
      tags: p.tags,
      visibleTestCases: p.visibleTestCases,
      hiddenTestCases: p.hiddenTestCases,
      startCode: p.startCode,
      referenceSolution: p.referenceSolution,
      testHarness: [
        { language: 'C++', harnessCode: buildCppHarness(p) },
        { language: 'Java', harnessCode: buildJavaHarness(p) },
        { language: 'Python', harnessCode: buildPyHarness(p) },
      ],
    }));

    console.log('📋 Loading existing problems...');
    const { data: allProblems } = await client.get(`${BACKEND_URL}/problem/getAllProblem`);
    const existingByTitle = new Map();
    (allProblems || []).forEach((p) => existingByTitle.set(p.title, p));
    console.log(`   ${existingByTitle.size} problems in DB\n`);

    let updated = 0, created = 0, skipped = 0, failed = 0;
    const failures = [];

    for (const p of problemsWithHarnesses) {
      const existing = existingByTitle.get(p.title);

      if (existing) {
        try {
          const adminRes = await client.get(`${BACKEND_URL}/problem/admin/${existing._id}`);
          const existingFull = adminRes.data;
          if (
            Array.isArray(existingFull.testHarness) && existingFull.testHarness.length >= 3 &&
            Array.isArray(existingFull.visibleTestCases) && existingFull.visibleTestCases.length > 0
          ) {
            console.log(`⏭️  Skipping "${p.title}" (already runnable)`);
            skipped++;
            continue;
          }
          await client.put(`${BACKEND_URL}/problem/update/${existing._id}`, {
            ...existingFull,
            problemNumber: p.problemNumber,
            difficulty: p.difficulty,
            tags: p.tags,
            startCode: p.startCode,
            visibleTestCases: p.visibleTestCases,
            hiddenTestCases: p.hiddenTestCases,
            referenceSolution: p.referenceSolution,
            testHarness: p.testHarness,
          });
          console.log(`✅ Updated "${p.title}" (#${p.problemNumber})`);
          updated++;
        } catch (err) {
          const msg = err.response?.data?.error || err.message;
          console.error(`❌ Failed to update "${p.title}": ${msg}\n`);
          failures.push({ title: p.title, error: msg });
          failed++;
        }
      } else {
        try {
          await client.post(`${BACKEND_URL}/problem/create`, p);
          console.log(`✅ Created "${p.title}" (#${p.problemNumber})\n`);
          created++;
        } catch (err) {
          const msg = err.response?.data?.error || err.message;
          console.error(`❌ Failed to create "${p.title}": ${msg}\n`);
          failures.push({ title: p.title, error: msg });
          failed++;
        }
      }

      await new Promise((r) => setTimeout(r, 6000));
    }

    console.log('─'.repeat(60));
    console.log(`🎉 Class design batch complete`);
    console.log(`   ✅ Created:    ${created}`);
    console.log(`   🔄 Updated:    ${updated}`);
    console.log(`   ⏭️  Skipped:   ${skipped}`);
    console.log(`   ❌ Failed:     ${failed}`);
    if (failures.length > 0) {
      console.log('\n   Failures:');
      failures.forEach((f) => console.log(`      - ${f.title}: ${f.error}`));
    }
  } catch (err) {
    console.error('❌ Fatal:', err.message);
  }
}

main();