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
// TREE HELPERS (per language, inlined into every harness)
// ─────────────────────────────────────────────────────────────

const CPP_HELPER = `#include <iostream>
#include <sstream>
#include <string>
#include <vector>
#include <queue>
#include <algorithm>
#include <climits>
#include <unordered_map>
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
    queue<TreeNode*> q;
    q.push(root);
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
    queue<TreeNode*> q;
    q.push(root);
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

string readLine() {
    string line;
    getline(cin, line);
    return line;
}

vector<int> parseArray(const string& line) {
    vector<int> v;
    stringstream ss(line);
    int x;
    while (ss >> x) v.push_back(x);
    return v;
}

TreeNode* findNode(TreeNode* root, int val) {
    if (!root) return nullptr;
    if (root->val == val) return root;
    TreeNode* left = findNode(root->left, val);
    if (left) return left;
    return findNode(root->right, val);
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
        Queue<TreeNode> q = new LinkedList<>();
        q.offer(root);
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
        Queue<TreeNode> q = new LinkedList<>();
        q.offer(root);
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

    static TreeNode findNode(TreeNode root, int val) {
        if (root == null) return null;
        if (root.val == val) return root;
        TreeNode left = findNode(root.left, val);
        if (left != null) return left;
        return findNode(root.right, val);
    }

    static int[] parseArray(String line) {
        if (line == null || line.trim().isEmpty()) return new int[]{};
        String[] tokens = line.trim().split("\\\\s+");
        int[] arr = new int[tokens.length];
        for (int i = 0; i < tokens.length; i++) arr[i] = Integer.parseInt(tokens[i]);
        return arr;
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

def find_node(root, val):
    if not root:
        return None
    if root.val == val:
        return root
    left = find_node(root.left, val)
    if left:
        return left
    return find_node(root.right, val)
`;

// ─────────────────────────────────────────────────────────────
// HARNESS BUILDERS
// ─────────────────────────────────────────────────────────────

function buildCppHarness(type, method) {
  const setup = {
    'tree-int': `string line1 = readLine();
    TreeNode* root = buildTree(line1);`,
    'tree-bool': `string line1 = readLine();
    TreeNode* root = buildTree(line1);`,
    'tree-tree': `string line1 = readLine();
    TreeNode* root = buildTree(line1);`,
    'tree-list': `string line1 = readLine();
    TreeNode* root = buildTree(line1);`,
    'tree-list-of-lists': `string line1 = readLine();
    TreeNode* root = buildTree(line1);`,
    'two-trees-bool': `string line1 = readLine();
    string line2 = readLine();
    TreeNode* root = buildTree(line1);
    TreeNode* subRoot = buildTree(line2);`,
    'tree-int-int': `string line1 = readLine();
    string line2 = readLine();
    TreeNode* root = buildTree(line1);
    int k = stoi(line2);`,
    'tree-two-values-int': `string line1 = readLine();
    string line2 = readLine();
    string line3 = readLine();
    TreeNode* root = buildTree(line1);
    TreeNode* p = findNode(root, stoi(line2));
    TreeNode* q = findNode(root, stoi(line3));`,
    'two-arrays-tree': `string line1 = readLine();
    string line2 = readLine();
    vector<int> preorder = parseArray(line1);
    vector<int> inorder = parseArray(line2);`,
  };

  const call = {
    'tree-int': `Solution sol;
    cout << sol.${method}(root) << endl;`,
    'tree-bool': `Solution sol;
    cout << (sol.${method}(root) ? "true" : "false") << endl;`,
    'tree-tree': `Solution sol;
    printTree(sol.${method}(root));`,
    'tree-list': `Solution sol;
    vector<int> res = sol.${method}(root);
    for (size_t i = 0; i < res.size(); i++) { if (i > 0) cout << " "; cout << res[i]; }
    cout << endl;`,
    'tree-list-of-lists': `Solution sol;
    vector<vector<int>> res = sol.${method}(root);
    for (size_t r = 0; r < res.size(); r++) {
        for (size_t i = 0; i < res[r].size(); i++) { if (i > 0) cout << " "; cout << res[r][i]; }
        cout << endl;
    }`,
    'two-trees-bool': `Solution sol;
    cout << (sol.${method}(root, subRoot) ? "true" : "false") << endl;`,
    'tree-int-int': `Solution sol;
    cout << sol.${method}(root, k) << endl;`,
    'tree-two-values-int': `Solution sol;
    TreeNode* result = sol.${method}(root, p, q);
    cout << result->val << endl;`,
    'two-arrays-tree': `Solution sol;
    TreeNode* result = sol.${method}(preorder, inorder);
    printTree(result);`,
  };

  return `${CPP_HELPER}
{{USER_CODE}}

int main() {
    ${setup[type]}
    ${call[type]}
    return 0;
}`;
}

