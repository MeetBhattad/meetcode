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
// C++ HARNESSES
// ─────────────────────────────────────────────────────────────
function cppHarness(type, method) {
  if (type === 'clone-graph') {
    return `#include <bits/stdc++.h>
using namespace std;

class Node {
public:
    int val;
    vector<Node*> neighbors;
    Node() { val = 0; neighbors = vector<Node*>(); }
    Node(int _val) { val = _val; neighbors = vector<Node*>(); }
    Node(int _val, vector<Node*> _neighbors) { val = _val; neighbors = _neighbors; }
};

{{USER_CODE}}

void printGraph(Node* node) {
    if (!node) return;
    map<int, vector<int>> adj;
    set<int> visited;
    queue<Node*> q;
        q.push(node);
    visited.insert(node->val);
    adj[node->val] = {};
    while(!q.empty()){
        Node* curr = q.front(); q.pop();
        for(auto n : curr->neighbors){
            adj[curr->val].push_back(n->val);
            if(!visited.count(n->val)){
                visited.insert(n->val);
                q.push(n);
                adj[n->val] = {};
            }
        }
    }
    for(auto& p : adj) sort(p.second.begin(), p.second.end());
    for(auto& p : adj) {
        cout << p.first << ":";
        for(int n : p.second) cout << " " << n;
        cout << endl;
    }
}

int main() {
    int n; if(!(cin >> n)) return 0;
    cin.ignore();
    vector<Node*> nodes(n + 1);
    for(int i=1; i<=n; i++) nodes[i] = new Node(i);
    for(int i=1; i<=n; i++) {
        string line; getline(cin, line);
        if(line.empty()) continue;
        stringstream ss(line);
        int v;
        while(ss >> v) nodes[i]->neighbors.push_back(nodes[v]);
    }
    Solution sol;
    Node* cloned = sol.${method}(nodes[1]);
    printGraph(cloned);
    return 0;
}`;
  }
  if (type === 'edges-bool') {
    return `#include <bits/stdc++.h>\nusing namespace std;\n{{USER_CODE}}\nint main() {\n    int n; if(!(cin >> n)) return 0;\n    cin.ignore();\n    string line; getline(cin, line);\n    vector<vector<int>> edges;\n    if (!line.empty()) {\n        stringstream ss(line);\n        int u, v;\n        while (ss >> u >> v) edges.push_back({u, v});\n    }\n    Solution sol;\n    cout << (sol.${method}(n, edges) ? "true" : "false") << endl;\n    return 0;\n}`;
  }
  if (type === 'edges-int') {
    return `#include <bits/stdc++.h>\nusing namespace std;\n{{USER_CODE}}\nint main() {\n    int n; if(!(cin >> n)) return 0;\n    cin.ignore();\n    string line; getline(cin, line);\n    vector<vector<int>> edges;\n    if (!line.empty()) {\n        stringstream ss(line);\n        int u, v;\n        while (ss >> u >> v) edges.push_back({u, v});\n    }\n    Solution sol;\n    cout << sol.${method}(n, edges) << endl;\n    return 0;\n}`;
  }
  if (type === 'strarr-str') {
    return `#include <bits/stdc++.h>\nusing namespace std;\n{{USER_CODE}}\nint main() {\n    int n; cin >> n; cin.ignore();\n    string line; getline(cin, line);\n    stringstream ss(line);\n    vector<string> words; string w;\n    while(ss >> w) words.push_back(w);\n    Solution sol;\n    cout << sol.${method}(words) << endl;\n    return 0;\n}`;
  }
  if (type === 'twostr-bool') {
    return `#include <bits/stdc++.h>\nusing namespace std;\n{{USER_CODE}}\nint main() {\n    string s1, s2;\n    getline(cin, s1);\n    getline(cin, s2);\n    Solution sol;\n    cout << (sol.${method}(s1, s2) ? "true" : "false") << endl;\n    return 0;\n}`;
  }
  if (type === 'threestr-bool') {
    return `#include <bits/stdc++.h>\nusing namespace std;\n{{USER_CODE}}\nint main() {\n    string s1, s2, s3;\n    getline(cin, s1);\n    getline(cin, s2);\n    getline(cin, s3);\n    Solution sol;\n    cout << (sol.${method}(s1, s2, s3) ? "true" : "false") << endl;\n    return 0;\n}`;
  }
  return '';
}

