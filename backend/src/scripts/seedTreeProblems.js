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
// HELPERS
// ─────────────────────────────────────────────────────────────

const CPP_HELPER = `#include <bits/stdc++.h>
using namespace std;

struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

TreeNode* buildTree(const string& line) {
    vector<string> tokens;
    stringstream ss(line);
    string t;
    while (ss >> t) tokens.push_back(t);
    if (tokens.empty() || tokens[0] == "null") return nullptr;
    TreeNode* root = new TreeNode(stoi(tokens[0]));
    queue<TreeNode*> q; q.push(root);
    int i = 1;
    while (!q.empty() && i < (int)tokens.size()) {
        TreeNode* node = q.front(); q.pop();
        if (i < (int)tokens.size() && tokens[i] != "null") {
            node->left = new TreeNode(stoi(tokens[i]));
            q.push(node->left);
        }
        i++;
        if (i < (int)tokens.size() && tokens[i] != "null") {
            node->right = new TreeNode(stoi(tokens[i]));
            q.push(node->right);
        }
        i++;
    }
    return root;
}

void printTree(TreeNode* root) {
    if (!root) { cout << endl; return; }
    vector<string> result;
    queue<TreeNode*> q; q.push(root);
    while (!q.empty()) {
        TreeNode* node = q.front(); q.pop();
        if (node) {
            result.push_back(to_string(node->val));
            q.push(node->left);
            q.push(node->right);
        } else {
            result.push_back("null");
        }
    }
    while (!result.empty() && result.back() == "null") result.pop_back();
    for (size_t i = 0; i < result.size(); i++) {
        if (i > 0) cout << " ";
        cout << result[i];
    }
    cout << endl;
}

vector<int> parseArray(const string& line) {
    vector<int> v;
    stringstream ss(line);
    int x;
    while (ss >> x) v.push_back(x);
    return v;
}
`;

const JAVA_HELPER = `import java.util.*;

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val; this.left = left; this.right = right;
    }
}

class TreeUtil {
    static TreeNode buildTree(String line) {
        if (line == null || line.trim().isEmpty()) return null;
        String[] tokens = line.trim().split("\\\\s+");
        if (tokens.length == 0 || tokens[0].equals("null")) return null;
        TreeNode root = new TreeNode(Integer.parseInt(tokens[0]));
        Queue<TreeNode> q = new LinkedList<>(); q.offer(root);
        int i = 1;
        while (!q.isEmpty() && i < tokens.length) {
            TreeNode node = q.poll();
            if (i < tokens.length && !tokens[i].equals("null")) {
                node.left = new TreeNode(Integer.parseInt(tokens[i]));
                q.offer(node.left);
            }
            i++;
            if (i < tokens.length && !tokens[i].equals("null")) {
                node.right = new TreeNode(Integer.parseInt(tokens[i]));
                q.offer(node.right);
            }
            i++;
        }
        return root;
    }

    static void printTree(TreeNode root) {
        if (root == null) { System.out.println(); return; }
        List<String> result = new ArrayList<>();
        Queue<TreeNode> q = new LinkedList<>(); q.offer(root);
        while (!q.isEmpty()) {
            TreeNode node = q.poll();
            if (node != null) {
                result.add(String.valueOf(node.val));
                q.offer(node.left);
                q.offer(node.right);
            } else {
                result.add("null");
            }
        }
        while (!result.isEmpty() && result.get(result.size() - 1).equals("null")) {
            result.remove(result.size() - 1);
        }
        System.out.println(String.join(" ", result));
    }
}
`;

const PY_HELPER = `import sys
from typing import List
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(line):
    if not line or not line.strip():
        return None
    tokens = line.strip().split()
    if not tokens or tokens[0] == 'null':
        return None
    root = TreeNode(int(tokens[0]))
    q = deque([root])
    i = 1
    while q and i < len(tokens):
        node = q.popleft()
        if i < len(tokens) and tokens[i] != 'null':
            node.left = TreeNode(int(tokens[i]))
            q.append(node.left)
        i += 1
        if i < len(tokens) and tokens[i] != 'null':
            node.right = TreeNode(int(tokens[i]))
            q.append(node.right)
        i += 1
    return root

def print_tree(root):
    if not root:
        print()
        return
    result = []
    q = deque([root])
    while q:
        node = q.popleft()
        if node:
            result.append(str(node.val))
            q.append(node.left)
            q.append(node.right)
        else:
            result.append('null')
    while result and result[-1] == 'null':
        result.pop()
    print(' '.join(result))
`;

// ─────────────────────────────────────────────────────────────
// HARNESS BUILDERS
// ─────────────────────────────────────────────────────────────

function buildCppHarness(type, method) {
  if (type === 'tree-list') {
    return `${CPP_HELPER}\n{{USER_CODE}}\n\nint main() {\n    string line1; getline(cin, line1);\n    TreeNode* root = buildTree(line1);\n    Solution sol;\n    vector<int> r = sol.${method}(root);\n    for (size_t i = 0; i < r.size(); i++) { if (i) cout << " "; cout << r[i]; }\n    cout << endl;\n    return 0;\n}`;
  }
  if (type === 'tree-int') {
    return `${CPP_HELPER}\n{{USER_CODE}}\n\nint main() {\n    string line1; getline(cin, line1);\n    TreeNode* root = buildTree(line1);\n    Solution sol;\n    cout << sol.${method}(root) << endl;\n    return 0;\n}`;
  }
  if (type === 'tree-int-int') {
    return `${CPP_HELPER}\n{{USER_CODE}}\n\nint main() {\n    string line1; getline(cin, line1);\n    TreeNode* root = buildTree(line1);\n    string line2; getline(cin, line2);\n    int k = stoi(line2);\n    Solution sol;\n    cout << sol.${method}(root, k) << endl;\n    return 0;\n}`;
  }
  if (type === 'tree-tree') {
    return `${CPP_HELPER}\n{{USER_CODE}}\n\nint main() {\n    string line1; getline(cin, line1);\n    TreeNode* root = buildTree(line1);\n    Solution sol;\n    printTree(sol.${method}(root));\n    return 0;\n}`;
  }
  if (type === 'tree-int-tree') {
    return `${CPP_HELPER}\n{{USER_CODE}}\n\nint main() {\n    string line1; getline(cin, line1);\n    TreeNode* root = buildTree(line1);\n    string line2; getline(cin, line2);\n    int k = stoi(line2);\n    Solution sol;\n    printTree(sol.${method}(root, k));\n    return 0;\n}`;
  }
  if (type === 'void-inplace-tree') {
    return `${CPP_HELPER}\n{{USER_CODE}}\n\nint main() {\n    string line1; getline(cin, line1);\n    TreeNode* root = buildTree(line1);\n    Solution sol;\n    sol.${method}(root);\n    printTree(root);\n    return 0;\n}`;
  }
  if (type === 'tree-list-of-lists') {
    return `${CPP_HELPER}\n{{USER_CODE}}\n\nint main() {\n    string line1; getline(cin, line1);\n    TreeNode* root = buildTree(line1);\n    Solution sol;\n    vector<vector<int>> r = sol.${method}(root);\n    for (auto& row : r) { for (size_t i = 0; i < row.size(); i++) { if (i) cout << " "; cout << row[i]; } cout << endl; }\n    return 0;\n}`;
  }
  if (type === 'n-edges-int-arr') {
    return `${CPP_HELPER}\n{{USER_CODE}}\n\nint main() {\n    int n; cin >> n; cin.ignore();\n    string line; getline(cin, line);\n    stringstream ss(line);\n    vector<int> flat; int x;\n    while (ss >> x) flat.push_back(x);\n    vector<vector<int>> edges;\n    for (size_t i = 0; i + 1 < flat.size(); i += 2) edges.push_back({flat[i], flat[i+1]});\n    Solution sol;\n    vector<int> r = sol.${method}(n, edges);\n    for (size_t i = 0; i < r.size(); i++) { if (i) cout << " "; cout << r[i]; }\n    cout << endl;\n    return 0;\n}`;
  }
  return '';
}