function buildJavaHarness(type, method) {
  const setup = {
    'tree-int': `String line1 = sc.nextLine();
        TreeNode root = TreeUtil.buildTree(line1);`,
    'tree-bool': `String line1 = sc.nextLine();
        TreeNode root = TreeUtil.buildTree(line1);`,
    'tree-tree': `String line1 = sc.nextLine();
        TreeNode root = TreeUtil.buildTree(line1);`,
    'tree-list': `String line1 = sc.nextLine();
        TreeNode root = TreeUtil.buildTree(line1);`,
    'tree-list-of-lists': `String line1 = sc.nextLine();
        TreeNode root = TreeUtil.buildTree(line1);`,
    'two-trees-bool': `String line1 = sc.nextLine();
        String line2 = sc.nextLine();
        TreeNode root = TreeUtil.buildTree(line1);
        TreeNode subRoot = TreeUtil.buildTree(line2);`,
    'tree-int-int': `String line1 = sc.nextLine();
        String line2 = sc.nextLine();
        TreeNode root = TreeUtil.buildTree(line1);
        int k = Integer.parseInt(line2.trim());`,
    'tree-two-values-int': `String line1 = sc.nextLine();
        String line2 = sc.nextLine();
        String line3 = sc.nextLine();
        TreeNode root = TreeUtil.buildTree(line1);
        TreeNode p = TreeUtil.findNode(root, Integer.parseInt(line2.trim()));
        TreeNode q = TreeUtil.findNode(root, Integer.parseInt(line3.trim()));`,
    'two-arrays-tree': `String line1 = sc.nextLine();
        String line2 = sc.nextLine();
        int[] preorder = TreeUtil.parseArray(line1);
        int[] inorder = TreeUtil.parseArray(line2);`,
  };

  const call = {
    'tree-int': `Solution sol = new Solution();
        System.out.println(sol.${method}(root));`,
    'tree-bool': `Solution sol = new Solution();
        System.out.println(sol.${method}(root) ? "true" : "false");`,
    'tree-tree': `Solution sol = new Solution();
        TreeUtil.printTree(sol.${method}(root));`,
    'tree-list': `Solution sol = new Solution();
        List<Integer> res = sol.${method}(root);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < res.size(); i++) { if (i > 0) sb.append(" "); sb.append(res.get(i)); }
        System.out.println(sb.toString());`,
    'tree-list-of-lists': `Solution sol = new Solution();
        List<List<Integer>> res = sol.${method}(root);
        for (List<Integer> row : res) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < row.size(); i++) { if (i > 0) sb.append(" "); sb.append(row.get(i)); }
            System.out.println(sb.toString());
        }`,
    'two-trees-bool': `Solution sol = new Solution();
        System.out.println(sol.${method}(root, subRoot) ? "true" : "false");`,
    'tree-int-int': `Solution sol = new Solution();
        System.out.println(sol.${method}(root, k));`,
    'tree-two-values-int': `Solution sol = new Solution();
        TreeNode result = sol.${method}(root, p, q);
        System.out.println(result.val);`,
    'two-arrays-tree': `Solution sol = new Solution();
        TreeNode result = sol.${method}(preorder, inorder);
        TreeUtil.printTree(result);`,
  };

  return `${JAVA_HELPER}
{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        ${setup[type]}
        ${call[type]}
    }
}`;
}

function buildPyHarness(type, method) {
  const setup = {
    'tree-int': `line1 = sys.stdin.readline().rstrip('\\n')
    root = build_tree(line1)`,
    'tree-bool': `line1 = sys.stdin.readline().rstrip('\\n')
    root = build_tree(line1)`,
    'tree-tree': `line1 = sys.stdin.readline().rstrip('\\n')
    root = build_tree(line1)`,
    'tree-list': `line1 = sys.stdin.readline().rstrip('\\n')
    root = build_tree(line1)`,
    'tree-list-of-lists': `line1 = sys.stdin.readline().rstrip('\\n')
    root = build_tree(line1)`,
    'two-trees-bool': `line1 = sys.stdin.readline().rstrip('\\n')
    line2 = sys.stdin.readline().rstrip('\\n')
    root = build_tree(line1)
    subRoot = build_tree(line2)`,
    'tree-int-int': `line1 = sys.stdin.readline().rstrip('\\n')
    line2 = sys.stdin.readline().rstrip('\\n')
    root = build_tree(line1)
    k = int(line2.strip())`,
    'tree-two-values-int': `line1 = sys.stdin.readline().rstrip('\\n')
    line2 = sys.stdin.readline().rstrip('\\n')
    line3 = sys.stdin.readline().rstrip('\\n')
    root = build_tree(line1)
    p = find_node(root, int(line2.strip()))
    q = find_node(root, int(line3.strip()))`,
    'two-arrays-tree': `line1 = sys.stdin.readline().rstrip('\\n')
    line2 = sys.stdin.readline().rstrip('\\n')
    preorder = list(map(int, line1.split())) if line1.strip() else []
    inorder = list(map(int, line2.split())) if line2.strip() else []`,
  };

  const call = {
    'tree-int': `print(Solution().${method}(root))`,
    'tree-bool': `print("true" if Solution().${method}(root) else "false")`,
    'tree-tree': `print_tree(Solution().${method}(root))`,
    'tree-list': `res = Solution().${method}(root)
    print(' '.join(map(str, res)))`,
    'tree-list-of-lists': `res = Solution().${method}(root)
    for row in res:
        print(' '.join(map(str, row)))`,
    'two-trees-bool': `print("true" if Solution().${method}(root, subRoot) else "false")`,
    'tree-int-int': `print(Solution().${method}(root, k))`,
    'tree-two-values-int': `result = Solution().${method}(root, p, q)
    print(result.val)`,
    'two-arrays-tree': `result = Solution().${method}(preorder, inorder)
    print_tree(result)`,
  };

  return `${PY_HELPER}
{{USER_CODE}}

def main():
    ${setup[type]}
    ${call[type]}

if __name__ == "__main__":
    main()`;
}

// ─────────────────────────────────────────────────────────────
// PROBLEM DATA (16 tree problems)
// ─────────────────────────────────────────────────────────────

