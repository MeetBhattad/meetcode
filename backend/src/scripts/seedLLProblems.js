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
// HELPERS  (IDENTICAL to seedLLProblems.js batch 1 — no null check)
// ─────────────────────────────────────────────────────────────

const CPP_HELPER = `#include <bits/stdc++.h>
using namespace std;

struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode* n) : val(x), next(n) {}
};

ListNode* buildList(const string& line) {
    stringstream ss(line);
    int x;
    ListNode dummy(0);
    ListNode* tail = &dummy;
    while (ss >> x) {
        tail->next = new ListNode(x);
        tail = tail->next;
    }
    return dummy.next;
}

void printList(ListNode* head) {
    ListNode* cur = head;
    bool first = true;
    while (cur) {
        if (!first) cout << " ";
        cout << cur->val;
        first = false;
        cur = cur->next;
    }
    cout << endl;
}

ListNode* getNodeAt(ListNode* head, int idx) {
    ListNode* cur = head;
    for (int i = 0; i < idx && cur; i++) cur = cur->next;
    return cur;
}
`;

const JAVA_HELPER = `import java.util.*;

class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

class ListUtil {
    static ListNode buildList(String line) {
        if (line == null || line.trim().isEmpty()) return null;
        String[] parts = line.trim().split("\\\\s+");
        ListNode dummy = new ListNode(0);
        ListNode tail = dummy;
        for (String p : parts) {
            tail.next = new ListNode(Integer.parseInt(p));
            tail = tail.next;
        }
        return dummy.next;
    }

    static void printList(ListNode head) {
        StringBuilder sb = new StringBuilder();
        ListNode cur = head;
        boolean first = true;
        while (cur != null) {
            if (!first) sb.append(" ");
            sb.append(cur.val);
            first = false;
            cur = cur.next;
        }
        System.out.println(sb.toString());
    }

    static ListNode getNodeAt(ListNode head, int idx) {
        ListNode cur = head;
        for (int i = 0; i < idx && cur != null; i++) cur = cur.next;
        return cur;
    }
}
`;

const PY_HELPER = `import sys
from typing import List, Optional
from collections import deque

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def build_list(line):
    if not line or not line.strip():
        return None
    dummy = ListNode(0)
    tail = dummy
    for x in line.strip().split():
        tail.next = ListNode(int(x))
        tail = tail.next
    return dummy.next

def print_list(head):
    parts = []
    cur = head
    while cur:
        parts.append(str(cur.val))
        cur = cur.next
    print(' '.join(parts))

def get_node_at(head, idx):
    cur = head
    for _ in range(idx):
        if not cur:
            return None
        cur = cur.next
    return cur
`;

// ─────────────────────────────────────────────────────────────
// HARNESS BUILDERS
// ─────────────────────────────────────────────────────────────

function buildCppHarness(type, method) {
  if (type === 'list-list') {
    return `${CPP_HELPER}\n{{USER_CODE}}\n\nint main() {\n    string line; getline(cin, line);\n    ListNode* head = buildList(line);\n    Solution sol;\n    printList(sol.${method}(head));\n    return 0;\n}`;
  }
  if (type === 'list-int-list') {
    return `${CPP_HELPER}\n{{USER_CODE}}\n\nint main() {\n    string line; getline(cin, line);\n    ListNode* head = buildList(line);\n    int k; cin >> k;\n    Solution sol;\n    printList(sol.${method}(head, k));\n    return 0;\n}`;
  }
  if (type === 'list-arrint-int') {
    return `${CPP_HELPER}\n{{USER_CODE}}\n\nint main() {\n    string l1; getline(cin, l1);\n    ListNode* head = buildList(l1);\n    string l2; getline(cin, l2);\n    vector<int> nums;\n    stringstream ss(l2);\n    int x;\n    while (ss >> x) nums.push_back(x);\n    Solution sol;\n    cout << sol.${method}(head, nums) << endl;\n    return 0;\n}`;
  }
  if (type === 'list-arr-int') {
    return `${CPP_HELPER}\n{{USER_CODE}}\n\nint main() {\n    string line; getline(cin, line);\n    ListNode* head = buildList(line);\n    Solution sol;\n    vector<int> r = sol.${method}(head);\n    for (size_t i = 0; i < r.size(); i++) {\n        if (i) cout << " ";\n        cout << r[i];\n    }\n    cout << endl;\n    return 0;\n}`;
  }
  return '';
}