// ─────────────────────────────────────────────────────────────
// JAVA HARNESSES
// ─────────────────────────────────────────────────────────────
function javaHarness(type, method) {
  const nodeClass = `
class Node {
    public int val;
    public List<Node> neighbors;
    public Node() { val = 0; neighbors = new ArrayList<Node>(); }
    public Node(int _val) { val = _val; neighbors = new ArrayList<Node>(); }
    public Node(int _val, ArrayList<Node> _neighbors) { val = _val; neighbors = _neighbors; }
}`;
  const printer = `
class Printer {
    static void printGraph(Node node) {
        if (node == null) return;
        Map<Integer, List<Integer>> adj = new TreeMap<>();
        Set<Integer> visited = new HashSet<>();
        Queue<Node> q = new LinkedList<>();
        q.add(node); visited.add(node.val);
        while(!q.isEmpty()){
            Node curr = q.poll();
            adj.putIfAbsent(curr.val, new ArrayList<>());
            for(Node n : curr.neighbors){
                adj.get(curr.val).add(n.val);
                if(!visited.contains(n.val)){
                    visited.add(n.val); q.add(n);
                }
            }
        }
        for(Map.Entry<Integer, List<Integer>> e : adj.entrySet()){
            Collections.sort(e.getValue());
            System.out.print(e.getKey() + ":");
            for(int v : e.getValue()) System.out.print(" " + v);
            System.out.println();
        }
    }
}`;

  if (type === 'clone-graph') {
    return `import java.util.*;\n${nodeClass}\n${printer}\n{{USER_CODE}}\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(!sc.hasNextInt()) return;\n        int n = sc.nextInt(); sc.nextLine();\n        Node[] nodes = new Node[n + 1];\n        for(int i=1; i<=n; i++) nodes[i] = new Node(i);\n        for(int i=1; i<=n; i++){\n            String line = sc.nextLine().trim();\n            if(line.isEmpty()) continue;\n            String[] parts = line.split("\\\\s+");\n            for(String p : parts) nodes[i].neighbors.add(nodes[Integer.parseInt(p)]);\n        }\n        Solution sol = new Solution();\n        Node cloned = sol.${method}(nodes[1]);\n        Printer.printGraph(cloned);\n    }\n}`;
  }
  if (type === 'edges-bool') {
    return `import java.util.*;\n{{USER_CODE}}\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(!sc.hasNextInt()) return;\n        int n = Integer.parseInt(sc.nextLine().trim());\n        String line = sc.hasNextLine() ? sc.nextLine().trim() : "";\n        int[][] edges = new int[0][0];\n        if(!line.isEmpty()){\n            String[] parts = line.split("\\\\s+");\n            edges = new int[parts.length/2][2];\n            for(int i=0; i<parts.length; i+=2){\n                edges[i/2][0] = Integer.parseInt(parts[i]);\n                edges[i/2][1] = Integer.parseInt(parts[i+1]);\n            }\n        }\n        Solution sol = new Solution();\n        System.out.println(sol.${method}(n, edges) ? "true" : "false");\n    }\n}`;
  }
  if (type === 'edges-int') {
    return `import java.util.*;\n{{USER_CODE}}\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(!sc.hasNextInt()) return;\n        int n = Integer.parseInt(sc.nextLine().trim());\n        String line = sc.hasNextLine() ? sc.nextLine().trim() : "";\n        int[][] edges = new int[0][0];\n        if(!line.isEmpty()){\n            String[] parts = line.split("\\\\s+");\n            edges = new int[parts.length/2][2];\n            for(int i=0; i<parts.length; i+=2){\n                edges[i/2][0] = Integer.parseInt(parts[i]);\n                edges[i/2][1] = Integer.parseInt(parts[i+1]);\n            }\n        }\n        Solution sol = new Solution();\n        System.out.println(sol.${method}(n, edges));\n    }\n}`;
  }
  if (type === 'strarr-str') {
    return `import java.util.*;\n{{USER_CODE}}\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = Integer.parseInt(sc.nextLine().trim());\n        String[] words = sc.nextLine().trim().split("\\\\s+");\n        System.out.println(new Solution().${method}(words));\n    }\n}`;
  }
  if (type === 'twostr-bool') {
    return `import java.util.*;\n{{USER_CODE}}\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s1 = sc.nextLine();\n        String s2 = sc.nextLine();\n        System.out.println(new Solution().${method}(s1, s2) ? "true" : "false");\n    }\n}`;
  }
  if (type === 'threestr-bool') {
    return `import java.util.*;\n{{USER_CODE}}\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s1 = sc.nextLine();\n        String s2 = sc.nextLine();\n        String s3 = sc.nextLine();\n        System.out.println(new Solution().${method}(s1, s2, s3) ? "true" : "false");\n    }\n}`;
  }
  return '';
}

