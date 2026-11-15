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
// GRID + GRAPH HELPERS (inlined into every harness)
// ─────────────────────────────────────────────────────────────

const CPP_HELPER = `#include <iostream>
#include <sstream>
#include <string>
#include <vector>
#include <queue>
#include <unordered_map>
#include <unordered_set>
#include <algorithm>
#include <functional>
#include <climits>
using namespace std;

vector<vector<int>> readIntGrid(int rows, int cols) {
    vector<vector<int>> g(rows, vector<int>(cols));
    for (int i = 0; i < rows; i++) for (int j = 0; j < cols; j++) cin >> g[i][j];
    return g;
}

vector<vector<char>> readCharGrid(int rows, int cols) {
    vector<vector<char>> g(rows, vector<char>(cols));
    for (int i = 0; i < rows; i++) for (int j = 0; j < cols; j++) cin >> g[i][j];
    return g;
}

void printIntGrid(const vector<vector<int>>& g) {
    for (auto& r : g) {
        for (size_t j = 0; j < r.size(); j++) { if (j) cout << " "; cout << r[j]; }
        cout << endl;
    }
}

void printCharGrid(const vector<vector<char>>& g) {
    for (auto& r : g) {
        for (size_t j = 0; j < r.size(); j++) { if (j) cout << " "; cout << r[j]; }
        cout << endl;
    }
}

vector<vector<int>> readEdges() {
    string line; getline(cin, line);
    stringstream ss(line);
    vector<int> flat; int x;
    while (ss >> x) flat.push_back(x);
    vector<vector<int>> edges;
    for (size_t i = 0; i + 1 < flat.size(); i += 2) edges.push_back({flat[i], flat[i+1]});
    return edges;
}
`;

const JAVA_HELPER = `import java.util.*;
import java.util.stream.*;

class GridUtil {
    static int[][] readIntGrid(Scanner sc, int rows, int cols) {
        int[][] g = new int[rows][cols];
        for (int i = 0; i < rows; i++) for (int j = 0; j < cols; j++) g[i][j] = sc.nextInt();
        return g;
    }

    static char[][] readCharGrid(Scanner sc, int rows, int cols) {
        char[][] g = new char[rows][cols];
        for (int i = 0; i < rows; i++) for (int j = 0; j < cols; j++) g[i][j] = sc.next().charAt(0);
        return g;
    }

    static void printIntGrid(int[][] g) {
        for (int[] r : g) {
            StringBuilder sb = new StringBuilder();
            for (int j = 0; j < r.length; j++) { if (j > 0) sb.append(" "); sb.append(r[j]); }
            System.out.println(sb.toString());
        }
    }

    static void printCharGrid(char[][] g) {
        for (char[] r : g) {
            StringBuilder sb = new StringBuilder();
            for (int j = 0; j < r.length; j++) { if (j > 0) sb.append(" "); sb.append(r[j]); }
            System.out.println(sb.toString());
        }
    }

    static int[][] readEdges(Scanner sc) {
        String line = sc.nextLine().trim();
        if (line.isEmpty()) return new int[0][2];
        String[] tokens = line.split("\\\\s+");
        int[][] edges = new int[tokens.length / 2][2];
        for (int i = 0; i < tokens.length; i += 2) {
            edges[i/2][0] = Integer.parseInt(tokens[i]);
            edges[i/2][1] = Integer.parseInt(tokens[i+1]);
        }
        return edges;
    }
}
`;

const PY_HELPER = `import sys
from typing import List
from collections import deque

def read_int_grid(rows, cols):
    return [list(map(int, input().split())) for _ in range(rows)]

def read_char_grid(rows, cols):
    return [input().split() for _ in range(rows)]

def print_int_grid(grid):
    for row in grid:
        print(' '.join(map(str, row)))

def print_char_grid(grid):
    for row in grid:
        print(' '.join(row))
`;

// ─────────────────────────────────────────────────────────────
// HARNESS BUILDERS
// ─────────────────────────────────────────────────────────────

function buildCppHarness(type, method) {
  const setup = {
    'gridchar-int': `int rows, cols; cin >> rows >> cols; auto grid = readCharGrid(rows, cols);`,
    'gridint-int': `int rows, cols; cin >> rows >> cols; auto grid = readIntGrid(rows, cols);`,
    'gridchar-bool': `int rows, cols; cin >> rows >> cols; auto grid = readCharGrid(rows, cols);`,
    'gridint-inplace': `int rows, cols; cin >> rows >> cols; auto grid = readIntGrid(rows, cols);`,
    'gridchar-inplace': `int rows, cols; cin >> rows >> cols; auto grid = readCharGrid(rows, cols);`,
    'gridint-list': `int rows, cols; cin >> rows >> cols; auto grid = readIntGrid(rows, cols);`,
    'gridint-pairs': `int rows, cols; cin >> rows >> cols; auto grid = readIntGrid(rows, cols);`,
    'gridchar-word-bool': `int rows, cols; cin >> rows >> cols; auto grid = readCharGrid(rows, cols); string word; cin >> word;`,
    'gridchar-words-list': `int rows, cols; cin >> rows >> cols; auto grid = readCharGrid(rows, cols); cin.ignore(); string wl; getline(cin, wl); stringstream wss(wl); vector<string> words; string w; while (wss >> w) words.push_back(w);`,
    'n-edges-bool': `int n; cin >> n; cin.ignore(); auto edges = readEdges();`,
    'n-edges-list': `int n; cin >> n; cin.ignore(); auto edges = readEdges();`,
    'words-int': `string beginWord, endWord; getline(cin, beginWord); getline(cin, endWord); string wl; getline(cin, wl); stringstream wss(wl); vector<string> wordList; string w; while (wss >> w) wordList.push_back(w);`,
  };

  const call = {
    'gridchar-int': `Solution sol; cout << sol.${method}(grid) << endl;`,
    'gridint-int': `Solution sol; cout << sol.${method}(grid) << endl;`,
    'gridchar-bool': `Solution sol; cout << (sol.${method}(grid) ? "true" : "false") << endl;`,
    'gridint-inplace': `Solution sol; sol.${method}(grid); printIntGrid(grid);`,
    'gridchar-inplace': `Solution sol; sol.${method}(grid); printCharGrid(grid);`,
    'gridint-list': `Solution sol; auto res = sol.${method}(grid); for (size_t i = 0; i < res.size(); i++) { if (i) cout << " "; cout << res[i]; } cout << endl;`,
    'gridint-pairs': `Solution sol; auto res = sol.${method}(grid); sort(res.begin(), res.end()); for (auto& p : res) cout << p[0] << " " << p[1] << endl;`,
    'gridchar-word-bool': `Solution sol; cout << (sol.${method}(grid, word) ? "true" : "false") << endl;`,
    'gridchar-words-list': `Solution sol; auto res = sol.${method}(grid, words); sort(res.begin(), res.end()); for (auto& s : res) cout << s << endl;`,
    'n-edges-bool': `Solution sol; cout << (sol.${method}(n, edges) ? "true" : "false") << endl;`,
    'n-edges-list': `Solution sol; auto res = sol.${method}(n, edges); for (size_t i = 0; i < res.size(); i++) { if (i) cout << " "; cout << res[i]; } cout << endl;`,
    'words-int': `Solution sol; cout << sol.${method}(beginWord, endWord, wordList) << endl;`,
  };

  return `${CPP_HELPER}\n{{USER_CODE}}\n\nint main() {\n    ${setup[type]}\n    ${call[type]}\n    return 0;\n}`;
}