function buildJavaHarness(type, method) {
  if (type === 'list-list') {
    return `${JAVA_HELPER}\n{{USER_CODE}}\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        ListNode head = ListUtil.buildList(sc.nextLine());\n        ListUtil.printList(new Solution().${method}(head));\n    }\n}`;
  }
  if (type === 'list-int-list') {
    return `${JAVA_HELPER}\n{{USER_CODE}}\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        ListNode head = ListUtil.buildList(sc.nextLine());\n        int k = Integer.parseInt(sc.nextLine().trim());\n        ListUtil.printList(new Solution().${method}(head, k));\n    }\n}`;
  }
  if (type === 'list-arrint-int') {
    return `${JAVA_HELPER}\n{{USER_CODE}}\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        ListNode head = ListUtil.buildList(sc.nextLine());\n        String[] parts = sc.nextLine().trim().split("\\\\s+");\n        int[] nums = new int[parts.length];\n        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\n        System.out.println(new Solution().${method}(head, nums));\n    }\n}`;
  }
  if (type === 'list-arr-int') {
    return `${JAVA_HELPER}\n{{USER_CODE}}\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        ListNode head = ListUtil.buildList(sc.nextLine());\n        int[] r = new Solution().${method}(head);\n        StringBuilder sb = new StringBuilder();\n        for (int i = 0; i < r.length; i++) {\n            if (i > 0) sb.append(" ");\n            sb.append(r[i]);\n        }\n        System.out.println(sb.toString());\n    }\n}`;
  }
  return '';
}

function buildPyHarness(type, method) {
  if (type === 'list-list') {
    return `${PY_HELPER}\n{{USER_CODE}}\n\ndef main():\n    line = sys.stdin.readline().rstrip('\\n')\n    head = build_list(line)\n    print_list(Solution().${method}(head))\n\nif __name__ == "__main__":\n    main()`;
  }
  if (type === 'list-int-list') {
    return `${PY_HELPER}\n{{USER_CODE}}\n\ndef main():\n    line = sys.stdin.readline().rstrip('\\n')\n    head = build_list(line)\n    k = int(sys.stdin.readline().strip())\n    print_list(Solution().${method}(head, k))\n\nif __name__ == "__main__":\n    main()`;
  }
  if (type === 'list-arrint-int') {
    return `${PY_HELPER}\n{{USER_CODE}}\n\ndef main():\n    l1 = sys.stdin.readline().rstrip('\\n')\n    head = build_list(l1)\n    l2 = sys.stdin.readline().rstrip('\\n')\n    nums = list(map(int, l2.split())) if l2 else []\n    print(Solution().${method}(head, nums))\n\nif __name__ == "__main__":\n    main()`;
  }
  if (type === 'list-arr-int') {
    return `${PY_HELPER}\n{{USER_CODE}}\n\ndef main():\n    line = sys.stdin.readline().rstrip('\\n')\n    head = build_list(line)\n    r = Solution().${method}(head)\n    print(' '.join(map(str, r)))\n\nif __name__ == "__main__":\n    main()`;
  }
  return '';
}

// ─────────────────────────────────────────────────────────────
// THE 5 PROBLEMS — every test case traced by hand
// ─────────────────────────────────────────────────────────────