// ─────────────────────────────────────────────────────────────
// PYTHON HARNESSES
// ─────────────────────────────────────────────────────────────
function pyHarness(type, method) {
  const nodeClass = `
class Node:
    def __init__(self, val = 0, neighbors = None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []`;
  const printer = `
def print_graph(node):
    if not node: return
    adj = {}
    visited = {node.val}
    q = deque([node])
    while q:
        curr = q.popleft()
        adj[curr.val] = []
        for n in curr.neighbors:
            adj[curr.val].append(n.val)
            if n.val not in visited:
                visited.add(n.val)
                q.append(n)
    for k in sorted(adj.keys()):
        adj[k].sort()
        print(f"{k}:", ' '.join(map(str, adj[k])))`;

  const header = `import sys\nfrom typing import List\nfrom collections import deque\n`;

  if (type === 'clone-graph') {
    return `${header}${nodeClass}\n${printer}\n{{USER_CODE}}\ndef main():\n    lines = sys.stdin.read().strip().split('\\n')\n    if not lines or not lines[0]: return\n    n = int(lines[0].strip())\n    nodes = {i: Node(i) for i in range(1, n + 1)}\n    for i in range(1, n + 1):\n        if i < len(lines) and lines[i].strip():\n            neighbors = list(map(int, lines[i].strip().split()))\n            for v in neighbors:\n                nodes[i].neighbors.append(nodes[v])\n    sol = Solution()\n    cloned = sol.${method}(nodes[1])\n    print_graph(cloned)\n\nif __name__ == "__main__":\n    main()`;
  }
  if (type === 'edges-bool') {
    return `${header}{{USER_CODE}}\ndef main():\n    lines = sys.stdin.read().strip().split('\\n')\n    if not lines or not lines[0]: return\n    n = int(lines[0].strip())\n    edges = []\n    if len(lines) > 1 and lines[1].strip():\n        flat = list(map(int, lines[1].strip().split()))\n        edges = [[flat[i], flat[i+1]] for i in range(0, len(flat), 2)]\n    print("true" if Solution().${method}(n, edges) else "false")\n\nif __name__ == "__main__":\n    main()`;
  }
  if (type === 'edges-int') {
    return `${header}{{USER_CODE}}\ndef main():\n    lines = sys.stdin.read().strip().split('\\n')\n    if not lines or not lines[0]: return\n    n = int(lines[0].strip())\n    edges = []\n    if len(lines) > 1 and lines[1].strip():\n        flat = list(map(int, lines[1].strip().split()))\n        edges = [[flat[i], flat[i+1]] for i in range(0, len(flat), 2)]\n    print(Solution().${method}(n, edges))\n\nif __name__ == "__main__":\n    main()`;
  }
  if (type === 'strarr-str') {
    return `${header}{{USER_CODE}}\ndef main():\n    lines = sys.stdin.read().strip().split('\\n')\n    if len(lines) < 2: return\n    n = int(lines[0].strip())\n    words = lines[1].split()\n    print(Solution().${method}(words))\n\nif __name__ == "__main__":\n    main()`;
  }
  if (type === 'twostr-bool') {
    return `${header}{{USER_CODE}}\ndef main():\n    lines = sys.stdin.read().split('\\n')\n    if len(lines) < 2: return\n    s1, s2 = lines[0].rstrip('\\r'), lines[1].rstrip('\\r')\n    print("true" if Solution().${method}(s1, s2) else "false")\n\nif __name__ == "__main__":\n    main()`;
  }
  if (type === 'threestr-bool') {
    return `${header}{{USER_CODE}}\ndef main():\n    lines = sys.stdin.read().split('\\n')\n    if len(lines) < 3: return\n    s1, s2, s3 = lines[0].rstrip('\\r'), lines[1].rstrip('\\r'), lines[2].rstrip('\\r')\n    print("true" if Solution().${method}(s1, s2, s3) else "false")\n\nif __name__ == "__main__":\n    main()`;
  }
  return '';
}