function buildJavaHarness(type, method) {
  const setup = {
    'gridchar-int': `int rows = sc.nextInt(), cols = sc.nextInt(); char[][] grid = GridUtil.readCharGrid(sc, rows, cols);`,
    'gridint-int': `int rows = sc.nextInt(), cols = sc.nextInt(); int[][] grid = GridUtil.readIntGrid(sc, rows, cols);`,
    'gridchar-bool': `int rows = sc.nextInt(), cols = sc.nextInt(); char[][] grid = GridUtil.readCharGrid(sc, rows, cols);`,
    'gridint-inplace': `int rows = sc.nextInt(), cols = sc.nextInt(); int[][] grid = GridUtil.readIntGrid(sc, rows, cols);`,
    'gridchar-inplace': `int rows = sc.nextInt(), cols = sc.nextInt(); char[][] grid = GridUtil.readCharGrid(sc, rows, cols);`,
    'gridint-list': `int rows = sc.nextInt(), cols = sc.nextInt(); int[][] grid = GridUtil.readIntGrid(sc, rows, cols);`,
    'gridint-pairs': `int rows = sc.nextInt(), cols = sc.nextInt(); int[][] grid = GridUtil.readIntGrid(sc, rows, cols);`,
    'gridchar-word-bool': `int rows = sc.nextInt(), cols = sc.nextInt(); char[][] grid = GridUtil.readCharGrid(sc, rows, cols); String word = sc.next();`,
    'gridchar-words-list': `int rows = sc.nextInt(), cols = sc.nextInt(); char[][] grid = GridUtil.readCharGrid(sc, rows, cols); sc.nextLine(); String[] ws = sc.nextLine().trim().split("\\\\s+");`,
    'n-edges-bool': `int n = Integer.parseInt(sc.nextLine().trim()); int[][] edges = GridUtil.readEdges(sc);`,
    'n-edges-list': `int n = Integer.parseInt(sc.nextLine().trim()); int[][] edges = GridUtil.readEdges(sc);`,
    'words-int': `String beginWord = sc.nextLine().trim(); String endWord = sc.nextLine().trim(); String[] ws = sc.nextLine().trim().split("\\\\s+");`,
  };

  const call = {
    'gridchar-int': `Solution sol = new Solution(); System.out.println(sol.${method}(grid));`,
    'gridint-int': `Solution sol = new Solution(); System.out.println(sol.${method}(grid));`,
    'gridchar-bool': `Solution sol = new Solution(); System.out.println(sol.${method}(grid) ? "true" : "false");`,
    'gridint-inplace': `Solution sol = new Solution(); sol.${method}(grid); GridUtil.printIntGrid(grid);`,
    'gridchar-inplace': `Solution sol = new Solution(); sol.${method}(grid); GridUtil.printCharGrid(grid);`,
    'gridint-list': `Solution sol = new Solution(); List<Integer> res = sol.${method}(grid); StringBuilder sb = new StringBuilder(); for (int i = 0; i < res.size(); i++) { if (i > 0) sb.append(" "); sb.append(res.get(i)); } System.out.println(sb.toString());`,
    'gridint-pairs': `Solution sol = new Solution(); List<List<Integer>> res = sol.${method}(grid); res.sort((a, b) -> a.get(0) != b.get(0) ? a.get(0) - b.get(0) : a.get(1) - b.get(1)); for (List<Integer> p : res) System.out.println(p.get(0) + " " + p.get(1));`,
    'gridchar-word-bool': `Solution sol = new Solution(); System.out.println(sol.${method}(grid, word) ? "true" : "false");`,
    'gridchar-words-list': `Solution sol = new Solution(); List<String> res = sol.${method}(grid, ws); Collections.sort(res); for (String s : res) System.out.println(s);`,
    'n-edges-bool': `Solution sol = new Solution(); System.out.println(sol.${method}(n, edges) ? "true" : "false");`,
    'n-edges-list': `Solution sol = new Solution(); int[] res = sol.${method}(n, edges); StringBuilder sb = new StringBuilder(); for (int i = 0; i < res.length; i++) { if (i > 0) sb.append(" "); sb.append(res[i]); } System.out.println(sb.toString());`,
    'words-int': `Solution sol = new Solution(); System.out.println(sol.${method}(beginWord, endWord, Arrays.asList(ws)));`,
  };

  return `${JAVA_HELPER}\n{{USER_CODE}}\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        ${setup[type]}\n        ${call[type]}\n    }\n}`;
}

function buildPyHarness(type, method) {
  const setup = {
    'gridchar-int': `rows, cols = map(int, input().split())\ngrid = read_char_grid(rows, cols)`,
    'gridint-int': `rows, cols = map(int, input().split())\ngrid = read_int_grid(rows, cols)`,
    'gridchar-bool': `rows, cols = map(int, input().split())\ngrid = read_char_grid(rows, cols)`,
    'gridint-inplace': `rows, cols = map(int, input().split())\ngrid = read_int_grid(rows, cols)`,
    'gridchar-inplace': `rows, cols = map(int, input().split())\ngrid = read_char_grid(rows, cols)`,
    'gridint-list': `rows, cols = map(int, input().split())\ngrid = read_int_grid(rows, cols)`,
    'gridint-pairs': `rows, cols = map(int, input().split())\ngrid = read_int_grid(rows, cols)`,
    'gridchar-word-bool': `rows, cols = map(int, input().split())\ngrid = read_char_grid(rows, cols)\nword = input().strip()`,
    'gridchar-words-list': `rows, cols = map(int, input().split())\ngrid = read_char_grid(rows, cols)\nwords = input().split()`,
    'n-edges-bool': `n = int(input().strip())\nline = input().strip()\nflat = list(map(int, line.split())) if line else []\nedges = [[flat[i], flat[i+1]] for i in range(0, len(flat), 2)]`,
    'n-edges-list': `n = int(input().strip())\nline = input().strip()\nflat = list(map(int, line.split())) if line else []\nedges = [[flat[i], flat[i+1]] for i in range(0, len(flat), 2)]`,
    'words-int': `begin = input().strip()\nend = input().strip()\nword_list = input().split()`,
  };

  const call = {
    'gridchar-int': `print(Solution().${method}(grid))`,
    'gridint-int': `print(Solution().${method}(grid))`,
    'gridchar-bool': `print("true" if Solution().${method}(grid) else "false")`,
    'gridint-inplace': `Solution().${method}(grid)\nprint_int_grid(grid)`,
    'gridchar-inplace': `Solution().${method}(grid)\nprint_char_grid(grid)`,
    'gridint-list': `res = Solution().${method}(grid)\nprint(' '.join(map(str, res)))`,
    'gridint-pairs': `res = Solution().${method}(grid)\nres.sort()\nfor p in res:\n    print(f"{p[0]} {p[1]}")`,
    'gridchar-word-bool': `print("true" if Solution().${method}(grid, word) else "false")`,
    'gridchar-words-list': `res = Solution().${method}(grid, words)\nres.sort()\nfor s in res:\n    print(s)`,
    'n-edges-bool': `print("true" if Solution().${method}(n, edges) else "false")`,
    'n-edges-list': `res = Solution().${method}(n, edges)\nprint(' '.join(map(str, res)))`,
    'words-int': `print(Solution().${method}(begin, end, word_list))`,
  };

  return `${PY_HELPER}\n{{USER_CODE}}\n\ndef main():\n    ${setup[type].split('\n').join('\n    ')}\n    ${call[type].split('\n').join('\n    ')}\n\nif __name__ == "__main__":\n    main()`;
}

// ─────────────────────────────────────────────────────────────
// PROBLEM DATA (13 graph/grid problems)
// ─────────────────────────────────────────────────────────────