function buildJavaHarness(type, method) {
  if (type === 'tree-list') {
    return `${JAVA_HELPER}\n{{USER_CODE}}\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        TreeNode root = TreeUtil.buildTree(sc.nextLine());\n        List<Integer> r = new Solution().${method}(root);\n        StringBuilder sb = new StringBuilder();\n        for (int i = 0; i < r.size(); i++) { if (i > 0) sb.append(" "); sb.append(r.get(i)); }\n        System.out.println(sb.toString());\n    }\n}`;
  }
  if (type === 'tree-int') {
    return `${JAVA_HELPER}\n{{USER_CODE}}\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        TreeNode root = TreeUtil.buildTree(sc.nextLine());\n        System.out.println(new Solution().${method}(root));\n    }\n}`;
  }
  if (type === 'tree-int-int') {
    return `${JAVA_HELPER}\n{{USER_CODE}}\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        TreeNode root = TreeUtil.buildTree(sc.nextLine());\n        int k = Integer.parseInt(sc.nextLine().trim());\n        System.out.println(new Solution().${method}(root, k));\n    }\n}`;
  }
  if (type === 'tree-tree') {
    return `${JAVA_HELPER}\n{{USER_CODE}}\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        TreeNode root = TreeUtil.buildTree(sc.nextLine());\n        TreeUtil.printTree(new Solution().${method}(root));\n    }\n}`;
  }
  if (type === 'tree-int-tree') {
    return `${JAVA_HELPER}\n{{USER_CODE}}\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        TreeNode root = TreeUtil.buildTree(sc.nextLine());\n        int k = Integer.parseInt(sc.nextLine().trim());\n        TreeUtil.printTree(new Solution().${method}(root, k));\n    }\n}`;
  }
  if (type === 'void-inplace-tree') {
    return `${JAVA_HELPER}\n{{USER_CODE}}\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        TreeNode root = TreeUtil.buildTree(sc.nextLine());\n        new Solution().${method}(root);\n        TreeUtil.printTree(root);\n    }\n}`;
  }
  if (type === 'tree-list-of-lists') {
    return `${JAVA_HELPER}\n{{USER_CODE}}\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        TreeNode root = TreeUtil.buildTree(sc.nextLine());\n        List<List<Integer>> r = new Solution().${method}(root);\n        for (List<Integer> row : r) {\n            StringBuilder sb = new StringBuilder();\n            for (int i = 0; i < row.size(); i++) { if (i > 0) sb.append(" "); sb.append(row.get(i)); }\n            System.out.println(sb.toString());\n        }\n    }\n}`;
  }
  if (type === 'n-edges-int-arr') {
    return `${JAVA_HELPER}\n{{USER_CODE}}\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = Integer.parseInt(sc.nextLine().trim());\n        String line2 = sc.hasNextLine() ? sc.nextLine().trim() : "";\n        String[] tokens = line2.isEmpty() ? new String[0] : line2.split("\\\\s+");\n        int[][] edges = new int[tokens.length / 2][2];\n        for (int i = 0; i < tokens.length; i += 2) {\n            edges[i/2][0] = Integer.parseInt(tokens[i]);\n            edges[i/2][1] = Integer.parseInt(tokens[i+1]);\n        }\n        int[] r = new Solution().${method}(n, edges);\n        StringBuilder sb = new StringBuilder();\n        for (int i = 0; i < r.length; i++) { if (i > 0) sb.append(" "); sb.append(r[i]); }\n        System.out.println(sb.toString());\n    }\n}`;
  }
  return '';
}

function buildPyHarness(type, method) {
  if (type === 'tree-list') {
    return `${PY_HELPER}\n{{USER_CODE}}\n\ndef main():\n    line = sys.stdin.readline().rstrip('\\n')\n    root = build_tree(line)\n    r = Solution().${method}(root)\n    print(' '.join(map(str, r)))\n\nif __name__ == "__main__":\n    main()`;
  }
  if (type === 'tree-int') {
    return `${PY_HELPER}\n{{USER_CODE}}\n\ndef main():\n    line = sys.stdin.readline().rstrip('\\n')\n    root = build_tree(line)\n    print(Solution().${method}(root))\n\nif __name__ == "__main__":\n    main()`;
  }
  if (type === 'tree-int-int') {
    return `${PY_HELPER}\n{{USER_CODE}}\n\ndef main():\n    line = sys.stdin.readline().rstrip('\\n')\n    root = build_tree(line)\n    k = int(sys.stdin.readline().strip())\n    print(Solution().${method}(root, k))\n\nif __name__ == "__main__":\n    main()`;
  }
  if (type === 'tree-tree') {
    return `${PY_HELPER}\n{{USER_CODE}}\n\ndef main():\n    line = sys.stdin.readline().rstrip('\\n')\n    root = build_tree(line)\n    print_tree(Solution().${method}(root))\n\nif __name__ == "__main__":\n    main()`;
  }
  if (type === 'tree-int-tree') {
    return `${PY_HELPER}\n{{USER_CODE}}\n\ndef main():\n    line = sys.stdin.readline().rstrip('\\n')\n    root = build_tree(line)\n    k = int(sys.stdin.readline().strip())\n    print_tree(Solution().${method}(root, k))\n\nif __name__ == "__main__":\n    main()`;
  }
  if (type === 'void-inplace-tree') {
    return `${PY_HELPER}\n{{USER_CODE}}\n\ndef main():\n    line = sys.stdin.readline().rstrip('\\n')\n    root = build_tree(line)\n    Solution().${method}(root)\n    print_tree(root)\n\nif __name__ == "__main__":\n    main()`;
  }
  if (type === 'tree-list-of-lists') {
    return `${PY_HELPER}\n{{USER_CODE}}\n\ndef main():\n    line = sys.stdin.readline().rstrip('\\n')\n    root = build_tree(line)\n    r = Solution().${method}(root)\n    for row in r:\n        print(' '.join(map(str, row)))\n\nif __name__ == "__main__":\n    main()`;
  }
  if (type === 'n-edges-int-arr') {
    return `${PY_HELPER}\n{{USER_CODE}}\n\ndef main():\n    lines = sys.stdin.read().strip().split('\\n')\n    n = int(lines[0].strip())\n    flat = list(map(int, lines[1].split())) if len(lines) > 1 and lines[1].strip() else []\n    edges = [[flat[i], flat[i+1]] for i in range(0, len(flat), 2)]\n    r = Solution().${method}(n, edges)\n    print(' '.join(map(str, r)))\n\nif __name__ == "__main__":\n    main()`;
  }
  return '';
}