const problemsData = [
  // ══════════════ 1. Remove Linked List Elements (#203) ══════════════
  // CHANGE: replaced `[7 7 7 7] / 7 → (empty)` visible case
  //         with `[1 2 1] / 1 → [2]` so output is non-empty.
  {
    title: 'Remove Linked List Elements',
    problemNumber: 203,
    difficulty: 'easy',
    tags: 'linkedList',
    type: 'list-int-list',
    method: 'removeElements',
    description: 'Given the `head` of a linked list and an integer `val`, remove all the nodes of the linked list that has `Node.val == val`, and return the new head.\n\n**Input format:** Line 1 = list, Line 2 = val.',
    visibleTestCases: [
      { input: '1 2 6 3 4 5 6\n6', output: '1 2 3 4 5', explanation: 'All 6s removed.' },
      { input: '1 2 1\n1', output: '2', explanation: 'Both 1s removed; only 2 remains.' },
    ],
    hiddenTestCases: [
      { input: '1 2 3\n1', output: '2 3' },
      { input: '1 2 3\n3', output: '1 2' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    ListNode* removeElements(ListNode* head, int val) {\n        // Write your code here\n        return head;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public ListNode removeElements(ListNode head, int val) {\n        // Write your code here\n        return head;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def removeElements(self, head: Optional[ListNode], val: int) -> Optional[ListNode]:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    ListNode* removeElements(ListNode* head, int val) {\n        ListNode dummy(0); dummy.next = head;\n        ListNode* cur = &dummy;\n        while (cur->next) {\n            if (cur->next->val == val) cur->next = cur->next->next;\n            else cur = cur->next;\n        }\n        return dummy.next;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public ListNode removeElements(ListNode head, int val) {\n        ListNode dummy = new ListNode(0); dummy.next = head;\n        ListNode cur = dummy;\n        while (cur.next != null) {\n            if (cur.next.val == val) cur.next = cur.next.next;\n            else cur = cur.next;\n        }\n        return dummy.next;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def removeElements(self, head: Optional[ListNode], val: int) -> Optional[ListNode]:\n        dummy = ListNode(0, head)\n        cur = dummy\n        while cur.next:\n            if cur.next.val == val:\n                cur.next = cur.next.next\n            else:\n                cur = cur.next\n        return dummy.next' },
    ],
  },

  // ══════════════ 2. Delete the Middle Node of a Linked List (#2095) ══════════════
  // CHANGE: expected outputs for [1,2,3,4] and [2,1] were WRONG in batch 2.
  //         n=4 → middle idx = floor(4/2) = 2 → remove value 3 → [1,2,4]
  //         n=2 → middle idx = 1 → remove value 1 → [2]
  //         Also removed `[1] → (empty)` visible case (would break schema).
  {
    title: 'Delete the Middle Node of a Linked List',
    problemNumber: 2095,
    difficulty: 'easy',
    tags: 'linkedList',
    type: 'list-list',
    method: 'deleteMiddle',
    description: 'You are given the `head` of a linked list. Delete the middle node, and return the `head` of the modified linked list.\n\nThe middle node of a linked list of size `n` is the `⌊n / 2⌋`-th node from the start (0-indexed).',
    visibleTestCases: [
      { input: '1 3 4 7 1 2 6', output: '1 3 4 1 2 6', explanation: 'n=7, middle index 3 (value 7) removed.' },
      { input: '1 2 3 4', output: '1 2 4', explanation: 'n=4, middle index 2 (value 3) removed.' },
    ],
    hiddenTestCases: [
      { input: '2 1', output: '2' },
      { input: '1 2 3', output: '1 3' },
      { input: '5 6 7 8 9 10', output: '5 6 7 9 10' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    ListNode* deleteMiddle(ListNode* head) {\n        // Write your code here\n        return head;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public ListNode deleteMiddle(ListNode head) {\n        // Write your code here\n        return head;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def deleteMiddle(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    ListNode* deleteMiddle(ListNode* head) {\n        if (!head->next) return nullptr;\n        ListNode* slow = head, *fast = head, *prev = nullptr;\n        while (fast && fast->next) { prev = slow; slow = slow->next; fast = fast->next->next; }\n        prev->next = slow->next;\n        return head;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public ListNode deleteMiddle(ListNode head) {\n        if (head.next == null) return null;\n        ListNode slow = head, fast = head, prev = null;\n        while (fast != null && fast.next != null) { prev = slow; slow = slow.next; fast = fast.next.next; }\n        prev.next = slow.next;\n        return head;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def deleteMiddle(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        if not head.next:\n            return None\n        slow = fast = head\n        prev = None\n        while fast and fast.next:\n            prev = slow\n            slow = slow.next\n            fast = fast.next.next\n        prev.next = slow.next\n        return head' },
    ],
  },

  // ══════════════ 3. Linked List Components (#817) ══════════════
  // CHANGE: removed `import java.util.*;\n\n` prefix from Java ref.
  //         Harness already has `import java.util.*;` at top of file.
  {
    title: 'Linked List Components',
    problemNumber: 817,
    difficulty: 'medium',
    tags: 'linkedList',
    type: 'list-arrint-int',
    method: 'numComponents',
    description: 'You are given the `head` of a linked list containing unique integer values and an integer array `nums` that is a subset of the linked list values.\n\nReturn the number of connected components in `nums` where two values are connected if they appear consecutively in the linked list.\n\n**Input format:** Line 1 = list, Line 2 = nums.',
    visibleTestCases: [
      { input: '0 1 2 3\n0 1 3', output: '2', explanation: 'Components: [0,1] and [3].' },
      { input: '0 1 2 3 4\n0 3 1 4', output: '2', explanation: 'Components: [0,1] and [3,4].' },
    ],
    hiddenTestCases: [
      { input: '0 1 2\n0 1 2', output: '1' },
      { input: '0 1 2\n1', output: '1' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int numComponents(ListNode* head, vector<int>& nums) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int numComponents(ListNode head, int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def numComponents(self, head: Optional[ListNode], nums: List[int]) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int numComponents(ListNode* head, vector<int>& nums) {\n        unordered_set<int> s(nums.begin(), nums.end());\n        int cnt = 0;\n        while (head) {\n            if (s.count(head->val) && (!head->next || !s.count(head->next->val))) cnt++;\n            head = head->next;\n        }\n        return cnt;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int numComponents(ListNode head, int[] nums) {\n        Set<Integer> s = new HashSet<>();\n        for (int n : nums) s.add(n);\n        int cnt = 0;\n        while (head != null) {\n            if (s.contains(head.val) && (head.next == null || !s.contains(head.next.val))) cnt++;\n            head = head.next;\n        }\n        return cnt;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def numComponents(self, head: Optional[ListNode], nums: List[int]) -> int:\n        s = set(nums)\n        cnt = 0\n        while head:\n            if head.val in s and (not head.next or head.next.val not in s):\n                cnt += 1\n            head = head.next\n        return cnt' },
    ],
  },

  // ══════════════ 4. Next Greater Node In Linked List (#1019) ══════════════
  // CHANGE: removed `import java.util.*;\n\n` prefix from Java ref.
  {
    title: 'Next Greater Node In Linked List',
    problemNumber: 1019,
    difficulty: 'medium',
    tags: 'linkedList',
    type: 'list-arr-int',
    method: 'nextLargerNodes',
    description: 'You are given the `head` of a linked list with `n` nodes.\n\nFor each node in the list, find the value of the **next greater node**. That is, find the value of the next node whose value is strictly greater than the current node.\n\nReturn an integer array `answer` where `answer[i]` is the value of the next greater node of the `i`-th node (1-indexed). If the `i`-th node does not have a next greater node, set `answer[i] = 0`.',
    visibleTestCases: [
      { input: '2 1 5', output: '5 5 0', explanation: '2→5, 1→5, 5→none.' },
      { input: '2 7 4 3 5', output: '7 0 5 5 0', explanation: 'Next greater node for each.' },
    ],
    hiddenTestCases: [
      { input: '1', output: '0' },
      { input: '1 2 3', output: '2 3 0' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    vector<int> nextLargerNodes(ListNode* head) {\n        // Write your code here\n        return {};\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int[] nextLargerNodes(ListNode head) {\n        // Write your code here\n        return new int[]{};\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def nextLargerNodes(self, head: Optional[ListNode]) -> List[int]:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    vector<int> nextLargerNodes(ListNode* head) {\n        vector<int> vals;\n        for (ListNode* c = head; c; c = c->next) vals.push_back(c->val);\n        int n = vals.size();\n        vector<int> res(n, 0);\n        stack<int> st;\n        for (int i = 0; i < n; i++) {\n            while (!st.empty() && vals[st.top()] < vals[i]) {\n                res[st.top()] = vals[i];\n                st.pop();\n            }\n            st.push(i);\n        }\n        return res;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int[] nextLargerNodes(ListNode head) {\n        List<Integer> vals = new ArrayList<>();\n        for (ListNode c = head; c != null; c = c.next) vals.add(c.val);\n        int n = vals.size();\n        int[] res = new int[n];\n        Deque<Integer> st = new ArrayDeque<>();\n        for (int i = 0; i < n; i++) {\n            while (!st.isEmpty() && vals.get(st.peek()) < vals.get(i)) {\n                res[st.pop()] = vals.get(i);\n            }\n            st.push(i);\n        }\n        return res;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def nextLargerNodes(self, head: Optional[ListNode]) -> List[int]:\n        vals = []\n        cur = head\n        while cur:\n            vals.append(cur.val)\n            cur = cur.next\n        n = len(vals)\n        res = [0] * n\n        st = []\n        for i in range(n):\n            while st and vals[st[-1]] < vals[i]:\n                res[st.pop()] = vals[i]\n            st.append(i)\n        return res' },
    ],
  },

  // ══════════════ 5. Remove Zero Sum Consecutive Nodes (#1171) ══════════════
  // CHANGE: removed `import java.util.*;\n\n` prefix from Java ref.
  {
    title: 'Remove Zero Sum Consecutive Nodes from Linked List',
    problemNumber: 1171,
    difficulty: 'medium',
    tags: 'linkedList',
    type: 'list-list',
    method: 'removeZeroSumSublists',
    description: 'Given the `head` of a linked list, we repeatedly delete consecutive sequences of nodes that sum to `0` until there are no such sequences.\n\nAfter doing so, return the head of the final linked list.',
    visibleTestCases: [
      { input: '1 2 -3 3 1', output: '3 1', explanation: '1+2-3 = 0 removed.' },
      { input: '1 2 3 -3 4', output: '1 2 4', explanation: '3-3 = 0 removed.' },
    ],
    hiddenTestCases: [
      { input: '1 2 3 -3 -2', output: '1' },
      { input: '5 -5 3', output: '3' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    ListNode* removeZeroSumSublists(ListNode* head) {\n        // Write your code here\n        return head;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public ListNode removeZeroSumSublists(ListNode head) {\n        // Write your code here\n        return head;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def removeZeroSumSublists(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    ListNode* removeZeroSumSublists(ListNode* head) {\n        ListNode* dummy = new ListNode(0);\n        dummy->next = head;\n        unordered_map<int, ListNode*> mp;\n        int sum = 0;\n        for (ListNode* cur = dummy; cur; cur = cur->next) {\n            sum += cur->val;\n            mp[sum] = cur;\n        }\n        sum = 0;\n        for (ListNode* cur = dummy; cur; cur = cur->next) {\n            sum += cur->val;\n            cur->next = mp[sum]->next;\n        }\n        return dummy->next;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public ListNode removeZeroSumSublists(ListNode head) {\n        ListNode dummy = new ListNode(0); dummy.next = head;\n        Map<Integer, ListNode> mp = new HashMap<>();\n        int sum = 0;\n        for (ListNode cur = dummy; cur != null; cur = cur.next) {\n            sum += cur.val;\n            mp.put(sum, cur);\n        }\n        sum = 0;\n        for (ListNode cur = dummy; cur != null; cur = cur.next) {\n            sum += cur.val;\n            cur.next = mp.get(sum).next;\n        }\n        return dummy.next;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def removeZeroSumSublists(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        dummy = ListNode(0, head)\n        mp = {}\n        s = 0\n        cur = dummy\n        while cur:\n            s += cur.val\n            mp[s] = cur\n            cur = cur.next\n        s = 0\n        cur = dummy\n        while cur:\n            s += cur.val\n            cur.next = mp[s].next\n            cur = cur.next\n        return dummy.next' },
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
        { language: 'C++', harnessCode: buildCppHarness(p.type, p.method) },
        { language: 'Java', harnessCode: buildJavaHarness(p.type, p.method) },
        { language: 'Python', harnessCode: buildPyHarness(p.type, p.method) },
      ],
    }));

    console.log('📋 Loading existing problems...');
    const { data: allProblems } = await client.get(`${BACKEND_URL}/problem/getAllProblem`);
    const existingByTitle = new Map();
    (allProblems || []).forEach((p) => existingByTitle.set(p.title, p));
    console.log(`   ${existingByTitle.size} problems in DB\n`);

    let updated = 0, created = 0, failed = 0;
    const failures = [];

    for (const p of problemsWithHarnesses) {
      const existing = existingByTitle.get(p.title);

      if (existing) {
        try {
          const adminRes = await client.get(`${BACKEND_URL}/problem/admin/${existing._id}`);
          await client.put(`${BACKEND_URL}/problem/update/${existing._id}`, {
            ...adminRes.data,
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
    console.log(`🎉 Batch-2 fix complete`);
    console.log(`   ✅ Created:  ${created}`);
    console.log(`   🔄 Updated:  ${updated}`);
    console.log(`   ❌ Failed:   ${failed}`);
    if (failures.length > 0) {
      console.log('\n   Failures:');
      failures.forEach((f) => console.log(`      - ${f.title}: ${f.error}`));
    }
  } catch (err) {
    console.error('❌ Fatal:', err.message);
  }
}

main();