const problemsData = [
  {
    title: 'Invert Binary Tree',
    problemNumber: 226,
    description: 'Given the `root` of a binary tree, invert the tree, and return its root.\n\nInverting a tree means swapping the left and right children of every node.\n\n**Input format:** Level-order array with `null` for missing children (LeetCode format). E.g., `4 2 7 1 3 6 9`.',
    difficulty: 'easy',
    tags: 'tree',
    harnessType: 'tree-tree',
    methodName: 'invertTree',
    visibleTestCases: [
      { input: '4 2 7 1 3 6 9', output: '4 7 2 9 6 3 1', explanation: 'Swap left/right children at every node.' },
      { input: '2 1 3', output: '2 3 1', explanation: 'Simple two-child swap.' },
    ],
      hiddenTestCases: [
      { input: '1', output: '1' },
      { input: '1 2', output: '1 null 2' },
      { input: '1 2 3 4 5 6 7', output: '1 3 2 7 6 5 4' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    TreeNode* invertTree(TreeNode* root) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def invertTree(self, root: TreeNode) -> TreeNode:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    TreeNode* invertTree(TreeNode* root) {\n        if (!root) return nullptr;\n        TreeNode* tmp = root->left;\n        root->left = root->right;\n        root->right = tmp;\n        invertTree(root->left);\n        invertTree(root->right);\n        return root;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        if (root == null) return null;\n        TreeNode tmp = root.left;\n        root.left = root.right;\n        root.right = tmp;\n        invertTree(root.left);\n        invertTree(root.right);\n        return root;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def invertTree(self, root: TreeNode) -> TreeNode:\n        if not root:\n            return None\n        root.left, root.right = root.right, root.left\n        self.invertTree(root.left)\n        self.invertTree(root.right)\n        return root' },
    ],
  },
  {
    title: 'Maximum Depth of Binary Tree',
    problemNumber: 104,
    description: 'Given the `root` of a binary tree, return its maximum depth.\n\nA binary tree\'s maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.',
    difficulty: 'easy',
    tags: 'tree',
    harnessType: 'tree-int',
    methodName: 'maxDepth',
    visibleTestCases: [
      { input: '3 9 20 null null 15 7', output: '3', explanation: 'Levels: [3], [9,20], [15,7] — depth 3.' },
      { input: '1 null 2', output: '2', explanation: 'Chain of 2 nodes.' },
    ],
    hiddenTestCases: [
      { input: 'null', output: '0' },
      { input: '1', output: '1' },
      { input: '1 2 3 4 5', output: '3' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int maxDepth(TreeNode* root) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int maxDepth(TreeNode root) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def maxDepth(self, root: TreeNode) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int maxDepth(TreeNode* root) {\n        if (!root) return 0;\n        return 1 + max(maxDepth(root->left), maxDepth(root->right));\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int maxDepth(TreeNode root) {\n        if (root == null) return 0;\n        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def maxDepth(self, root: TreeNode) -> int:\n        if not root:\n            return 0\n        return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))' },
    ],
  },
  {
    title: 'Same Tree',
    problemNumber: 100,
    description: 'Given the roots of two binary trees `p` and `q`, return `true` if they are the same tree, or `false` otherwise.\n\nTwo binary trees are considered the same if they are structurally identical, and the nodes have the same value.\n\n**Input format:** Two lines, each a level-order array.',
    difficulty: 'easy',
    tags: 'tree',
    harnessType: 'two-trees-bool',
    methodName: 'isSameTree',
    visibleTestCases: [
      { input: '1 2 3\n1 2 3', output: 'true', explanation: 'Identical structure and values.' },
      { input: '1 2\n1 null 2', output: 'false', explanation: 'Different structure.' },
    ],
    hiddenTestCases: [
      { input: '1 2 1\n1 1 2', output: 'false' },
      { input: 'null\nnull', output: 'true' },
      { input: '1\n1', output: 'true' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    bool isSameTree(TreeNode* p, TreeNode* q) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public boolean isSameTree(TreeNode p, TreeNode q) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def isSameTree(self, p: TreeNode, q: TreeNode) -> bool:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    bool isSameTree(TreeNode* p, TreeNode* q) {\n        if (!p && !q) return true;\n        if (!p || !q) return false;\n        return p->val == q->val && isSameTree(p->left, q->left) && isSameTree(p->right, q->right);\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public boolean isSameTree(TreeNode p, TreeNode q) {\n        if (p == null && q == null) return true;\n        if (p == null || q == null) return false;\n        return p.val == q.val && isSameTree(p.left, q.left) && isSameTree(p.right, q.right);\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def isSameTree(self, p: TreeNode, q: TreeNode) -> bool:\n        if not p and not q:\n            return True\n        if not p or not q:\n            return False\n        return p.val == q.val and self.isSameTree(p.left, q.left) and self.isSameTree(p.right, q.right)' },
    ],
  },
  {
    title: 'Diameter of Binary Tree',
    problemNumber: 543,
    description: 'Given the `root` of a binary tree, return the length of the diameter of the tree.\n\nThe diameter of a binary tree is the length of the longest path between any two nodes in a tree. This path may or may not pass through the `root`.\n\nThe length of a path between two nodes is represented by the number of edges between them.',
    difficulty: 'easy',
    tags: 'tree',
    harnessType: 'tree-int',
    methodName: 'diameterOfBinaryTree',
    visibleTestCases: [
      { input: '1 2 3 4 5', output: '3', explanation: 'Path 4→2→1→3 (or 5→2→1→3) has 3 edges.' },
      { input: '1 2', output: '1', explanation: 'Single edge.' },
    ],
    hiddenTestCases: [
      { input: '1', output: '0' },
      { input: '1 2 3', output: '2' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int diameterOfBinaryTree(TreeNode* root) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int diameterOfBinaryTree(TreeNode root) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def diameterOfBinaryTree(self, root: TreeNode) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int diameterOfBinaryTree(TreeNode* root) {\n        int best = 0;\n        height(root, best);\n        return best;\n    }\nprivate:\n    int height(TreeNode* node, int& best) {\n        if (!node) return 0;\n        int l = height(node->left, best);\n        int r = height(node->right, best);\n        best = max(best, l + r);\n        return 1 + max(l, r);\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    private int best = 0;\n    public int diameterOfBinaryTree(TreeNode root) {\n        height(root);\n        return best;\n    }\n    private int height(TreeNode node) {\n        if (node == null) return 0;\n        int l = height(node.left);\n        int r = height(node.right);\n        best = Math.max(best, l + r);\n        return 1 + Math.max(l, r);\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def diameterOfBinaryTree(self, root: TreeNode) -> int:\n        self.best = 0\n        def height(node):\n            if not node:\n                return 0\n            l = height(node.left)\n            r = height(node.right)\n            self.best = max(self.best, l + r)\n            return 1 + max(l, r)\n        height(root)\n        return self.best' },
    ],
  },
  {
    title: 'Balanced Binary Tree',
    problemNumber: 110,
    description: 'Given a binary tree, determine if it is height-balanced.\n\nA binary tree is height-balanced if the left and right subtrees of every node differ in height by no more than 1.',
    difficulty: 'easy',
    tags: 'tree',
    harnessType: 'tree-bool',
    methodName: 'isBalanced',
    visibleTestCases: [
      { input: '3 9 20 null null 15 7', output: 'true', explanation: 'All subtrees balanced.' },
      { input: '1 2 2 3 3 null null 4 4', output: 'false', explanation: 'Left subtree deeper than right.' },
    ],
    hiddenTestCases: [
      { input: 'null', output: 'true' },
      { input: '1', output: 'true' },
      { input: '1 2 3 4', output: 'false' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    bool isBalanced(TreeNode* root) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public boolean isBalanced(TreeNode root) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def isBalanced(self, root: TreeNode) -> bool:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    bool isBalanced(TreeNode* root) {\n        return check(root) != -1;\n    }\nprivate:\n    int check(TreeNode* node) {\n        if (!node) return 0;\n        int l = check(node->left);\n        if (l == -1) return -1;\n        int r = check(node->right);\n        if (r == -1) return -1;\n        if (abs(l - r) > 1) return -1;\n        return 1 + max(l, r);\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public boolean isBalanced(TreeNode root) {\n        return check(root) != -1;\n    }\n    private int check(TreeNode node) {\n        if (node == null) return 0;\n        int l = check(node.left);\n        if (l == -1) return -1;\n        int r = check(node.right);\n        if (r == -1) return -1;\n        if (Math.abs(l - r) > 1) return -1;\n        return 1 + Math.max(l, r);\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def isBalanced(self, root: TreeNode) -> bool:\n        return self.check(root) != -1\n    def check(self, node):\n        if not node:\n            return 0\n        l = self.check(node.left)\n        if l == -1:\n            return -1\n        r = self.check(node.right)\n        if r == -1:\n            return -1\n        if abs(l - r) > 1:\n            return -1\n        return 1 + max(l, r)' },
    ],
  },
  {
    title: 'Binary Tree Level Order Traversal',
    problemNumber: 102,
    description: 'Given the `root` of a binary tree, return the level order traversal of its nodes\' values (i.e., from left to right, level by level).\n\n**Output format:** One line per level, values space-separated.',
    difficulty: 'medium',
    tags: 'tree',
    harnessType: 'tree-list-of-lists',
    methodName: 'levelOrder',
    visibleTestCases: [
      { input: '3 9 20 null null 15 7', output: '3\n9 20\n15 7', explanation: 'Level 0: [3], Level 1: [9,20], Level 2: [15,7].' },
      { input: '1', output: '1', explanation: 'Single node.' },
    ],
        hiddenTestCases: [
      { input: '1', output: '1' },
      { input: '1 2 3 4 5', output: '1\n2 3\n4 5' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    vector<vector<int>> levelOrder(TreeNode* root) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public List<List<Integer>> levelOrder(TreeNode root) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def levelOrder(self, root: TreeNode) -> List[List[int]]:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    vector<vector<int>> levelOrder(TreeNode* root) {\n        vector<vector<int>> res;\n        if (!root) return res;\n        queue<TreeNode*> q;\n        q.push(root);\n        while (!q.empty()) {\n            int sz = q.size();\n            vector<int> level;\n            for (int i = 0; i < sz; i++) {\n                TreeNode* node = q.front(); q.pop();\n                level.push_back(node->val);\n                if (node->left) q.push(node->left);\n                if (node->right) q.push(node->right);\n            }\n            res.push_back(level);\n        }\n        return res;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public List<List<Integer>> levelOrder(TreeNode root) {\n        List<List<Integer>> res = new ArrayList<>();\n        if (root == null) return res;\n        Queue<TreeNode> q = new LinkedList<>();\n        q.offer(root);\n        while (!q.isEmpty()) {\n            int sz = q.size();\n            List<Integer> level = new ArrayList<>();\n            for (int i = 0; i < sz; i++) {\n                TreeNode node = q.poll();\n                level.add(node.val);\n                if (node.left != null) q.offer(node.left);\n                if (node.right != null) q.offer(node.right);\n            }\n            res.add(level);\n        }\n        return res;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def levelOrder(self, root: TreeNode) -> List[List[int]]:\n        res = []\n        if not root:\n            return res\n        q = deque([root])\n        while q:\n            level = []\n            for _ in range(len(q)):\n                node = q.popleft()\n                level.append(node.val)\n                if node.left: q.append(node.left)\n                if node.right: q.append(node.right)\n            res.append(level)\n        return res' },
    ],
  },
  {
    title: 'Binary Tree Right Side View',
    problemNumber: 199,
    description: 'Given the `root` of a binary tree, imagine yourself standing on the right side of it, return the values of the nodes you can see ordered from top to bottom.',
    difficulty: 'medium',
    tags: 'tree',
    harnessType: 'tree-list',
    methodName: 'rightSideView',
    visibleTestCases: [
      { input: '1 2 3 null 5 null 4', output: '1 3 4', explanation: 'Rightmost at each level: 1, 3, 4.' },
      { input: '1 2 3 4 null null null 5', output: '1 3 4 5', explanation: 'Rightmost at each level.' },
    ],
    hiddenTestCases: [
      { input: '1 null 3', output: '1 3' },
      { input: '1 2', output: '1 2' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    vector<int> rightSideView(TreeNode* root) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public List<Integer> rightSideView(TreeNode root) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def rightSideView(self, root: TreeNode) -> List[int]:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    vector<int> rightSideView(TreeNode* root) {\n        vector<int> res;\n        if (!root) return res;\n        queue<TreeNode*> q;\n        q.push(root);\n        while (!q.empty()) {\n            int sz = q.size();\n            for (int i = 0; i < sz; i++) {\n                TreeNode* node = q.front(); q.pop();\n                if (i == sz - 1) res.push_back(node->val);\n                if (node->left) q.push(node->left);\n                if (node->right) q.push(node->right);\n            }\n        }\n        return res;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public List<Integer> rightSideView(TreeNode root) {\n        List<Integer> res = new ArrayList<>();\n        if (root == null) return res;\n        Queue<TreeNode> q = new LinkedList<>();\n        q.offer(root);\n        while (!q.isEmpty()) {\n            int sz = q.size();\n            for (int i = 0; i < sz; i++) {\n                TreeNode node = q.poll();\n                if (i == sz - 1) res.add(node.val);\n                if (node.left != null) q.offer(node.left);\n                if (node.right != null) q.offer(node.right);\n            }\n        }\n        return res;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def rightSideView(self, root: TreeNode) -> List[int]:\n        res = []\n        if not root:\n            return res\n        q = deque([root])\n        while q:\n            sz = len(q)\n            for i in range(sz):\n                node = q.popleft()\n                if i == sz - 1:\n                    res.append(node.val)\n                if node.left: q.append(node.left)\n                if node.right: q.append(node.right)\n        return res' },
    ],
  },
  {
    title: 'Binary Tree Zigzag Level Order Traversal',
    problemNumber: 103,
    description: 'Given the `root` of a binary tree, return the zigzag level order traversal of its nodes\' values (i.e., from left to right, then right to left for the next level and alternate between).\n\n**Output format:** One line per level, values space-separated.',
    difficulty: 'medium',
    tags: 'tree',
    harnessType: 'tree-list-of-lists',
    methodName: 'zigzagLevelOrder',
    visibleTestCases: [
      { input: '3 9 20 null null 15 7', output: '3\n20 9\n15 7', explanation: 'Level 0: [3], Level 1 reversed: [20,9], Level 2: [15,7].' },
      { input: '1', output: '1', explanation: 'Single node.' },
    ],
    hiddenTestCases: [
      { input: '1 2 3 4 5', output: '1\n3 2\n4 5' },
      { input: '1 2 3', output: '1\n3 2' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    vector<vector<int>> zigzagLevelOrder(TreeNode* root) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public List<List<Integer>> zigzagLevelOrder(TreeNode root) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def zigzagLevelOrder(self, root: TreeNode) -> List[List[int]]:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    vector<vector<int>> zigzagLevelOrder(TreeNode* root) {\n        vector<vector<int>> res;\n        if (!root) return res;\n        queue<TreeNode*> q;\n        q.push(root);\n        bool leftToRight = true;\n        while (!q.empty()) {\n            int sz = q.size();\n            vector<int> level(sz);\n            for (int i = 0; i < sz; i++) {\n                TreeNode* node = q.front(); q.pop();\n                int idx = leftToRight ? i : (sz - 1 - i);\n                level[idx] = node->val;\n                if (node->left) q.push(node->left);\n                if (node->right) q.push(node->right);\n            }\n            res.push_back(level);\n            leftToRight = !leftToRight;\n        }\n        return res;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public List<List<Integer>> zigzagLevelOrder(TreeNode root) {\n        List<List<Integer>> res = new ArrayList<>();\n        if (root == null) return res;\n        Queue<TreeNode> q = new LinkedList<>();\n        q.offer(root);\n        boolean leftToRight = true;\n        while (!q.isEmpty()) {\n            int sz = q.size();\n            List<Integer> level = new ArrayList<>(Collections.nCopies(sz, 0));\n            for (int i = 0; i < sz; i++) {\n                TreeNode node = q.poll();\n                int idx = leftToRight ? i : (sz - 1 - i);\n                level.set(idx, node.val);\n                if (node.left != null) q.offer(node.left);\n                if (node.right != null) q.offer(node.right);\n            }\n            res.add(level);\n            leftToRight = !leftToRight;\n        }\n        return res;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def zigzagLevelOrder(self, root: TreeNode) -> List[List[int]]:\n        res = []\n        if not root:\n            return res\n        q = deque([root])\n        left_to_right = True\n        while q:\n            sz = len(q)\n            level = [0] * sz\n            for i in range(sz):\n                node = q.popleft()\n                idx = i if left_to_right else (sz - 1 - i)\n                level[idx] = node.val\n                if node.left: q.append(node.left)\n                if node.right: q.append(node.right)\n            res.append(level)\n            left_to_right = not left_to_right\n        return res' },
    ],
  },
  {
    title: 'Kth Smallest Element in a BST',
    problemNumber: 230,
    description: 'Given the `root` of a binary search tree, and an integer `k`, return the `k-th` smallest value (1-indexed) of all the values of the nodes in the tree.\n\n**Input format:** Line 1 = tree (level order), Line 2 = k.',
    difficulty: 'medium',
    tags: 'tree',
    harnessType: 'tree-int-int',
    methodName: 'kthSmallest',
    visibleTestCases: [
      { input: '3 1 4 null 2\n1', output: '1', explanation: 'In-order: 1,2,3,4 — 1st smallest is 1.' },
      { input: '5 3 6 2 4 null null 1\n3', output: '3', explanation: 'In-order: 1,2,3,4,5,6 — 3rd smallest is 3.' },
    ],
    hiddenTestCases: [
      { input: '1\n1', output: '1' },
      { input: '2 1\n2', output: '2' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int kthSmallest(TreeNode* root, int k) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int kthSmallest(TreeNode root, int k) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def kthSmallest(self, root: TreeNode, k: int) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int kthSmallest(TreeNode* root, int k) {\n        vector<int> vals;\n        inorder(root, vals);\n        return vals[k - 1];\n    }\nprivate:\n    void inorder(TreeNode* node, vector<int>& vals) {\n        if (!node) return;\n        inorder(node->left, vals);\n        vals.push_back(node->val);\n        inorder(node->right, vals);\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int kthSmallest(TreeNode root, int k) {\n        List<Integer> vals = new ArrayList<>();\n        inorder(root, vals);\n        return vals.get(k - 1);\n    }\n    private void inorder(TreeNode node, List<Integer> vals) {\n        if (node == null) return;\n        inorder(node.left, vals);\n        vals.add(node.val);\n        inorder(node.right, vals);\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def kthSmallest(self, root: TreeNode, k: int) -> int:\n        vals = []\n        def inorder(node):\n            if not node: return\n            inorder(node.left)\n            vals.append(node.val)\n            inorder(node.right)\n        inorder(root)\n        return vals[k - 1]' },
    ],
  },
  {
    title: 'Lowest Common Ancestor of a Binary Search Tree',
    problemNumber: 235,
    description: 'Given a binary search tree (BST), find the lowest common ancestor (LCA) of two given nodes in the BST.\n\nThe LCA is defined between two nodes `p` and `q` as the lowest node in the tree that has both `p` and `q` as descendants (where a node can be a descendant of itself).\n\n**Input format:** Line 1 = tree, Line 2 = p value, Line 3 = q value. Output is the LCA node\'s value.',
    difficulty: 'easy',
    tags: 'tree',
    harnessType: 'tree-two-values-int',
    methodName: 'lowestCommonAncestor',
    visibleTestCases: [
      { input: '6 2 8 0 4 7 9 null null 3 5\n2\n8', output: '6', explanation: '2 is in left subtree of 6, 8 is in right subtree — LCA is 6.' },
      { input: '6 2 8 0 4 7 9 null null 3 5\n2\n4', output: '2', explanation: '4 is descendant of 2 — LCA is 2.' },
    ],
    hiddenTestCases: [
      { input: '2 1\n2\n1', output: '2' },
      { input: '2 1\n1\n2', output: '2' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def lowestCommonAncestor(self, root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {\n        while (root) {\n            if (p->val < root->val && q->val < root->val) root = root->left;\n            else if (p->val > root->val && q->val > root->val) root = root->right;\n            else return root;\n        }\n        return nullptr;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {\n        while (root != null) {\n            if (p.val < root.val && q.val < root.val) root = root.left;\n            else if (p.val > root.val && q.val > root.val) root = root.right;\n            else return root;\n        }\n        return null;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def lowestCommonAncestor(self, root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:\n        while root:\n            if p.val < root.val and q.val < root.val:\n                root = root.left\n            elif p.val > root.val and q.val > root.val:\n                root = root.right\n            else:\n                return root\n        return None' },
    ],
  },
  {
    title: 'Lowest Common Ancestor of a Binary Tree',
    problemNumber: 236,
    description: 'Given a binary tree, find the lowest common ancestor (LCA) of two given nodes in the tree.\n\nThe LCA is defined between two nodes `p` and `q` as the lowest node in the tree that has both `p` and `q` as descendants (where a node can be a descendant of itself).\n\n**Input format:** Line 1 = tree, Line 2 = p value, Line 3 = q value. Output is the LCA node\'s value.',
    difficulty: 'medium',
    tags: 'tree',
    harnessType: 'tree-two-values-int',
    methodName: 'lowestCommonAncestor',
    visibleTestCases: [
      { input: '3 5 1 6 2 0 8 null null 7 4\n5\n1', output: '3', explanation: '5 in left subtree, 1 in right subtree — LCA is 3.' },
      { input: '3 5 1 6 2 0 8 null null 7 4\n5\n4', output: '5', explanation: '4 is descendant of 5 — LCA is 5.' },
    ],
    hiddenTestCases: [
      { input: '1 2\n1\n2', output: '1' },
      { input: '1 2\n2\n1', output: '1' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def lowestCommonAncestor(self, root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {\n        if (!root || root == p || root == q) return root;\n        TreeNode* left = lowestCommonAncestor(root->left, p, q);\n        TreeNode* right = lowestCommonAncestor(root->right, p, q);\n        if (left && right) return root;\n        return left ? left : right;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {\n        if (root == null || root == p || root == q) return root;\n        TreeNode left = lowestCommonAncestor(root.left, p, q);\n        TreeNode right = lowestCommonAncestor(root.right, p, q);\n        if (left != null && right != null) return root;\n        return left != null ? left : right;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def lowestCommonAncestor(self, root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:\n        if not root or root is p or root is q:\n            return root\n        left = self.lowestCommonAncestor(root.left, p, q)\n        right = self.lowestCommonAncestor(root.right, p, q)\n        if left and right:\n            return root\n        return left if left else right' },
    ],
  },
  {
    title: 'Validate Binary Search Tree',
    problemNumber: 98,
    description: 'Given the `root` of a binary tree, determine if it is a valid binary search tree (BST).\n\nA valid BST has:\n- The left subtree of a node contains only nodes with keys less than the node\'s key.\n- The right subtree of a node contains only nodes with keys greater than the node\'s key.\n- Both left and right subtrees must also be BSTs.',
    difficulty: 'medium',
    tags: 'tree',
    harnessType: 'tree-bool',
    methodName: 'isValidBST',
    visibleTestCases: [
      { input: '2 1 3', output: 'true', explanation: 'Valid BST.' },
      { input: '5 1 4 null null 3 6', output: 'false', explanation: '4 is right child of 5 but has child 3 < 5.' },
    ],
    hiddenTestCases: [
      { input: 'null', output: 'true' },
      { input: '1', output: 'true' },
      { input: '5 4 6 null null 3 7', output: 'false' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    bool isValidBST(TreeNode* root) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public boolean isValidBST(TreeNode root) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def isValidBST(self, root: TreeNode) -> bool:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    bool isValidBST(TreeNode* root) {\n        return validate(root, LONG_MIN, LONG_MAX);\n    }\nprivate:\n    bool validate(TreeNode* node, long low, long high) {\n        if (!node) return true;\n        if (node->val <= low || node->val >= high) return false;\n        return validate(node->left, low, node->val) && validate(node->right, node->val, high);\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public boolean isValidBST(TreeNode root) {\n        return validate(root, Long.MIN_VALUE, Long.MAX_VALUE);\n    }\n    private boolean validate(TreeNode node, long low, long high) {\n        if (node == null) return true;\n        if (node.val <= low || node.val >= high) return false;\n        return validate(node.left, low, node.val) && validate(node.right, node.val, high);\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def isValidBST(self, root: TreeNode) -> bool:\n        def validate(node, low, high):\n            if not node:\n                return True\n            if node.val <= low or node.val >= high:\n                return False\n            return validate(node.left, low, node.val) and validate(node.right, node.val, high)\n        return validate(root, float(\'-inf\'), float(\'inf\'))' },
    ],
  },
  {
    title: 'Count Good Nodes in Binary Tree',
    problemNumber: 1448,
    description: 'Given a binary tree `root`, a node X in the tree is named **good** if in the path from root to X there are no nodes with a value greater than X.\n\nReturn the number of **good** nodes in the binary tree.',
    difficulty: 'medium',
    tags: 'tree',
    harnessType: 'tree-int',
    methodName: 'goodNodes',
    visibleTestCases: [
      { input: '3 1 4 3 null 1 5', output: '4', explanation: 'Good nodes: 3, 3 (left of 1), 4, 5.' },
      { input: '3 3 null 4 2', output: '3', explanation: 'Good nodes: 3, 3, 4.' },
    ],
    hiddenTestCases: [
      { input: '1', output: '1' },
      { input: '1 2 3', output: '3' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int goodNodes(TreeNode* root) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int goodNodes(TreeNode root) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def goodNodes(self, root: TreeNode) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int goodNodes(TreeNode* root) {\n        return dfs(root, INT_MIN);\n    }\nprivate:\n    int dfs(TreeNode* node, int maxSoFar) {\n        if (!node) return 0;\n        int count = node->val >= maxSoFar ? 1 : 0;\n        int newMax = max(maxSoFar, node->val);\n        return count + dfs(node->left, newMax) + dfs(node->right, newMax);\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int goodNodes(TreeNode root) {\n        return dfs(root, Integer.MIN_VALUE);\n    }\n    private int dfs(TreeNode node, int maxSoFar) {\n        if (node == null) return 0;\n        int count = node.val >= maxSoFar ? 1 : 0;\n        int newMax = Math.max(maxSoFar, node.val);\n        return count + dfs(node.left, newMax) + dfs(node.right, newMax);\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def goodNodes(self, root: TreeNode) -> int:\n        def dfs(node, max_so_far):\n            if not node:\n                return 0\n            count = 1 if node.val >= max_so_far else 0\n            new_max = max(max_so_far, node.val)\n            return count + dfs(node.left, new_max) + dfs(node.right, new_max)\n        return dfs(root, float(\'-inf\'))' },
    ],
  },
  {
    title: 'Construct Binary Tree from Preorder and Inorder Traversal',
    problemNumber: 105,
    description: 'Given two integer arrays `preorder` and `inorder` where `preorder` is the preorder traversal of a binary tree and `inorder` is the inorder traversal of the same tree, construct and return the binary tree.\n\n**Input format:** Line 1 = preorder array, Line 2 = inorder array.\n\n**Output format:** Level-order array of the constructed tree.',
    difficulty: 'medium',
    tags: 'tree',
    harnessType: 'two-arrays-tree',
    methodName: 'buildTree',
    visibleTestCases: [
      { input: '3 9 20 15 7\n9 3 15 20 7', output: '3 9 20 null null 15 7', explanation: 'Root 3; left subtree [9]; right subtree [20,15,7].' },
      { input: '1 2\n2 1', output: '1 2', explanation: 'Root 1 with left child 2.' },
    ],
    hiddenTestCases: [
      { input: '-1\n-1', output: '-1' },
      { input: '1 2 3\n2 1 3', output: '1 2 3' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public TreeNode buildTree(int[] preorder, int[] inorder) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def buildTree(self, preorder: List[int], inorder: List[int]) -> TreeNode:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {\n        unordered_map<int, int> inMap;\n        for (int i = 0; i < inorder.size(); i++) inMap[inorder[i]] = i;\n        return build(preorder, inMap, 0, preorder.size() - 1, 0);\n    }\nprivate:\n    TreeNode* build(vector<int>& pre, unordered_map<int,int>& inMap, int preL, int preR, int inL) {\n        if (preL > preR) return nullptr;\n        TreeNode* root = new TreeNode(pre[preL]);\n        int inIdx = inMap[pre[preL]];\n        int leftSize = inIdx - inL;\n        root->left = build(pre, inMap, preL + 1, preL + leftSize, inL);\n        root->right = build(pre, inMap, preL + leftSize + 1, preR, inIdx + 1);\n        return root;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    private Map<Integer, Integer> inMap = new HashMap<>();\n    public TreeNode buildTree(int[] preorder, int[] inorder) {\n        for (int i = 0; i < inorder.length; i++) inMap.put(inorder[i], i);\n        return build(preorder, 0, preorder.length - 1, 0);\n    }\n    private TreeNode build(int[] pre, int preL, int preR, int inL) {\n        if (preL > preR) return null;\n        TreeNode root = new TreeNode(pre[preL]);\n        int inIdx = inMap.get(pre[preL]);\n        int leftSize = inIdx - inL;\n        root.left = build(pre, preL + 1, preL + leftSize, inL);\n        root.right = build(pre, preL + leftSize + 1, preR, inIdx + 1);\n        return root;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def buildTree(self, preorder: List[int], inorder: List[int]) -> TreeNode:\n        in_map = {v: i for i, v in enumerate(inorder)}\n        def build(pre_l, pre_r, in_l):\n            if pre_l > pre_r:\n                return None\n            root = TreeNode(preorder[pre_l])\n            in_idx = in_map[preorder[pre_l]]\n            left_size = in_idx - in_l\n            root.left = build(pre_l + 1, pre_l + left_size, in_l)\n            root.right = build(pre_l + left_size + 1, pre_r, in_idx + 1)\n            return root\n        return build(0, len(preorder) - 1, 0)' },
    ],
  },
  {
    title: 'Binary Tree Maximum Path Sum',
    problemNumber: 124,
    description: 'A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. A node can only appear in the sequence at most once. The path does not need to pass through the root.\n\nThe path sum of a path is the sum of the node\'s values in the path.\n\nGiven the `root` of a binary tree, return the maximum path sum of any non-empty path.',
    difficulty: 'hard',
    tags: 'tree',
    harnessType: 'tree-int',
    methodName: 'maxPathSum',
    visibleTestCases: [
      { input: '1 2 3', output: '6', explanation: 'Path 2→1→3, sum 6.' },
      { input: '-10 9 20 null null 15 7', output: '42', explanation: 'Path 15→20→7, sum 42.' },
    ],
    hiddenTestCases: [
      { input: '-3', output: '-3' },
      { input: '2 -1', output: '2' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int maxPathSum(TreeNode* root) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int maxPathSum(TreeNode root) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def maxPathSum(self, root: TreeNode) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int maxPathSum(TreeNode* root) {\n        int best = INT_MIN;\n        gain(root, best);\n        return best;\n    }\nprivate:\n    int gain(TreeNode* node, int& best) {\n        if (!node) return 0;\n        int l = max(gain(node->left, best), 0);\n        int r = max(gain(node->right, best), 0);\n        best = max(best, node->val + l + r);\n        return node->val + max(l, r);\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    private int best = Integer.MIN_VALUE;\n    public int maxPathSum(TreeNode root) {\n        gain(root);\n        return best;\n    }\n    private int gain(TreeNode node) {\n        if (node == null) return 0;\n        int l = Math.max(gain(node.left), 0);\n        int r = Math.max(gain(node.right), 0);\n        best = Math.max(best, node.val + l + r);\n        return node.val + Math.max(l, r);\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def maxPathSum(self, root: TreeNode) -> int:\n        self.best = float(\'-inf\')\n        def gain(node):\n            if not node:\n                return 0\n            l = max(gain(node.left), 0)\n            r = max(gain(node.right), 0)\n            self.best = max(self.best, node.val + l + r)\n            return node.val + max(l, r)\n        gain(root)\n        return self.best' },
    ],
  },
  {
    title: 'Subtree of Another Tree',
    problemNumber: 572,
    description: 'Given the roots of two binary trees `root` and `subRoot`, return `true` if there is a subtree of `root` with the same structure and node values of `subRoot` and `false` otherwise.\n\nA subtree of a binary tree `tree` is a tree that consists of a node in `tree` and all of this node\'s descendants. The tree `tree` could also be considered a subtree of itself.\n\n**Input format:** Two lines of level-order arrays.',
    difficulty: 'easy',
    tags: 'tree',
    harnessType: 'two-trees-bool',
    methodName: 'isSubtree',
    visibleTestCases: [
      { input: '3 4 5 1 2\n4 1 2', output: 'true', explanation: 'Root\'s left subtree (4,1,2) matches subRoot.' },
      { input: '3 4 5 1 2 null null null null 0\n4 1 2', output: 'false', explanation: 'Node 2 in root\'s tree has extra child 0.' },
    ],
    hiddenTestCases: [
      { input: '1\n1', output: 'true' },
      { input: '1 2\n1', output: 'true' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    bool isSubtree(TreeNode* root, TreeNode* subRoot) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public boolean isSubtree(TreeNode root, TreeNode subRoot) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def isSubtree(self, root: TreeNode, subRoot: TreeNode) -> bool:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    bool isSubtree(TreeNode* root, TreeNode* subRoot) {\n        if (!root) return false;\n        if (same(root, subRoot)) return true;\n        return isSubtree(root->left, subRoot) || isSubtree(root->right, subRoot);\n    }\nprivate:\n    bool same(TreeNode* a, TreeNode* b) {\n        if (!a && !b) return true;\n        if (!a || !b) return false;\n        if (a->val != b->val) return false;\n        return same(a->left, b->left) && same(a->right, b->right);\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public boolean isSubtree(TreeNode root, TreeNode subRoot) {\n        if (root == null) return false;\n        if (same(root, subRoot)) return true;\n        return isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);\n    }\n    private boolean same(TreeNode a, TreeNode b) {\n        if (a == null && b == null) return true;\n        if (a == null || b == null) return false;\n        if (a.val != b.val) return false;\n        return same(a.left, b.left) && same(a.right, b.right);\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def isSubtree(self, root: TreeNode, subRoot: TreeNode) -> bool:\n        if not root:\n            return False\n        def same(a, b):\n            if not a and not b:\n                return True\n            if not a or not b:\n                return False\n            if a.val != b.val:\n                return False\n            return same(a.left, b.left) and same(a.right, b.right)\n        if same(root, subRoot):\n            return True\n        return self.isSubtree(root.left, subRoot) or self.isSubtree(root.right, subRoot)' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// SEED
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

    // Pre-build harnesses for all problems
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

    // Load existing problems
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
            Array.isArray(existingFull.testHarness) &&
            existingFull.testHarness.length >= 3 &&
            Array.isArray(existingFull.visibleTestCases) &&
            existingFull.visibleTestCases.length > 0
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
          console.log(`✅ Updated "${p.title}" (#${p.problemNumber}) — made runnable`);
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
    console.log(`🎉 Tree problems batch complete`);
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