// ─────────────────────────────────────────────────────────────
// PROBLEMS — 15 (3 Easy, 8 Medium, 4 Hard)
// ─────────────────────────────────────────────────────────────

const problemsData = [
  // ═══════════ EASY (3) ═══════════
  {
    title: 'Binary Tree Inorder Traversal',
    problemNumber: 94,
    difficulty: 'easy',
    tags: 'tree',
    harnessType: 'tree-list',
    methodName: 'inorderTraversal',
    description: 'Given the `root` of a binary tree, return the inorder traversal of its nodes\' values.\n\nInorder: left → root → right.',
    visibleTestCases: [
      { input: '1 null 2 3', output: '1 3 2', explanation: 'Inorder of [1,null,2,3] = [1,3,2].' },
      { input: '1', output: '1', explanation: 'Single node.' },
    ],
    hiddenTestCases: [
      { input: '1 2', output: '2 1' },
      { input: '1 2 3', output: '2 1 3' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    vector<int> inorderTraversal(TreeNode* root) {\n        // Write your code here\n        return {};\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public List<Integer> inorderTraversal(TreeNode root) {\n        // Write your code here\n        return new ArrayList<>();\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def inorderTraversal(self, root: TreeNode) -> List[int]:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    vector<int> inorderTraversal(TreeNode* root) {\n        vector<int> res;\n        stack<TreeNode*> st;\n        TreeNode* cur = root;\n        while (cur || !st.empty()) {\n            while (cur) { st.push(cur); cur = cur->left; }\n            cur = st.top(); st.pop();\n            res.push_back(cur->val);\n            cur = cur->right;\n        }\n        return res;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public List<Integer> inorderTraversal(TreeNode root) {\n        List<Integer> res = new ArrayList<>();\n        Deque<TreeNode> st = new ArrayDeque<>();\n        TreeNode cur = root;\n        while (cur != null || !st.isEmpty()) {\n            while (cur != null) { st.push(cur); cur = cur.left; }\n            cur = st.pop();\n            res.add(cur.val);\n            cur = cur.right;\n        }\n        return res;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def inorderTraversal(self, root: TreeNode) -> List[int]:\n        res = []\n        st = []\n        cur = root\n        while cur or st:\n            while cur:\n                st.append(cur)\n                cur = cur.left\n            cur = st.pop()\n            res.append(cur.val)\n            cur = cur.right\n        return res' },
    ],
  },

  {
    title: 'Binary Tree Postorder Traversal',
    problemNumber: 145,
    difficulty: 'easy',
    tags: 'tree',
    harnessType: 'tree-list',
    methodName: 'postorderTraversal',
    description: 'Given the `root` of a binary tree, return the postorder traversal of its nodes\' values.\n\nPostorder: left → right → root.',
    visibleTestCases: [
      { input: '1 null 2 3', output: '3 2 1', explanation: 'Postorder of [1,null,2,3] = [3,2,1].' },
      { input: '1', output: '1', explanation: 'Single node.' },
    ],
    hiddenTestCases: [
      { input: '1 2', output: '2 1' },
      { input: '1 2 3', output: '2 3 1' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    vector<int> postorderTraversal(TreeNode* root) {\n        // Write your code here\n        return {};\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public List<Integer> postorderTraversal(TreeNode root) {\n        // Write your code here\n        return new ArrayList<>();\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def postorderTraversal(self, root: TreeNode) -> List[int]:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    vector<int> postorderTraversal(TreeNode* root) {\n        vector<int> res;\n        stack<TreeNode*> st; if (root) st.push(root);\n        while (!st.empty()) {\n            TreeNode* n = st.top(); st.pop();\n            res.push_back(n->val);\n            if (n->left) st.push(n->left);\n            if (n->right) st.push(n->right);\n        }\n        reverse(res.begin(), res.end());\n        return res;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public List<Integer> postorderTraversal(TreeNode root) {\n        List<Integer> res = new ArrayList<>();\n        Deque<TreeNode> st = new ArrayDeque<>();\n        if (root != null) st.push(root);\n        while (!st.isEmpty()) {\n            TreeNode n = st.pop();\n            res.add(n.val);\n            if (n.left != null) st.push(n.left);\n            if (n.right != null) st.push(n.right);\n        }\n        Collections.reverse(res);\n        return res;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def postorderTraversal(self, root: TreeNode) -> List[int]:\n        if not root:\n            return []\n        res = []\n        st = [root]\n        while st:\n            n = st.pop()\n            res.append(n.val)\n            if n.left: st.append(n.left)\n            if n.right: st.append(n.right)\n        res.reverse()\n        return res' },
    ],
  },

  {
    title: 'Binary Tree Tilt',
    problemNumber: 563,
    difficulty: 'easy',
    tags: 'tree',
    harnessType: 'tree-int',
    methodName: 'findTilt',
    description: 'Given the `root` of a binary tree, return the sum of every tree node\'s tilt.\n\nThe tilt of a tree node is the absolute difference between the sum of all left subtree node values and all right subtree node values. If a node does not have a left child, then the sum of the left subtree node values is treated as `0`. The rule is similar if the node does not have a right child.',
    visibleTestCases: [
      { input: '1 2 3', output: '1', explanation: 'Node 1 tilt = |2-3| = 1. Leaves have 0 tilt. Total = 1.' },
      { input: '4 2 9 3 5 null 7', output: '15', explanation: 'Node 2 tilt = |3-5| = 2. Node 9 tilt = 7. Node 4 tilt = |10-16| = 6. Total = 15.' },
    ],
    hiddenTestCases: [
      { input: '1', output: '0' },
      { input: '1 2', output: '2' },
      { input: '21 7 14 1 1 2 2 3 3', output: '9' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int findTilt(TreeNode* root) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int findTilt(TreeNode root) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def findTilt(self, root: TreeNode) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int findTilt(TreeNode* root) {\n        int total = 0;\n        dfs(root, total);\n        return total;\n    }\nprivate:\n    int dfs(TreeNode* n, int& total) {\n        if (!n) return 0;\n        int l = dfs(n->left, total);\n        int r = dfs(n->right, total);\n        total += abs(l - r);\n        return l + r + n->val;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    private int total = 0;\n    public int findTilt(TreeNode root) {\n        dfs(root);\n        return total;\n    }\n    private int dfs(TreeNode n) {\n        if (n == null) return 0;\n        int l = dfs(n.left);\n        int r = dfs(n.right);\n        total += Math.abs(l - r);\n        return l + r + n.val;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def findTilt(self, root: TreeNode) -> int:\n        self.total = 0\n        def dfs(n):\n            if not n:\n                return 0\n            l = dfs(n.left)\n            r = dfs(n.right)\n            self.total += abs(l - r)\n            return l + r + n.val\n        dfs(root)\n        return self.total' },
    ],
  },

  // ═══════════ MEDIUM (8) ═══════════
  {
    title: 'Path Sum III',
    problemNumber: 437,
    difficulty: 'medium',
    tags: 'tree',
    harnessType: 'tree-int-int',
    methodName: 'pathSum',
    description: 'Given the `root` of a binary tree and an integer `targetSum`, return the number of paths where the sum of the values along the path equals `targetSum`.\n\nThe path does not need to start or end at the root or a leaf, but it must go downwards (i.e., traveling only from parent nodes to child nodes).\n\n**Input format:** Line 1 = tree, Line 2 = targetSum.',
    visibleTestCases: [
      { input: '10 5 -3 3 2 null 11 3 -2 null 1\n8', output: '3', explanation: 'Paths summing to 8: [5,3], [-3,11], [5,2,1].' },
      { input: '10\n5', output: '0', explanation: 'No path sums to 5.' },
    ],
    hiddenTestCases: [
      { input: '1 2 3\n3', output: '2' },
      { input: '1 -2 -3\n-1', output: '1' },
      { input: '0 1 1\n1', output: '4' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int pathSum(TreeNode* root, int targetSum) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int pathSum(TreeNode root, int targetSum) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def pathSum(self, root: TreeNode, targetSum: int) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int pathSum(TreeNode* root, int targetSum) {\n        if (!root) return 0;\n        return helper(root, targetSum) + pathSum(root->left, targetSum) + pathSum(root->right, targetSum);\n    }\nprivate:\n    int helper(TreeNode* n, long long target) {\n        if (!n) return 0;\n        long long rem = target - n->val;\n        return (rem == 0 ? 1 : 0) + helper(n->left, rem) + helper(n->right, rem);\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int pathSum(TreeNode root, int targetSum) {\n        if (root == null) return 0;\n        return helper(root, (long) targetSum) + pathSum(root.left, targetSum) + pathSum(root.right, targetSum);\n    }\n    private int helper(TreeNode n, long target) {\n        if (n == null) return 0;\n        long rem = target - n.val;\n        return (rem == 0 ? 1 : 0) + helper(n.left, rem) + helper(n.right, rem);\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def pathSum(self, root: TreeNode, targetSum: int) -> int:\n        if not root:\n            return 0\n        def helper(n, target):\n            if not n:\n                return 0\n            rem = target - n.val\n            return (1 if rem == 0 else 0) + helper(n.left, rem) + helper(n.right, rem)\n        return helper(root, targetSum) + self.pathSum(root.left, targetSum) + self.pathSum(root.right, targetSum)' },
    ],
  },

  {
    title: 'Flatten Binary Tree to Linked List',
    problemNumber: 114,
    difficulty: 'medium',
    tags: 'tree',
    harnessType: 'void-inplace-tree',
    methodName: 'flatten',
    description: 'Given the `root` of a binary tree, flatten the tree into a "linked list":\n- The "linked list" should use the same `TreeNode` class where the `right` child pointer points to the next node in the list and the `left` child pointer is always `null`.\n- The "linked list" should be in the same order as a pre-order traversal of the binary tree.\n\n**Output format:** The flattened tree, level-order serialized.',
    visibleTestCases: [
      { input: '1 2 5 3 4 null 6', output: '1 null 2 null 3 null 4 null 5 null 6', explanation: 'Preorder 1→2→3→4→5→6, all linked as right children.' },
      { input: '0', output: '0', explanation: 'Single node.' },
    ],
    hiddenTestCases: [
      { input: '1 2', output: '1 null 2' },
      { input: '1 null 2', output: '1 null 2' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    void flatten(TreeNode* root) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public void flatten(TreeNode root) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def flatten(self, root: TreeNode) -> None:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    void flatten(TreeNode* root) {\n        TreeNode* cur = root;\n        while (cur) {\n            if (cur->left) {\n                TreeNode* rightmost = cur->left;\n                while (rightmost->right) rightmost = rightmost->right;\n                rightmost->right = cur->right;\n                cur->right = cur->left;\n                cur->left = nullptr;\n            }\n            cur = cur->right;\n        }\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public void flatten(TreeNode root) {\n        TreeNode cur = root;\n        while (cur != null) {\n            if (cur.left != null) {\n                TreeNode rightmost = cur.left;\n                while (rightmost.right != null) rightmost = rightmost.right;\n                rightmost.right = cur.right;\n                cur.right = cur.left;\n                cur.left = null;\n            }\n            cur = cur.right;\n        }\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def flatten(self, root: TreeNode) -> None:\n        cur = root\n        while cur:\n            if cur.left:\n                rightmost = cur.left\n                while rightmost.right:\n                    rightmost = rightmost.right\n                rightmost.right = cur.right\n                cur.right = cur.left\n                cur.left = None\n            cur = cur.right' },
    ],
  },

  {
    title: 'Convert BST to Greater Tree',
    problemNumber: 538,
    difficulty: 'medium',
    tags: 'tree',
    harnessType: 'tree-tree',
    methodName: 'convertBST',
    description: 'Given the `root` of a Binary Search Tree (BST), convert it to a Greater Tree such that every key of the original BST is changed to the original key plus the sum of all keys greater than the original key in BST.\n\nReturn the new root.',
    visibleTestCases: [
      { input: '4 1 6 0 2 5 7 null null null 3 null null null 8', output: '30 36 21 36 35 26 15 null null null 33 null null null 8', explanation: 'Each key is added to the sum of all greater keys.' },
      { input: '0 null 1', output: '1 null 1', explanation: '0 becomes 1 (0+1), 1 stays 1.' },
    ],
    hiddenTestCases: [
      { input: '1', output: '1' },
      { input: '2 1', output: '2 3' },
      { input: '1 0 2', output: '3 3 2' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    TreeNode* convertBST(TreeNode* root) {\n        // Write your code here\n        return root;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public TreeNode convertBST(TreeNode root) {\n        // Write your code here\n        return root;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def convertBST(self, root: TreeNode) -> TreeNode:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    TreeNode* convertBST(TreeNode* root) {\n        int sum = 0;\n        dfs(root, sum);\n        return root;\n    }\nprivate:\n    void dfs(TreeNode* n, int& sum) {\n        if (!n) return;\n        dfs(n->right, sum);\n        sum += n->val;\n        n->val = sum;\n        dfs(n->left, sum);\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    private int sum = 0;\n    public TreeNode convertBST(TreeNode root) {\n        dfs(root);\n        return root;\n    }\n    private void dfs(TreeNode n) {\n        if (n == null) return;\n        dfs(n.right);\n        sum += n.val;\n        n.val = sum;\n        dfs(n.left);\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def convertBST(self, root: TreeNode) -> TreeNode:\n        self.total = 0\n        def dfs(n):\n            if not n:\n                return\n            dfs(n.right)\n            self.total += n.val\n            n.val = self.total\n            dfs(n.left)\n        dfs(root)\n        return root' },
    ],
  },

  {
    title: 'Lowest Common Ancestor of Deepest Leaves',
    problemNumber: 1123,
    difficulty: 'medium',
    tags: 'tree',
    harnessType: 'tree-tree',
    methodName: 'lcaDeepestLeaves',
    description: 'Given the `root` of a binary tree, return the lowest common ancestor of its deepest leaves.\n\nRecall that:\n- The node of a binary tree is a leaf if and only if it has no children\n- The depth of the root of the tree is `0`. If the depth of a node is `d`, the depth of each of its children is `d + 1`.\n- The lowest common ancestor of a set `S` of nodes, is the node `A` with the largest depth such that every node in `S` is in the subtree with root `A`.\n\n**Output format:** The subtree rooted at the LCA, level-order serialized.',
    visibleTestCases: [
      { input: '3 5 1 6 2 0 8 null null 7 4', output: '2 7 4', explanation: 'Deepest leaves are 7 and 4 under node 2 — LCA is 2.' },
      { input: '1', output: '1', explanation: 'Single node.' },
    ],
    hiddenTestCases: [
      { input: '0 1 3 null 2', output: '2' },
      { input: '0 1 3', output: '0 1 3' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    TreeNode* lcaDeepestLeaves(TreeNode* root) {\n        // Write your code here\n        return root;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public TreeNode lcaDeepestLeaves(TreeNode root) {\n        // Write your code here\n        return root;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def lcaDeepestLeaves(self, root: TreeNode) -> TreeNode:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    TreeNode* lcaDeepestLeaves(TreeNode* root) {\n        return dfs(root).first;\n    }\nprivate:\n    pair<TreeNode*, int> dfs(TreeNode* n) {\n        if (!n) return {nullptr, 0};\n        auto l = dfs(n->left);\n        auto r = dfs(n->right);\n        if (l.second > r.second) return {l.first, l.second + 1};\n        if (r.second > l.second) return {r.first, r.second + 1};\n        return {n, l.second + 1};\n    }\n};' },
            { language: 'Java', completeCode: 'class Solution {\n    public TreeNode lcaDeepestLeaves(TreeNode root) {\n        return (TreeNode) dfs(root)[0];\n    }\n    private Object[] dfs(TreeNode n) {\n        if (n == null) return new Object[]{null, 0};\n        Object[] l = dfs(n.left);\n        Object[] r = dfs(n.right);\n        int lh = (int) l[1], rh = (int) r[1];\n        if (lh > rh) return new Object[]{l[0], lh + 1};\n        if (rh > lh) return new Object[]{r[0], rh + 1};\n        return new Object[]{n, lh + 1};\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def lcaDeepestLeaves(self, root: TreeNode) -> TreeNode:\n        def dfs(n):\n            if not n:\n                return None, 0\n            ln, lh = dfs(n.left)\n            rn, rh = dfs(n.right)\n            if lh > rh:\n                return ln, lh + 1\n            if rh > lh:\n                return rn, rh + 1\n            return n, lh + 1\n        return dfs(root)[0]' },
    ],
  },

  {
    title: 'Delete Leaves With a Given Value',
    problemNumber: 1325,
    difficulty: 'medium',
    tags: 'tree',
    harnessType: 'tree-int-tree',
    methodName: 'removeLeafNodes',
    description: 'Given a binary tree `root` and an integer `target`, delete all leaf nodes with value `target`.\n\nNote that once you delete a leaf node with value `target`, if its parent node becomes a leaf node and has the value `target`, it should also be deleted (you need to continue doing that until you cannot).\n\n**Input format:** Line 1 = tree, Line 2 = target.',
    visibleTestCases: [
      { input: '1 2 3 2 null 2 4\n2', output: '1 null 3 null 4', explanation: 'Cascade removes all 2-valued leaves.' },
      { input: '1 3 3 3 2\n3', output: '1 3 null null 2', explanation: 'Removes all 3-valued leaves.' },
    ],
    hiddenTestCases: [
      { input: '1 2 3\n2', output: '1 null 3' },
      { input: '1 2\n2', output: '1' },
      { input: '1 2 3\n1', output: '1 2 3' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    TreeNode* removeLeafNodes(TreeNode* root, int target) {\n        // Write your code here\n        return root;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public TreeNode removeLeafNodes(TreeNode root, int target) {\n        // Write your code here\n        return root;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def removeLeafNodes(self, root: TreeNode, target: int) -> TreeNode:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    TreeNode* removeLeafNodes(TreeNode* root, int target) {\n        if (!root) return nullptr;\n        root->left = removeLeafNodes(root->left, target);\n        root->right = removeLeafNodes(root->right, target);\n        if (!root->left && !root->right && root->val == target) return nullptr;\n        return root;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public TreeNode removeLeafNodes(TreeNode root, int target) {\n        if (root == null) return null;\n        root.left = removeLeafNodes(root.left, target);\n        root.right = removeLeafNodes(root.right, target);\n        if (root.left == null && root.right == null && root.val == target) return null;\n        return root;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def removeLeafNodes(self, root: TreeNode, target: int) -> TreeNode:\n        if not root:\n            return None\n        root.left = self.removeLeafNodes(root.left, target)\n        root.right = self.removeLeafNodes(root.right, target)\n        if not root.left and not root.right and root.val == target:\n            return None\n        return root' },
    ],
  },

  {
    title: 'Longest Univalue Path',
    problemNumber: 687,
    difficulty: 'medium',
    tags: 'tree',
    harnessType: 'tree-int',
    methodName: 'longestUnivaluePath',
    description: 'Given the `root` of a binary tree, return the length of the longest path, where each node in the path has the same value. This path may or may not pass through the root.\n\nThe length of the path between two nodes is represented by the number of edges between them.',
    visibleTestCases: [
      { input: '5 4 5 1 1 null 5', output: '2', explanation: 'Longest univalue path: 5→5→5, edges = 2.' },
      { input: '1 4 5 4 4 null 5', output: '2', explanation: '4→4→4 path, edges = 2.' },
    ],
    hiddenTestCases: [
      { input: '1', output: '0' },
      { input: '1 1', output: '1' },
      { input: '1 1 1', output: '2' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int longestUnivaluePath(TreeNode* root) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int longestUnivaluePath(TreeNode root) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def longestUnivaluePath(self, root: TreeNode) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int longestUnivaluePath(TreeNode* root) {\n        int best = 0;\n        dfs(root, best);\n        return best;\n    }\nprivate:\n    int dfs(TreeNode* n, int& best) {\n        if (!n) return 0;\n        int l = dfs(n->left, best);\n        int r = dfs(n->right, best);\n        int lExt = (n->left && n->left->val == n->val) ? l + 1 : 0;\n        int rExt = (n->right && n->right->val == n->val) ? r + 1 : 0;\n        best = max(best, lExt + rExt);\n        return max(lExt, rExt);\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    private int best = 0;\n    public int longestUnivaluePath(TreeNode root) {\n        dfs(root);\n        return best;\n    }\n    private int dfs(TreeNode n) {\n        if (n == null) return 0;\n        int l = dfs(n.left);\n        int r = dfs(n.right);\n        int lExt = (n.left != null && n.left.val == n.val) ? l + 1 : 0;\n        int rExt = (n.right != null && n.right.val == n.val) ? r + 1 : 0;\n        best = Math.max(best, lExt + rExt);\n        return Math.max(lExt, rExt);\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def longestUnivaluePath(self, root: TreeNode) -> int:\n        self.best = 0\n        def dfs(n):\n            if not n:\n                return 0\n            l = dfs(n.left)\n            r = dfs(n.right)\n            l_ext = l + 1 if n.left and n.left.val == n.val else 0\n            r_ext = r + 1 if n.right and n.right.val == n.val else 0\n            self.best = max(self.best, l_ext + r_ext)\n            return max(l_ext, r_ext)\n        dfs(root)\n        return self.best' },
    ],
  },

  {
    title: 'Binary Tree Pruning',
    problemNumber: 814,
    difficulty: 'medium',
    tags: 'tree',
    harnessType: 'tree-tree',
    methodName: 'pruneTree',
    description: 'Given the `root` of a binary tree, return the same tree where every subtree (of the given tree) not containing a `1` has been removed.\n\nA subtree of a node `node` is `node` plus every node that is a descendant of `node`.',
    visibleTestCases: [
      { input: '1 null 0 0 1', output: '1 null 0 null 1', explanation: 'Prunes left subtree of 0 (has no 1).' },
      { input: '1 0 1 0 0 0 1', output: '1 null 1 null 1', explanation: 'Prunes all-0 subtrees.' },
    ],
    hiddenTestCases: [
      { input: '1', output: '1' },
      { input: '0 null 1', output: '0 null 1' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    TreeNode* pruneTree(TreeNode* root) {\n        // Write your code here\n        return root;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public TreeNode pruneTree(TreeNode root) {\n        // Write your code here\n        return root;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def pruneTree(self, root: TreeNode) -> TreeNode:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    TreeNode* pruneTree(TreeNode* root) {\n        if (!root) return nullptr;\n        root->left = pruneTree(root->left);\n        root->right = pruneTree(root->right);\n        if (!root->left && !root->right && root->val == 0) return nullptr;\n        return root;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public TreeNode pruneTree(TreeNode root) {\n        if (root == null) return null;\n        root.left = pruneTree(root.left);\n        root.right = pruneTree(root.right);\n        if (root.left == null && root.right == null && root.val == 0) return null;\n        return root;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def pruneTree(self, root: TreeNode) -> TreeNode:\n        if not root:\n            return None\n        root.left = self.pruneTree(root.left)\n        root.right = self.pruneTree(root.right)\n        if not root.left and not root.right and root.val == 0:\n            return None\n        return root' },
    ],
  },

  {
    title: 'Count Complete Tree Nodes',
    problemNumber: 222,
    difficulty: 'medium',
    tags: 'tree',
    harnessType: 'tree-int',
    methodName: 'countNodes',
    description: 'Given the `root` of a complete binary tree, return the number of the nodes in the tree.\n\nAccording to Wikipedia, every level, except possibly the last, is completely filled in a complete binary tree, and all nodes in the last level are as far left as possible.',
    visibleTestCases: [
      { input: '1 2 3 4 5 6', output: '6', explanation: '6 nodes.' },
      { input: '1', output: '1', explanation: '1 node.' },
    ],
    hiddenTestCases: [
      { input: '1 2 3 4 5 6 7 8 9', output: '9' },
      { input: '1 2 3 4', output: '4' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int countNodes(TreeNode* root) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int countNodes(TreeNode root) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def countNodes(self, root: TreeNode) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int countNodes(TreeNode* root) {\n        if (!root) return 0;\n        int lh = height(root->left);\n        int rh = height(root->right);\n        if (lh == rh) return (1 << lh) + countNodes(root->right);\n        return (1 << rh) + countNodes(root->left);\n    }\nprivate:\n    int height(TreeNode* n) {\n        int h = 0;\n        while (n) { h++; n = n->left; }\n        return h;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int countNodes(TreeNode root) {\n        if (root == null) return 0;\n        int lh = height(root.left);\n        int rh = height(root.right);\n        if (lh == rh) return (1 << lh) + countNodes(root.right);\n        return (1 << rh) + countNodes(root.left);\n    }\n    private int height(TreeNode n) {\n        int h = 0;\n        while (n != null) { h++; n = n.left; }\n        return h;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def countNodes(self, root: TreeNode) -> int:\n        if not root:\n            return 0\n        def height(n):\n            h = 0\n            while n:\n                h += 1\n                n = n.left\n            return h\n        lh = height(root.left)\n        rh = height(root.right)\n        if lh == rh:\n            return (1 << lh) + self.countNodes(root.right)\n        return (1 << rh) + self.countNodes(root.left)' },
    ],
  },

  // ═══════════ HARD (4) ═══════════
  {
    title: 'Vertical Order Traversal of a Binary Tree',
    problemNumber: 987,
    difficulty: 'hard',
    tags: 'tree',
    harnessType: 'tree-list-of-lists',
    methodName: 'verticalTraversal',
    description: 'Given the `root` of a binary tree, calculate the vertical order traversal of the binary tree.\n\nFor each node at position `(row, col)`, its left and right children will be at positions `(row + 1, col - 1)` and `(row + 1, col + 1)` respectively. The root of the tree is at `(0, 0)`.\n\nThe vertical order traversal of a binary tree is a list of top-to-bottom orderings for each column index starting from the leftmost column and ending on the rightmost column. There may be multiple nodes in the same row and same column. In such a case, sort these nodes by their values.\n\n**Output format:** One line per column.',
    visibleTestCases: [
      { input: '3 9 20 null null 15 7', output: '9\n3 15\n20\n7', explanation: 'Columns from left to right: [9], [3,15], [20], [7].' },
      { input: '1 2 3 4 5 6 7', output: '4\n2\n1 5 6\n3\n7', explanation: 'Columns from left to right.' },
    ],
    hiddenTestCases: [
      { input: '1', output: '1' },
      { input: '1 2 3', output: '2\n1\n3' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    vector<vector<int>> verticalTraversal(TreeNode* root) {\n        // Write your code here\n        return {};\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public List<List<Integer>> verticalTraversal(TreeNode root) {\n        // Write your code here\n        return new ArrayList<>();\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def verticalTraversal(self, root: TreeNode) -> List[List[int]]:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    vector<vector<int>> verticalTraversal(TreeNode* root) {\n        map<int, vector<pair<int, int>>> mp;\n        function<void(TreeNode*, int, int)> dfs = [&](TreeNode* n, int col, int row) {\n            if (!n) return;\n            mp[col].push_back({row, n->val});\n            dfs(n->left, col - 1, row + 1);\n            dfs(n->right, col + 1, row + 1);\n        };\n        dfs(root, 0, 0);\n        vector<vector<int>> res;\n        for (auto& [col, v] : mp) {\n            sort(v.begin(), v.end());\n            vector<int> col_vals;\n            for (auto& p : v) col_vals.push_back(p.second);\n            res.push_back(col_vals);\n        }\n        return res;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public List<List<Integer>> verticalTraversal(TreeNode root) {\n        TreeMap<Integer, List<int[]>> mp = new TreeMap<>();\n        dfs(root, 0, 0, mp);\n        List<List<Integer>> res = new ArrayList<>();\n        for (List<int[]> v : mp.values()) {\n            v.sort((a, b) -> a[0] != b[0] ? a[0] - b[0] : a[1] - b[1]);\n            List<Integer> col = new ArrayList<>();\n            for (int[] p : v) col.add(p[1]);\n            res.add(col);\n        }\n        return res;\n    }\n    private void dfs(TreeNode n, int col, int row, TreeMap<Integer, List<int[]>> mp) {\n        if (n == null) return;\n        mp.computeIfAbsent(col, k -> new ArrayList<>()).add(new int[]{row, n.val});\n        dfs(n.left, col - 1, row + 1, mp);\n        dfs(n.right, col + 1, row + 1, mp);\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def verticalTraversal(self, root: TreeNode) -> List[List[int]]:\n        mp = {}\n        def dfs(n, col, row):\n            if not n:\n                return\n            mp.setdefault(col, []).append((row, n.val))\n            dfs(n.left, col - 1, row + 1)\n            dfs(n.right, col + 1, row + 1)\n        dfs(root, 0, 0)\n        res = []\n        for col in sorted(mp.keys()):\n            mp[col].sort()\n            res.append([v for _, v in mp[col]])\n        return res' },
    ],
  },

  {
    title: 'Distribute Coins in Binary Tree',
    problemNumber: 979,
    difficulty: 'hard',
    tags: 'tree',
    harnessType: 'tree-int',
    methodName: 'distributeCoins',
    description: 'You are given the `root` of a binary tree with `n` nodes where each `node` in the tree has `node.val` coins. There are `n` coins in total throughout the whole tree.\n\nIn one move, we may choose two adjacent nodes and move one coin from one node to another. A move may be from parent to child, or from child to parent.\n\nReturn the minimum number of moves required to make every node have exactly one coin.',
    visibleTestCases: [
      { input: '3 0 0', output: '2', explanation: 'Root has 3 coins, children need 1 each. 2 moves.' },
      { input: '0 3 0', output: '3', explanation: '3 moves required.' },
    ],
    hiddenTestCases: [
      { input: '1', output: '0' },
      { input: '0 2', output: '1' },
      { input: '1 0 2', output: '2' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int distributeCoins(TreeNode* root) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int distributeCoins(TreeNode root) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def distributeCoins(self, root: TreeNode) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int distributeCoins(TreeNode* root) {\n        int moves = 0;\n        dfs(root, moves);\n        return moves;\n    }\nprivate:\n    int dfs(TreeNode* n, int& moves) {\n        if (!n) return 0;\n        int l = dfs(n->left, moves);\n        int r = dfs(n->right, moves);\n        moves += abs(l) + abs(r);\n        return n->val + l + r - 1;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    private int moves = 0;\n    public int distributeCoins(TreeNode root) {\n        dfs(root);\n        return moves;\n    }\n    private int dfs(TreeNode n) {\n        if (n == null) return 0;\n        int l = dfs(n.left);\n        int r = dfs(n.right);\n        moves += Math.abs(l) + Math.abs(r);\n        return n.val + l + r - 1;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def distributeCoins(self, root: TreeNode) -> int:\n        self.moves = 0\n        def dfs(n):\n            if not n:\n                return 0\n            l = dfs(n.left)\n            r = dfs(n.right)\n            self.moves += abs(l) + abs(r)\n            return n.val + l + r - 1\n        dfs(root)\n        return self.moves' },
    ],
  },

  {
    title: 'Maximum Sum BST in Binary Tree',
    problemNumber: 1373,
    difficulty: 'hard',
    tags: 'tree',
    harnessType: 'tree-int',
    methodName: 'maxSumBST',
    description: 'Given a binary tree `root`, return the maximum sum of all keys of any subtree which is also a Binary Search Tree (BST).\n\nIf no BST exists, return `0`.\n\nA BST is defined as:\n- The left subtree of a node contains only nodes with keys less than the node\'s key.\n- The right subtree of a node contains only nodes with keys greater than the node\'s key.\n- Both the left and right subtrees must also be binary search trees.',
    visibleTestCases: [
      { input: '1 4 3 2 4 2 5 null null null null null null 4 6', output: '20', explanation: 'Subtree rooted at 3 is a BST with sum 3+2+5+4+6 = 20.' },
      { input: '4 3 null 1 2', output: '2', explanation: 'Node 2 alone is a BST with sum 2.' },
    ],
    hiddenTestCases: [
      { input: '-4 -2 -5', output: '0' },
      { input: '2 1 3', output: '6' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int maxSumBST(TreeNode* root) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int maxSumBST(TreeNode root) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def maxSumBST(self, root: TreeNode) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int maxSumBST(TreeNode* root) {\n        int best = 0;\n        dfs(root, best);\n        return best;\n    }\nprivate:\n    array<int, 4> dfs(TreeNode* n, int& best) {\n        if (!n) return {1, INT_MAX, INT_MIN, 0};\n        auto l = dfs(n->left, best);\n        auto r = dfs(n->right, best);\n        if (l[0] && r[0] && l[2] < n->val && n->val < r[1]) {\n            int s = l[3] + n->val + r[3];\n            best = max(best, s);\n            return {1, min(l[1], n->val), max(r[2], n->val), s};\n        }\n        return {0, 0, 0, 0};\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    private int best = 0;\n    public int maxSumBST(TreeNode root) {\n        dfs(root);\n        return best;\n    }\n    private int[] dfs(TreeNode n) {\n        if (n == null) return new int[]{1, Integer.MAX_VALUE, Integer.MIN_VALUE, 0};\n        int[] l = dfs(n.left);\n        int[] r = dfs(n.right);\n        if (l[0] == 1 && r[0] == 1 && l[2] < n.val && n.val < r[1]) {\n            int s = l[3] + n.val + r[3];\n            best = Math.max(best, s);\n            return new int[]{1, Math.min(l[1], n.val), Math.max(r[2], n.val), s};\n        }\n        return new int[]{0, 0, 0, 0};\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def maxSumBST(self, root: TreeNode) -> int:\n        self.best = 0\n        def dfs(n):\n            if not n:\n                return (True, float(\'inf\'), float(\'-inf\'), 0)\n            l = dfs(n.left)\n            r = dfs(n.right)\n            if l[0] and r[0] and l[2] < n.val < r[1]:\n                s = l[3] + n.val + r[3]\n                self.best = max(self.best, s)\n                return (True, min(l[1], n.val), max(r[2], n.val), s)\n            return (False, 0, 0, 0)\n        dfs(root)\n        return self.best' },
    ],
  },

  {
    title: 'Sum of Distances in Tree',
    problemNumber: 834,
    difficulty: 'hard',
    tags: 'graph',
    harnessType: 'n-edges-int-arr',
    methodName: 'sumOfDistancesInTree',
    description: 'There is an undirected connected tree with `n` nodes labeled from `0` to `n - 1` and `n - 1` edges.\n\nYou are given the integer `n` and the array `edges` where `edges[i] = [a_i, b_i]` indicates that there is an edge between nodes `a_i` and `b_i` in the tree.\n\nReturn an array `answer` of length `n` where `answer[i]` is the sum of the distances between the i-th node in the tree and all other nodes.\n\n**Input format:** Line 1 = n, Line 2 = flat edge pairs (a b c d = edges [a,b], [c,d]).',
    visibleTestCases: [
      { input: '6\n0 1 0 2 2 3 2 4 2 5', output: '8 12 6 10 10 10', explanation: 'Answer is [8,12,6,10,10,10].' },
      { input: '2\n1 0', output: '1 1', explanation: 'Two nodes at distance 1 from each other.' },
    ],
    hiddenTestCases: [
      { input: '3\n0 1 1 2', output: '3 2 3' },
      { input: '4\n0 1 0 2 0 3', output: '3 5 5 5' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    vector<int> sumOfDistancesInTree(int n, vector<vector<int>>& edges) {\n        // Write your code here\n        return {};\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int[] sumOfDistancesInTree(int n, int[][] edges) {\n        // Write your code here\n        return new int[]{};\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def sumOfDistancesInTree(self, n: int, edges: List[List[int]]) -> List[int]:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    vector<int> sumOfDistancesInTree(int n, vector<vector<int>>& edges) {\n        vector<vector<int>> adj(n);\n        for (auto& e : edges) { adj[e[0]].push_back(e[1]); adj[e[1]].push_back(e[0]); }\n        vector<int> count(n, 1), res(n, 0);\n        function<void(int, int)> dfs1 = [&](int node, int parent) {\n            for (int nx : adj[node]) {\n                if (nx == parent) continue;\n                dfs1(nx, node);\n                count[node] += count[nx];\n                res[node] += res[nx] + count[nx];\n            }\n        };\n        function<void(int, int)> dfs2 = [&](int node, int parent) {\n            for (int nx : adj[node]) {\n                if (nx == parent) continue;\n                res[nx] = res[node] + n - 2 * count[nx];\n                dfs2(nx, node);\n            }\n        };\n        dfs1(0, -1);\n        dfs2(0, -1);\n        return res;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int[] sumOfDistancesInTree(int n, int[][] edges) {\n        List<List<Integer>> adj = new ArrayList<>();\n        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());\n        for (int[] e : edges) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); }\n        int[] count = new int[n], res = new int[n];\n        Arrays.fill(count, 1);\n        dfs1(0, -1, adj, count, res);\n        dfs2(0, -1, n, adj, count, res);\n        return res;\n    }\n    private void dfs1(int node, int parent, List<List<Integer>> adj, int[] count, int[] res) {\n        for (int nx : adj.get(node)) {\n            if (nx == parent) continue;\n            dfs1(nx, node, adj, count, res);\n            count[node] += count[nx];\n            res[node] += res[nx] + count[nx];\n        }\n    }\n    private void dfs2(int node, int parent, int n, List<List<Integer>> adj, int[] count, int[] res) {\n        for (int nx : adj.get(node)) {\n            if (nx == parent) continue;\n            res[nx] = res[node] + n - 2 * count[nx];\n            dfs2(nx, node, n, adj, count, res);\n        }\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def sumOfDistancesInTree(self, n: int, edges: List[List[int]]) -> List[int]:\n        adj = [[] for _ in range(n)]\n        for a, b in edges:\n            adj[a].append(b)\n            adj[b].append(a)\n        count = [1] * n\n        res = [0] * n\n        def dfs1(node, parent):\n            for nx in adj[node]:\n                if nx == parent:\n                    continue\n                dfs1(nx, node)\n                count[node] += count[nx]\n                res[node] += res[nx] + count[nx]\n        def dfs2(node, parent):\n            for nx in adj[node]:\n                if nx == parent:\n                    continue\n                res[nx] = res[node] + n - 2 * count[nx]\n                dfs2(nx, node)\n        dfs1(0, -1)\n        dfs2(0, -1)\n        return res' },
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
        { language: 'C++', harnessCode: buildCppHarness(p.harnessType, p.methodName) },
        { language: 'Java', harnessCode: buildJavaHarness(p.harnessType, p.methodName) },
        { language: 'Python', harnessCode: buildPyHarness(p.harnessType, p.methodName) },
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
    console.log(`🎉 Tree batch 3 complete`);
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