const problemsData = [
  {
    title: 'Number of Islands',
    problemNumber: 200,
    description: 'Given an `m x n` 2D binary grid `grid` which represents a map of `"1"`s (land) and `"0"`s (water), return the number of islands.\n\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.\n\n**Input format:** Line 1 = rows cols, then grid rows (space-separated chars).',
    difficulty: 'medium',
    tags: 'graph',
    harnessType: 'gridchar-int',
    methodName: 'numIslands',
    visibleTestCases: [
      { input: '4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0', output: '1', explanation: 'All 1s form a single connected island.' },
      { input: '4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1', output: '3', explanation: 'Three separate islands.' },
    ],
    hiddenTestCases: [
      { input: '1 1\n1', output: '1' },
      { input: '1 1\n0', output: '0' },
      { input: '2 2\n1 0\n0 1', output: '2' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int numIslands(char[][] grid) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def numIslands(self, grid: List[List[str]]) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        int count = 0;\n        for (int i = 0; i < grid.size(); i++)\n            for (int j = 0; j < grid[0].size(); j++)\n                if (grid[i][j] == \'1\') { count++; dfs(grid, i, j); }\n        return count;\n    }\nprivate:\n    void dfs(vector<vector<char>>& g, int i, int j) {\n        if (i < 0 || i >= g.size() || j < 0 || j >= g[0].size() || g[i][j] != \'1\') return;\n        g[i][j] = \'0\';\n        dfs(g, i+1, j); dfs(g, i-1, j); dfs(g, i, j+1); dfs(g, i, j-1);\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int numIslands(char[][] grid) {\n        int count = 0;\n        for (int i = 0; i < grid.length; i++)\n            for (int j = 0; j < grid[0].length; j++)\n                if (grid[i][j] == \'1\') { count++; dfs(grid, i, j); }\n        return count;\n    }\n    private void dfs(char[][] g, int i, int j) {\n        if (i < 0 || i >= g.length || j < 0 || j >= g[0].length || g[i][j] != \'1\') return;\n        g[i][j] = \'0\';\n        dfs(g, i+1, j); dfs(g, i-1, j); dfs(g, i, j+1); dfs(g, i, j-1);\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def numIslands(self, grid: List[List[str]]) -> int:\n        count = 0\n        def dfs(i, j):\n            if i < 0 or i >= len(grid) or j < 0 or j >= len(grid[0]) or grid[i][j] != \'1\':\n                return\n            grid[i][j] = \'0\'\n            dfs(i+1, j); dfs(i-1, j); dfs(i, j+1); dfs(i, j-1)\n        for i in range(len(grid)):\n            for j in range(len(grid[0])):\n                if grid[i][j] == \'1\':\n                    count += 1\n                    dfs(i, j)\n        return count' },
    ],
  },
  {
    title: 'Rotting Oranges',
    problemNumber: 994,
    description: 'You are given an `m x n` grid where each cell can have one of three values:\n- `0` representing an empty cell,\n- `1` representing a fresh orange, or\n- `2` representing a rotten orange.\n\nEvery minute, any fresh orange that is 4-directionally adjacent to a rotten orange becomes rotten.\n\nReturn the minimum number of minutes that must elapse until no cell has a fresh orange. If this is impossible, return `-1`.',
    difficulty: 'medium',
    tags: 'graph',
    harnessType: 'gridint-int',
    methodName: 'orangesRotting',
    visibleTestCases: [
      { input: '3 3\n2 1 1\n1 1 0\n0 1 1', output: '4', explanation: 'All oranges rot in 4 minutes.' },
      { input: '3 3\n2 1 1\n0 1 1\n1 0 1', output: '-1', explanation: 'Bottom-left orange can never rot.' },
    ],
    hiddenTestCases: [
      { input: '1 1\n0', output: '0' },
      { input: '1 1\n1', output: '-1' },
      { input: '1 1\n2', output: '0' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int orangesRotting(vector<vector<int>>& grid) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int orangesRotting(int[][] grid) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def orangesRotting(self, grid: List[List[int]]) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int orangesRotting(vector<vector<int>>& grid) {\n        int m = grid.size(), n = grid[0].size(), fresh = 0;\n        queue<pair<int,int>> q;\n        for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) {\n            if (grid[i][j] == 2) q.push({i,j});\n            else if (grid[i][j] == 1) fresh++;\n        }\n        if (fresh == 0) return 0;\n        int minutes = 0;\n        int dirs[4][2] = {{1,0},{-1,0},{0,1},{0,-1}};\n        while (!q.empty()) {\n            int sz = q.size();\n            bool any = false;\n            for (int k = 0; k < sz; k++) {\n                auto [i,j] = q.front(); q.pop();\n                for (auto& d : dirs) {\n                    int ni = i + d[0], nj = j + d[1];\n                    if (ni >= 0 && ni < m && nj >= 0 && nj < n && grid[ni][nj] == 1) {\n                        grid[ni][nj] = 2; fresh--; q.push({ni,nj}); any = true;\n                    }\n                }\n            }\n            if (any) minutes++;\n        }\n        return fresh == 0 ? minutes : -1;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int orangesRotting(int[][] grid) {\n        int m = grid.length, n = grid[0].length, fresh = 0;\n        Queue<int[]> q = new LinkedList<>();\n        for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) {\n            if (grid[i][j] == 2) q.offer(new int[]{i,j});\n            else if (grid[i][j] == 1) fresh++;\n        }\n        if (fresh == 0) return 0;\n        int minutes = 0;\n        int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};\n        while (!q.isEmpty()) {\n            int sz = q.size();\n            boolean any = false;\n            for (int k = 0; k < sz; k++) {\n                int[] cur = q.poll();\n                for (int[] d : dirs) {\n                    int ni = cur[0] + d[0], nj = cur[1] + d[1];\n                    if (ni >= 0 && ni < m && nj >= 0 && nj < n && grid[ni][nj] == 1) {\n                        grid[ni][nj] = 2; fresh--; q.offer(new int[]{ni,nj}); any = true;\n                    }\n                }\n            }\n            if (any) minutes++;\n        }\n        return fresh == 0 ? minutes : -1;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def orangesRotting(self, grid: List[List[int]]) -> int:\n        m, n = len(grid), len(grid[0])\n        q = deque()\n        fresh = 0\n        for i in range(m):\n            for j in range(n):\n                if grid[i][j] == 2: q.append((i,j))\n                elif grid[i][j] == 1: fresh += 1\n        if fresh == 0:\n            return 0\n        minutes = 0\n        while q:\n            any_rot = False\n            for _ in range(len(q)):\n                i, j = q.popleft()\n                for di, dj in [(1,0),(-1,0),(0,1),(0,-1)]:\n                    ni, nj = i + di, j + dj\n                    if 0 <= ni < m and 0 <= nj < n and grid[ni][nj] == 1:\n                        grid[ni][nj] = 2\n                        fresh -= 1\n                        q.append((ni,nj))\n                        any_rot = True\n            if any_rot: minutes += 1\n        return minutes if fresh == 0 else -1' },
    ],
  },
  {
    title: 'Course Schedule',
    problemNumber: 207,
    description: 'There are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. You are given an array `prerequisites` where `prerequisites[i] = [a_i, b_i]` indicates that you must take course `b_i` first if you want to take course `a_i`.\n\nReturn `true` if you can finish all courses. Otherwise, return `false`.\n\n**Input format:** Line 1 = numCourses, Line 2 = flat edge pairs (`a b c d` = edges `[a,b]`, `[c,d]`). Empty line 2 = no edges.',
    difficulty: 'medium',
    tags: 'graph',
    harnessType: 'n-edges-bool',
    methodName: 'canFinish',
    visibleTestCases: [
      { input: '2\n1 0', output: 'true', explanation: 'Take course 0 before 1. No cycle.' },
      { input: '2\n1 0 0 1', output: 'false', explanation: 'Cycle: 0 → 1 → 0.' },
    ],
    hiddenTestCases: [
      { input: '1\n', output: 'true' },
      { input: '3\n1 0 2 1', output: 'true' },
      { input: '3\n1 0 0 1 2 0', output: 'false' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public boolean canFinish(int numCourses, int[][] prerequisites) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    bool canFinish(int n, vector<vector<int>>& pre) {\n        vector<vector<int>> adj(n);\n        vector<int> indeg(n, 0);\n        for (auto& p : pre) { adj[p[1]].push_back(p[0]); indeg[p[0]]++; }\n        queue<int> q;\n        for (int i = 0; i < n; i++) if (indeg[i] == 0) q.push(i);\n        int seen = 0;\n        while (!q.empty()) {\n            int c = q.front(); q.pop(); seen++;\n            for (int nx : adj[c]) if (--indeg[nx] == 0) q.push(nx);\n        }\n        return seen == n;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public boolean canFinish(int n, int[][] pre) {\n        List<List<Integer>> adj = new ArrayList<>();\n        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());\n        int[] indeg = new int[n];\n        for (int[] p : pre) { adj.get(p[1]).add(p[0]); indeg[p[0]]++; }\n        Queue<Integer> q = new LinkedList<>();\n        for (int i = 0; i < n; i++) if (indeg[i] == 0) q.offer(i);\n        int seen = 0;\n        while (!q.isEmpty()) {\n            int c = q.poll(); seen++;\n            for (int nx : adj.get(c)) if (--indeg[nx] == 0) q.offer(nx);\n        }\n        return seen == n;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def canFinish(self, n: int, pre: List[List[int]]) -> bool:\n        adj = [[] for _ in range(n)]\n        indeg = [0] * n\n        for a, b in pre:\n            adj[b].append(a)\n            indeg[a] += 1\n        q = deque([i for i in range(n) if indeg[i] == 0])\n        seen = 0\n        while q:\n            c = q.popleft()\n            seen += 1\n            for nx in adj[c]:\n                indeg[nx] -= 1\n                if indeg[nx] == 0:\n                    q.append(nx)\n        return seen == n' },
    ],
  },
  {
    title: 'Course Schedule II',
    problemNumber: 210,
    description: 'There are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. You are given an array `prerequisites` where `prerequisites[i] = [a_i, b_i]` indicates that you must take course `b_i` first if you want to take course `a_i`.\n\nReturn the ordering of courses you should take to finish all courses. If there are many valid answers, return any of them. If it is impossible to finish all courses, return an empty array.\n\n**Input format:** Line 1 = numCourses, Line 2 = flat edge pairs.\n\n**Note:** Test cases here have **unique** answers to allow deterministic comparison.',
    difficulty: 'medium',
    tags: 'graph',
    harnessType: 'n-edges-list',
    methodName: 'findOrder',
    visibleTestCases: [
      { input: '2\n1 0', output: '0 1', explanation: 'Take 0 first, then 1.' },
      { input: '4\n1 0 2 1 3 2', output: '0 1 2 3', explanation: 'Chain: 0 → 1 → 2 → 3.' },
    ],
        hiddenTestCases: [
      { input: '1\n', output: '0' },
      { input: '2\n1 0', output: '0 1' },
      { input: '3\n1 0 2 1', output: '0 1 2' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    vector<int> findOrder(int numCourses, vector<vector<int>>& prerequisites) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int[] findOrder(int numCourses, int[][] prerequisites) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def findOrder(self, numCourses: int, prerequisites: List[List[int]]) -> List[int]:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    vector<int> findOrder(int n, vector<vector<int>>& pre) {\n        vector<vector<int>> adj(n);\n        vector<int> indeg(n, 0);\n        for (auto& p : pre) { adj[p[1]].push_back(p[0]); indeg[p[0]]++; }\n        queue<int> q;\n        for (int i = 0; i < n; i++) if (indeg[i] == 0) q.push(i);\n        vector<int> order;\n        while (!q.empty()) {\n            int c = q.front(); q.pop(); order.push_back(c);\n            for (int nx : adj[c]) if (--indeg[nx] == 0) q.push(nx);\n        }\n        if ((int)order.size() != n) return {};\n        return order;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int[] findOrder(int n, int[][] pre) {\n        List<List<Integer>> adj = new ArrayList<>();\n        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());\n        int[] indeg = new int[n];\n        for (int[] p : pre) { adj.get(p[1]).add(p[0]); indeg[p[0]]++; }\n        Queue<Integer> q = new LinkedList<>();\n        for (int i = 0; i < n; i++) if (indeg[i] == 0) q.offer(i);\n        int[] order = new int[n];\n        int idx = 0;\n        while (!q.isEmpty()) {\n            int c = q.poll(); order[idx++] = c;\n            for (int nx : adj.get(c)) if (--indeg[nx] == 0) q.offer(nx);\n        }\n        if (idx != n) return new int[0];\n        return order;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def findOrder(self, n: int, pre: List[List[int]]) -> List[int]:\n        adj = [[] for _ in range(n)]\n        indeg = [0] * n\n        for a, b in pre:\n            adj[b].append(a)\n            indeg[a] += 1\n        q = deque([i for i in range(n) if indeg[i] == 0])\n        order = []\n        while q:\n            c = q.popleft()\n            order.append(c)\n            for nx in adj[c]:\n                indeg[nx] -= 1\n                if indeg[nx] == 0:\n                    q.append(nx)\n        return order if len(order) == n else []' },
    ],
  },
  {
    title: 'Word Ladder',
    problemNumber: 127,
    description: 'A transformation sequence from word `beginWord` to word `endWord` using a dictionary `wordList` is a sequence of words where every adjacent pair differs by a single letter, and every word is in the dictionary.\n\nReturn the number of words in the shortest transformation sequence, or 0 if no such sequence exists.\n\n**Input format:** Line 1 = beginWord, Line 2 = endWord, Line 3 = wordList (space-separated).',
    difficulty: 'hard',
    tags: 'graph',
    harnessType: 'words-int',
    methodName: 'ladderLength',
    visibleTestCases: [
      { input: 'hit\ncog\nhot dot dog lot log cog', output: '5', explanation: 'hit → hot → dot → dog → cog (5 words).' },
      { input: 'hit\ncog\nhot dot dog lot log', output: '0', explanation: 'cog not in dictionary.' },
    ],
    hiddenTestCases: [
      { input: 'a\nc\na b c', output: '3' },
      { input: 'ab\nac\nab ac', output: '2' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int ladderLength(String beginWord, String endWord, List<String> wordList) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def ladderLength(self, beginWord: str, endWord: str, wordList: List[str]) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int ladderLength(string begin, string end, vector<string>& words) {\n        unordered_set<string> dict(words.begin(), words.end());\n        if (!dict.count(end)) return 0;\n        queue<string> q;\n        q.push(begin);\n        int len = 1;\n        while (!q.empty()) {\n            int sz = q.size();\n            for (int k = 0; k < sz; k++) {\n                string w = q.front(); q.pop();\n                if (w == end) return len;\n                for (int i = 0; i < w.size(); i++) {\n                    char orig = w[i];\n                    for (char c = \'a\'; c <= \'z\'; c++) {\n                        if (c == orig) continue;\n                        w[i] = c;\n                        if (dict.count(w)) { dict.erase(w); q.push(w); }\n                    }\n                    w[i] = orig;\n                }\n            }\n            len++;\n        }\n        return 0;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int ladderLength(String begin, String end, List<String> words) {\n        Set<String> dict = new HashSet<>(words);\n        if (!dict.contains(end)) return 0;\n        Queue<String> q = new LinkedList<>();\n        q.offer(begin);\n        int len = 1;\n        while (!q.isEmpty()) {\n            int sz = q.size();\n            for (int k = 0; k < sz; k++) {\n                char[] w = q.poll().toCharArray();\n                if (new String(w).equals(end)) return len;\n                for (int i = 0; i < w.length; i++) {\n                    char orig = w[i];\n                    for (char c = \'a\'; c <= \'z\'; c++) {\n                        if (c == orig) continue;\n                        w[i] = c;\n                        String s = new String(w);\n                        if (dict.contains(s)) { dict.remove(s); q.offer(s); }\n                    }\n                    w[i] = orig;\n                }\n            }\n            len++;\n        }\n        return 0;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def ladderLength(self, begin: str, end: str, words: List[str]) -> int:\n        dict_set = set(words)\n        if end not in dict_set:\n            return 0\n        q = deque([begin])\n        length = 1\n        while q:\n            for _ in range(len(q)):\n                w = q.popleft()\n                if w == end:\n                    return length\n                for i in range(len(w)):\n                    for c in \'abcdefghijklmnopqrstuvwxyz\':\n                        if c == w[i]:\n                            continue\n                        nw = w[:i] + c + w[i+1:]\n                        if nw in dict_set:\n                            dict_set.remove(nw)\n                            q.append(nw)\n            length += 1\n        return 0' },
    ],
  },
  {
    title: 'Pacific Atlantic Water Flow',
    problemNumber: 417,
    description: 'There is an `m x n` rectangular island that borders both the Pacific Ocean (top and left) and Atlantic Ocean (bottom and right).\n\nGiven an `m x n` integer matrix `heights`, return a list of grid coordinates `[r, c]` where rain water can flow to both the Pacific and Atlantic oceans.\n\nWater can flow in 4 directions if the adjacent cell\'s height is less than or equal to the current cell\'s height.\n\n**Output format:** Each coordinate on its own line, sorted.',
    difficulty: 'medium',
    tags: 'graph',
    harnessType: 'gridint-pairs',
    methodName: 'pacificAtlantic',
    visibleTestCases: [
      { input: '5 5\n1 2 2 3 5\n3 2 3 4 4\n2 4 5 3 1\n6 7 1 4 5\n5 1 1 2 4', output: '0 4\n1 3\n1 4\n2 2\n3 0\n3 1\n4 0', explanation: 'Cells reachable from both oceans.' },
      { input: '1 1\n1', output: '0 0', explanation: 'Single cell touches both oceans.' },
    ],
    hiddenTestCases: [
      { input: '2 2\n1 1\n1 1', output: '0 0\n0 1\n1 0\n1 1' },
      { input: '2 3\n1 2 3\n4 5 6', output: '1 2' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    vector<vector<int>> pacificAtlantic(vector<vector<int>>& heights) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public List<List<Integer>> pacificAtlantic(int[][] heights) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def pacificAtlantic(self, heights: List[List[int]]) -> List[List[int]]:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    vector<vector<int>> pacificAtlantic(vector<vector<int>>& h) {\n        if (h.empty()) return {};\n        int m = h.size(), n = h[0].size();\n        vector<vector<bool>> pac(m, vector<bool>(n, false)), atl(m, vector<bool>(n, false));\n        int dirs[4][2] = {{1,0},{-1,0},{0,1},{0,-1}};\n        function<void(int,int,vector<vector<bool>>&)> dfs = [&](int i, int j, vector<vector<bool>>& seen) {\n            seen[i][j] = true;\n            for (auto& d : dirs) {\n                int ni = i + d[0], nj = j + d[1];\n                if (ni >= 0 && ni < m && nj >= 0 && nj < n && !seen[ni][nj] && h[ni][nj] >= h[i][j])\n                    dfs(ni, nj, seen);\n            }\n        };\n        for (int i = 0; i < m; i++) { dfs(i, 0, pac); dfs(i, n-1, atl); }\n        for (int j = 0; j < n; j++) { dfs(0, j, pac); dfs(m-1, j, atl); }\n        vector<vector<int>> res;\n        for (int i = 0; i < m; i++) for (int j = 0; j < n; j++)\n            if (pac[i][j] && atl[i][j]) res.push_back({i,j});\n        return res;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public List<List<Integer>> pacificAtlantic(int[][] h) {\n        List<List<Integer>> res = new ArrayList<>();\n        if (h.length == 0) return res;\n        int m = h.length, n = h[0].length;\n        boolean[][] pac = new boolean[m][n], atl = new boolean[m][n];\n        for (int i = 0; i < m; i++) { dfs(h, i, 0, pac); dfs(h, i, n-1, atl); }\n        for (int j = 0; j < n; j++) { dfs(h, 0, j, pac); dfs(h, m-1, j, atl); }\n        for (int i = 0; i < m; i++) for (int j = 0; j < n; j++)\n            if (pac[i][j] && atl[i][j]) res.add(Arrays.asList(i, j));\n        return res;\n    }\n    private void dfs(int[][] h, int i, int j, boolean[][] seen) {\n        if (i < 0 || i >= h.length || j < 0 || j >= h[0].length || seen[i][j]) return;\n        seen[i][j] = true;\n        int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};\n        for (int[] d : dirs) {\n            int ni = i + d[0], nj = j + d[1];\n            if (ni >= 0 && ni < h.length && nj >= 0 && nj < h[0].length && !seen[ni][nj] && h[ni][nj] >= h[i][j])\n                dfs(h, ni, nj, seen);\n        }\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def pacificAtlantic(self, h: List[List[int]]) -> List[List[int]]:\n        if not h:\n            return []\n        m, n = len(h), len(h[0])\n        pac = [[False]*n for _ in range(m)]\n        atl = [[False]*n for _ in range(m)]\n        def dfs(i, j, seen):\n            if seen[i][j]:\n                return\n            seen[i][j] = True\n            for di, dj in [(1,0),(-1,0),(0,1),(0,-1)]:\n                ni, nj = i + di, j + dj\n                if 0 <= ni < m and 0 <= nj < n and not seen[ni][nj] and h[ni][nj] >= h[i][j]:\n                    dfs(ni, nj, seen)\n        for i in range(m):\n            dfs(i, 0, pac)\n            dfs(i, n-1, atl)\n        for j in range(n):\n            dfs(0, j, pac)\n            dfs(m-1, j, atl)\n        return [[i, j] for i in range(m) for j in range(n) if pac[i][j] and atl[i][j]]' },
    ],
  },
  {
    title: 'Valid Sudoku',
    problemNumber: 36,
    description: 'Determine if a `9 x 9` Sudoku board is valid. Only the filled cells need to be validated according to the following rules:\n\n1. Each row must contain the digits `1-9` without repetition.\n2. Each column must contain the digits `1-9` without repetition.\n3. Each of the nine `3 x 3` sub-boxes must contain the digits `1-9` without repetition.\n\nEmpty cells are represented by `.`.',
    difficulty: 'medium',
    tags: 'array',
    harnessType: 'gridchar-bool',
    methodName: 'isValidSudoku',
    visibleTestCases: [
      { input: '9 9\n5 3 . . 7 . . . .\n6 . . 1 9 5 . . .\n. 9 8 . . . . 6 .\n8 . . . 6 . . . 3\n4 . . 8 . 3 . . 1\n7 . . . 2 . . . 6\n. 6 . . . . 2 8 .\n. . . 4 1 9 . . 5\n. . . . 8 . . 7 9', output: 'true', explanation: 'Valid Sudoku.' },
      { input: '9 9\n8 3 . . 7 . . . .\n6 . . 1 9 5 . . .\n. 9 8 . . . . 6 .\n8 . . . 6 . . . 3\n4 . . 8 . 3 . . 1\n7 . . . 2 . . . 6\n. 6 . . . . 2 8 .\n. . . 4 1 9 . . 5\n. . . . 8 . . 7 9', output: 'false', explanation: 'Two 8s in column 1.' },
    ],
    hiddenTestCases: [
      { input: '9 9\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .', output: 'true' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    bool isValidSudoku(vector<vector<char>>& board) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public boolean isValidSudoku(char[][] board) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def isValidSudoku(self, board: List[List[str]]) -> bool:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    bool isValidSudoku(vector<vector<char>>& b) {\n        int rows[9][9] = {}, cols[9][9] = {}, boxes[9][9] = {};\n        for (int i = 0; i < 9; i++) for (int j = 0; j < 9; j++) {\n            if (b[i][j] == \'.\') continue;\n            int v = b[i][j] - \'1\';\n            int bi = (i/3)*3 + (j/3);\n            if (rows[i][v] || cols[j][v] || boxes[bi][v]) return false;\n            rows[i][v] = cols[j][v] = boxes[bi][v] = 1;\n        }\n        return true;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public boolean isValidSudoku(char[][] b) {\n        int[][] rows = new int[9][9], cols = new int[9][9], boxes = new int[9][9];\n        for (int i = 0; i < 9; i++) for (int j = 0; j < 9; j++) {\n            if (b[i][j] == \'.\') continue;\n            int v = b[i][j] - \'1\';\n            int bi = (i/3)*3 + (j/3);\n            if (rows[i][v]++ > 0 || cols[j][v]++ > 0 || boxes[bi][v]++ > 0) return false;\n        }\n        return true;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def isValidSudoku(self, b: List[List[str]]) -> bool:\n        rows = [set() for _ in range(9)]\n        cols = [set() for _ in range(9)]\n        boxes = [set() for _ in range(9)]\n        for i in range(9):\n            for j in range(9):\n                v = b[i][j]\n                if v == \'.\':\n                    continue\n                bi = (i // 3) * 3 + (j // 3)\n                if v in rows[i] or v in cols[j] or v in boxes[bi]:\n                    return False\n                rows[i].add(v)\n                cols[j].add(v)\n                boxes[bi].add(v)\n        return True' },
    ],
  },
  {
    title: 'Word Search',
    problemNumber: 79,
    description: 'Given an `m x n` grid of characters `board` and a string `word`, return `true` if `word` exists in the grid.\n\nThe word can be constructed from letters of sequentially adjacent cells (horizontally or vertically neighboring). The same cell may not be used more than once.\n\n**Input format:** Line 1 = rows cols, then grid rows, then the word on its own line.',
    difficulty: 'medium',
    tags: 'backtracking',
    harnessType: 'gridchar-word-bool',
    methodName: 'exist',
    visibleTestCases: [
      { input: '3 4\nA B C E\nS F C S\nA D E E\nABCCED', output: 'true', explanation: 'Word can be traced through grid.' },
      { input: '3 4\nA B C E\nS F C S\nA D E E\nABCB', output: 'false', explanation: 'Cannot reuse cell B.' },
    ],
    hiddenTestCases: [
      { input: '1 1\nA\nA', output: 'true' },
      { input: '1 1\nA\nB', output: 'false' },
      { input: '3 4\nA B C E\nS F C S\nA D E E\nSEE', output: 'true' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    bool exist(vector<vector<char>>& board, string word) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public boolean exist(char[][] board, String word) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def exist(self, board: List[List[str]], word: str) -> bool:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    bool exist(vector<vector<char>>& b, string word) {\n        int m = b.size(), n = b[0].size();\n        for (int i = 0; i < m; i++) for (int j = 0; j < n; j++)\n            if (dfs(b, word, 0, i, j)) return true;\n        return false;\n    }\nprivate:\n    bool dfs(vector<vector<char>>& b, string& w, int idx, int i, int j) {\n        if (idx == w.size()) return true;\n        if (i < 0 || i >= b.size() || j < 0 || j >= b[0].size() || b[i][j] != w[idx]) return false;\n        char tmp = b[i][j]; b[i][j] = \'#\';\n        bool found = dfs(b, w, idx+1, i+1, j) || dfs(b, w, idx+1, i-1, j) || dfs(b, w, idx+1, i, j+1) || dfs(b, w, idx+1, i, j-1);\n        b[i][j] = tmp;\n        return found;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public boolean exist(char[][] b, String word) {\n        for (int i = 0; i < b.length; i++) for (int j = 0; j < b[0].length; j++)\n            if (dfs(b, word, 0, i, j)) return true;\n        return false;\n    }\n    private boolean dfs(char[][] b, String w, int idx, int i, int j) {\n        if (idx == w.length()) return true;\n        if (i < 0 || i >= b.length || j < 0 || j >= b[0].length || b[i][j] != w.charAt(idx)) return false;\n        char tmp = b[i][j]; b[i][j] = \'#\';\n        boolean found = dfs(b, w, idx+1, i+1, j) || dfs(b, w, idx+1, i-1, j) || dfs(b, w, idx+1, i, j+1) || dfs(b, w, idx+1, i, j-1);\n        b[i][j] = tmp;\n        return found;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def exist(self, b: List[List[str]], word: str) -> bool:\n        m, n = len(b), len(b[0])\n        def dfs(i, j, idx):\n            if idx == len(word):\n                return True\n            if i < 0 or i >= m or j < 0 or j >= n or b[i][j] != word[idx]:\n                return False\n            tmp = b[i][j]\n            b[i][j] = \'#\'\n            found = dfs(i+1, j, idx+1) or dfs(i-1, j, idx+1) or dfs(i, j+1, idx+1) or dfs(i, j-1, idx+1)\n            b[i][j] = tmp\n            return found\n        for i in range(m):\n            for j in range(n):\n                if dfs(i, j, 0):\n                    return True\n        return False' },
    ],
  },
  {
    title: 'Spiral Matrix',
    problemNumber: 54,
    description: 'Given an `m x n` matrix, return all elements of the matrix in spiral order.\n\n**Output format:** Flat list, space-separated.',
    difficulty: 'medium',
    tags: 'array',
    harnessType: 'gridint-list',
    methodName: 'spiralOrder',
    visibleTestCases: [
      { input: '3 3\n1 2 3\n4 5 6\n7 8 9', output: '1 2 3 6 9 8 7 4 5', explanation: 'Spiral traversal.' },
      { input: '3 4\n1 2 3 4\n5 6 7 8\n9 10 11 12', output: '1 2 3 4 8 12 11 10 9 5 6 7', explanation: 'Spiral on non-square matrix.' },
    ],
    hiddenTestCases: [
      { input: '1 1\n1', output: '1' },
      { input: '1 3\n1 2 3', output: '1 2 3' },
      { input: '3 1\n1\n2\n3', output: '1 2 3' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    vector<int> spiralOrder(vector<vector<int>>& matrix) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public List<Integer> spiralOrder(int[][] matrix) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def spiralOrder(self, matrix: List[List[int]]) -> List[int]:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    vector<int> spiralOrder(vector<vector<int>>& m) {\n        vector<int> res;\n        if (m.empty()) return res;\n        int top = 0, bot = m.size() - 1, left = 0, right = m[0].size() - 1;\n        while (top <= bot && left <= right) {\n            for (int j = left; j <= right; j++) res.push_back(m[top][j]);\n            top++;\n            for (int i = top; i <= bot; i++) res.push_back(m[i][right]);\n            right--;\n            if (top <= bot) { for (int j = right; j >= left; j--) res.push_back(m[bot][j]); bot--; }\n            if (left <= right) { for (int i = bot; i >= top; i--) res.push_back(m[i][left]); left++; }\n        }\n        return res;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public List<Integer> spiralOrder(int[][] m) {\n        List<Integer> res = new ArrayList<>();\n        if (m.length == 0) return res;\n        int top = 0, bot = m.length - 1, left = 0, right = m[0].length - 1;\n        while (top <= bot && left <= right) {\n            for (int j = left; j <= right; j++) res.add(m[top][j]);\n            top++;\n            for (int i = top; i <= bot; i++) res.add(m[i][right]);\n            right--;\n            if (top <= bot) { for (int j = right; j >= left; j--) res.add(m[bot][j]); bot--; }\n            if (left <= right) { for (int i = bot; i >= top; i--) res.add(m[i][left]); left++; }\n        }\n        return res;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def spiralOrder(self, m: List[List[int]]) -> List[int]:\n        if not m:\n            return []\n        res = []\n        top, bot, left, right = 0, len(m)-1, 0, len(m[0])-1\n        while top <= bot and left <= right:\n            for j in range(left, right+1): res.append(m[top][j])\n            top += 1\n            for i in range(top, bot+1): res.append(m[i][right])\n            right -= 1\n            if top <= bot:\n                for j in range(right, left-1, -1): res.append(m[bot][j])\n                bot -= 1\n            if left <= right:\n                for i in range(bot, top-1, -1): res.append(m[i][left])\n                left += 1\n        return res' },
    ],
  },
  {
    title: 'Rotate Image',
    problemNumber: 48,
    description: 'You are given an `n x n` 2D matrix representing an image, rotate the image by 90 degrees (clockwise).\n\nYou have to rotate the image **in-place**, which means you have to modify the input 2D matrix directly.',
    difficulty: 'medium',
    tags: 'array',
    harnessType: 'gridint-inplace',
    methodName: 'rotate',
    visibleTestCases: [
      { input: '3 3\n1 2 3\n4 5 6\n7 8 9', output: '7 4 1\n8 5 2\n9 6 3', explanation: 'Rotated 90° clockwise.' },
      { input: '2 2\n1 2\n3 4', output: '3 1\n4 2', explanation: '2x2 rotation.' },
    ],
    hiddenTestCases: [
      { input: '1 1\n1', output: '1' },
      { input: '4 4\n1 2 3 4\n5 6 7 8\n9 10 11 12\n13 14 15 16', output: '13 9 5 1\n14 10 6 2\n15 11 7 3\n16 12 8 4' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    void rotate(vector<vector<int>>& matrix) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public void rotate(int[][] matrix) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def rotate(self, matrix: List[List[int]]) -> None:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    void rotate(vector<vector<int>>& m) {\n        int n = m.size();\n        for (int i = 0; i < n; i++) for (int j = i+1; j < n; j++) swap(m[i][j], m[j][i]);\n        for (int i = 0; i < n; i++) reverse(m[i].begin(), m[i].end());\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public void rotate(int[][] m) {\n        int n = m.length;\n        for (int i = 0; i < n; i++) for (int j = i+1; j < n; j++) {\n            int t = m[i][j]; m[i][j] = m[j][i]; m[j][i] = t;\n        }\n        for (int i = 0; i < n; i++) {\n            int l = 0, r = n - 1;\n            while (l < r) { int t = m[i][l]; m[i][l] = m[i][r]; m[i][r] = t; l++; r--; }\n        }\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def rotate(self, m: List[List[int]]) -> None:\n        n = len(m)\n        for i in range(n):\n            for j in range(i+1, n):\n                m[i][j], m[j][i] = m[j][i], m[i][j]\n        for i in range(n):\n            m[i].reverse()' },
    ],
  },
  {
    title: 'Set Matrix Zeroes',
    problemNumber: 73,
    description: 'Given an `m x n` integer matrix `matrix`, if an element is `0`, set its entire row and column to `0\'s`.\n\nYou must do it in-place.',
    difficulty: 'medium',
    tags: 'array',
    harnessType: 'gridint-inplace',
    methodName: 'setZeroes',
    visibleTestCases: [
      { input: '3 3\n1 1 1\n1 0 1\n1 1 1', output: '1 0 1\n0 0 0\n1 0 1', explanation: 'Middle cell zeroes its row and column.' },
      { input: '3 4\n0 1 2 0\n3 4 5 2\n1 3 1 5', output: '0 0 0 0\n0 4 5 0\n0 3 1 0', explanation: 'Two zeroes zero out their rows/columns.' },
    ],
    hiddenTestCases: [
      { input: '1 1\n0', output: '0' },
      { input: '1 1\n1', output: '1' },
      { input: '2 2\n1 1\n1 1', output: '1 1\n1 1' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    void setZeroes(vector<vector<int>>& matrix) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public void setZeroes(int[][] matrix) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def setZeroes(self, matrix: List[List[int]]) -> None:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    void setZeroes(vector<vector<int>>& m) {\n        int R = m.size(), C = m[0].size();\n        bool firstRow = false, firstCol = false;\n        for (int i = 0; i < R; i++) if (m[i][0] == 0) firstCol = true;\n        for (int j = 0; j < C; j++) if (m[0][j] == 0) firstRow = true;\n        for (int i = 1; i < R; i++) for (int j = 1; j < C; j++)\n            if (m[i][j] == 0) { m[i][0] = 0; m[0][j] = 0; }\n        for (int i = 1; i < R; i++) for (int j = 1; j < C; j++)\n            if (m[i][0] == 0 || m[0][j] == 0) m[i][j] = 0;\n        if (firstRow) for (int j = 0; j < C; j++) m[0][j] = 0;\n        if (firstCol) for (int i = 0; i < R; i++) m[i][0] = 0;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public void setZeroes(int[][] m) {\n        int R = m.length, C = m[0].length;\n        boolean firstRow = false, firstCol = false;\n        for (int i = 0; i < R; i++) if (m[i][0] == 0) firstCol = true;\n        for (int j = 0; j < C; j++) if (m[0][j] == 0) firstRow = true;\n        for (int i = 1; i < R; i++) for (int j = 1; j < C; j++)\n            if (m[i][j] == 0) { m[i][0] = 0; m[0][j] = 0; }\n        for (int i = 1; i < R; i++) for (int j = 1; j < C; j++)\n            if (m[i][0] == 0 || m[0][j] == 0) m[i][j] = 0;\n        if (firstRow) for (int j = 0; j < C; j++) m[0][j] = 0;\n        if (firstCol) for (int i = 0; i < R; i++) m[i][0] = 0;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def setZeroes(self, m: List[List[int]]) -> None:\n        R, C = len(m), len(m[0])\n        first_row = any(m[0][j] == 0 for j in range(C))\n        first_col = any(m[i][0] == 0 for i in range(R))\n        for i in range(1, R):\n            for j in range(1, C):\n                if m[i][j] == 0:\n                    m[i][0] = 0\n                    m[0][j] = 0\n        for i in range(1, R):\n            for j in range(1, C):\n                if m[i][0] == 0 or m[0][j] == 0:\n                    m[i][j] = 0\n        if first_row:\n            for j in range(C): m[0][j] = 0\n        if first_col:\n            for i in range(R): m[i][0] = 0' },
    ],
  },
  {
    title: 'Surrounded Regions',
    problemNumber: 130,
    description: 'Given an `m x n` matrix `board` containing `"X"` and `"O"`, capture all regions that are 4-directionally surrounded by `"X"`.\n\nA region is captured by flipping all `"O"`s into `"X"`s in that surrounded region.\n\n**Note:** Any `"O"` on the border of the board cannot be captured.',
    difficulty: 'medium',
    tags: 'graph',
    harnessType: 'gridchar-inplace',
    methodName: 'solve',
    visibleTestCases: [
      { input: '4 4\nX X X X\nX O O X\nX X O X\nX O X X', output: 'X X X X\nX X X X\nX X X X\nX O X X', explanation: 'Bottom O touches border, stays O.' },
      { input: '1 1\nX', output: 'X', explanation: 'Single X.' },
    ],
    hiddenTestCases: [
      { input: '1 1\nO', output: 'O' },
      { input: '3 3\nX X X\nX O X\nX X X', output: 'X X X\nX X X\nX X X' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    void solve(vector<vector<char>>& board) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public void solve(char[][] board) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def solve(self, board: List[List[str]]) -> None:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    void solve(vector<vector<char>>& b) {\n        if (b.empty()) return;\n        int m = b.size(), n = b[0].size();\n        function<void(int,int)> dfs = [&](int i, int j) {\n            if (i < 0 || i >= m || j < 0 || j >= n || b[i][j] != \'O\') return;\n            b[i][j] = \'#\';\n            dfs(i+1, j); dfs(i-1, j); dfs(i, j+1); dfs(i, j-1);\n        };\n        for (int i = 0; i < m; i++) { dfs(i, 0); dfs(i, n-1); }\n        for (int j = 0; j < n; j++) { dfs(0, j); dfs(m-1, j); }\n        for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) {\n            if (b[i][j] == \'O\') b[i][j] = \'X\';\n            else if (b[i][j] == \'#\') b[i][j] = \'O\';\n        }\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public void solve(char[][] b) {\n        if (b.length == 0) return;\n        int m = b.length, n = b[0].length;\n        for (int i = 0; i < m; i++) { dfs(b, i, 0); dfs(b, i, n-1); }\n        for (int j = 0; j < n; j++) { dfs(b, 0, j); dfs(b, m-1, j); }\n        for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) {\n            if (b[i][j] == \'O\') b[i][j] = \'X\';\n            else if (b[i][j] == \'#\') b[i][j] = \'O\';\n        }\n    }\n    private void dfs(char[][] b, int i, int j) {\n        if (i < 0 || i >= b.length || j < 0 || j >= b[0].length || b[i][j] != \'O\') return;\n        b[i][j] = \'#\';\n        dfs(b, i+1, j); dfs(b, i-1, j); dfs(b, i, j+1); dfs(b, i, j-1);\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def solve(self, b: List[List[str]]) -> None:\n        if not b:\n            return\n        m, n = len(b), len(b[0])\n        def dfs(i, j):\n            if i < 0 or i >= m or j < 0 or j >= n or b[i][j] != \'O\':\n                return\n            b[i][j] = \'#\'\n            dfs(i+1, j); dfs(i-1, j); dfs(i, j+1); dfs(i, j-1)\n        for i in range(m):\n            dfs(i, 0); dfs(i, n-1)\n        for j in range(n):\n            dfs(0, j); dfs(m-1, j)\n        for i in range(m):\n            for j in range(n):\n                if b[i][j] == \'O\': b[i][j] = \'X\'\n                elif b[i][j] == \'#\': b[i][j] = \'O\'' },
    ],
  },
  {
    title: 'Word Search II',
    problemNumber: 212,
    description: 'Given an `m x n` board of characters and a list of strings `words`, return all words on the board.\n\nEach word must be constructed from letters of sequentially adjacent cells (horizontal or vertical). The same cell may not be used more than once in a word.\n\n**Output format:** Each word on its own line, sorted alphabetically.',
    difficulty: 'hard',
    tags: 'backtracking',
    harnessType: 'gridchar-words-list',
    methodName: 'findWords',
    visibleTestCases: [
      { input: '4 4\no a a n\ne t a e\ni h k r\ni f l v\noath pea eat rain', output: 'eat\noath', explanation: 'Words found on board.' },
      { input: '2 2\na b\nc d\nab cd', output: 'ab\ncd', explanation: 'Two words found.' },
    ],
    hiddenTestCases: [
      { input: '1 1\na\na', output: 'a' },
      { input: '1 2\na b\nab', output: 'ab' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    vector<string> findWords(vector<vector<char>>& board, vector<string>& words) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public List<String> findWords(char[][] board, String[] words) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def findWords(self, board: List[List[str]], words: List[str]) -> List[str]:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'struct TrieNode {\n    TrieNode* children[26] = {};\n    string word = "";\n};\n\nclass Solution {\npublic:\n    vector<string> findWords(vector<vector<char>>& b, vector<string>& words) {\n        TrieNode* root = new TrieNode();\n        for (auto& w : words) {\n            TrieNode* n = root;\n            for (char c : w) {\n                if (!n->children[c-\'a\']) n->children[c-\'a\'] = new TrieNode();\n                n = n->children[c-\'a\'];\n            }\n            n->word = w;\n        }\n        vector<string> res;\n        int m = b.size(), n = b[0].size();\n        function<void(int,int,TrieNode*)> dfs = [&](int i, int j, TrieNode* node) {\n            if (i < 0 || i >= m || j < 0 || j >= n) return;\n            char c = b[i][j];\n            if (c == \'#\' || !node->children[c-\'a\']) return;\n            node = node->children[c-\'a\'];\n            if (!node->word.empty()) { res.push_back(node->word); node->word.clear(); }\n            b[i][j] = \'#\';\n            dfs(i+1, j, node); dfs(i-1, j, node); dfs(i, j+1, node); dfs(i, j-1, node);\n            b[i][j] = c;\n        };\n        for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) dfs(i, j, root);\n        return res;\n    }\n};' },
      { language: 'Java', completeCode: 'class TrieNode {\n    TrieNode[] children = new TrieNode[26];\n    String word = "";\n}\n\nclass Solution {\n    public List<String> findWords(char[][] b, String[] words) {\n        TrieNode root = new TrieNode();\n        for (String w : words) {\n            TrieNode n = root;\n            for (char c : w.toCharArray()) {\n                if (n.children[c-\'a\'] == null) n.children[c-\'a\'] = new TrieNode();\n                n = n.children[c-\'a\'];\n            }\n            n.word = w;\n        }\n        List<String> res = new ArrayList<>();\n        int m = b.length, n = b[0].length;\n        for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) dfs(b, i, j, root, res);\n        return res;\n    }\n    private void dfs(char[][] b, int i, int j, TrieNode node, List<String> res) {\n        if (i < 0 || i >= b.length || j < 0 || j >= b[0].length) return;\n        char c = b[i][j];\n        if (c == \'#\' || node.children[c-\'a\'] == null) return;\n        node = node.children[c-\'a\'];\n        if (!node.word.isEmpty()) { res.add(node.word); node.word = ""; }\n        b[i][j] = \'#\';\n        dfs(b, i+1, j, node, res); dfs(b, i-1, j, node, res); dfs(b, i, j+1, node, res); dfs(b, i, j-1, node, res);\n        b[i][j] = c;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def findWords(self, b: List[List[str]], words: List[str]) -> List[str]:\n        trie = {}\n        for w in words:\n            node = trie\n            for c in w:\n                node = node.setdefault(c, {})\n            node[\'$\'] = w\n        res = []\n        m, n = len(b), len(b[0])\n        def dfs(i, j, node):\n            if i < 0 or i >= m or j < 0 or j >= n:\n                return\n            c = b[i][j]\n            if c not in node:\n                return\n            nxt = node[c]\n            if \'$\' in nxt:\n                res.append(nxt[\'$\'])\n                del nxt[\'$\']\n            b[i][j] = \'#\'\n            dfs(i+1, j, nxt); dfs(i-1, j, nxt); dfs(i, j+1, nxt); dfs(i, j-1, nxt)\n            b[i][j] = c\n        for i in range(m):\n            for j in range(n):\n                dfs(i, j, trie)\n        return res' },
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
    console.log(`🎉 Graph/grid batch complete`);
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