// ─────────────────────────────────────────────────────────────
// PROBLEMS
// ─────────────────────────────────────────────────────────────
const problemsData = [
  {
    title: 'Clone Graph', problemNumber: 133, difficulty: 'medium', tags: 'graph',
    type: 'clone-graph', method: 'cloneGraph',
    description: 'Given a reference of a node in a **connected** undirected graph.\n\nReturn a **deep copy** (clone) of the graph.\n\nEach node in the graph contains a value (`int`) and a list (`List[Node]`) of its neighbors.\n\n**Input format:** Line 1 = number of nodes `n`. Following `n` lines = space-separated neighbor values for each node.\n\n**Output format:** The cloned graph printed as an adjacency list.',
    visibleTestCases: [
      { input: '4\n2 4\n1 3\n2 4\n1 3', output: '1: 2 4\n2: 1 3\n3: 2 4\n4: 1 3', explanation: 'Graph of 4 nodes cloned perfectly.' },
      { input: '1\n', output: '1:', explanation: 'Single node with no neighbors.' },
    ],
    hiddenTestCases: [
      { input: '2\n2\n1', output: '1: 2\n2: 1' },
      { input: '3\n2 3\n1 3\n1 2', output: '1: 2 3\n2: 1 3\n3: 1 2' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    Node* cloneGraph(Node* node) {\n        // Write your code here\n        return nullptr;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public Node cloneGraph(Node node) {\n        // Write your code here\n        return null;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def cloneGraph(self, node: \'Node\') -> \'Node\':\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    Node* cloneGraph(Node* node) {\n        if (!node) return nullptr;\n        unordered_map<Node*, Node*> mp;\n        queue<Node*> q;\n        q.push(node);\n        mp[node] = new Node(node->val);\n        while (!q.empty()) {\n            Node* curr = q.front(); q.pop();\n            for (Node* neighbor : curr->neighbors) {\n                if (!mp.count(neighbor)) {\n                    mp[neighbor] = new Node(neighbor->val);\n                    q.push(neighbor);\n                }\n                mp[curr]->neighbors.push_back(mp[neighbor]);\n            }\n        }\n        return mp[node];\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public Node cloneGraph(Node node) {\n        if (node == null) return null;\n        Map<Node, Node> map = new HashMap<>();\n        Queue<Node> q = new LinkedList<>();\n        q.add(node);\n        map.put(node, new Node(node.val));\n        while (!q.isEmpty()) {\n            Node curr = q.poll();\n            for (Node n : curr.neighbors) {\n                if (!map.containsKey(n)) {\n                    map.put(n, new Node(n.val));\n                    q.add(n);\n                }\n                map.get(curr).neighbors.add(map.get(n));\n            }\n        }\n        return map.get(node);\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def cloneGraph(self, node: \'Node\') -> \'Node\':\n        if not node:\n            return None\n        mp = {node: Node(node.val)}\n        q = deque([node])\n        while q:\n            curr = q.popleft()\n            for n in curr.neighbors:\n                if n not in mp:\n                    mp[n] = Node(n.val)\n                    q.append(n)\n                mp[curr].neighbors.append(mp[n])\n        return mp[node]' },
    ],
  },

  {
    title: 'Graph Valid Tree', problemNumber: 261, difficulty: 'medium', tags: 'graph',
    type: 'edges-bool', method: 'validTree',
    description: 'Given `n` nodes labeled from `0` to `n - 1` and a list of undirected edges, write a function to check whether these edges make up a valid tree.\n\n**Input format:** Line 1 = `n`, Line 2 = flat space-separated edge pairs.',
    visibleTestCases: [
      { input: '5\n0 1 0 2 0 3 1 4', output: 'true', explanation: 'Valid tree (n=5, n-1=4 edges, no cycles).' },
      { input: '5\n0 1 1 2 2 3 1 3 1 4', output: 'false', explanation: 'Contains a cycle (too many edges).' },
    ],
    hiddenTestCases: [
      { input: '1\n', output: 'true' },
      { input: '4\n0 1 2 3', output: 'false' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    bool validTree(int n, vector<vector<int>>& edges) {\n        // Write your code here\n        return false;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public boolean validTree(int n, int[][] edges) {\n        // Write your code here\n        return false;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def validTree(self, n: int, edges: List[List[int]]) -> bool:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    bool validTree(int n, vector<vector<int>>& edges) {\n        if (edges.size() != n - 1) return false;\n        vector<vector<int>> adj(n);\n        for (auto& e : edges) {\n            adj[e[0]].push_back(e[1]);\n            adj[e[1]].push_back(e[0]);\n        }\n        vector<bool> visited(n, false);\n        if (!dfs(0, -1, adj, visited)) return false;\n        for (bool v : visited) if (!v) return false;\n        return true;\n    }\nprivate:\n    bool dfs(int node, int parent, vector<vector<int>>& adj, vector<bool>& visited) {\n        visited[node] = true;\n        for (int nx : adj[node]) {\n            if (nx == parent) continue;\n            if (visited[nx]) return false;\n            if (!dfs(nx, node, adj, visited)) return false;\n        }\n        return true;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public boolean validTree(int n, int[][] edges) {\n        if (edges.length != n - 1) return false;\n        List<List<Integer>> adj = new ArrayList<>();\n        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());\n        for (int[] e : edges) {\n            adj.get(e[0]).add(e[1]);\n            adj.get(e[1]).add(e[0]);\n        }\n        boolean[] visited = new boolean[n];\n        if (!dfs(0, -1, adj, visited)) return false;\n        for (boolean v : visited) if (!v) return false;\n        return true;\n    }\n    private boolean dfs(int node, int parent, List<List<Integer>> adj, boolean[] visited) {\n        visited[node] = true;\n        for (int nx : adj.get(node)) {\n            if (nx == parent) continue;\n            if (visited[nx]) return false;\n            if (!dfs(nx, node, adj, visited)) return false;\n        }\n        return true;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def validTree(self, n: int, edges: List[List[int]]) -> bool:\n        if len(edges) != n - 1:\n            return False\n        adj = [[] for _ in range(n)]\n        for u, v in edges:\n            adj[u].append(v)\n            adj[v].append(u)\n        visited = set()\n        def dfs(node, parent):\n            if node in visited:\n                return False\n            visited.add(node)\n            for nx in adj[node]:\n                if nx != parent:\n                    if not dfs(nx, node):\n                        return False\n            return True\n        return dfs(0, -1) and len(visited) == n' },
    ],
  },

  {
    title: 'Number of Connected Components in an Undirected Graph', problemNumber: 323, difficulty: 'medium', tags: 'graph',
    type: 'edges-int', method: 'countComponents',
    description: 'You have a graph of `n` nodes. You are given an integer `n` and an array `edges` where `edges[i] = [ai, bi]` indicates that there is an undirected edge between `ai` and `bi`.\n\nReturn the number of connected components in the graph.\n\n**Input format:** Line 1 = `n`, Line 2 = flat space-separated edge pairs.',
    visibleTestCases: [
      { input: '5\n0 1 1 2 3 4', output: '2', explanation: 'Components: {0,1,2} and {3,4}.' },
      { input: '5\n0 1 1 2 2 3 3 4', output: '1', explanation: 'All nodes connected.' },
    ],
    hiddenTestCases: [
      { input: '4\n0 1 2 3', output: '2' },
      { input: '1\n', output: '1' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int countComponents(int n, vector<vector<int>>& edges) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int countComponents(int n, int[][] edges) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def countComponents(self, n: int, edges: List[List[int]]) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int countComponents(int n, vector<vector<int>>& edges) {\n        vector<vector<int>> adj(n);\n        for (auto& e : edges) {\n            adj[e[0]].push_back(e[1]);\n            adj[e[1]].push_back(e[0]);\n        }\n        vector<bool> visited(n, false);\n        int count = 0;\n        for (int i = 0; i < n; i++) {\n            if (!visited[i]) {\n                count++;\n                dfs(i, adj, visited);\n            }\n        }\n        return count;\n    }\nprivate:\n    void dfs(int node, vector<vector<int>>& adj, vector<bool>& visited) {\n        visited[node] = true;\n        for (int nx : adj[node]) {\n            if (!visited[nx]) dfs(nx, adj, visited);\n        }\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int countComponents(int n, int[][] edges) {\n        List<List<Integer>> adj = new ArrayList<>();\n        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());\n        for (int[] e : edges) {\n            adj.get(e[0]).add(e[1]);\n            adj.get(e[1]).add(e[0]);\n        }\n        boolean[] visited = new boolean[n];\n        int count = 0;\n        for (int i = 0; i < n; i++) {\n            if (!visited[i]) {\n                count++;\n                dfs(i, adj, visited);\n            }\n        }\n        return count;\n    }\n    private void dfs(int node, List<List<Integer>> adj, boolean[] visited) {\n        visited[node] = true;\n        for (int nx : adj.get(node)) {\n            if (!visited[nx]) dfs(nx, adj, visited);\n        }\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def countComponents(self, n: int, edges: List[List[int]]) -> int:\n        adj = [[] for _ in range(n)]\n        for u, v in edges:\n            adj[u].append(v)\n            adj[v].append(u)\n        visited = set()\n        def dfs(node):\n            visited.add(node)\n            for nx in adj[node]:\n                if nx not in visited:\n                    dfs(nx)\n        count = 0\n        for i in range(n):\n            if i not in visited:\n                dfs(i)\n                count += 1\n        return count' },
    ],
  },

  {
    title: 'Alien Dictionary', problemNumber: 269, difficulty: 'hard', tags: 'graph',
    type: 'strarr-str', method: 'alienOrder',
    description: 'There is a new alien language that uses the English alphabet. However, the order among the letters is unknown to you.\n\nYou are given a list of strings `words` from the alien language\'s dictionary, where the strings in `words` are sorted lexicographically by the rules of this new language.\n\nReturn a string of the unique letters in the new alien language sorted in lexicographically increasing order by the new language\'s rules. If there is no solution, return `""`. If there are multiple solutions, return **any of them**.\n\n**Input format:** Line 1 = `n` (number of words). Line 2 = space-separated words.',
    visibleTestCases: [
      { input: '5\nwrt wrf er ett rftt', output: 'wertf', explanation: 'Unique topological ordering.' },
      { input: '2\nz x', output: 'zx', explanation: 'z comes before x.' },
    ],
    hiddenTestCases: [
      { input: '2\nza zb', output: 'zab' },
      { input: '3\nabc ab ac', output: 'abc' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    string alienOrder(vector<string>& words) {\n        // Write your code here\n        return "";\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public String alienOrder(String[] words) {\n        // Write your code here\n        return "";\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def alienOrder(self, words: List[str]) -> str:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    string alienOrder(vector<string>& words) {\n        unordered_map<char, unordered_set<char>> adj;\n        unordered_map<char, int> indegree;\n        for (string w : words) {\n            for (char c : w) {\n                adj[c] = {};\n                indegree[c] = 0;\n            }\n        }\n        for (int i = 0; i < words.size() - 1; i++) {\n            string w1 = words[i], w2 = words[i + 1];\n            int len = min(w1.size(), w2.size());\n            for (int j = 0; j < len; j++) {\n                if (w1[j] != w2[j]) {\n                    if (!adj[w1[j]].count(w2[j])) {\n                        adj[w1[j]].insert(w2[j]);\n                        indegree[w2[j]]++;\n                    }\n                    break;\n                }\n            }\n        }\n        queue<char> q;\n        for (auto& p : indegree) if (p.second == 0) q.push(p.first);\n        string res = "";\n        while (!q.empty()) {\n            char c = q.front(); q.pop();\n            res += c;\n            for (char nx : adj[c]) {\n                if (--indegree[nx] == 0) q.push(nx);\n            }\n        }\n        return res.size() == indegree.size() ? res : "";\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public String alienOrder(String[] words) {\n        Map<Character, Set<Character>> adj = new HashMap<>();\n        Map<Character, Integer> indegree = new HashMap<>();\n        for (String w : words) {\n            for (char c : w.toCharArray()) {\n                adj.putIfAbsent(c, new HashSet<>());\n                indegree.putIfAbsent(c, 0);\n            }\n        }\n        for (int i = 0; i < words.length - 1; i++) {\n            String w1 = words[i], w2 = words[i + 1];\n            int len = Math.min(w1.length(), w2.length());\n            for (int j = 0; j < len; j++) {\n                char c1 = w1.charAt(j), c2 = w2.charAt(j);\n                if (c1 != c2) {\n                    if (!adj.get(c1).contains(c2)) {\n                        adj.get(c1).add(c2);\n                        indegree.put(c2, indegree.get(c2) + 1);\n                    }\n                    break;\n                }\n            }\n        }\n        Queue<Character> q = new LinkedList<>();\n        for (char c : indegree.keySet()) {\n            if (indegree.get(c) == 0) q.offer(c);\n        }\n        StringBuilder sb = new StringBuilder();\n        while (!q.isEmpty()) {\n            char c = q.poll();\n            sb.append(c);\n            for (char nx : adj.get(c)) {\n                indegree.put(nx, indegree.get(nx) - 1);\n                if (indegree.get(nx) == 0) q.offer(nx);\n            }\n        }\n        return sb.length() == indegree.size() ? sb.toString() : "";\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def alienOrder(self, words: List[str]) -> str:\n        adj = {}\n        indegree = {}\n        for w in words:\n            for c in w:\n                adj[c] = set()\n                indegree[c] = 0\n        for i in range(len(words) - 1):\n            w1, w2 = words[i], words[i + 1]\n            for j in range(min(len(w1), len(w2))):\n                c1, c2 = w1[j], w2[j]\n                if c1 != c2:\n                    if c2 not in adj[c1]:\n                        adj[c1].add(c2)\n                        indegree[c2] += 1\n                    break\n        q = deque([c for c in indegree if indegree[c] == 0])\n        res = []\n        while q:\n            c = q.popleft()\n            res.append(c)\n            for nx in adj[c]:\n                indegree[nx] -= 1\n                if indegree[nx] == 0:\n                    q.append(nx)\n        return "".join(res) if len(res) == len(indegree) else ""' },
    ],
  },

  {
    title: 'Interleaving String', problemNumber: 97, difficulty: 'medium', tags: 'dp',
    type: 'threestr-bool', method: 'isInterleave',
    description: 'Given strings `s1`, `s2`, and `s3`, find whether `s3` is formed by an interleaving of `s1` and `s2`.\n\nAn interleaving of two strings `s` and `t` is a configuration where they are divided into `n` and `m` substrings respectively, such that:\n- `s = s1 + s2 + ... + sn`\n- `t = t1 + t2 + ... + tm`\n- `|n - m| <= 1`\n- The interleaving is `s1 + t1 + s2 + t2 + s3 + t3 + ...` or `t1 + s1 + t2 + s2 + t3 + s3 + ...`\n\n**Input format:** Line 1 = `s1`, Line 2 = `s2`, Line 3 = `s3`.',
    visibleTestCases: [
      { input: 'aabcc\ndbbca\naadbbcbcac', output: 'true', explanation: 'Valid interleaving.' },
      { input: 'aabcc\ndbbca\naadbbbaccc', output: 'false', explanation: 'Invalid interleaving.' },
    ],
    hiddenTestCases: [
      { input: 'a\na\naa', output: 'true' },
      { input: 'a\nb\nab', output: 'true' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    bool isInterleave(string s1, string s2, string s3) {\n        // Write your code here\n        return false;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public boolean isInterleave(String s1, String s2, String s3) {\n        // Write your code here\n        return false;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def isInterleave(self, s1: str, s2: str, s3: str) -> bool:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    bool isInterleave(string s1, string s2, string s3) {\n        int m = s1.size(), n = s2.size();\n        if (m + n != s3.size()) return false;\n        vector<vector<bool>> dp(m + 1, vector<bool>(n + 1, false));\n        dp[0][0] = true;\n        for (int i = 1; i <= m; i++) dp[i][0] = dp[i-1][0] && s1[i-1] == s3[i-1];\n        for (int j = 1; j <= n; j++) dp[0][j] = dp[0][j-1] && s2[j-1] == s3[j-1];\n        for (int i = 1; i <= m; i++) {\n            for (int j = 1; j <= n; j++) {\n                dp[i][j] = (dp[i-1][j] && s1[i-1] == s3[i+j-1]) ||\n                           (dp[i][j-1] && s2[j-1] == s3[i+j-1]);\n            }\n        }\n        return dp[m][n];\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public boolean isInterleave(String s1, String s2, String s3) {\n        int m = s1.length(), n = s2.length();\n        if (m + n != s3.length()) return false;\n        boolean[][] dp = new boolean[m + 1][n + 1];\n        dp[0][0] = true;\n        for (int i = 1; i <= m; i++) dp[i][0] = dp[i-1][0] && s1.charAt(i-1) == s3.charAt(i-1);\n        for (int j = 1; j <= n; j++) dp[0][j] = dp[0][j-1] && s2.charAt(j-1) == s3.charAt(j-1);\n        for (int i = 1; i <= m; i++) {\n            for (int j = 1; j <= n; j++) {\n                dp[i][j] = (dp[i-1][j] && s1.charAt(i-1) == s3.charAt(i+j-1)) ||\n                           (dp[i][j-1] && s2.charAt(j-1) == s3.charAt(i+j-1));\n            }\n        }\n        return dp[m][n];\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def isInterleave(self, s1: str, s2: str, s3: str) -> bool:\n        m, n = len(s1), len(s2)\n        if m + n != len(s3):\n            return False\n        dp = [[False] * (n + 1) for _ in range(m + 1)]\n        dp[0][0] = True\n        for i in range(1, m + 1):\n            dp[i][0] = dp[i-1][0] and s1[i-1] == s3[i-1]\n        for j in range(1, n + 1):\n            dp[0][j] = dp[0][j-1] and s2[j-1] == s3[j-1]\n        for i in range(1, m + 1):\n            for j in range(1, n + 1):\n                dp[i][j] = (dp[i-1][j] and s1[i-1] == s3[i+j-1]) or \\\n                           (dp[i][j-1] and s2[j-1] == s3[i+j-1])\n        return dp[m][n]' },
    ],
  },

  {
    title: 'Regular Expression Matching', problemNumber: 10, difficulty: 'hard', tags: 'dp',
    type: 'twostr-bool', method: 'isMatch',
    description: 'Given an input string `s` and a pattern `p`, implement regular expression matching with support for `\'.\'` and `\'*\'` where:\n- `\'.\'` Matches any single character.\n- `\'*\'` Matches zero or more of the preceding element.\n\nThe matching should cover the **entire** input string (not partial).\n\n**Input format:** Line 1 = `s`, Line 2 = `p`.',
    visibleTestCases: [
      { input: 'aa\na*', output: 'true', explanation: 'a* matches the entire string.' },
      { input: 'aa\na', output: 'false', explanation: 'a does not match the entire string.' },
    ],
    hiddenTestCases: [
      { input: 'ab\n.*', output: 'true' },
      { input: 'aab\nc*a*b', output: 'true' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    bool isMatch(string s, string p) {\n        // Write your code here\n        return false;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public boolean isMatch(String s, String p) {\n        // Write your code here\n        return false;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def isMatch(self, s: str, p: str) -> bool:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    bool isMatch(string s, string p) {\n        int m = s.size(), n = p.size();\n        vector<vector<bool>> dp(m + 1, vector<bool>(n + 1, false));\n        dp[0][0] = true;\n        for (int j = 1; j <= n; j++) {\n            if (p[j-1] == \'*\') dp[0][j] = dp[0][j-2];\n        }\n        for (int i = 1; i <= m; i++) {\n            for (int j = 1; j <= n; j++) {\n                if (p[j-1] == s[i-1] || p[j-1] == \'.\') {\n                    dp[i][j] = dp[i-1][j-1];\n                } else if (p[j-1] == \'*\') {\n                    dp[i][j] = dp[i][j-2];\n                    if (p[j-2] == s[i-1] || p[j-2] == \'.\') {\n                        dp[i][j] = dp[i][j] || dp[i-1][j];\n                    }\n                }\n            }\n        }\n        return dp[m][n];\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public boolean isMatch(String s, String p) {\n        int m = s.length(), n = p.length();\n        boolean[][] dp = new boolean[m + 1][n + 1];\n        dp[0][0] = true;\n        for (int j = 1; j <= n; j++) {\n            if (p.charAt(j-1) == \'*\') dp[0][j] = dp[0][j-2];\n        }\n        for (int i = 1; i <= m; i++) {\n            for (int j = 1; j <= n; j++) {\n                if (p.charAt(j-1) == s.charAt(i-1) || p.charAt(j-1) == \'.\') {\n                    dp[i][j] = dp[i-1][j-1];\n                } else if (p.charAt(j-1) == \'*\') {\n                    dp[i][j] = dp[i][j-2];\n                    if (p.charAt(j-2) == s.charAt(i-1) || p.charAt(j-2) == \'.\') {\n                        dp[i][j] = dp[i][j] || dp[i-1][j];\n                    }\n                }\n            }\n        }\n        return dp[m][n];\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def isMatch(self, s: str, p: str) -> bool:\n        m, n = len(s), len(p)\n        dp = [[False] * (n + 1) for _ in range(m + 1)]\n        dp[0][0] = True\n        for j in range(1, n + 1):\n            if p[j-1] == \'*\':\n                dp[0][j] = dp[0][j-2]\n        for i in range(1, m + 1):\n            for j in range(1, n + 1):\n                if p[j-1] == s[i-1] or p[j-1] == \'.\':\n                    dp[i][j] = dp[i-1][j-1]\n                elif p[j-1] == \'*\':\n                    dp[i][j] = dp[i][j-2]\n                    if p[j-2] == s[i-1] or p[j-2] == \'.\':\n                        dp[i][j] = dp[i][j] or dp[i-1][j]\n        return dp[m][n]' },
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
      emailId: ADMIN_EMAIL, password: ADMIN_PASSWORD,
    });
    const cookies = loginRes.headers['set-cookie'];
    if (!cookies) throw new Error('Login failed');
    const client = axios.create({ headers: { Cookie: cookies } });
    console.log('✅ Logged in\n');

    const problemsWithHarnesses = problemsData.map((p) => ({
      title: p.title, problemNumber: p.problemNumber, description: p.description,
      difficulty: p.difficulty, tags: p.tags,
      visibleTestCases: p.visibleTestCases, hiddenTestCases: p.hiddenTestCases,
      startCode: p.startCode, referenceSolution: p.referenceSolution,
      testHarness: [
        { language: 'C++', harnessCode: cppHarness(p.type, p.method) },
        { language: 'Java', harnessCode: javaHarness(p.type, p.method) },
        { language: 'Python', harnessCode: pyHarness(p.type, p.method) },
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
            ...existingFull, problemNumber: p.problemNumber, difficulty: p.difficulty,
            tags: p.tags, startCode: p.startCode, visibleTestCases: p.visibleTestCases,
            hiddenTestCases: p.hiddenTestCases, referenceSolution: p.referenceSolution,
            testHarness: p.testHarness,
          });
          console.log(`✅ Updated "${p.title}" (#${p.problemNumber})`);
          updated++;
        } catch (err) {
          const msg = err.response?.data?.error || err.message;
          console.error(`❌ Failed to update "${p.title}": ${msg}\n`);
          failures.push({ title: p.title, error: msg }); failed++;
        }
      } else {
        try {
          await client.post(`${BACKEND_URL}/problem/create`, p);
          console.log(`✅ Created "${p.title}" (#${p.problemNumber})\n`);
          created++;
        } catch (err) {
          const msg = err.response?.data?.error || err.message;
          console.error(`❌ Failed to create "${p.title}": ${msg}\n`);
          failures.push({ title: p.title, error: msg }); failed++;
        }
      }
      await new Promise((r) => setTimeout(r, 6000));
    }

    console.log('─'.repeat(60));
    console.log(`🎉 Graph & DP batch complete`);
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